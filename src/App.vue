<!-- src/App.vue -->
<template>
  <div id="app">
    <nav v-if="isLoggedIn" class="navbar">
      <div class="container">
        <div class="navbar-brand">
          <router-link to="/" class="brand-link">Dashboard Monitoring</router-link>
        </div>
       <div class="navbar-menu">
  <router-link to="/" class="nav-item">Home</router-link>
  <router-link to="/tanaman-ulang" class="nav-item">Lihat Data Tanaman Ulang</router-link>
  <router-link to="/tanaman-ulang/input" class="nav-item">Input Data Tanaman Ulang</router-link>
  <router-link to="/tanaman-konversi" class="nav-item">Tanaman Konversi</router-link>
  <router-link v-if="isAdmin" to="/admin" class="nav-item">Admin</router-link>
  <a @click="promptLogout" class="nav-item logout">Logout</a>
</div>
      </div>
    </nav>
    <router-view></router-view>

    <!-- PERUBAHAN: Tambahkan komponen modal konfirmasi -->
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
import { logout } from './services/authService';
// PERUBAHAN: Import komponen ConfirmModal
import ConfirmModal from './components/ConfirmModal.vue';

export default {
  name: 'App',
  components: {
    // PERUBAHAN: Daftarkan komponen ConfirmModal
    ConfirmModal
  },
  data() {
    return {
      // PERUBAHAN: Tambahkan state untuk mengontrol visibilitas modal
      showLogoutModal: false
    };
  },
  computed: {
    isLoggedIn() {
      return !!localStorage.getItem('token');
    },
    isAdmin() {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      return user.role === 'admin';
    }
  },
  methods: {
    // PERUBAHAN: Method ini dipanggil saat link logout diklik
    promptLogout() {
      this.showLogoutModal = true;
    },
    // PERUBAHAN: Method ini dipanggil jika user mengkonfirmasi logout
    confirmLogout() {
      this.showLogoutModal = false; // Sembunyikan modal
      logout(); // Jalankan fungsi logout
      this.$router.push('/login'); // Redirect ke halaman login
    },
    // PERUBAHAN: Method ini dipanggil jika user membatalkan logout
    cancelLogout() {
      this.showLogoutModal = false; // Cukup sembunyikan modal
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
  background-color: #4f46e5;
  color: white;
  padding: 0.75rem 0;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
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