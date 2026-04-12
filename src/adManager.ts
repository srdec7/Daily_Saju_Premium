/**
 * AdManager
 * Handles the integration with Google AdSense (Ad Placement API / Rewarded Web).
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
  
  // =========================================================================
  // TO ENABLE REAL ADS, SET VIRTUAL ENVIRONMENT VARIABLE: VITE_ADSENSE_PUB_ID
  // e.g. VITE_ADSENSE_PUB_ID='ca-pub-1234567890123456'
  // =========================================================================
  public publisherId: string | null = (import.meta as any).env.VITE_ADSENSE_PUB_ID || null;

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
   * Initializes the Google AdSense Script and Ad Placement context
   */
  private initAdSDK() {
    if (this.publisherId) {
      console.log(`[AdManager] Initializing real AdSense SDK for ${this.publisherId}`);
      
      // Inject AdSense script
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${this.publisherId}`;
      script.crossOrigin = 'anonymous';
      document.head.appendChild(script);

      // Setup AdConfig queue
      window.adsbygoogle = window.adsbygoogle || [];
      window.adConfig = function(o) { window.adsbygoogle.push(o); };
      
      // Preload the rewarded ad breaks (H5 API requirement)
      window.adConfig({
        preloadAdBreaks: 'on',
        onReady: () => {
          console.log('[AdManager] AdSense API Ready');
          this.isAdReady = true;
        }
      });
      
    } else {
      // In TEST mode, we consider the ad mechanism ready.
      console.log('[AdManager] Running in TEST (Mock) mode. No Publisher ID set.');
      this.isAdReady = true;
    }
  }

  /**
   * Triggers a rewarded video ad.
   */
  public showRewardedVideo(): Promise<boolean> {
    return new Promise((resolve) => {
      const isAdBreakAvailable = this.publisherId && typeof window.adbreak === 'function';

      if (!this.isAdReady || !isAdBreakAvailable) {
        console.warn('[AdManager] Ad SDK not ready or adbreak missing (Pending Review/AdBlocker). Falling back to Mock.');
        this.runMockVideoAd(resolve);
        return;
      }

      if (this.publisherId && typeof window.adbreak === 'function') {
        const adScreen = document.getElementById('mock-ad-screen');
        if (adScreen) adScreen.style.display = 'flex'; // show a dim overlay while loading
        
        window.adbreak({
          type: 'reward',
          name: 'premium_saju_reading',
          beforeAd: () => {
            // Pause any audio/timers here if we have them
            console.log('[AdManager] Ad started');
          },
          afterAd: () => {
            // Resume logic
            if (adScreen) adScreen.style.display = 'none';
          },
          adDismissed: () => {
            console.log('[AdManager] User dismissed ad early.');
            if (adScreen) adScreen.style.display = 'none';
            resolve(false);
          },
          adViewed: () => {
            console.log('[AdManager] User watched ad successfully. Reward granted!');
            if (adScreen) adScreen.style.display = 'none';
            resolve(true);
          }
        });
      } else {
        // Fallback to MOCK mode if no publisher ID or AdBlocker blocked adbreak
        if (this.publisherId) {
           console.warn('[AdManager] AdBreak function missing. AdBlocker active? Falling back to Mock.');
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
