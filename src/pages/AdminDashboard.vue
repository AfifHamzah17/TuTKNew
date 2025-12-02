<!-- src/pages/AdminDashboard.vue -->
<template>
  <div class="admin-dashboard-container">
    <header>
      <h1>Dashboard Admin</h1>
      <div class="user-info">
        <span>Selamat datang, <strong>{{ currentUser.email }}</strong> (Admin)</span>
        <button @click="handleLogout" class="logout-btn">Logout</button>
      </div>
    </header>
    <main>
      <div class="dashboard-content">
        <h2>Halaman Admin Berhasil</h2>
        <!-- Anda bisa menambahkan komponen lain di sini, seperti tabel user -->
      </div>
    </main>
  </div>
</template>

<script>
// PERBAIKAN: Tambahkan import Toastify
import Toastify from 'toastify-js';
import "toastify-js/src/toastify.css";
import * as authService from '../services/authService';

export default {
  name: 'AdminDashboard',
  computed: {
    currentUser() {
      // Ambil data user dari localStorage
      return JSON.parse(localStorage.getItem('user') || '{}');
    }
  },
  methods: {
    handleLogout() {
      // Tampilkan notifikasi logout
      Toastify({
        text: "Anda telah berhasil logout.",
        duration: 3000,
        gravity: "top",
        position: "right",
        style: {
          background: "linear-gradient(to right, #f093fb, #f5576c)",
        }
      }).showToast();
      
      authService.logout();
      this.$router.push('/login');
    }
  }
};
</script>

<style scoped>
.admin-dashboard-container {
  padding: 20px;
}

header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #ddd;
  padding-bottom: 10px;
  margin-bottom: 20px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.logout-btn {
  background-color: #dc3545;
  color: white;
  padding: 8px 15px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
}

.logout-btn:hover {
  background-color: #c82333;
}

.dashboard-content {
  background-color: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
}
</style>