import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.pastorapalacio.taica',
  appName: 'Centro + Salud',
  webDir: 'dist',
  server: {
    url: 'https://pastora-palacio-taica.vercel.app/',
    cleartext: true
  }
};

export default config;
