// CSS imports
import '../styles/styles.css';
import '../styles/responsives.css';
import 'tiny-slider/dist/tiny-slider.css';
import 'leaflet/dist/leaflet.css';

// Components
import App from './pages/app';
import { registerServiceWorker } from './utils';
import Camera from './utils/camera';
import { Workbox } from 'workbox-window';

document.addEventListener('DOMContentLoaded', async () => {
  const app = new App({
    content: document.getElementById('main-content'),
    drawerButton: document.getElementById('drawer-button'),
    drawerNavigation: document.getElementById('navigation-drawer'),
    skipLinkButton: document.getElementById('skip-link'),
  });
  await app.renderPage();

  // Register service worker
  if ('serviceWorker' in navigator) {
    try {
      const wb = new Workbox('/sw.bundle.js');
      
      wb.addEventListener('installed', (event) => {
        if (event.isUpdate) {
          console.log('Service worker updated. Refresh for the latest version.');
          // You could show a message to the user here about refreshing
        } else {
          console.log('Service worker installed successfully.');
        }
      });
      
      wb.addEventListener('activated', (event) => {
        if (event.isUpdate) {
          console.log('Service worker activated after update');
        } else {
          console.log('Service worker activated for the first time');
        }
      });
      
      wb.addEventListener('waiting', (event) => {
        console.log('New service worker waiting to activate');
        // You could prompt the user to reload for updates here
      });
      
      wb.register();
      console.log('Service worker registered successfully');
    } catch (error) {
      console.error('Service worker registration failed:', error);
    }
  } else {
    console.log('Service Worker not supported in this browser');
  }

  await registerServiceWorker();

  window.addEventListener('hashchange', async () => {
    await app.renderPage();

    // Stop all active media
    Camera.stopAllStreams();
  });
});