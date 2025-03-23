export default class StoriesPresenter {
  #view;
  #model;
  #currentFilter = {
    page: 1,
    size: 5,
    location: 0
  };

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
      await this.getStories();
    } catch (error) {
      console.error('initialStoriesAndMap: error:', error);
      this.#view.populateStoriesListError(error.message);
    } finally {
      this.#view.hideLoading();
    }
  }

  async getStories(options = {}) {
    this.#view.showLoading();
    try {
      // Update filter with new options
      this.#currentFilter = {
        ...this.#currentFilter,
        ...options
      };
      
      const response = await this.#model.getAllStory(this.#currentFilter);

      if (!response.ok) {
        console.error('getStories: response:', response);
        this.#view.populateStoriesListError(response.message);
        return;
      }

      this.#view.populateStoriesList(response.message, response.listStory || []);
    } catch (error) {
      console.error('getStories: error:', error);
      this.#view.populateStoriesListError(error.message);
    } finally {
      this.#view.hideLoading();
    }
  }
  
  async submitNewStory({ description, photo, latitude, longitude }) {
    this.#view.showSubmitLoadingButton();
    try {
      let response;
      
      // Gunakan API yang sesuai untuk menambah story
      response = await this.#model.addNewStory({
        description,
        photo,
        latitude,
        longitude,
      });

      if (!response.ok) {
        console.error('submitNewStory: response:', response);
        this.#view.storyAddedFailed(response.message);
        return;
      }

      // Beritahu view bahwa story berhasil ditambahkan
      this.#view.storyAddedSuccessfully(response.message);
      
      // Refresh daftar story
      this.getStories({
        page: 1, // Kembali ke halaman pertama
        size: this.#currentFilter.size,
        location: this.#currentFilter.location
      });
    } catch (error) {
      console.error('submitNewStory: error:', error);
      this.#view.storyAddedFailed(error.message);
    } finally {
      this.#view.hideSubmitLoadingButton();
    }
  }
}