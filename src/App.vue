<!-- src/App.vue -->
<template>
  <div id="app">
    <!-- Navbar selalu ditampilkan -->
    <nav class="navbar">
      <div class="container">
        <div class="navbar-brand">
          <a class="navbar-item" href="/">
            <img src="/2.png" alt="Dashboard Monitoring" class="navbar-brand-img" style="width: 50px;">
          </a>
        </div>
        
        <!-- Hamburger menu button for mobile -->
        <button class="navbar-toggle" @click="toggleMobileMenu" :class="{ 'is-active': isMobileMenuOpen }">
          <span class="bar"></span>
          <span class="bar"></span>
          <span class="bar"></span>
        </button>
        
        <!-- Menu items -->
        <div class="navbar-menu" :class="{ 'is-active': isMobileMenuOpen }">
          <!-- PERUBAHAN: Link ini sekarang mengarah ke /tanaman-ulang/view -->
          <router-link to="/tanaman-ulang/view" class="nav-item" @click="closeMobileMenu">Tanaman Ulang</router-link>
          
          <!-- Link input hanya muncul jika sudah login -->
          <router-link v-if="isLoggedIn" to="/tanaman-ulang/input" class="nav-item" @click="closeMobileMenu">Input Data Tanaman Ulang</router-link>
          
          <router-link to="/tanaman-konversi" class="nav-item" @click="closeMobileMenu">Tanaman Konversi</router-link>
          <router-link v-if="isAdmin" to="/admin" class="nav-item" @click="closeMobileMenu">Admin</router-link>
          
          <!-- Tampilkan Login jika belum login, dan Logout jika sudah login -->
          <router-link v-if="!isLoggedIn" to="/login" class="nav-item" @click="closeMobileMenu">Login</router-link>
          <a v-else @click="promptLogout" class="nav-item logout">Logout</a>
        </div>
      </div>
    </nav>
    
    <!-- Backdrop overlay for mobile menu -->
    <div v-if="isMobileMenuOpen" class="mobile-menu-backdrop" @click="closeMobileMenu"></div>
    
    <router-view></router-view>

    <!-- Modal konfirmasi logout -->
    <ConfirmModal
      :isVisible="showLogoutModal"
      title="Konfirmasi Logout"
      message="Apakah Anda yakin ingin keluar dari sistem?"
      confirmButtonText="Ya, Keluar"
      cancelButtonText="Batal"
      @confirm="confirmLogout"
      @cancel="cancelLogout"
    />
  </div>
</template>

<script>
import { logout, authEvents } from './services/authService';
import ConfirmModal from './components/ConfirmModal.vue';
import axios from 'axios'; // Import axios directly

export default {
  name: 'App',
  components: {
    ConfirmModal
  },
  data() {
    return {
      showLogoutModal: false,
      isMobileMenuOpen: false, // New property for mobile menu state
      // Ubah dari computed property ke data property
      isLoggedIn: !!localStorage.getItem('token'),
      // Simpan data user untuk reaktivitas
      user: JSON.parse(localStorage.getItem('user') || '{}')
    };
  },
  computed: {
    isAdmin() {
      return this.user.role === 'admin';
    }
  },
  created() {
    // Dengarkan event storage untuk update saat tab berbeda melakukan login/logout
    window.addEventListener('storage', this.handleStorageChange);
    
    // Dengarkan event auth dari authService
    authEvents.on('login', this.handleLogin);
    authEvents.on('logout', this.handleLogout);
    
    // Periksa token saat aplikasi dimuat
    this.checkAuthStatus();
  },
  beforeDestroy() {
    // Hapus listener saat komponen dihancurkan
    window.removeEventListener('storage', this.handleStorageChange);
    authEvents.off('login', this.handleLogin);
    authEvents.off('logout', this.handleLogout);
  },
  methods: {
    checkAuthStatus() {
      // Periksa status autentikasi dan update state
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      this.isLoggedIn = !!token;
      this.user = user;
      
      // Set token ke header axios - FIX: Use imported axios directly
      if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      } else {
        delete axios.defaults.headers.common['Authorization'];
      }
    },
    handleStorageChange(event) {
      // Handle perubahan storage (misalnya saat login/logout di tab lain)
      if (event.key === 'token' || event.key === 'user') {
        this.checkAuthStatus();
      }
    },
    handleLogin({ token, user }) {
      // Update state saat login
      this.isLoggedIn = true;
      this.user = user;
    },
    handleLogout() {
      // Update state saat logout
      this.isLoggedIn = false;
      this.user = {};
    },
    promptLogout() {
      this.showLogoutModal = true;
      this.closeMobileMenu(); // Close mobile menu when logout modal opens
    },
    confirmLogout() {
      this.showLogoutModal = false; 
      logout();
      // State sudah diupdate melalui event handler
      this.$router.push('/'); // Arahkan ke home setelah logout
    },
    cancelLogout() {
      this.showLogoutModal = false;
    },
    toggleMobileMenu() {
      this.isMobileMenuOpen = !this.isMobileMenuOpen;
    },
    closeMobileMenu() {
      this.isMobileMenuOpen = false;
    }
  },
  watch: {
    // Watch untuk perubahan route
    $route() {
      // Periksa ulang status autentikasi saat route berubah
      this.checkAuthStatus();
      this.closeMobileMenu(); // Close mobile menu when route changes
    }
  }
}
</script>

