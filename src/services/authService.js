// src/services/authService.js
import axios from 'axios';

// PASTIKAN PORT ANDA BENAR! Sesuaikan dengan backend yang berjalan.
const API_URL = 'https://tutk-307703218179.asia-southeast2.run.app/api'; 

// Event emitter untuk notifikasi perubahan status autentikasi
const authEvents = {
  listeners: {},
  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  },
  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => callback(data));
    }
  }
};

// Set token ke header axios
const setAuthHeader = (token) => {
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }
};

// Cek token di localStorage dan set ke header
if (localStorage.getItem('token')) {
  setAuthHeader(localStorage.getItem('token'));
}

// --- FUNGSI UTILITAS ---

// Fungsi untuk generate ID acak 16 karakter
export const generateDocId = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 16; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Fungsi untuk validasi dan normalisasi nomor HP
export const validateAndNormalizePhone = (phone) => {
  // Hapus semua karakter kecuali angka
  let normalizedPhone = phone.replace(/\D/g, '');

  // Jika dimulai dengan '0', ganti dengan '62'
  if (normalizedPhone.startsWith('0')) {
    normalizedPhone = '62' + normalizedPhone.substring(1);
  }
  // Jika tidak memenuhi syarat, return null
  else if (!normalizedPhone.startsWith('62')) {
    return null;
  }

  // Validasi panjang (10-15 digit setelah normalisasi)
  if (normalizedPhone.length < 10 || normalizedPhone.length > 15) {
    return null;
  }

  return normalizedPhone;
};

// --- FUNGSI AUTENTIKASI ---

export const login = async (credentials) => {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, credentials);
    const { token, user } = response.data;
    
    // Simpan token ke localStorage HANYA SAAT LOGIN
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    
    // Set token ke header axios
    setAuthHeader(token);
    
    // Emit event login
    authEvents.emit('login', { token, user });
    
    return response.data;
  } catch (error) {
    console.error('Error during login:', error);
    throw error;
  }
};

// FUNGSI REGISTER YANG BENAR (TIDAK MENYIMPAN TOKEN)
export const register = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/auth/register`, userData);
    
    // JANGAN SIMPAN APA-APA KE LOCALSTORAGE DI SINI
    // Backend tidak lagi mengembalikan token saat register
    // Hanya kembalikan respons dari server.
    return response.data;
  } catch (error) {
    console.error('Error during registration:', error);
    throw error;
  }
};

export const logout = () => {
  // Hapus token dari localStorage
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  
  // Hapus token dari header axios
  setAuthHeader(null);
  
  // Emit event logout
  authEvents.emit('logout');
  
  return { success: true };
};

export const getCurrentUser = async () => {
  try {
    const response = await axios.get(`${API_URL}/auth/me`);
    return response.data;
  } catch (error) {
    console.error('Error getting current user:', error);
    throw error;
  }
};

export const getAllUsers = async () => {
  try {
    const response = await axios.get(`${API_URL}/admin/users`);
    return response.data;
  } catch (error) {
    console.error('Error getting users:', error);
    throw error;
  }
};

export const createAdminUser = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/admin/create-admin`, userData);
    return response.data;
  } catch (error) {
    console.error('Error creating admin user:', error);
    throw error;
  }
};

// Export event emitter untuk digunakan di komponen lain
export { authEvents };