import { createRouter, createWebHistory } from 'vue-router';

// --- IMPORT KOMPONEN HALAMAN ---
import Home from './pages/Home.vue';
import TanamanUlang from './pages/TanamanUlang.vue'; // Halaman untuk melihat data
import TanamanUlangView from './pages/TanamanUlangView.vue'; // Halaman baru untuk view data dengan tabel
import TanamanKonversi from './pages/TanamanKonversi.vue';
import Login from './pages/Login.vue';
import Register from './pages/Register.vue';
import AdminDashboard from './pages/AdminDashboard.vue'; 
import DataEntry from './pages/DataEntry.vue'; // Komponen entry data dinamis
import TanamanUlangKrani from './pages/TanamanUlangKrani.vue'; // Komponen input data untuk Krani

// --- DEFINISI ROUTE ---
const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
    // PERUBAHAN: Hapus meta.requiresAuth agar halaman home dapat diakses tanpa login
  },
  {
    path: '/tanaman-ulang',
    name: 'TanamanUlang',
    component: TanamanUlang
    // PERUBAHAN: Hapus meta.requiresAuth agar halaman dapat diakses tanpa login
  },
  {
    path: '/tanaman-ulang/view',
    name: 'TanamanUlangView',
    component: TanamanUlangView,
    // PERBAIKAN: Tambahkan meta.requiresAuth: false secara eksplisit
    meta: { requiresAuth: false }
  },
  {
    path: '/tanaman-konversi',
    name: 'TanamanKonversi',
    component: TanamanKonversi
    // PERUBAHAN: Hapus meta.requiresAuth agar halaman dapat diakses tanpa login
  },
  {
    // Route ini tetap memerlukan autentikasi
    path: '/tanaman-ulang/input',
    name: 'InputTanamanUlang',
    component: TanamanUlangKrani,
    meta: { requiresAuth: true }
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/register',
    name: 'Register',
    component: Register
  },
  {
    path: '/admin',
    name: 'AdminDashboard',
    component: AdminDashboard,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    // Route dinamis (jika masih dibutuhkan untuk konversi)
    path: '/data-entry/:type', 
    name: 'DataEntry',
    component: DataEntry,
    meta: { requiresAuth: true }
  },
  {
    // Rute catch-all untuk mengarahkan ke home jika URL tidak ditemukan
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
];

// --- BUAT INSTANCE ROUTER ---
const router = createRouter({
  history: createWebHistory(),
  routes
});

// --- NAVIGATION GUARD UNTUK AUTENTIKASI ---
router.beforeEach((to, from, next) => {
  // Mendapatkan status autentikasi dan data user dari localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAuthenticated = !!localStorage.getItem('token'); // PERUBAHAN: Perbaikan cara cek autentikasi
  const isAdmin = user.role === 'admin';
  
  // PERBAIKAN: Tambahkan log untuk debugging
  console.log('Navigation to:', to.path);
  console.log('Is authenticated:', isAuthenticated);
  console.log('Route meta:', to.meta);
  
  // Jika rute dituju memerlukan autentikasi dan pengguna belum login
  if (to.matched.some(record => record.meta.requiresAuth) && !isAuthenticated) {
    console.log('Redirecting to login - requires auth');
    next('/login');
  } 
  // Jika rute dituju memerlukan admin dan pengguna bukan admin
  else if (to.matched.some(record => record.meta.requiresAdmin) && !isAdmin) {
    console.log('Redirecting to home - requires admin');
    next('/');
  } 
  // Jika pengguna sudah login tapi mencoba akses halaman login/register
  else if ((to.path === '/login' || to.path === '/register') && isAuthenticated) {
    console.log('Redirecting to home - already logged in');
    next('/');
  }
  // Jika semua syarat terpenuhi, izinkan navigasi
  else {
    console.log('Navigation allowed');
    next();
  }
});

export default router;