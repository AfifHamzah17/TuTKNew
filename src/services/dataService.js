// src/services/dataService.js
import axios from 'axios';
import router from '../router'; // PASTIKAN INI ADA

const API_URL = 'https://tutk-307703218179.asia-southeast2.run.app/api';

// --- Instance AXIOS YANG DIAUTENTIKASI (Untuk POST, PUT, DELETE) ---
const api = axios.create({
  baseURL: API_URL
});

// Fungsi untuk mendapatkan token dari localStorage
const getToken = () => {
  try {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    const user = JSON.parse(userStr);
    return user.token;
  } catch (error) {
    console.error('Error parsing user from localStorage:', error);
    return null;
  }
};

// Request interceptor untuk instance yang diautentikasi
api.interceptors.request.use(config => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => Promise.reject(error));

// Response interceptor untuk instance yang diautentikasi
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      console.log('Unauthorized on protected route. Redirecting to login...');
      localStorage.removeItem('user');
      if (router.currentRoute.value.path !== '/login') {
        router.push('/login');
      }
    }
    return Promise.reject(error);
  }
);


// --- Instance AXIOS PUBLIK (Hanya untuk GET data view) ---
const publicApi = axios.create({
  baseURL: API_URL
});

// Response interceptor untuk instance publik
// JANGAN redirect pada error 401, biarkan komponen yang menangani
publicApi.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      console.log('Public API call returned 401. Not redirecting, component will handle.');
    }
    return Promise.reject(error);
  }
);


// --- FUNGSI API YANG DIAUTENTIKASI (Menggunakan instance 'api') ---

export const saveDataTU = async (data) => {
  const response = await api.post('/data/tu', data);
  return response.data;
};

export const updateDataTU = async (docId, data) => {
  const response = await api.put(`/data/tu/${docId}`, data);
  return response.data;
};

export const deleteDataTU = async (docId) => {
  const response = await api.delete(`/data/tu/${docId}`);
  return response.data;
};

export const getNextSequence = async () => {
  const response = await api.get('/data/tu/next-sequence');
  return response.data;
};

// --- FUNGSI API PUBLIK (Menggunakan instance 'publicApi') ---

/**
 * Mengambil data Tanaman Ulang secara publik (tanpa token).
 * @param {Object} params - Parameter query untuk filter
 * @returns {Promise<Array>} Array dari data Tanaman Ulang
 */
export const getPublicDataTU = async (params = {}) => {
  const response = await publicApi.get('/data/tu', { params });
  console.log('getPublicDataTU Response:', response.data);
  return response.data;
};

/**
 * Mengambil data Tanaman Ulang (memerlukan token).
 * Fungsi ini tetap ada untuk bagian aplikasi lain yang memerlukan autentikasi.
 * @param {Object} params - Parameter query untuk filter
 * @returns {Promise<Array>} Array dari data Tanaman Ulang
 */
export const getDataTU = async (params = {}) => {
  const response = await api.get('/data/tu', { params });
  console.log('getDataTU Response:', response.data);
  return response.data;
};