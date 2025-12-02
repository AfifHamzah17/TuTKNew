<template>
  <div class="data-grid">
    <div class="data-grid-header">
      <div class="flex justify-between items-center">
        <h3 class="text-lg font-medium text-gray-900">Data Progress Tanaman</h3>
        <div class="flex space-x-2">
          <!-- Date Filter -->
          <div class="flex items-center space-x-2">
            <label for="dateFilter" class="text-sm text-gray-700">Filter Tanggal:</label>
            <input 
              type="date" 
              id="dateFilter" 
              v-model="selectedDate" 
              @change="handleDateFilter"
              class="border rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button 
              v-if="selectedDate" 
              @click="clearDateFilter" 
              class="text-sm text-red-600 hover:text-red-800 font-medium"
            >
              Clear
            </button>
          </div>
          
          <button @click="exportToExcelHandler" class="btn btn-secondary text-sm">
            Export Excel
          </button>
          <button @click="refreshData" class="btn btn-primary text-sm">
            Refresh Data
          </button>
        </div>
      </div>
    </div>
    
    <!-- Date info display -->
    <div v-if="selectedDate" class="px-6 py-2 bg-blue-50 border-b border-blue-200">
      <p class="text-sm text-blue-800">
        Menampilkan data untuk tanggal: <span class="font-semibold">{{ formatDate(selectedDate) }}</span>
      </p>
    </div>
    
    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th class="w-12">No</th>
            <th class="w-32">Kebun</th>
            <th class="w-24">Afdeling</th>
            <th class="w-32">Nama Vendor</th>
            <th class="w-24">Luas</th>
            <th class="w-64">Pembuatan Parit</th>
            <th class="w-64">Pembuatan Jalan</th>
            <th class="w-64">Pembuatan Teras</th>
            <th class="w-64">Ripping</th>
            <th class="w-64">Luku</th>
            <th class="w-64">Tumbang/Chipping</th>
            <th class="w-64">Menanam Mucuna</th>
            <th class="w-64">Lubang Tanam KS</th>
            <th class="w-64">Mempupuk Lubang KS</th>
            <th class="w-64">Menanam KS</th>
            <th class="w-64">Progress overall</th>
            <th class="w-40">Tanggal SPPBJ</th>
            <th class="w-32">Durasi kerja</th>
          </tr>
        </thead>
        <tbody class="data-grid-body">
          <!-- Data rows -->
          <tr v-for="(row, index) in paginatedData" :key="row.docId || index" class="data-grid-row">
            <td class="data-grid-cell font-medium">{{ index + 1 }}</td>
            <td class="data-grid-cell kebun-name">{{ row.kebun }}</td>
            <td class="data-grid-cell">
              <span class="badge badge-info">{{ row.afdeling }}</span>
            </td>
            <td class="data-grid-cell">{{ row.namaVendor }}</td>
            <td class="data-grid-cell">{{ formatNumber(row.luas) }} ha</td>
            <td class="data-grid-cell">
              <ProgressItem
                title="Pembuatan Parit"
                unit="Mtr"
                :rencana="getProgressData(row.pembuatanParit, 'rencana')"
                :hari-ini="getProgressData(row.pembuatanParit, 'hariIni')"
                :sd-hari-ini="getProgressData(row.pembuatanParit, 'sdHariIni')"
                :persentase="calculatePercentage(getProgressData(row.pembuatanParit, 'sdHariIni'), getProgressData(row.pembuatanParit, 'rencana'))"
              />
            </td>
            <td class="data-grid-cell">
              <ProgressItem
                title="Pembuatan Jalan"
                unit="Mtr"
                :rencana="getProgressData(row.pembuatanJalan, 'rencana')"
                :hari-ini="getProgressData(row.pembuatanJalan, 'hariIni')"
                :sd-hari-ini="getProgressData(row.pembuatanJalan, 'sdHariIni')"
                :persentase="calculatePercentage(getProgressData(row.pembuatanJalan, 'sdHariIni'), getProgressData(row.pembuatanJalan, 'rencana'))"
              />
            </td>
            <td class="data-grid-cell">
              <ProgressItem
                title="Pembuatan Teras"
                unit="Mtr"
                :rencana="getProgressData(row.pembuatanTeras, 'rencana')"
                :hari-ini="getProgressData(row.pembuatanTeras, 'hariIni')"
                :sd-hari-ini="getProgressData(row.pembuatanTeras, 'sdHariIni')"
                :persentase="calculatePercentage(getProgressData(row.pembuatanTeras, 'sdHariIni'), getProgressData(row.pembuatanTeras, 'rencana'))"
              />
            </td>
            <td class="data-grid-cell">
              <ProgressItem
                title="Ripping"
                unit="Ha"
                :rencana="getProgressData(row.ripping, 'rencana')"
                :hari-ini="getProgressData(row.ripping, 'hariIni')"
                :sd-hari-ini="getProgressData(row.ripping, 'sdHariIni')"
                :persentase="calculatePercentage(getProgressData(row.ripping, 'sdHariIni'), getProgressData(row.ripping, 'rencana'))"
              />
            </td>
            <td class="data-grid-cell">
              <ProgressItem
                title="Luku"
                unit="Ha"
                :rencana="getProgressData(row.luku, 'rencana')"
                :hari-ini="getProgressData(row.luku, 'hariIni')"
                :sd-hari-ini="getProgressData(row.luku, 'sdHariIni')"
                :persentase="calculatePercentage(getProgressData(row.luku, 'sdHariIni'), getProgressData(row.luku, 'rencana'))"
              />
            </td>
            <td class="data-grid-cell">
              <ProgressItem
                title="Tumbang/Chipping"
                unit="Ha"
                :rencana="getProgressData(row.tumbangChipping, 'rencana')"
                :hari-ini="getProgressData(row.tumbangChipping, 'hariIni')"
                :sd-hari-ini="getProgressData(row.tumbangChipping, 'sdHariIni')"
                :persentase="calculatePercentage(getProgressData(row.tumbangChipping, 'sdHariIni'), getProgressData(row.tumbangChipping, 'rencana'))"
              />
            </td>
            <td class="data-grid-cell">
              <ProgressItem
                title="Menanam Mucuna"
                unit="Ha"
                :rencana="getProgressData(row.menanamMucuna, 'rencana')"
                :hari-ini="getProgressData(row.menanamMucuna, 'hariIni')"
                :sd-hari-ini="getProgressData(row.menanamMucuna, 'sdHariIni')"
                :persentase="calculatePercentage(getProgressData(row.menanamMucuna, 'sdHariIni'), getProgressData(row.menanamMucuna, 'rencana'))"
              />
            </td>
            <td class="data-grid-cell">
              <ProgressItem
                title="Lubang Tanam KS"
                unit="Ha"
                :rencana="getProgressData(row.lubangTanamKS, 'rencana')"
                :hari-ini="getProgressData(row.lubangTanamKS, 'hariIni')"
                :sd-hari-ini="getProgressData(row.lubangTanamKS, 'sdHariIni')"
                :persentase="calculatePercentage(getProgressData(row.lubangTanamKS, 'sdHariIni'), getProgressData(row.lubangTanamKS, 'rencana'))"
              />
            </td>
            <td class="data-grid-cell">
              <ProgressItem
                title="Mempupuk Lubang KS"
                unit="Ha"
                :rencana="getProgressData(row.mempupukLubangKS, 'rencana')"
                :hari-ini="getProgressData(row.mempupukLubangKS, 'hariIni')"
                :sd-hari-ini="getProgressData(row.mempupukLubangKS, 'sdHariIni')"
                :persentase="calculatePercentage(getProgressData(row.mempupukLubangKS, 'sdHariIni'), getProgressData(row.mempupukLubangKS, 'rencana'))"
              />
            </td>
            <td class="data-grid-cell">
              <ProgressItem
                title="Menanam KS"
                unit="Ha"
                :rencana="getProgressData(row.menanamKS, 'rencana')"
                :hari-ini="getProgressData(row.menanamKS, 'hariIni')"
                :sd-hari-ini="getProgressData(row.menanamKS, 'sdHariIni')"
                :persentase="calculatePercentage(getProgressData(row.menanamKS, 'sdHariIni'), getProgressData(row.menanamKS, 'rencana'))"
              />
            </td>
            <td class="data-grid-cell">
              <ProgressItem
                title="Progress Overall"
                :rencana="100"
                :hari-ini="0"
                :sd-hari-ini="row.progressOverall"
                :persentase="row.progressOverall"
              />
            </td>
            <td class="data-grid-cell">
              <div class="flex items-center">
                <svg class="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
                <span>{{ formatDate(row.tanggalSPPBJ) }}</span>
              </div>
            </td>
            <td class="data-grid-cell">
              <div class="flex items-center">
                <svg class="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span>{{ row.durasiKerja }} hari</span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <div class="px-6 py-4 bg-gray-50 border-t border-gray-200">
      <div class="flex items-center justify-between">
        <div class="text-sm text-gray-700">
          Menampilkan <span class="font-medium">{{ startItem }}-{{ endItem }}</span> dari <span class="font-medium">{{ filteredData.length }}</span> data
        </div>
        <div class="flex items-center space-x-8">
          <!-- Items per page control -->
          <div class="flex items-center space-x-2">
            <span class="text-sm text-gray-700">Items per page:</span>
            <div class="flex items-center border rounded">
              <select 
                v-model="itemsPerPage" 
                @change="handleItemsPerPageChange" 
                class="border-none rounded-l px-2 py-1 text-sm focus:outline-none"
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
                <option value="all">All</option>
              </select>
            </div>
          </div>
          
          <!-- Pagination buttons -->
          <div class="flex space-x-2">
            <button @click="prevPage" :disabled="currentPage === 1" class="btn btn-secondary text-sm">
              Previous
            </button>
            <button @click="nextPage" :disabled="currentPage === totalPages" class="btn btn-primary text-sm">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getDataTU } from '../services/dataService';
