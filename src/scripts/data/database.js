import { openDB } from 'idb';

const DATABASE_NAME = 'story-app-db';
const DATABASE_VERSION = 1;
const OBJECT_STORE_NAME = 'saved-stories';

const dbPromise = openDB(DATABASE_NAME, DATABASE_VERSION, {
  upgrade(database) {
    database.createObjectStore(OBJECT_STORE_NAME, {
      keyPath: 'id'
    });
  }
});

const StoryStorage = {
  async saveStory(story) {
    if (!Object.hasOwn(story, 'id')) {
      throw new Error('Story must have an ID to be saved');
    }
    
    // Add timestamp for sorting
    const storyWithTimestamp = {
      ...story,
      savedAt: new Date().toISOString()
    };
    
    return (await dbPromise).put(OBJECT_STORE_NAME, storyWithTimestamp);
  },
  
  async getStory(id) {
    if (!id) {
      throw new Error('Story ID is required');
    }
    
    return (await dbPromise).get(OBJECT_STORE_NAME, id);
  },
  
  async getAllStories() {
    return (await dbPromise).getAll(OBJECT_STORE_NAME);
  },
  
  async deleteStory(id) {
    return (await dbPromise).delete(OBJECT_STORE_NAME, id);
  },
  
  async isStorySaved(id) {
    if (!id) return false;
    
    const story = await this.getStory(id);
    return !!story;
  }
};

export default StoryStorage;