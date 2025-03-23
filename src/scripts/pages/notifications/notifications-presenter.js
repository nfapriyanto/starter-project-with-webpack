import {
  isCurrentPushSubscriptionAvailable,
  getPushSubscription,
  requestNotificationPermission,
} from '../../utils/notification-helper';
import { VAPID_PUBLIC_KEY } from '../../config';

export default class NotificationsPresenter {
  #view;
  #model;

  constructor({ view, model }) {
    this.#view = view;
    this.#model = model;
  }

  async checkSubscriptionStatus() {
    try {
      const isSubscribed = await isCurrentPushSubscriptionAvailable();
      this.#view.updateSubscriptionStatus(isSubscribed);
    } catch (error) {
      console.error('checkSubscriptionStatus: error:', error);
      this.#view.showError('Terjadi kesalahan saat memeriksa status berlangganan');
    }
  }

  async subscribeToNotifications() {
    try {
      // Request notification permission first
      const permissionGranted = await requestNotificationPermission();
      if (!permissionGranted) {
        this.#view.showError('Izin notifikasi diperlukan untuk berlangganan');
        return false;
      }

      // Get service worker registration and subscribe
      const registration = await navigator.serviceWorker.getRegistration();
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      // Send subscription to server
      const { endpoint, keys } = subscription.toJSON();
      const response = await this.#model.subscribePushNotification({
        endpoint,
        keys: {
          p256dh: keys.p256dh,
          auth: keys.auth,
        },
      });

      if (!response.ok) {
        console.error('subscribeToNotifications: response:', response);
        // Unsubscribe if server registration failed
        await subscription.unsubscribe();
        this.#view.showError(response.message || 'Gagal mendaftarkan langganan di server');
        return false;
      }

      return true;
    } catch (error) {
      console.error('subscribeToNotifications: error:', error);
      this.#view.showError('Terjadi kesalahan saat berlangganan notifikasi');
      return false;
    }
  }

  async unsubscribeFromNotifications() {
    try {
      // Get current subscription
      const subscription = await getPushSubscription();
      if (!subscription) {
        return true; // Already unsubscribed
      }

      // Call API to unsubscribe first
      const { endpoint } = subscription.toJSON();
      const response = await this.#model.unsubscribePushNotification({ endpoint });

      if (!response.ok) {
        console.error('unsubscribeFromNotifications: response:', response);
        this.#view.showError(response.message || 'Gagal menghapus langganan di server');
        return false;
      }

      // Then unsubscribe from browser
      const result = await subscription.unsubscribe();
      if (!result) {
        this.#view.showError('Gagal berhenti berlangganan dari browser');
        return false;
      }

      return true;
    } catch (error) {
      console.error('unsubscribeFromNotifications: error:', error);
      this.#view.showError('Terjadi kesalahan saat berhenti berlangganan');
      return false;
    }
  }

  // Helper function to convert VAPID key to Uint8Array
  urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }

    return outputArray;
  }
}
