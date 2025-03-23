import NotificationsPresenter from './notifications-presenter';
import { generateLoaderAbsoluteTemplate } from '../../templates';
import * as API from '../../data/api';
import { 
  isNotificationAvailable,
  isCurrentPushSubscriptionAvailable,
  subscribe,
  unsubscribe,
} from '../../utils/notification-helper';

export default class NotificationsPage {
  #presenter = null;

  async render() {
    const isNotificationSupported = isNotificationAvailable();
    
    if (!isNotificationSupported) {
      return `
        <section class="container">
          <div class="error-container">
            <h1>Notifikasi Tidak Didukung</h1>
            <p>Maaf, browser Anda tidak mendukung fitur notifikasi push.</p>
          </div>
        </section>
      `;
    }
    
    return `
      <section class="container">
        <div class="notifications-container">
          <h1 class="section-title">Kelola Notifikasi</h1>
          
          <div class="notifications-status">
            <h2>Status Berlangganan</h2>
            <div id="subscription-status">
              <p>Memuat status berlangganan...</p>
            </div>
          </div>
          
          <div class="notification-actions">
            <div id="notification-buttons">
              <button id="subscribe-button" class="btn btn-outline">
                <i class="fas fa-spinner loader-button"></i> Memuat...
              </button>
            </div>
          </div>
          
          <div class="notification-info">
            <h2>Tentang Notifikasi Story</h2>
            <p>Dengan berlangganan notifikasi, Anda akan mendapatkan pemberitahuan saat:</p>
            <ul>
              <li>Anda membuat story baru</li>
              <li>Story Anda disukai oleh pengguna lain</li>
              <li>Ada story baru yang dibuat oleh pengguna yang Anda ikuti</li>
            </ul>
          </div>
        </div>
      </section>
    `;
  }

  async afterRender() {
    if (!isNotificationAvailable()) {
      return;
    }
    
    this.#presenter = new NotificationsPresenter({
      view: this,
      model: API,
    });
    
    await this.#presenter.checkSubscriptionStatus();
    this.#setupNotificationButtons();
  }
  
  #setupNotificationButtons() {
    document.getElementById('subscribe-button').addEventListener('click', async () => {
      const isSubscribed = await isCurrentPushSubscriptionAvailable();
      
      if (isSubscribed) {
        this.showLoading();
        await unsubscribe();
      } else {
        this.showLoading();
        await subscribe();
      }
      
      await this.#presenter.checkSubscriptionStatus();
    });
  }
  
  updateSubscriptionStatus(isSubscribed) {
    const statusContainer = document.getElementById('subscription-status');
    const buttonsContainer = document.getElementById('notification-buttons');
    
    if (isSubscribed) {
      statusContainer.innerHTML = `
        <p class="subscription-active">
          <i class="fas fa-check-circle"></i> Anda telah berlangganan notifikasi
        </p>
      `;
      
      buttonsContainer.innerHTML = `
        <button id="subscribe-button" class="btn unsubscribe-button">
          Berhenti Berlangganan <i class="fas fa-bell-slash"></i>
        </button>
      `;
    } else {
      statusContainer.innerHTML = `
        <p class="subscription-inactive">
          <i class="fas fa-times-circle"></i> Anda belum berlangganan notifikasi
        </p>
      `;
      
      buttonsContainer.innerHTML = `
        <button id="subscribe-button" class="btn subscribe-button">
          Berlangganan <i class="fas fa-bell"></i>
        </button>
      `;
    }
    
    this.#setupNotificationButtons();
  }
  
  showError(message) {
    alert(message);
  }
  
  showLoading() {
    document.getElementById('notification-buttons').innerHTML = `
      <button class="btn" disabled>
        <i class="fas fa-spinner loader-button"></i> Sedang proses...
      </button>
    `;
  }
}