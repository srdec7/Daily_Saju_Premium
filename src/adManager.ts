import { AdMob, RewardAdPluginEvents } from '@capacitor-community/admob';
import type { AdMobRewardItem } from '@capacitor-community/admob';
import { Capacitor } from '@capacitor/core';

/**
 * AdManager
 * Handles the integration with Google AdMob for mobile platform,
 * and falls back to a mock ad screen on web/error situations.
 */

declare global {
  interface Window {
    adsbygoogle: any[];
    adConfig: (o: any) => void;
    adbreak: (o: any) => void;
  }
}

export class AdManager {
  private static instance: AdManager;
  private isAdReady: boolean = false;
  private isInitializing: boolean = false;
  
  // Real or Test Ad Unit ID for Android.
  // Test ID for Android Rewarded: ca-app-pub-3940256099942544/5224354917
  public adUnitId: string = (import.meta as any).env.VITE_ADMOB_REWARD_ID || 'ca-app-pub-3940256099942544/5224354917';

  private constructor() {
    this.initAdSDK();
  }

  public static getInstance(): AdManager {
    if (!AdManager.instance) {
      AdManager.instance = new AdManager();
    }
    return AdManager.instance;
  }

  /**
   * Initializes the Google AdMob SDK
   */
  private async initAdSDK() {
    if (!Capacitor.isNativePlatform()) {
      console.log('[AdManager] Running in web mode. AdMob SDK is disabled.');
      this.isAdReady = true;
      return;
    }

    if (this.isInitializing) return;
    this.isInitializing = true;

    try {
      console.log('[AdManager] Initializing AdMob SDK...');
      await AdMob.initialize({});
      console.log('[AdManager] AdMob SDK Initialized.');
      this.isAdReady = true;
    } catch (e) {
      console.error('[AdManager] AdMob initialization failed:', e);
      this.isAdReady = false;
    } finally {
      this.isInitializing = false;
    }
  }

  /**
   * Triggers a rewarded video ad.
   */
  public showRewardedVideo(): Promise<boolean> {
    return new Promise(async (resolve) => {
      // For web/browsers, use the simulated Mock ad
      if (!Capacitor.isNativePlatform()) {
        console.log('[AdManager] Web environment detected. Triggering Mock ad.');
        this.runMockVideoAd(resolve);
        return;
      }

      // Re-try initialization if it failed earlier
      if (!this.isAdReady) {
        await this.initAdSDK();
      }

      if (!this.isAdReady) {
        console.warn('[AdManager] AdMob SDK not ready. Falling back to Mock.');
        this.runMockVideoAd(resolve);
        return;
      }

      const adScreen = document.getElementById('mock-ad-screen');
      const adPlayingText = document.getElementById('ui-ad-playing');
      const bgMusic = document.getElementById('bg-music') as HTMLAudioElement;

      // Handle background music pause
      let wasMusicPlaying = false;
      if (bgMusic && typeof bgMusic.pause === 'function') {
        wasMusicPlaying = !bgMusic.paused && bgMusic.volume > 0;
        if (wasMusicPlaying) bgMusic.pause();
      }

      if (adScreen) {
        adScreen.style.display = 'flex';
        adScreen.classList.add('view-active');
      }
      if (adPlayingText) {
        adPlayingText.textContent = 'Loading Ad...';
      }

      let rewardEarned = false;

      // Listeners definition
      const rewardedListener = await AdMob.addListener(RewardAdPluginEvents.Rewarded, (reward: AdMobRewardItem) => {
        console.log('[AdManager] Ad reward earned:', reward);
        rewardEarned = true;
      });

      const dismissedListener = await AdMob.addListener(RewardAdPluginEvents.Dismissed, () => {
        console.log('[AdManager] Ad dismissed by user.');
        cleanup();
        if (adScreen) {
          adScreen.style.display = 'none';
          adScreen.classList.remove('view-active');
        }
        if (wasMusicPlaying && bgMusic) {
          bgMusic.play().catch(() => {});
        }
        resolve(rewardEarned);
      });

      const failedToLoadListener = await AdMob.addListener(RewardAdPluginEvents.FailedToLoad, (error) => {
        console.error('[AdManager] Ad failed to load:', error);
        cleanup();
        if (adScreen) {
          adScreen.style.display = 'none';
          adScreen.classList.remove('view-active');
        }
        if (wasMusicPlaying && bgMusic) {
          bgMusic.play().catch(() => {});
        }
        // Fallback to Mock ad
        this.runMockVideoAd(resolve);
      });

      const failedToShowListener = await AdMob.addListener(RewardAdPluginEvents.FailedToShow, (error) => {
        console.error('[AdManager] Ad failed to show:', error);
        cleanup();
        if (adScreen) {
          adScreen.style.display = 'none';
          adScreen.classList.remove('view-active');
        }
        if (wasMusicPlaying && bgMusic) {
          bgMusic.play().catch(() => {});
        }
        // Fallback to Mock ad
        this.runMockVideoAd(resolve);
      });

      const cleanup = () => {
        rewardedListener.remove();
        dismissedListener.remove();
        failedToLoadListener.remove();
        failedToShowListener.remove();
      };

      try {
        if (adPlayingText) adPlayingText.textContent = 'Preparing video...';
        await AdMob.prepareRewardVideoAd({
          adId: this.adUnitId,
        });
        if (adPlayingText) adPlayingText.textContent = 'Showing ad...';
        await AdMob.showRewardVideoAd();
      } catch (err) {
        console.error('[AdManager] Error showing native reward ad:', err);
        cleanup();
        if (adScreen) {
          adScreen.style.display = 'none';
          adScreen.classList.remove('view-active');
        }
        if (wasMusicPlaying && bgMusic) {
          bgMusic.play().catch(() => {});
        }
        this.runMockVideoAd(resolve);
      }
    });
  }

