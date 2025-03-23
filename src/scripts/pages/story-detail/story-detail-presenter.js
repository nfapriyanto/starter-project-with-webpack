export default class StoryDetailPresenter {
    #storyId;
    #view;
    #model;
  
    constructor(storyId, { view, model }) {
      this.#storyId = storyId;
      this.#view = view;
      this.#model = model;
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
        const response = await this.#model.getStoryById(this.#storyId);
  
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
  }