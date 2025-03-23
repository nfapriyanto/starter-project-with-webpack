import { getAccessToken } from '../utils/auth';
import { BASE_URL } from '../config';

const ENDPOINTS = {
  // Auth
  REGISTER: `${BASE_URL}/register`,
  LOGIN: `${BASE_URL}/login`,

  // Story
  STORY_LIST: `${BASE_URL}/stories`,
  STORY_DETAIL: (id) => `${BASE_URL}/stories/${id}`,
  ADD_NEW_STORY: `${BASE_URL}/stories`,
  ADD_NEW_STORY_GUEST: `${BASE_URL}/stories/guest`,

  // Story Notification
  SUBSCRIBE: `${BASE_URL}/notifications/subscribe`,
  UNSUBSCRIBE: `${BASE_URL}/notifications/subscribe`, // Sama dengan subscribe tapi menggunakan method DELETE
};

// Helper function untuk handling response
const handleResponse = async (fetchResponse) => {
  const json = await fetchResponse.json();
  
  if (!fetchResponse.ok) {
    // Jika response bukan 2xx, throw error dengan pesan dari API
    throw new Error(json.message || 'Terjadi kesalahan pada server');
  }
  
  return {
    ...json,
    ok: fetchResponse.ok,
  };
};

export async function getRegistered({ name, email, password }) {
  try {
    const data = JSON.stringify({ name, email, password });

    const fetchResponse = await fetch(ENDPOINTS.REGISTER, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: data,
    });
    
    return await handleResponse(fetchResponse);
  } catch (error) {
    return {
      error: true,
      message: error.message,
      ok: false,
    };
  }
}

export async function getLogin({ email, password }) {
  try {
    const data = JSON.stringify({ email, password });

    const fetchResponse = await fetch(ENDPOINTS.LOGIN, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: data,
    });
    
    return await handleResponse(fetchResponse);
  } catch (error) {
    return {
      error: true,
      message: error.message,
      ok: false,
    };
  }
}

export async function getAllStory(options = {}) {
  try {
    const accessToken = getAccessToken();
    
    // Tambahkan parameter query sesuai dokumentasi
    const { page, size, location } = options;
    const params = new URLSearchParams();
    
    if (page) params.append('page', page);
    if (size) params.append('size', size);
    if (location !== undefined) params.append('location', location ? 1 : 0);
    
    const url = `${ENDPOINTS.STORY_LIST}${params.toString() ? `?${params.toString()}` : ''}`;

    const fetchResponse = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    
    return await handleResponse(fetchResponse);
  } catch (error) {
    return {
      error: true,
      message: error.message,
      ok: false,
    };
  }
}

export async function getStoryById(id) {
  try {
    const accessToken = getAccessToken();

    const fetchResponse = await fetch(ENDPOINTS.STORY_DETAIL(id), {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    
    return await handleResponse(fetchResponse);
  } catch (error) {
    return {
      error: true,
      message: error.message,
      ok: false,
    };
  }
}

export async function addNewStory({
  description,
  photo,
  latitude,
  longitude,
}) {
  try {
    const accessToken = getAccessToken();

    const formData = new FormData();
    formData.set('description', description);
    formData.set('photo', photo);
    
    // Jika latitude dan longitude disediakan, tambahkan ke formData
    if (latitude) formData.set('lat', latitude);
    if (longitude) formData.set('lon', longitude);

    const fetchResponse = await fetch(ENDPOINTS.ADD_NEW_STORY, {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}` },
      body: formData,
    });
    
    return await handleResponse(fetchResponse);
  } catch (error) {
    return {
      error: true,
      message: error.message,
      ok: false,
    };
  }
}

export async function addNewStoryGuest({
  description,
  photo,
  latitude,
  longitude,
}) {
  try {
    // Debugging
    console.log('addNewStoryGuest dipanggil dengan:');
    console.log('- description:', description);
    console.log('- photo:', photo ? 'Ada' : 'Tidak ada');
    console.log('- latitude:', latitude);
    console.log('- longitude:', longitude);

    const formData = new FormData();
    formData.set('description', description);
    formData.set('photo', photo);
    
    // Jika latitude dan longitude disediakan, tambahkan ke formData
    if (latitude) formData.set('lat', latitude);
    if (longitude) formData.set('lon', longitude);

    console.log('Mengirim request ke:', ENDPOINTS.ADD_NEW_STORY_GUEST);
    
    const fetchResponse = await fetch(ENDPOINTS.ADD_NEW_STORY_GUEST, {
      method: 'POST',
      body: formData,
    });
    
    return await handleResponse(fetchResponse);
  } catch (error) {
    console.error('API Error addNewStoryGuest:', error);
    return {
      error: true,
      message: error.message,
      ok: false,
    };
  }
}

export async function subscribePushNotification({ endpoint, keys: { p256dh, auth } }) {
  try {
    const accessToken = getAccessToken();
    const data = JSON.stringify({
      endpoint,
      keys: { p256dh, auth },
    });

    const fetchResponse = await fetch(ENDPOINTS.SUBSCRIBE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: data,
    });
    
    return await handleResponse(fetchResponse);
  } catch (error) {
    return {
      error: true,
      message: error.message,
      ok: false,
    };
  }
}

export async function unsubscribePushNotification({ endpoint }) {
  try {
    const accessToken = getAccessToken();
    const data = JSON.stringify({
      endpoint,
    });

    const fetchResponse = await fetch(ENDPOINTS.UNSUBSCRIBE, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: data,
    });
    
    return await handleResponse(fetchResponse);
  } catch (error) {
    return {
      error: true,
      message: error.message,
      ok: false,
    };
  }
}