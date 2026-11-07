import type { ExpoConfig } from 'expo/config';

let publicHost: string | undefined;
if (process.env.EXPO_PUBLIC_WEB_URL) {
  const url = new URL(process.env.EXPO_PUBLIC_WEB_URL);
  if (url.protocol !== 'https:' || url.username || url.password || url.port || url.pathname !== '/' || url.search || url.hash) {
    throw new Error('EXPO_PUBLIC_WEB_URL deve ser uma origem HTTPS, sem caminho ou credenciais.');
  }
  publicHost = url.hostname;
}

const config: ExpoConfig = {
  name: 'RAFAH',
  slug: 'rafah-mobile',
  version: '0.1.0',
  scheme: 'rafah',
  userInterfaceStyle: 'light',
  plugins: [['expo-router', { root: './src/routes' }]],
  ios: {
    supportsTablet: true,
    ...(process.env.RAFAH_IOS_BUNDLE_ID ? { bundleIdentifier: process.env.RAFAH_IOS_BUNDLE_ID } : {}),
    ...(publicHost ? { associatedDomains: [`applinks:${publicHost}`] } : {}),
    infoPlist: { ITSAppUsesNonExemptEncryption: false },
  },
  android: {
    ...(process.env.RAFAH_ANDROID_PACKAGE ? { package: process.env.RAFAH_ANDROID_PACKAGE } : {}),
    ...(publicHost ? {
      intentFilters: [{
        action: 'VIEW',
        autoVerify: true,
        data: [{ scheme: 'https', host: publicHost, pathPrefix: '/igreja/' }],
        category: ['BROWSABLE', 'DEFAULT'],
      }],
    } : {}),
  },
  web: { bundler: 'metro', output: 'single', name: 'RAFAH' },
  ...(process.env.EAS_PROJECT_ID ? { extra: { eas: { projectId: process.env.EAS_PROJECT_ID } } } : {}),
};

export default config;
