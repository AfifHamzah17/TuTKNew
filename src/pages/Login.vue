<!-- src/pages/Login.vue -->

<template>
  <div class="login-page-wrapper">
    <div class="login-container">
      <h2>Login</h2>
      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="email">Email</label>
          <input 
            type="email" 
            id="email" 
            v-model="email" 
            required 
            placeholder="Masukkan email Anda"
          />
        </div>
        <div class="form-group">
          <label for="password">Password</label>
          <div class="password-input-wrapper">
            <input 
              :type="showPassword ? 'text' : 'password'" 
              id="password" 
              v-model="password" 
              required 
              placeholder="Masukkan password Anda"
              class="password-input"
            />
            <button 
              type="button" 
              class="password-toggle"
              @click="togglePasswordVisibility"
              aria-label="Toggle password visibility"
            >
              <svg v-if="showPassword" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                <line x1="1" y1="1" x2="23" y2="23"></line>
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            </button>
          </div>
        </div>
        <div v-if="error" class="error-message">{{ error }}</div>
        <button type="submit" :disabled="isLoading">
          {{ isLoading ? 'Sedang masuk...' : 'Masuk' }}
        </button>
      </form>
      <p class="register-link">
        Belum punya akun? <router-link to="/register">Daftar di sini</router-link>
      </p>
    </div>
  </div>
</template>

<script>
import * as authService from '../services/authService';
import Toastify from 'toastify-js';
import "toastify-js/src/toastify.css";

export default {
  name: 'Login',
  data() {
    return {
      email: '',
      password: '',
      error: '',
      isLoading: false,
      showPassword: false
    };
  },
  methods: {
    togglePasswordVisibility() {
      this.showPassword = !this.showPassword;
    },
    async handleLogin() {
      this.isLoading = true;
      this.error = '';
      
      try {
        const credentials = {
          email: this.email,
          password: this.password
        };
        
        // PERBAIKAN: Tangkap respons dari authService.login untuk mendapatkan data user
        const response = await authService.login(credentials);
        const { user } = response;

        // Tentukan path redirect berdasarkan role user
        let redirectPath = '/'; // Default untuk user biasa
        if (user.role === 'admin') {
          redirectPath = '/admin';
        }
        
        // Tampilkan notifikasi sukses yang dinamis
        Toastify({
          text: `Login berhasil! Mengalihkan ke ${user.role === 'admin' ? 'dashboard admin' : 'halaman utama'}...`,
          duration: 3000,
          gravity: "top",
          position: "right",
          style: {
            background: "linear-gradient(to right, #00b09b, #96c93d)",
          }
        }).showToast();
        
        // Arahkan ke path yang sudah ditentukan
        setTimeout(() => {
            this.$router.push(redirectPath);
        }, 1500);

      } catch (error) {
        this.error = error.response?.data?.message || 'Login gagal. Periksa kembali kredensial Anda.';
        Toastify({
          text: this.error,
          duration: 3000,
          gravity: "top",
          position: "right",
          style: {
            background: "linear-gradient(to right, #ff5f6d, #ffc371)",
          }
        }).showToast();
        console.error(error);
      } finally {
        this.isLoading = false;
      }
    }
  }
};
</script>

<style scoped>
.login-page-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f0f2f5;
  padding: 20px;
  box-sizing: border-box;
}

.login-container {
  max-width: 400px;
  width: 100%;
  padding: 30px;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

h2 {
  text-align: center;
  margin-bottom: 25px;
  color: #333;
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #555;
}

input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  box-sizing: border-box;
  transition: border-color 0.3s;
}

input:focus {
  outline: none;
  border-color: #4CAF50;
}

.password-input-wrapper {
  position: relative;
  display: block;
}

.password-input {
  width: 100%;
  padding-right: 45px;
}

.password-toggle {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: #888;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: color 0.2s, background-color 0.2s;
}

.password-toggle:hover {
  color: #4CAF50;
  background-color: rgba(76, 175, 80, 0.1);
}

.password-toggle:active {
  transform: translateY(-50%) scale(0.95);
}

.password-toggle svg {
  display: block;
}

button[type="submit"] {
  width: 100%;
  padding: 12px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
  transition: background-color 0.3s;
}

button[type="submit"]:hover:not(:disabled) {
  background-color: #45a049;
}

button[type="submit"]:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.error-message {
  color: #f44336;
  margin-bottom: 15px;
  padding: 10px;
  background-color: #ffebee;
  border-radius: 4px;
  border-left: 4px solid #f44336;
  font-size: 14px;
}

.register-link {
  text-align: center;
  margin-top: 20px;
  font-size: 14px;
}

.register-link a {
  color: #4CAF50;
  text-decoration: none;
  font-weight: 600;
}

.register-link a:hover {
  text-decoration: underline;
}
</style>