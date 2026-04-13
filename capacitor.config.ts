import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.dailysaju.premium',
  appName: 'Daily Saju',
  webDir: 'dist',
  plugins: {
    SplashScreen: {
      launchShowDuration: 1500,
      launchAutoHide: true,
      backgroundColor: "#0a0b0f",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER",
      showSpinner: false,
    }
  }
};

export default config;