import { formatDate } from '../utils/dateUtils';
import { exportToExcel } from '../utils/exportUtils.js';
import ProgressItem from './ProgressItem.vue';

export default {
  name: 'TanamanUlangDataGrid',
  components: {
    ProgressItem
  },
  props: {
    // Terima data dari parent component (TanamanUlang.vue)
    rawData: {
      type: Array,
      required: true
    },
    filters: {
      type: Object,
      default: () => ({ kebun: '', afdeling: '', search: '' })
    }
  },
  emits: ['refresh'],
  data() {
    return {
      isLoading: false,
      errorData: '',
      currentPage: 1,
      itemsPerPage: 10,
      // State untuk melacak grup yang diminimalkan
      minimizedGroups: {},
      // State untuk filter tanggal
      selectedDate: null
    };
  },
  computed: {
    // Filter data berdasarkan filter yang dipilih
    filteredData() {
      if (!this.rawData || !this.rawData.length) return [];
      
      return this.rawData.filter(row => {
        // Filter tanggal
        if (this.selectedDate) {
          // Convert both dates to YYYY-MM-DD format for comparison
          const selectedDateStr = this.selectedDate;
          const rowDateStr = this.formatDateForComparison(row.tanggal);
          
          if (rowDateStr !== selectedDateStr) {
            return false;
          }
        }
        
        // Filter kebun
        if (this.filters.kebun && row.kebun !== this.filters.kebun) {
          return false;
        }
        
        // Filter AFD
        if (this.filters.afdeling && row.afdeling !== this.filters.afdeling) {
          return false;
        }
        
        // Filter search
        if (this.filters.search) {
          const searchLower = this.filters.search.toLowerCase();
          const searchableText = [
            row.kebun,
            row.namaVendor,
            row.afdeling,
            row.luas.toString(),
            this.getProgressData(row.pembuatanParit, 'rencana').toString(),
            this.getProgressData(row.pembuatanParit, 'sdHariIni').toString(),
            // ... tambahkan field lainnya jika perlu
          ].join(' ').toLowerCase();
          
          if (!searchableText.includes(searchLower)) {
            return false;
          }
        }
        
        return true;
      });
    },
    
    // Group data berdasarkan nama kebun
    groupedData() {
      const groups = {};
      
      this.filteredData.forEach(row => {
        if (!groups[row.kebun]) {
          groups[row.kebun] = [];
        }
        groups[row.kebun].push(row);
      });
      
      return groups;
    },

    // Calculate pagination values
    totalPages() {
      if (this.itemsPerPage === 'all') return 1;
      return Math.ceil(this.filteredData.length / this.itemsPerPage);
    },
    
    startItem() {
      if (this.itemsPerPage === 'all') return 1;
      return (this.currentPage - 1) * this.itemsPerPage + 1;
    },
    
    endItem() {
      if (this.itemsPerPage === 'all') return this.filteredData.length;
      const end = this.currentPage * this.itemsPerPage;
      return end > this.filteredData.length ? this.filteredData.length : end;
    },
    
    // Create paginated version of data
    paginatedData() {
      if (this.itemsPerPage === 'all') {
        return this.filteredData;
      }
      
      const startIndex = (this.currentPage - 1) * this.itemsPerPage;
      const endIndex = startIndex + this.itemsPerPage;
      
      return this.filteredData.slice(startIndex, endIndex);
    }
  },
  methods: {
    // Metode untuk mengambil data progress dengan aman
    getProgressData(progressObj, field) {
      if (!progressObj || typeof progressObj !== 'object') {
        return 0;
      }
      return progressObj[field] || 0;
    },
    
    formatNumber(num) {
      if (num === null || num === undefined || isNaN(num)) return '0';
      return parseFloat(num).toLocaleString('id-ID', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    },
    formatPercentage(num) {
      if (num === null || num === undefined || isNaN(num)) return '0%';
      return `${parseFloat(num).toFixed(1)}%`;
    },
    formatDate(dateString) {
      return formatDate(dateString);
    },
    // Metode untuk memformat tanggal untuk perbandingan
    formatDateForComparison(dateValue) {
      if (!dateValue) return '';
      
      // Handle ISO string format dari backend
      if (typeof dateValue === 'string') {
        return dateValue.split('T')[0];
      }
      
      return '';
    },
    calculatePercentage(realization, plan) {
      if (!plan || plan === 0) return 0;
      return (realization / plan) * 100;
    },
    exportToExcelHandler() {
      console.log('Exporting raw data:', this.rawData);
      exportToExcel(this.rawData);
    },
    refreshData() {
      this.$emit('refresh');
    },
    async fetchData() {
      this.isLoading = true;
      this.errorData = '';
      try {
        // Include date filter in API call if selected
        const params = {};
        if (this.selectedDate) {
          params.tanggal = this.selectedDate;
        }
        
        const response = await getDataTU(params);
        
        // Perbaikan: Pastikan kita mengambil data dengan benar
        this.rawData = response.data || response;
        
        // Debug log untuk melihat data yang disimpan
        console.log('Raw data after assignment:', this.rawData);
        
        // Debug log untuk melihat tanggal yang diformat
        if (this.rawData && this.rawData.length > 0) {
          console.log('Formatted dates:');
          this.rawData.forEach((row, index) => {
            console.log(`Row ${index}: ${this.formatDateForComparison(row.tanggal)}`);
          });
        }
      } catch (err) {
        this.errorData = err.response?.data?.message || 'Gagal mengambil data.';
        console.error('Error fetching data:', err);
      } finally {
        this.isLoading = false;
      }
    },
    // Metode untuk menangani perubahan filter tanggal
    handleDateFilter() {
      this.resetPagination();
      this.fetchData();
    },
    // Metode untuk menghapus filter tanggal
    clearDateFilter() {
      this.selectedDate = null;
      this.resetPagination();
      this.fetchData();
    },
    resetPagination() {
      this.currentPage = 1;
    },
    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
      }
    },
    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++;
      }
    },
    handleItemsPerPageChange() {
      this.resetPagination();
    },
    // Metode untuk toggle minimize/maximize grup
    toggleGroup(groupName) {
      // Menggunakan spread operator untuk mempertahankan reaktivitas di Vue 3
      this.minimizedGroups = {
        ...this.minimizedGroups,
        [groupName]: !this.minimizedGroups[groupName]
      };
    }
  },
  watch: {
    filteredData() {
      this.resetPagination();
    }
  },
  async created() {
    this.fetchData();
  }
}
</script>

