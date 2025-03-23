export default class StoryDetailPresenter {
  #storyId;
  #view;
  #apiModel;
  #storageModel;

  constructor(storyId, { view, apiModel, storageModel }) {
    this.#storyId = storyId;
    this.#view = view;
    this.#apiModel = apiModel;
    this.#storageModel = storageModel;
  }

  async showStoryDetailMap() {
    this.#view.showMapLoading();
    try {
      await this.#view.initialMap();
    } catch (error) {
      console.error('showStoryDetailMap: error:', error);
    } finally {
      this.#view.hideMapLoading();
    }
  }

  async showStoryDetail() {
    this.#view.showStoryDetailLoading();
    try {
      const response = await this.#apiModel.getStoryById(this.#storyId);

      if (!response.ok) {
        console.error('showStoryDetail: response:', response);
        this.#view.populateStoryDetailError(response.message);
        return;
      }

      this.#view.populateStoryDetailAndInitialMap(response.message, response.story);
    } catch (error) {
      console.error('showStoryDetail: error:', error);
      this.#view.populateStoryDetailError(error.message);
    } finally {
      this.#view.hideStoryDetailLoading();
    }
  }
  
  async checkSaveStatus() {
    try {
      const isSaved = await this.#storageModel.isStorySaved(this.#storyId);
      
      if (isSaved) {
        this.#view.renderRemoveButton();
      } else {
        this.#view.renderSaveButton();
      }
    } catch (error) {
      console.error('checkSaveStatus error:', error);
      // Default to showing the save button if there's an error
      this.#view.renderSaveButton();
    }
  }
  
  async saveStory(story) {
    try {
      await this.#storageModel.saveStory(story);
      this.#view.saveStorySuccess('Story saved successfully');
    } catch (error) {
      console.error('saveStory error:', error);
      this.#view.saveStoryError(error.message);
    }
  }
  
  async removeStory(storyId) {
    try {
      await this.#storageModel.deleteStory(storyId);
      this.#view.removeStorySuccess('Story removed from saved stories');
    } catch (error) {
      console.error('removeStory error:', error);
      this.#view.removeStoryError(error.message);
    }
  }
}