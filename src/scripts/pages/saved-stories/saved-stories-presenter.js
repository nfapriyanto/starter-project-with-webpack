export default class SavedStoriesPresenter {
  #view;
  #model;

  constructor({ view, model }) {
    this.#view = view;
    this.#model = model;
  }

  async showStoriesListMap() {
    this.#view.showMapLoading();
    try {
      await this.#view.initialMap();
    } catch (error) {
      console.error('showStoriesListMap: error:', error);
    } finally {
      this.#view.hideMapLoading();
    }
  }

  async initialStoriesAndMap() {
    this.#view.showLoading();
    try {
      await this.showStoriesListMap();
      await this.getSavedStories();
    } catch (error) {
      console.error('initialStoriesAndMap: error:', error);
      this.#view.populateStoriesListError(error.message);
    } finally {
      this.#view.hideLoading();
    }
  }

  async getSavedStories() {
    this.#view.showLoading();
    try {
      const savedStories = await this.#model.getAllStories();

      // Sort stories by saved timestamp (newest first)
      const sortedStories = savedStories.sort((a, b) => {
        return new Date(b.savedAt) - new Date(a.savedAt);
      });

      this.#view.populateStoriesList('Successfully retrieved saved stories', sortedStories);
    } catch (error) {
      console.error('getSavedStories: error:', error);
      this.#view.populateStoriesListError(error.message);
    } finally {
      this.#view.hideLoading();
    }
  }
}