<style scoped>
/* Tambahkan style untuk transisi dan cursor pointer */
.kebun-header {
  cursor: pointer;
  transition: background-color 0.2s;
}

.kebun-header:hover {
  background-color: rgba(243, 244, 246, 0.5);
}

/* Animasi untuk ikon panah */
.transform {
  transition: transform 0.2s ease-in-out;
}

.rotate-90 {
  transform: rotate(90deg);
}

/* Style untuk status indikator */
.badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
}

.badge-info {
  background-color: #dbeafe;
  color: #1e40af;
}

/* Style untuk tombol */
.btn {
  display: inline-block;
  font-weight: 400;
  text-align: center;
  white-space: nowrap;
  vertical-align: middle;
  user-select: none;
  border: 1px solid transparent;
  padding: 0.375rem 0.75rem;
  font-size: 0.875rem;
  line-height: 1.5;
  border-radius: 0.25rem;
  transition: color 0.15s ease-in-out, background-color 0.15s ease-in-out, border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
  cursor: pointer;
}

.btn-primary {
  color: #fff;
  background-color: #4f46e5;
  border-color: #4f46e5;
}

.btn-primary:hover {
  color: #fff;
  background-color: #4338ca;
  border-color: #4338ca;
}

.btn-primary:disabled {
  color: #fff;
  background-color: #a5b4fc;
  border-color: #a5b4fc;
  cursor: not-allowed;
}

