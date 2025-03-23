import { convertBase64ToBlob } from '../../utils';
import { generateLoaderAbsoluteTemplate } from '../../templates';
import * as API from '../../data/api';
import Camera from '../../utils/camera';
import Map from '../../utils/map';

export default class GuestStoryPage {
  #form = null;
  #camera = null;
  #isCameraOpen = false;
  #photo = null;
  #map = null;

  async render() {
    return `
      <section>
        <div class="add-story__header">
          <div class="container">
            <h1 class="add-story__header__title">Buat Story sebagai Tamu</h1>
            <p class="add-story__header__description">
              Silakan lengkapi formulir di bawah untuk membuat story baru sebagai tamu.<br>
              <strong>Anda sedang membuat story tanpa login.</strong>
            </p>
          </div>
        </div>
      </section>
    
      <section class="container">
        <div class="new-form__container">
          <form id="add-story-form" class="new-form">
            <div class="form-control">
              <label for="description-input" class="new-form__description__title">Deskripsi</label>
    
              <div class="new-form__description__container">
                <textarea
                  id="description-input"
                  name="description"
                  placeholder="Masukkan deskripsi untuk story Anda"
                  required
                ></textarea>
              </div>
            </div>
            
            <div class="form-control">
              <label for="photo-input" class="new-form__documentations__title">Foto</label>
              <div id="documentations-more-info">Unggah sebuah foto untuk story Anda (wajib).</div>
    
              <div class="new-form__documentations__container">
                <div class="new-form__documentations__buttons">
                  <button id="photo-input-button" class="btn btn-outline" type="button">
                    Pilih Gambar
                  </button>
                  <input
                    id="photo-input"
                    name="photo"
                    type="file"
                    accept="image/*"
                    hidden="hidden"
                    required
                    aria-describedby="documentations-more-info"
                  >
                  <button id="open-camera-button" class="btn btn-outline" type="button">
                    Buka Kamera
                  </button>
                </div>
                <div id="camera-container" class="new-form__camera__container">
                  <video id="camera-video" class="new-form__camera__video">
                    Video stream not available.
                  </video>
                  <canvas id="camera-canvas" class="new-form__camera__canvas"></canvas>
    
                  <div class="new-form__camera__tools">
                    <select id="camera-select"></select>
                    <div class="new-form__camera__tools_buttons">
                      <button id="camera-take-button" class="btn" type="button">
                        Ambil Gambar
                      </button>
                    </div>
                  </div>
                </div>
                <div id="photo-preview-container" class="new-form__documentations__outputs"></div>
              </div>
            </div>
            
            <div class="form-control">
              <div class="new-form__location__title">Lokasi (opsional)</div>
              <div>Tambahkan lokasi untuk membuat story Anda lebih informatif.</div>
    
              <div class="new-form__location__container">
                <div class="new-form__location__map__container">
                  <div id="map" class="new-form__location__map"></div>
                  <div id="map-loading-container"></div>
                </div>
                <div class="new-form__location__lat-lng">
                  <input type="number" name="latitude" placeholder="Latitude" step="any">
                  <input type="number" name="longitude" placeholder="Longitude" step="any">
                </div>
              </div>
            </div>
            
            <div class="form-buttons">
              <span id="submit-button-container">
                <button class="btn" type="submit">Buat Story</button>
              </span>
              <a class="btn btn-outline" href="#/">Batal</a>
            </div>
          </form>
        </div>
      </section>
    `;
  }

  async afterRender() {
    this.#setupForm();
    this.#setupMap();
  }

  #setupForm() {
    this.#form = document.getElementById('add-story-form');
    
    // Setup form submission
    this.#form.addEventListener('submit', async (event) => {
      event.preventDefault();

      if (!this.#photo) {
        alert('Harap pilih foto untuk story Anda');
        return;
      }

