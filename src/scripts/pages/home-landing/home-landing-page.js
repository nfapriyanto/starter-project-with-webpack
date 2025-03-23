export default class HomeLandingPage {
    async render() {
      return `
        <section class="landing-hero">
          <div class="container">
            <div class="landing-hero__content">
              <h1 class="landing-hero__title">Berbagi Cerita di Dicoding Story</h1>
              <p class="landing-hero__description">
                Selamat datang di Dicoding Story! Platform untuk berbagi pengalaman, cerita, 
                dan momen spesial seputar Dicoding. Bagikan cerita Anda atau jelajahi cerita dari pengguna lain.
              </p>
              <div class="landing-hero__buttons">
                <a href="#/login" class="btn">Masuk</a>
                <a href="#/register" class="btn btn-outline">Daftar</a>
              </div>
            </div>
            <div class="landing-hero__image">
              <img src="images/landing-illustration.png" alt="Dicoding Story Illustration" onerror="this.src='images/logo.png'; this.style.maxWidth='200px';">
            </div>
          </div>
        </section>
  
        <section class="landing-features">
          <div class="container">
            <h2 class="section-title">Fitur Dicoding Story</h2>
            <div class="landing-features__grid">
              <div class="landing-feature-card">
                <div class="landing-feature-card__icon">
                  <i class="fas fa-image"></i>
                </div>
                <h3 class="landing-feature-card__title">Berbagi Cerita</h3>
                <p class="landing-feature-card__description">
                  Bagikan cerita dan pengalaman Anda dengan komunitas Dicoding melalui teks dan gambar.
                </p>
              </div>
              <div class="landing-feature-card">
                <div class="landing-feature-card__icon">
                  <i class="fas fa-map-marker-alt"></i>
                </div>
                <h3 class="landing-feature-card__title">Tambahkan Lokasi</h3>
                <p class="landing-feature-card__description">
                  Sertakan lokasi pada cerita Anda untuk memberikan konteks tempat peristiwa terjadi.
                </p>
              </div>
              <div class="landing-feature-card">
                <div class="landing-feature-card__icon">
                  <i class="fas fa-bell"></i>
                </div>
                <h3 class="landing-feature-card__title">Notifikasi</h3>
                <p class="landing-feature-card__description">
                  Dapatkan notifikasi untuk aktivitas terbaru dan cerita yang dibuat.
                </p>
              </div>
            </div>
          </div>
        </section>
  
        <section class="landing-cta">
          <div class="container">
            <div class="landing-cta__content">
              <h2 class="landing-cta__title">Mulai Berbagi Cerita Sekarang</h2>
              <p class="landing-cta__description">
                Bergabunglah dengan komunitas Dicoding Story dan bagikan pengalaman Anda sekarang juga!
              </p>
              <div class="landing-cta__buttons">
                <a href="#/register" class="btn">Daftar Sekarang</a>
                <a href="#/stories/guest" class="btn btn-outline">Buat Cerita (Guest)</a>
              </div>
            </div>
          </div>
        </section>
      `;
    }
  
    async afterRender() {
      // Add any additional functionality if needed
    }
  }