.btn-secondary {
  color: #1f2937;
  background-color: #f3f4f6;
  border-color: #d1d5db;
}

.btn-secondary:hover {
  color: #1f2937;
  background-color: #e5e7eb;
  border-color: #d1d5db;
}

.btn-secondary:disabled {
  color: #9ca3af;
  background-color: #f9fafb;
  border-color: #e5e7eb;
  cursor: not-allowed;
}

/* Style untuk tabel */
.data-table {
  width: 100%;
  border-collapse: collapse;
  border-spacing: 0;
}

.data-table th {
  padding: 0.75rem 1rem;
  text-align: left;
  font-weight: 600;
  color: #374151;
  background-color: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.data-table td {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.data-grid-row:hover {
  background-color: rgba(243, 244, 246, 0.5);
}

.kebun-group {
  background-color: #f0f9ff;
}

.kebun-header {
  font-weight: 600;
  color: #0c4a6e;
}

.table-container {
  overflow-x: auto;
}

/* Style untuk responsive */
@media (max-width: 1024px) {
  .table-container {
    font-size: 0.875rem;
  }
  
  .data-table th,
  .data-table td {
    padding: 0.5rem;
  }
}

@media (max-width: 768px) {
  .table-container {
    font-size: 0.75rem;
  }
  
  .data-table th,
  .data-table td {
    padding: 0.25rem;
  }
}
</style>