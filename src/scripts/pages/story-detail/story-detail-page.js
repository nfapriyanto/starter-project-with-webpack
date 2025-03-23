import {
    generateLoaderAbsoluteTemplate,
    generateStoryDetailErrorTemplate,
    generateStoryDetailTemplate,
  } from '../../templates';
  import { createCarousel } from '../../utils';
  import StoryDetailPresenter from './story-detail-presenter';
  import { parseActivePathname } from '../../routes/url-parser';
  import Map from '../../utils/map';
  import * as API from '../../data/api';
  
  export default class StoryDetailPage {
    #presenter = null;
    #map = null;
  
    async render() {
      return `
        <section>
          <div class="story-detail__container">
            <div id="story-detail" class="story-detail"></div>
            <div id="story-detail-loading-container"></div>
          </div>
        </section>
      `;
    }
  
    async afterRender() {
      this.#presenter = new StoryDetailPresenter(parseActivePathname().id, {
        view: this,
        model: API,
      });
  
      this.#presenter.showStoryDetail();
    }
  
    async populateStoryDetailAndInitialMap(message, story) {
      document.getElementById('story-detail').innerHTML = generateStoryDetailTemplate({
        id: story.id,
        name: story.name,
        description: story.description,
        photoUrl: story.photoUrl,
        createdAt: story.createdAt,
        lat: story.lat,
        lon: story.lon
      });
  
      // Map (only if story has location)
      if (story.lat && story.lon) {
        await this.#presenter.showStoryDetailMap();
        if (this.#map) {
          const storyCoordinate = [story.lat, story.lon];
          const markerOptions = { alt: story.name };
          const popupOptions = { content: story.name };
  
          this.#map.changeCamera(storyCoordinate);
          this.#map.addMarker(storyCoordinate, markerOptions, popupOptions);
        }
      }
    }
  
    populateStoryDetailError(message) {
      document.getElementById('story-detail').innerHTML = generateStoryDetailErrorTemplate(message);
    }
  
    async initialMap() {
      this.#map = await Map.build('#map', {
        zoom: 15,
      });
    }
  
    showStoryDetailLoading() {
      document.getElementById('story-detail-loading-container').innerHTML =
        generateLoaderAbsoluteTemplate();
    }
  
    hideStoryDetailLoading() {
      document.getElementById('story-detail-loading-container').innerHTML = '';
    }
  
    showMapLoading() {
      document.getElementById('map-loading-container').innerHTML = generateLoaderAbsoluteTemplate();
    }
  
    hideMapLoading() {
      document.getElementById('map-loading-container').innerHTML = '';
    }
  }