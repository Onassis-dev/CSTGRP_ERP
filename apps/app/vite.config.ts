import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
	plugins: [
		sveltekit(),
		VitePWA({
			registerType: 'autoUpdate',
			devOptions: {
				enabled: true,
				type: 'module'
			},
			includeAssets: [],
			manifest: {
				name: 'CST ERP',
				short_name: 'CST ERP',
				description: '',
				theme_color: '#ffffff',
				icons: [
					{
						src: '/pwa/android/android-launchericon-512-512.png',
						sizes: '512x512'
					},
					{
						src: '/pwa/android/android-launchericon-192-192.png',
						sizes: '192x192'
					},
					{
						src: '/pwa/android/android-launchericon-144-144.png',
						sizes: '144x144'
					},
					{
						src: '/pwa/android/android-launchericon-96-96.png',
						sizes: '96x96'
					},
					{
						src: '/pwa/android/android-launchericon-72-72.png',
						sizes: '72x72'
					},
					{
						src: '/pwa/android/android-launchericon-48-48.png',
						sizes: '48x48'
					},
					{
						src: '/pwa/ios/16.png',
						sizes: '16x16'
					},
					{
						src: '/pwa/ios/20.png',
						sizes: '20x20'
					},
					{
						src: '/pwa/ios/29.png',
						sizes: '29x29'
					},
					{
						src: '/pwa/ios/32.png',
						sizes: '32x32'
					},
					{
						src: '/pwa/ios/40.png',
						sizes: '40x40'
					},
					{
						src: '/pwa/ios/50.png',
						sizes: '50x50'
					},
					{
						src: '/pwa/ios/57.png',
						sizes: '57x57'
					},
					{
						src: '/pwa/ios/58.png',
						sizes: '58x58'
					},
					{
						src: '/pwa/ios/60.png',
						sizes: '60x60'
					},
					{
						src: '/pwa/ios/64.png',
						sizes: '64x64'
					},
					{
						src: '/pwa/ios/72.png',
						sizes: '72x72'
					},
					{
						src: '/pwa/ios/76.png',
						sizes: '76x76'
					},
					{
						src: '/pwa/ios/80.png',
						sizes: '80x80'
					},
					{
						src: '/pwa/ios/87.png',
						sizes: '87x87'
					},
					{
						src: '/pwa/ios/100.png',
						sizes: '100x100'
					},
					{
						src: '/pwa/ios/114.png',
						sizes: '114x114'
					},
					{
						src: '/pwa/ios/120.png',
						sizes: '120x120'
					},
					{
						src: '/pwa/ios/128.png',
						sizes: '128x128'
					},
					{
						src: '/pwa/ios/144.png',
						sizes: '144x144'
					},
					{
						src: '/pwa/ios/152.png',
						sizes: '152x152'
					},
					{
						src: '/pwa/ios/167.png',
						sizes: '167x167'
					},
					{
						src: '/pwa/ios/180.png',
						sizes: '180x180'
					},
					{
						src: '/pwa/ios/192.png',
						sizes: '192x192'
					},
					{
						src: '/pwa/ios/256.png',
						sizes: '256x256'
					},
					{
						src: '/pwa/ios/512.png',
						sizes: '512x512'
					},
					{
						src: '/pwa/ios/1024.png',
						sizes: '1024x1024'
					}
				]
			}
		})
	],
	server: {
		host: '0.0.0.0',
		port: 5001
	}
});
