<!-- src/pages/DataEntry.vue -->
<template>
  <div class="data-entry-container">
    <header>
      <h1>Input Data {{ pageTitle }}</h1>
      <p>Kebun: <strong>{{ currentUser.kebun }}</strong> | Krani: <strong>{{ currentUser.name }}</strong></p>
    </header>

    <form @submit.prevent="handleSubmit">
      <!-- Gunakan struktur yang mirip dengan DataGrid, tapi sebagai input form -->
      <div class="form-grid">
        <div class="form-group">
          <label>Nama Paket</label>
          <input type="text" v-model="formData.namaPaket" required>
        </div>
        <div class="form-group">
          <label>Afdeling</label>
          <input type="text" v-model="formData.afd" required>
        </div>
        <div class="form-group">
          <label>Luas (ha)</label>
          <input type="number" v-model.number="formData.luasPaket" required>
        </div>
        
        <!-- Buat komponen ProgressInput untuk setiap item -->
        <ProgressInput title="Pembuatan Parit" unit="Mtr" v-model="formData.pembuatanParit" />
        <ProgressInput title="Pembuatan Jalan" unit="Mtr" v-model="formData.pembuatanJalan" />
        <!-- ... lanjutkan untuk semua item ... -->
      </div>
      
      <button type="submit" :disabled="isLoading">
        {{ isLoading ? 'Menyimpan...' : 'Simpan Data' }}
      </button>
    </form>
  </div>
</template>

<script>
import { mapState } from 'vuex'; // atau ambil dari localStorage
import * as dataService from '../services/dataService'; // Service baru untuk API /api/data
import ProgressInput from '../components/ProgressInput.vue'; // Komponen form untuk progress

export default {
  name: 'DataEntry',
  components: { ProgressInput },
  data() {
    return {
      isLoading: false,
      formData: {
        // Inisialisasi dengan struktur kosong
        namaPaket: '', afd: '', luasPaket: 0,
        pembuatanParit: { rencana: 0, hariIni: 0, sdHariIni: 0 },
        pembuatanJalan: { rencana: 0, hariIni: 0, sdHariIni: 0 },
        // ... dan seterusnya
      }
    };
  },
  computed: {
    // Ambil data user dari state management atau localStorage
    currentUser() {
      return JSON.parse(localStorage.getItem('user') || '{}');
    },
    // Tentukan judul berdasarkan route parameter
    pageTitle() {
      return this.$route.params.type === 'TU' ? 'Tanaman Ulang' : 'Tanaman Konversi';
    }
  },
  methods: {
    async handleSubmit() {
      this.isLoading = true;
      try {
        // Panggil service yang sesuai (TU atau TK)
        if (this.$route.params.type === 'TU') {
          await dataService.saveDataTU(this.formData);
        } else {
          // await dataService.saveDataTK(this.formData);
        }
        
        Toastify({
          text: "Data berhasil disimpan!",
          // ... config Toastify
        }).showToast();
        
        // Reset form atau redirect
        this.resetForm();

      } catch (error) {
        // ... handle error
      } finally {
        this.isLoading = false;
      }
    },
    resetForm() {
      // Logika untuk reset form ke nilai awal
    }
  }
};
</script>