      await this.#submitStory();
    });

    // Photo input setup
    document.getElementById('photo-input').addEventListener('change', async (event) => {
      if (event.target.files && event.target.files[0]) {
        this.#photo = event.target.files[0];
        await this.#updatePhotoPreview();
      }
    });

    document.getElementById('photo-input-button').addEventListener('click', () => {
      this.#form.elements.namedItem('photo').click();
    });

    // Camera setup
    const cameraContainer = document.getElementById('camera-container');
    document
      .getElementById('open-camera-button')
      .addEventListener('click', async (event) => {
        cameraContainer.classList.toggle('open');
        this.#isCameraOpen = cameraContainer.classList.contains('open');

        if (this.#isCameraOpen) {
          event.currentTarget.textContent = 'Tutup Kamera';
          this.#setupCamera();
          this.#camera.launch();
          return;
        }

        event.currentTarget.textContent = 'Buka Kamera';
        this.#camera.stop();
      });
  }
  
  async #submitStory() {
    // Tampilkan loading button
    const submitButtonContainer = document.getElementById('submit-button-container');
    if (submitButtonContainer) {
      submitButtonContainer.innerHTML = `
        <button class="btn" type="submit" disabled>
          <i class="fas fa-spinner loader-button"></i> Buat Story
        </button>
      `;
    }
    
    try {
      const data = {
        description: this.#form.elements.namedItem('description').value,
        photo: this.#photo,
        latitude: this.#form.elements.namedItem('latitude').value || null,
        longitude: this.#form.elements.namedItem('longitude').value || null,
      };
      
      // Tambahkan logging untuk debugging
      console.log('Mengirim data guest story:', data);
      
      // Gunakan API khusus untuk guest story
      const response = await API.addNewStoryGuest(data);
      console.log('Response dari API:', response);
  
      if (!response.ok) {
        console.error('submitStory: response:', response);
        alert(response.message || 'Gagal membuat story');
        return;
      }
  
      // Berhasil menambahkan story
      alert('Story berhasil dibuat!');
      
      // Reset form
      this.#form.reset();
      this.#photo = null;
      this.#updatePhotoPreview();
      
      // Redirect ke halaman utama
      location.hash = '/';
      
    } catch (error) {
      console.error('submitStory: error:', error);
      alert(error.message || 'Terjadi kesalahan saat membuat story');
    } finally {
      // Tampilkan tombol normal kembali
      const submitButtonContainer = document.getElementById('submit-button-container');
      if (submitButtonContainer) {
        submitButtonContainer.innerHTML = `
          <button class="btn" type="submit">Buat Story</button>
        `;
      }
    }
  }
  
  async #updatePhotoPreview() {
    const photoPreviewContainer = document.getElementById('photo-preview-container');
    const photoInput = document.getElementById('photo-input');
    
    if (!photoPreviewContainer) return;
    
    if (!this.#photo) {
      photoPreviewContainer.innerHTML = '';
      return;
    }
  
    // Remove required attribute when photo is set
    if (this.#photo instanceof Blob && photoInput) {
      photoInput.removeAttribute('required');
    }
  
    const imageUrl = URL.createObjectURL(this.#photo);
    photoPreviewContainer.innerHTML = `
      <div class="new-form__documentations__outputs-item">
        <img src="${imageUrl}" alt="Foto story">
      </div>
    `;
  }
  
  #setupCamera() {
    if (!this.#camera) {
      this.#camera = new Camera({
        video: document.getElementById('camera-video'),
        cameraSelect: document.getElementById('camera-select'),
        canvas: document.getElementById('camera-canvas'),
      });
    }

    this.#camera.addCheeseButtonListener('#camera-take-button', async () => {
      const image = await this.#camera.takePicture();
      this.#photo = image;
      await this.#updatePhotoPreview();

      setTimeout(() => {
        this.#camera.stop();
      }, 1000);
    });
  }
  
  async #setupMap() {
    try {
      const mapLoadingContainer = document.getElementById('map-loading-container');
      if (mapLoadingContainer) {
        mapLoadingContainer.innerHTML = generateLoaderAbsoluteTemplate();
      }
      
      this.#map = await Map.build('#map', {
        zoom: 10,
        locate: true,
      });

      // Preparing marker for select coordinate
      const centerCoordinate = this.#map.getCenter();

      this.#updateLatLngInput(centerCoordinate.latitude, centerCoordinate.longitude);

      const draggableMarker = this.#map.addMarker(
        [centerCoordinate.latitude, centerCoordinate.longitude],
        { draggable: 'true' },
      );

      draggableMarker.addEventListener('move', (event) => {
        const coordinate = event.target.getLatLng();
        this.#updateLatLngInput(coordinate.lat, coordinate.lng);
      });

      this.#map.addMapEventListener('click', (event) => {
        draggableMarker.setLatLng(event.latlng);
        this.#map.changeCamera([event.latlng.lat, event.latlng.lng]);
      });
    } catch (error) {
      console.error('Error initializing map:', error);
    } finally {
      const mapLoadingContainer = document.getElementById('map-loading-container');
      if (mapLoadingContainer) {
        mapLoadingContainer.innerHTML = '';
      }
    }
  }
  
  #updateLatLngInput(latitude, longitude) {
    if (!this.#form) return;
    
    const latitudeInput = this.#form.elements.namedItem('latitude');
    const longitudeInput = this.#form.elements.namedItem('longitude');
    
    if (latitudeInput && longitudeInput) {
      latitudeInput.value = latitude;
      longitudeInput.value = longitude;
    }
  }
}