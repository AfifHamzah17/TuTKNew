// src/services/dataService.js
import axios from 'axios';

// PERBAIKAN: Gunakan import.meta.env untuk Vite, bukan process.env untuk Webpack
// Juga, Vite menggunakan prefix VITE_ bukan VUE_APP_
const API_URL = 'https://tutk-307703218179.asia-southeast2.run.app/api';

// Set up axios defaults
axios.defaults.baseURL = API_URL;

// Fungsi untuk mendapatkan token dari localStorage
const getToken = () => {
  try {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      console.log('No user found in localStorage');
      return null;
    }
    const user = JSON.parse(userStr);
    return user.token;
  } catch (error) {
    console.error('Error parsing user from localStorage:', error);
    return null;
  }
};

// Add request interceptor untuk otomatis menambahkan auth token ke setiap request
axios.interceptors.request.use(
  config => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Token attached to request:', token.substring(0, 20) + '...');
    }
    return config;
  },
  error => {
    // Lakukan sesuatu dengan error request
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor untuk menangani error global (opsional, tapi direkomendasikan)
axios.interceptors.response.use(
  response => {
    // Status kode 2xx akan masuk sini
    return response;
  },
  error => {
    // Status kode di luar 2xx akan masuk sini
    if (error.response) {
      // Server merespons dengan status kode di luar 2xx
      console.error('API Error Response:', error.response.data, error.response.status);
      if (error.response.status === 401) {
        // Token mungkin sudah kadaluarsa atau tidak valid
        console.log('Unauthorized! Redirecting to login...');
        localStorage.removeItem('user');
        // Redirect ke halaman login jika bukan sudah di sana
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    } else if (error.request) {
      // Request dibuat tapi tidak ada respons
      console.error('API No Response:', error.request);
    } else {
      // Terjadi kesalahan saat setting up request
      console.error('API Setup Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// --- API SERVICE FUNCTIONS ---

/**
 * Mengambil semua data Tanaman Ulang.
 * @param {Object} params - Parameter query untuk filter (contoh: { tanggal: '2023-11-18' })
 * @returns {Promise<Array>} Array dari data Tanaman Ulang
 */
export const getDataTU = async (params = {}) => {
  try {
    const response = await axios.get('/data/tu', { params });
    console.log('getDataTU Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error getting data TU:', error);
    // Lempar error agar bisa ditangani di komponen
    throw error;
  }
};

/**
 * Menyimpan data Tanaman Ulang baru.
 * @param {Object} data - Data yang akan disimpan
 * @returns {Promise<Object>} Data yang berhasil disimpan
 */
export const saveDataTU = async (data) => {
  try {
    const response = await axios.post('/data/tu', data);
    console.log('saveDataTU Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error saving data TU:', error);
    throw error;
  }
};

/**
 * Memperbarui data Tanaman Ulang yang ada.
 * @param {string} docId - ID dokumen yang akan diperbarui
 * @param {Object} data - Data pembaruan
 * @returns {Promise<Object>} Data yang berhasil diperbarui
 */
export const updateDataTU = async (docId, data) => {
  try {
    console.log('Updating document with ID:', docId);
    const response = await axios.put(`/data/tu/${docId}`, data);
    console.log('updateDataTU Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error updating data TU:', error);
    throw error;
  }
};

/**
 * Menghapus data Tanaman Ulang.
 * @param {string} docId - ID dokumen yang akan dihapus
 * @returns {Promise<Object>} Konfirmasi penghapusan
 */
export const deleteDataTU = async (docId) => {
  try {
    console.log('Deleting document with ID:', docId);
    const response = await axios.delete(`/data/tu/${docId}`);
    console.log('deleteDataTU Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error deleting data TU:', error);
    throw error;
  }
};

/**
 * Mendapatkan nomor urut berikutnya untuk user yang sedang login.
 * @returns {Promise<Object>} Objek berisi nextSequence
 */
export const getNextSequence = async () => {
  try {
    const response = await axios.get('/data/tu/next-sequence');
    console.log('getNextSequence Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error getting next sequence:', error);
    throw error;
  }
};