import {
    generateLoaderAbsoluteTemplate,
    generateStoryItemTemplate,
    generateStoriesListEmptyTemplate,
    generateStoriesListErrorTemplate,
  } from '../../templates';
  import SavedStoriesPresenter from './saved-stories-presenter';
  import StoryStorage from '../../data/database';
  import Map from '../../utils/map';
  
  export default class SavedStoriesPage {
    #presenter = null;
    #map = null;
  
    async render() {
      return `
        <section>
          <div class="stories-list__map__container">
            <div id="map" class="stories-list__map"></div>
            <div id="map-loading-container"></div>
          </div>
        </section>
  
        <section class="container">
          <h1 class="section-title">Saved Stories</h1>
  
          <div class="stories-list__container">
            <div id="stories-list"></div>
            <div id="stories-list-loading-container"></div>
          </div>
        </section>
      `;
    }
  
    async afterRender() {
      this.#presenter = new SavedStoriesPresenter({
        view: this,
        model: StoryStorage,
      });
  
      await this.#presenter.initialStoriesAndMap();
    }
  
    populateStoriesList(message, stories) {
      const storiesListElement = document.getElementById('stories-list');
      
      if (!storiesListElement) return;
  
      if (stories.length <= 0) {
        this.populateStoriesListEmpty();
        return;
      }
  
      // Clear the map markers before adding new ones
      if (this.#map) {
        this.#map.clearMarkers();
      }
  
      const html = stories.reduce((accumulator, story) => {
        // Add markers to the map if story has location data
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
        storiesListElement.innerHTML = `
          <div class="stories-list__empty">
            <h2>No Saved Stories</h2>
            <p>You haven't saved any stories yet. When you find interesting stories, click the "Save" button to add them here.</p>
          </div>
        `;
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
  }