<style>
/* ... (Style global Anda tetap sama, tidak perlu diubah) ... */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

body {
  margin: 0;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: #f9fafb;
  color: #1f2937;
}

.container {
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
  padding-left: 1rem;
  padding-right: 1rem;
}

/* Navbar styles */
.navbar {
  background: linear-gradient(135deg, #15803d, #166534);
  color: white;
  padding: 0.75rem 0;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  position: relative;
  z-index: 9999; /* High z-index for navbar */
}

.navbar .container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.navbar-brand {
  font-weight: 600;
  font-size: 1.25rem;
}

.brand-link {
  color: white;
  text-decoration: none;
}

.navbar-menu {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.nav-item {
  color: white;
  text-decoration: none;
  padding: 0.5rem 0.75rem;
  border-radius: 0.375rem;
  transition: background-color 0.2s;
}

.nav-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.nav-item.router-link-exact-active {
  background-color: rgba(255, 255, 255, 0.2);
  font-weight: 500;
}

.logout {
  cursor: pointer;
}

/* Hamburger menu styles */
.navbar-toggle {
  display: none;
  flex-direction: column;
  justify-content: space-around;
  width: 2rem;
  height: 2rem;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  z-index: 10000; /* Very high z-index for hamburger button */
}

.navbar-toggle:focus {
  outline: none;
}

.bar {
  display: block;
  width: 2rem;
  height: 0.25rem;
  background-color: white;
  border-radius: 0.125rem;
  transition: all 0.3s linear;
  position: relative;
  transform-origin: 1px;
}

/* First bar animation */
.navbar-toggle.is-active .bar:nth-child(1) {
  transform: rotate(45deg);
}

/* Second bar animation */
.navbar-toggle.is-active .bar:nth-child(2) {
  opacity: 0;
}

/* Third bar animation */
.navbar-toggle.is-active .bar:nth-child(3) {
  transform: rotate(-45deg);
}

/* Mobile menu backdrop */
.mobile-menu-backdrop {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 9998; /* High z-index but below the menu */
}

/* Mobile responsive styles */
@media screen and (max-width: 768px) {
  .navbar-toggle {
    display: flex;
  }
  
  .mobile-menu-backdrop {
    display: block;
  }
  
  .navbar-menu {
    position: fixed;
    top: 60px;
    left: 0;
    width: 100%;
    height: calc(100vh - 60px);
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    background-color: rgba(21, 128, 61, 0.98);
    padding-top: 2rem;
    transform: translateX(-100%);
    transition: transform 0.3s ease-in-out;
    gap: 1.5rem;
    z-index: 9999; /* Very high z-index for mobile menu */
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  }
  
  .navbar-menu.is-active {
    transform: translateX(0);
  }
  
  .nav-item {
    font-size: 1.2rem;
    padding: 0.75rem 1rem;
    width: 80%;
    text-align: center;
  }
}

/* Router link styles */
a {
  text-decoration: none;
  color: inherit;
}

/* Focus styles for accessibility */
button:focus,
a:focus {
  outline: 2px solid #4F46E5;
  outline-offset: 2px;
}

/* Card styles */
.card {
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

/* Button styles */
.btn {
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
}

.btn-primary {
  background-color: #4f46e5;
  color: white;
}

.btn-primary:hover {
  background-color: #4338ca;
}

.btn-secondary {
  background-color: #6b7280;
  color: white;
}

.btn-secondary:hover {
  background-color: #4b5563;
}

.btn-danger {
  background-color: #ef4444;
  color: white;
}

.btn-danger:hover {
  background-color: #dc2626;
}

/* Form styles */
.form-group {
  margin-bottom: 1rem;
}

.form-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.form-input {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  transition: border-color 0.2s;
}

.form-input:focus {
  border-color: #4f46e5;
  outline: none;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

/* Table styles */
.table-container {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th {
  background-color: #f3f4f6;
  padding: 0.75rem;
  text-align: left;
  font-weight: 600;
  color: #374151;
  border-bottom: 1px solid #e5e7eb;
}

.data-table td {
  padding: 0.75rem;
  border-bottom: 1px solid #e5e7eb;
}

.data-table tr:hover {
  background-color: #f9fafb;
}

/* Alert styles */
.alert {
  padding: 0.75rem 1rem;
  border-radius: 0.375rem;
  margin-bottom: 1rem;
}

.alert-success {
  background-color: #d1fae5;
  color: #065f46;
  border: 1px solid #a7f3d0;
}

.alert-error {
  background-color: #fee2e2;
  color: #b91c1c;
  border: 1px solid #fecaca;
}

/* Loading spinner */
.spinner {
  display: inline-block;
  width: 1.5rem;
  height: 1.5rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>