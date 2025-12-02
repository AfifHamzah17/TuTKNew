<!-- src/pages/Register.vue -->
<template>
  <div class="register-page-wrapper">
    <div class="register-container">
      <h2>Register</h2>
      <form @submit.prevent="handleRegister">
        <div class="form-group">
          <label for="name">Nama Lengkap</label>
          <input 
            type="text" 
            id="name" 
            v-model="name" 
            required 
            placeholder="Masukkan nama lengkap Anda"
          />
        </div>
        
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
          <label for="noHp">No. HP</label>
          <input 
            type="tel" 
            id="noHp" 
            v-model="noHp" 
            required 
            placeholder="08xxxxxxxx atau +628xxxxxxxx"
          />
          <small v-if="phoneError" class="error-text">{{ phoneError }}</small>
        </div>
        
        <div class="form-group">
          <label for="kebun">Kebun</label>
          <select id="kebun" v-model="kebun" required>
            <option value="" disabled>-- Pilih Kebun --</option>
            <!-- Gunakan data dari rantai.json -->
            <option v-for="item in kebunList" :key="item.Kodering" :value="item.Kodering">
              ({{ item.Kodering }}) - {{ item.Kebun }} 
            </option>
          </select>
        </div>
        
        <div class="form-group">
          <label for="password">Password</label>
          <input 
            type="password" 
            id="password" 
            v-model="password"
            @focus="showPasswordRequirements = true"
            @blur="showPasswordRequirements = false"
            required 
            placeholder="Masukkan password Anda"
          />
          <div v-if="showPasswordRequirements && password" class="password-requirements">
            <ul>
              <li :class="{ valid: passwordLengthValid }">Minimal 8 karakter</li>
              <li :class="{ valid: passwordHasUppercase }">Mengandung huruf besar</li>
              <li :class="{ valid: passwordHasNumberOrSymbol }">Mengandung angka atau simbol</li>
            </ul>
          </div>
        </div>
        
        <div class="form-group">
          <label for="confirmPassword">Konfirmasi Password</label>
          <input 
            type="password" 
            id="confirmPassword" 
            v-model="confirmPassword"
            @focus="showPasswordMatchRequirement = true"
            @blur="showPasswordMatchRequirement = false"
            required 
            placeholder="Ketik ulang password Anda"
          />
          <div v-if="showPasswordMatchRequirement && confirmPassword" class="password-match-indicator">
            <span :class="{ valid: doPasswordsMatch }">
              {{ doPasswordsMatch ? '✓ Password cocok' : '✗ Password tidak cocok' }}
            </span>
          </div>
        </div>
        
        <div v-if="isAdmin" class="form-group">
          <label for="role">Role</label>
          <select id="role" v-model="role">
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        
        <div v-if="error" class="error-message">{{ error }}</div>
        <button type="submit" :disabled="isLoading || !isFormValid">
          {{ isLoading ? 'Mendaftarkan...' : 'Daftar' }}
        </button>
      </form>
      <p class="login-link">
        Sudah punya akun? <router-link to="/login">Masuk di sini</router-link>
      </p>
    </div>
  </div>
</template>

<script>
import * as authService from '../services/authService';
import { validateAndNormalizePhone } from '../services/authService';
import Toastify from 'toastify-js';
import "toastify-js/src/toastify.css";
// Import data rantai.json
import kebunData from '../data/rantai.json';

export default {
  name: 'Register',
  data() {
    return {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      noHp: '',
      kebun: '',
      role: 'user',
      error: '',
      phoneError: '',
      isLoading: false,
      isAdmin: false,
      showPasswordRequirements: false,
      showPasswordMatchRequirement: false,
      // Tambahkan data kebun dari rantai.json
      kebunList: kebunData
    };
  },
  created() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    this.isAdmin = user.role === 'admin';
  },
  computed: {
    passwordLengthValid() {
      return this.password.length >= 8;
    },
    passwordHasUppercase() {
      return /[A-Z]/.test(this.password);
    },
    passwordHasNumberOrSymbol() {
      return /[!@#$%^&*(),.?":{}|<>0-9]/.test(this.password);
    },
    isPasswordValid() {
      return this.passwordLengthValid && this.passwordHasUppercase && this.passwordHasNumberOrSymbol;
    },
    doPasswordsMatch() {
      return this.password === this.confirmPassword;
    },
    isFormValid() {
      return this.name && this.email && this.noHp && this.kebun && this.isPasswordValid && this.doPasswordsMatch && !this.phoneError;
    }
  },
  methods: {
    async handleRegister() {
      // Validasi nomor HP sebelum mengirim
      const normalizedPhone = validateAndNormalizePhone(this.noHp);
      if (!normalizedPhone) {
        this.phoneError = 'Nomor HP tidak valid. Gunakan format +628 atau 08.';
        return;
      } else {
        this.phoneError = '';
      }
      
      if (!this.isFormValid) {
        this.error = 'Harap pastikan semua field terisi dengan benar dan memenuhi syarat.';
        return;
      }

      this.isLoading = true;
      this.error = '';
      
      try {
        const userData = {
          name: this.name,
          email: this.email,
          password: this.password,
          noHp: normalizedPhone, // Kirim yang sudah dinormalisasi
          kebun: this.kebun,
          role: this.isAdmin ? this.role : 'user'
        };
        
        await authService.register(userData);
        
        // PERUBAHAN: Tampilkan notifikasi sukses dan arahkan ke login
        Toastify({
          text: "Pendaftaran berhasil! Silakan masuk.",
          duration: 3000,
          gravity: "top",
          position: "right",
          style: {
            background: "linear-gradient(to right, #00b09b, #96c93d)",
          }
        }).showToast();
        
        // Arahkan ke halaman login setelah berhasil register
        setTimeout(() => {
            this.$router.push('/login');
        }, 1500);

      } catch (error) {
        this.error = error.response?.data?.message || 'Pendaftaran gagal. Silakan coba lagi.';
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
/* Style tetap sama seperti sebelumnya */
.register-page-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f0f2f5;
  padding: 20px;
  box-sizing: border-box;
}

.register-container {
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
  position: relative;
}

label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #555;
}

input, select {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  box-sizing: border-box;
  transition: border-color 0.3s;
}

input:focus, select:focus {
  outline: none;
  border-color: #4CAF50;
}

button {
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

button:hover:not(:disabled) {
  background-color: #45a049;
}

button:disabled {
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

.error-text {
  color: #f44336;
  font-size: 12px;
  margin-top: 5px;
  display: block;
}

.login-link {
  text-align: center;
  margin-top: 20px;
  font-size: 14px;
}

.login-link a {
  color: #4CAF50;
  text-decoration: none;
  font-weight: 600;
}

.login-link a:hover {
  text-decoration: underline;
}

.password-requirements, .password-match-indicator {
  margin-top: 8px;
  padding: 10px;
  background-color: #f9f9f9;
  border-radius: 4px;
  border: 1px solid #eee;
  font-size: 0.9em;
}

.password-requirements ul {
  list-style-type: none;
  padding: 0;
  margin: 0;
}

.password-requirements li {
  color: #888;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
}

.password-requirements li::before {
  content: '○';
  margin-right: 8px;
  color: #ccc;
  font-size: 1.2em;
}

.password-requirements li.valid {
  color: #28a745;
}

.password-requirements li.valid::before {
  content: '✓';
  color: #28a745;
  font-weight: bold;
}

.password-match-indicator span {
  color: #f44336;
  font-weight: bold;
}

.password-match-indicator span.valid {
  color: #28a745;
}
</style>