  private runMockVideoAd(onComplete: (success: boolean) => void) {
    const adScreen = document.getElementById('mock-ad-screen');
    const adPlayingText = document.getElementById('ui-ad-playing');
    const adIframe = document.getElementById('mock-ad-iframe') as HTMLIFrameElement;
    const bgMusic = document.getElementById('bg-music') as HTMLAudioElement;
    
    // Check if music was actively playing
    let wasMusicPlaying = false;
    if (bgMusic && typeof bgMusic.pause === 'function') {
      wasMusicPlaying = !bgMusic.paused && bgMusic.volume > 0;
      if (wasMusicPlaying) bgMusic.pause();
    }

    if (!adScreen) {
      if (wasMusicPlaying && bgMusic) bgMusic.play().catch(() => {});
      onComplete(false);
      return;
    }

    adScreen.classList.add('view-active');
    adScreen.style.display = 'flex';
    
    // Play video by sending JS API message to pre-loaded iframe (keeps gesture sync on iOS)
    if (adIframe && adIframe.contentWindow) {
      adIframe.contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
    }

    let countdown = 21;
    if (adPlayingText) adPlayingText.textContent = `Playing Partner Message... ${countdown}s`;

    const interval = setInterval(() => {
      countdown -= 1;
      if (adPlayingText) adPlayingText.textContent = `Playing Partner Message... ${countdown}s`;
      
      if (countdown <= 0) {
        clearInterval(interval);
        if (adPlayingText) adPlayingText.textContent = 'Reward Granted!';
        
        setTimeout(() => {
          adScreen.classList.remove('view-active');
          adScreen.style.display = 'none';
          if (adIframe && adIframe.contentWindow) {
             // Stop the video
             adIframe.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
             // Rewind it for next time
             adIframe.contentWindow.postMessage('{"event":"command","func":"seekTo","args":[0, true]}', '*');
          }

          // Resume background music if it was playing
          if (wasMusicPlaying && bgMusic) {
             bgMusic.play().catch(() => console.warn('Audio resume blocked'));
          }

          onComplete(true);
        }, 800);
      }
    }, 1000);
  }
}
