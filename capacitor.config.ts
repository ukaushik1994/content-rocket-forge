import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.ae13b72c00ff4e50bd02cd9edb6bbaf5',
  appName: 'creaiter',
  webDir: 'dist',
  bundledWebRuntime: false,
  server: {
    url: 'https://ae13b72c-00ff-4e50-bd02-cd9edb6bbaf5.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"]
    }
  }
};

export default config;