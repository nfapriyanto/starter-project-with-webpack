import {
  generateLoaderAbsoluteTemplate,
  generateStoryItemTemplate,
  generateStoriesListEmptyTemplate,
  generateStoriesListErrorTemplate,
} from '../../templates';
import StoriesPresenter from './stories-presenter';
import Map from '../../utils/map';
import * as API from '../../data/api';
import { convertBase64ToBlob } from '../../utils';
import Camera from '../../utils/camera';

export default class StoriesPage {
  #presenter = null;
  #map = null;
  #currentPage = 1;
  #pageSize = 5;
  #showAddStoryForm = false;

  // Properti untuk fungsi add story
  #form = null;
  #camera = null;
  #isCameraOpen = false;
  #photo = null;
  #addStoryMap = null;

  async render() {
    // Jika menampilkan form tambah story
    if (this.#showAddStoryForm) {
      return this.#renderAddStoryForm();
    }

    // Jika menampilkan daftar story
    return `
      <section>
        <div class="stories-list__map__container">
          <div id="map" class="stories-list__map"></div>
          <div id="map-loading-container"></div>
        </div>
      </section>

      <section class="container">
        <h1 class="section-title">Daftar Story</h1>

        <div class="stories-list__container">
          <div class="stories-filter">
            <div class="filter-group">
              <label for="location-filter" class="filter-label">
                <input type="checkbox" id="location-filter" name="location-filter"> 
                Tampilkan story dengan lokasi
              </label>
            </div>
            <div class="filter-group">
              <label for="size-filter" class="filter-label">Jumlah per halaman:</label>
              <select id="size-filter" class="size-select">
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="20">20</option>
              </select>
            </div>
          </div>
          
          <div id="stories-list"></div>
          <div id="stories-list-loading-container"></div>
          
          <div class="pagination">
            <button id="prev-page" class="btn btn-outline pagination-btn" disabled>
              <i class="fas fa-chevron-left"></i> Sebelumnya
            </button>
            <span id="page-info" class="page-info">Halaman 1</span>
            <button id="next-page" class="btn btn-outline pagination-btn">
              Selanjutnya <i class="fas fa-chevron-right"></i>
            </button>
          </div>
        </div>
      </section>
      
      <button id="add-story-button" class="floating-add-button" title="Buat Story Baru">
        <i class="fas fa-plus"></i>
      </button>
    `;
  }

