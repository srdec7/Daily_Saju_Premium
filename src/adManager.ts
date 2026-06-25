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
  private initPromise: Promise<void> | null = null;
  private adMobError: string | null = null;
  
  // Production ID: ca-app-pub-5036571902202474/6228955866
  public adUnitId: string = (import.meta as any).env.VITE_ADMOB_REWARD_ID || 'ca-app-pub-5036571902202474/6228955866';

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
   * Requests iOS App Tracking Transparency before the ad SDK touches IDFA.
   * The app continues with non-personalized behavior when permission is denied.
   */
  private async requestTrackingAuthorizationIfNeeded() {
    if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'ios') return;

    try {
      const admob = AdMob as any;
      if (typeof admob.trackingAuthorizationStatus !== 'function' || typeof admob.requestTrackingAuthorization !== 'function') return;

      const info = await admob.trackingAuthorizationStatus();
      if (info?.status === 'notDetermined') {
        await admob.requestTrackingAuthorization();
      }
    } catch (e) {
      console.warn('[AdManager] ATT request skipped or failed:', e);
    }
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

    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = (async () => {
      try {
        console.log('[AdManager] Initializing AdMob SDK...');
        await this.requestTrackingAuthorizationIfNeeded();
        await AdMob.initialize({});
        console.log('[AdManager] AdMob SDK Initialized.');
        this.isAdReady = true;
        this.adMobError = null;
      } catch (e: any) {
        console.error('[AdManager] AdMob initialization failed:', e);
        this.isAdReady = false;
        this.adMobError = e.message || String(e);
      }
    })();
    return this.initPromise;
  }

  /**
   * Triggers a rewarded video ad.
   */
  public showRewardedVideo(): Promise<boolean> {
    return new Promise(async (resolve) => {
      if (!Capacitor.isNativePlatform()) {
        alert('Ads are not supported on the Web version. Please use the mobile app.');
        resolve(false);
        return;
      }

      // Re-try initialization if it failed earlier
      if (!this.isAdReady) {
        await this.initAdSDK();
      }

      if (!this.isAdReady) {
        console.warn('[AdManager] AdMob SDK not ready.');
        alert('AdMob SDK not ready. Error: ' + (this.adMobError || 'Unknown'));
        resolve(false);
        return;
      }

      const bgMusic = document.getElementById('bg-music') as HTMLAudioElement;

      // Handle background music pause
      let wasMusicPlaying = false;
      if (bgMusic && typeof bgMusic.pause === 'function') {
        wasMusicPlaying = !bgMusic.paused && bgMusic.volume > 0;
        if (wasMusicPlaying) bgMusic.pause();
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
        if (wasMusicPlaying && bgMusic) {
          bgMusic.play().catch(() => {});
        }
        resolve(rewardEarned);
      });

      const failedToLoadListener = await AdMob.addListener(RewardAdPluginEvents.FailedToLoad, (error) => {
        console.error('[AdManager] Ad failed to load:', error);
        cleanup();
        if (wasMusicPlaying && bgMusic) {
          bgMusic.play().catch(() => {});
        }
        alert('Ad failed to load (No Fill or Error). Please try again later.');
        resolve(false);
      });

      const failedToShowListener = await AdMob.addListener(RewardAdPluginEvents.FailedToShow, (error) => {
        console.error('[AdManager] Ad failed to show:', error);
        cleanup();
        if (wasMusicPlaying && bgMusic) {
          bgMusic.play().catch(() => {});
        }
        alert('Ad failed to show. Please try again later.');
        resolve(false);
      });

      const cleanup = () => {
        rewardedListener.remove();
        dismissedListener.remove();
        failedToLoadListener.remove();
        failedToShowListener.remove();
      };

      try {
        await AdMob.prepareRewardVideoAd({
          adId: this.adUnitId,
        });
        await AdMob.showRewardVideoAd();
      } catch (err) {
        console.error('[AdManager] Error showing native reward ad:', err);
        cleanup();
        if (wasMusicPlaying && bgMusic) {
          bgMusic.play().catch(() => {});
        }
        alert('Error preparing or showing native reward ad.');
        resolve(false);
      }
    });
  }


}
