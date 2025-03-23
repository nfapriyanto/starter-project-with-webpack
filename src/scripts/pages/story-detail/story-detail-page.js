import {
  generateLoaderAbsoluteTemplate,
  generateStoryDetailErrorTemplate,
  generateStoryDetailTemplate,
  generateSaveStoryButtonTemplate,
  generateRemoveStoryButtonTemplate,
} from '../../templates';
import { createCarousel } from '../../utils';
import StoryDetailPresenter from './story-detail-presenter';
import { parseActivePathname } from '../../routes/url-parser';
import Map from '../../utils/map';
import * as API from '../../data/api';
import StoryStorage from '../../data/database';

export default class StoryDetailPage {
  #presenter = null;
  #map = null;
  #currentStory = null;

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
      apiModel: API,
      storageModel: StoryStorage,
    });

    this.#presenter.showStoryDetail();
  }

  async populateStoryDetailAndInitialMap(message, story) {
    // Store the current story for saving functionality
    this.#currentStory = story;
    
    document.getElementById('story-detail').innerHTML = generateStoryDetailTemplate({
      id: story.id,
      name: story.name,
      description: story.description,
      photoUrl: story.photoUrl,
      createdAt: story.createdAt,
      lat: story.lat,
      lon: story.lon
    });

    // Add the save/unsave button container if not already in the template
    const actionsContainer = document.createElement('div');
    actionsContainer.id = 'story-actions-container';
    actionsContainer.className = 'story-detail__actions';
    document.querySelector('.story-detail__body').appendChild(actionsContainer);

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
    
    // Check if the story is saved and update the save button accordingly
    await this.#presenter.checkSaveStatus();
  }

  populateStoryDetailError(message) {
    document.getElementById('story-detail').innerHTML = generateStoryDetailErrorTemplate(message);
  }

  async initialMap() {
    this.#map = await Map.build('#map', {
      zoom: 15,
    });
  }
  
  renderSaveButton() {
    const container = document.getElementById('story-actions-container');
    if (container) {
      container.innerHTML = generateSaveStoryButtonTemplate();
      
      document.getElementById('save-story-button').addEventListener('click', () => {
        this.#presenter.saveStory(this.#currentStory);
      });
    }
  }
  
  renderRemoveButton() {
    const container = document.getElementById('story-actions-container');
    if (container) {
      container.innerHTML = generateRemoveStoryButtonTemplate();
      
      document.getElementById('remove-story-button').addEventListener('click', () => {
        this.#presenter.removeStory(this.#currentStory.id);
      });
    }
  }
  
  saveStorySuccess(message) {
    alert('Story saved successfully!');
    this.renderRemoveButton();
  }
  
  saveStoryError(message) {
    alert(`Error saving story: ${message}`);
  }
  
  removeStorySuccess(message) {
    alert('Story removed from saved stories.');
    this.renderSaveButton();
  }
  
  removeStoryError(message) {
    alert(`Error removing story: ${message}`);
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