  #renderAddStoryForm() {
    return `
      <section>
        <div class="add-story__header">
          <div class="container">
            <h1 class="add-story__header__title">Buat Story Baru</h1>
            <p class="add-story__header__description">
              Silakan lengkapi formulir di bawah untuk membuat story baru.
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
                  <div id="add-story-map" class="new-form__location__map"></div>
                  <div id="add-story-map-loading-container"></div>
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
              <button id="cancel-add-story-button" class="btn btn-outline" type="button">Batal</button>
            </div>
          </form>
        </div>
      </section>
    `;
  }

  async afterRender() {
    this.#presenter = new StoriesPresenter({
      view: this,
      model: API,
    });

    if (this.#showAddStoryForm) {
      this.#setupAddStoryForm();
    } else {
      this.#setupStoryListPage();
    }
  }

  #setupStoryListPage() {
    this.#setupFilters();
    this.#setupPagination();
    this.#setupAddStoryButton();
    this.#presenter.initialStoriesAndMap();
  }

  #setupAddStoryButton() {
    const addStoryButton = document.getElementById('add-story-button');
    if (addStoryButton) {
      // Cara yang lebih baik untuk menghindari multiple event handlers
      const newAddStoryButton = addStoryButton.cloneNode(true);
      addStoryButton.parentNode.replaceChild(newAddStoryButton, addStoryButton);

      newAddStoryButton.addEventListener('click', () => {
        this.#showAddStoryForm = true;
        this.reRender();
      });
    }
  }

  async reRender() {
    // Simpan referensi ke elemen content
    const contentElement = document.getElementById('main-content');

    // Render ulang halaman ke elemen content
    contentElement.innerHTML = await this.render();

    // Panggil afterRender untuk menginisialisasi event handler
    await this.afterRender();

    // Scroll ke atas halaman
    window.scrollTo(0, 0);
  }

  #setupFilters() {
    // Location filter
    const locationFilter = document.getElementById('location-filter');
    if (locationFilter) {
      locationFilter.addEventListener('change', (event) => {
        // Reset to page 1 when filter changes
        this.#currentPage = 1;
        this.updatePageInfo();
        this.#presenter.getStories({
          location: event.target.checked ? 1 : 0,
          page: this.#currentPage,
          size: this.#pageSize,
        });
      });
    }

    // Page size filter
    const sizeFilter = document.getElementById('size-filter');
    if (sizeFilter) {
      sizeFilter.addEventListener('change', (event) => {
        this.#pageSize = parseInt(event.target.value, 10);
        // Reset to page 1 when page size changes
        this.#currentPage = 1;
        this.updatePageInfo();

        const locationChecked = document.getElementById('location-filter')?.checked || false;
        this.#presenter.getStories({
          page: this.#currentPage,
          size: this.#pageSize,
          location: locationChecked ? 1 : 0,
        });
      });

      // Set initial value
      sizeFilter.value = this.#pageSize.toString();
    }
  }

  #setupPagination() {
    // Previous page button
    const prevButton = document.getElementById('prev-page');
    if (prevButton) {
      prevButton.addEventListener('click', () => {
        if (this.#currentPage > 1) {
          this.#currentPage--;
          this.updatePageInfo();

          const locationChecked = document.getElementById('location-filter')?.checked || false;
          this.#presenter.getStories({
            page: this.#currentPage,
            size: this.#pageSize,
            location: locationChecked ? 1 : 0,
          });
        }
      });
    }

    // Next page button
    const nextButton = document.getElementById('next-page');
    if (nextButton) {
      nextButton.addEventListener('click', () => {
        this.#currentPage++;
        this.updatePageInfo();

        const locationChecked = document.getElementById('location-filter')?.checked || false;
        this.#presenter.getStories({
          page: this.#currentPage,
          size: this.#pageSize,
          location: locationChecked ? 1 : 0,
        });
      });
    }
  }

  #setupAddStoryForm() {
    this.#form = document.getElementById('add-story-form');
    if (!this.#form) return;

    // Setup form submission
    this.#form.addEventListener('submit', async (event) => {
      event.preventDefault();

      if (!this.#photo) {
        alert('Harap pilih foto untuk story Anda');
        return;
      }

      const data = {
        description: this.#form.elements.namedItem('description').value,
        photo: this.#photo,
        latitude: this.#form.elements.namedItem('latitude').value || null,
        longitude: this.#form.elements.namedItem('longitude').value || null,
      };

      await this.#presenter.submitNewStory(data);
    });

    // Photo input setup
    const photoInput = document.getElementById('photo-input');
    if (photoInput) {
      photoInput.addEventListener('change', async (event) => {
        if (event.target.files && event.target.files[0]) {
          this.#photo = event.target.files[0];
          await this.#updatePhotoPreview();
        }
      });
    }

    const photoInputButton = document.getElementById('photo-input-button');
    if (photoInputButton && photoInput) {
      photoInputButton.addEventListener('click', () => {
        photoInput.click();
      });
    }

    // Camera setup
    const cameraContainer = document.getElementById('camera-container');
    const openCameraButton = document.getElementById('open-camera-button');
    if (cameraContainer && openCameraButton) {
      openCameraButton.addEventListener('click', async (event) => {
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

    // Cancel button setup
    const cancelButton = document.getElementById('cancel-add-story-button');
    if (cancelButton) {
      cancelButton.addEventListener('click', () => {
        this.#showAddStoryForm = false;
        this.reRender();
      });
    }

    // Initialize map for add story form
    this.#initializeAddStoryMap();
  }

  async #initializeAddStoryMap() {
    try {
      const mapLoadingContainer = document.getElementById('add-story-map-loading-container');
      if (mapLoadingContainer) {
        mapLoadingContainer.innerHTML = generateLoaderAbsoluteTemplate();
      }

      this.#addStoryMap = await Map.build('#add-story-map', {
        zoom: 10,
        locate: true,
      });

      // Preparing marker for select coordinate
      const centerCoordinate = this.#addStoryMap.getCenter();

      this.#updateLatLngInput(centerCoordinate.latitude, centerCoordinate.longitude);

      const draggableMarker = this.#addStoryMap.addMarker(
        [centerCoordinate.latitude, centerCoordinate.longitude],
        { draggable: 'true' },
      );

      draggableMarker.addEventListener('move', (event) => {
        const coordinate = event.target.getLatLng();
        this.#updateLatLngInput(coordinate.lat, coordinate.lng);
      });

      this.#addStoryMap.addMapEventListener('click', (event) => {
        draggableMarker.setLatLng(event.latlng);
        this.#addStoryMap.changeCamera([event.latlng.lat, event.latlng.lng]);
      });
    } catch (error) {
      console.error('Error initializing add story map:', error);
    } finally {
      const mapLoadingContainer = document.getElementById('add-story-map-loading-container');
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

  #setupCamera() {
    if (!this.#camera) {
      const videoElement = document.getElementById('camera-video');
      const cameraSelectElement = document.getElementById('camera-select');
      const canvasElement = document.getElementById('camera-canvas');

      if (videoElement && cameraSelectElement && canvasElement) {
        this.#camera = new Camera({
          video: videoElement,
          cameraSelect: cameraSelectElement,
          canvas: canvasElement,
        });
      }
    }

    const takePictureButton = document.getElementById('camera-take-button');
    if (this.#camera && takePictureButton) {
      this.#camera.addCheeseButtonListener('#camera-take-button', async () => {
        const image = await this.#camera.takePicture();
        this.#photo = image;
        await this.#updatePhotoPreview();

        setTimeout(() => {
          this.#camera.stop();
        }, 1000);
      });
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
  
  updatePageInfo() {
    const pageInfoElement = document.getElementById('page-info');
    if (pageInfoElement) {
      pageInfoElement.textContent = `Halaman ${this.#currentPage}`;
    }

    // Enable/disable previous button
    const prevButton = document.getElementById('prev-page');
    if (prevButton) {
      prevButton.disabled = this.#currentPage <= 1;

      // If we're at the first page, disable the previous button
      if (this.#currentPage <= 1) {
        prevButton.classList.add('btn-disabled');
      } else {
        prevButton.classList.remove('btn-disabled');
      }
    }
  }

  populateStoriesList(message, stories) {
    const storiesListElement = document.getElementById('stories-list');
    if (!storiesListElement) return;

    if (stories.length <= 0) {
      this.populateStoriesListEmpty();

      // Disable next button if no stories found (likely reached the end)
      const nextButton = document.getElementById('next-page');
      if (nextButton) {
        nextButton.disabled = true;
        nextButton.classList.add('btn-disabled');
      }

      // If we're past page 1 and got no results, go back one page
      if (this.#currentPage > 1) {
        this.#currentPage--;
        this.updatePageInfo();

        const locationChecked = document.getElementById('location-filter')?.checked || false;
        this.#presenter.getStories({
          page: this.#currentPage,
          size: this.#pageSize,
          location: locationChecked ? 1 : 0,
        });
      }

      return;
    }

    // Enable next button if we have stories
    const nextButton = document.getElementById('next-page');
    if (nextButton) {
      nextButton.disabled = false;
      nextButton.classList.remove('btn-disabled');
    }

    // Clear the map markers when loading new stories
    if (this.#map) {
      this.#map.clearMarkers();
    }

    const html = stories.reduce((accumulator, story) => {
      if (this.#map && story.lat && story.lon) {
        const coordinate = [story.lat, story.lon];
        const markerOptions = { alt: story.name };
        const popupOptions = { content: story.name };

        this.#map.addMarker(coordinate, markerOptions, popupOptions);
      }

      return accumulator.concat(
        generateStoryItemTemplate({
          id: story.id,
          name: story.name,
          description: story.description,
          photoUrl: story.photoUrl,
          createdAt: story.createdAt,
          lat: story.lat,
          lon: story.lon,
        }),
      );
    }, '');

    storiesListElement.innerHTML = `
      <div class="stories-list">${html}</div>
    `;
  }

  populateStoriesListEmpty() {
    const storiesListElement = document.getElementById('stories-list');
    if (storiesListElement) {
      storiesListElement.innerHTML = generateStoriesListEmptyTemplate();
    }
  }

  populateStoriesListError(message) {
    const storiesListElement = document.getElementById('stories-list');
    if (storiesListElement) {
      storiesListElement.innerHTML = generateStoriesListErrorTemplate(message);
    }
  }

  async initialMap() {
    this.#map = await Map.build('#map', {
      zoom: 5,
      locate: true,
    });
  }

  showMapLoading() {
    const mapLoadingContainer = document.getElementById('map-loading-container');
    if (mapLoadingContainer) {
      mapLoadingContainer.innerHTML = generateLoaderAbsoluteTemplate();
    }
  }

  hideMapLoading() {
    const mapLoadingContainer = document.getElementById('map-loading-container');
    if (mapLoadingContainer) {
      mapLoadingContainer.innerHTML = '';
    }
  }

  showLoading() {
    const loadingContainer = document.getElementById('stories-list-loading-container');
    if (loadingContainer) {
      loadingContainer.innerHTML = generateLoaderAbsoluteTemplate();
    }
  }

  hideLoading() {
    const loadingContainer = document.getElementById('stories-list-loading-container');
    if (loadingContainer) {
      loadingContainer.innerHTML = '';
    }
  }

  showSubmitLoadingButton() {
    const submitButtonContainer = document.getElementById('submit-button-container');
    if (submitButtonContainer) {
      submitButtonContainer.innerHTML = `
        <button class="btn" type="submit" disabled>
          <i class="fas fa-spinner loader-button"></i> Buat Story
        </button>
      `;
    }
  }

  hideSubmitLoadingButton() {
    const submitButtonContainer = document.getElementById('submit-button-container');
    if (submitButtonContainer) {
      submitButtonContainer.innerHTML = `
        <button class="btn" type="submit">Buat Story</button>
      `;
    }
  }

  storyAddedSuccessfully(message) {
    console.log(message);

    // Kembali ke tampilan daftar story
    this.#showAddStoryForm = false;
    this.reRender();

    // Tampilkan pesan sukses
    alert('Story berhasil dibuat!');
  }

  storyAddedFailed(message) {
    alert(message);
  }
}
