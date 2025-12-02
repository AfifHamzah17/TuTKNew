<template>
  <div class="data-entry-container">
    <!-- Bagian header dan form utama tetap sama -->
    <header>
      <h1>Input Data Tanaman Ulang</h1>
      <p>Kebun: <strong>{{ currentUser.kebun }}</strong> | Krani: <strong>{{ currentUser.name }}</strong></p>
      <div class="nav-links">
        <router-link to="/tanaman-ulang/view" class="nav-link">Lihat Data</router-link>
        <button @click="logout" class="btn btn-secondary">Logout</button>
      </div>
    </header>

    <!-- Form utama tetap sama -->
    <form @submit.prevent="handleSubmit">
      <!-- Bagian Data Utama -->
      <section class="form-section">
        <h2>Data Utama</h2>
        <div class="form-grid-main">
          <div class="form-group">
            <label>No. Urut</label>
            <input type="number" v-model.number="formData.no" readonly />
          </div>
          <div class="form-group">
            <label>Afdeling</label>
            <select v-model="formData.afdeling" required>
              <option value="">Pilih Afdeling</option>
              <option value="I">I</option>
              <option value="II">II</option>
              <option value="III">III</option>
              <option value="IV">IV</option>
              <option value="V">V</option>
              <option value="VI">VI</option>
              <option value="VII">VII</option>
              <option value="VIII">VIII</option>
              <option value="IX">IX</option>
              <option value="X">X</option>
              <option value="II/IV/">II/IV</option>
              <option value="III/V/VI">III/V/VI</option>
            </select>
          </div>
          <div class="form-group">
            <label>Nama Vendor</label>
            <input type="text" v-model="formData.namaVendor" required />
          </div>
          <div class="form-group">
            <label>Luas (Ha)</label>
            <input type="number" v-model.number="formData.luas" step="0.01" required />
          </div>
        </div>
      </section>

      <!-- Bagian Progress Pekerjaan -->
      <section class="form-section">
        <h2>Progress Pekerjaan</h2>
        <div class="progress-grid">
          <ProgressInput title="Pembuatan Parit" unit="Mtr" v-model="formData.pembuatanParit" layout="vertical" />
          <ProgressInput title="Pembuatan Jalan" unit="Mtr" v-model="formData.pembuatanJalan" layout="vertical" />
          <ProgressInput title="Pembuatan Teras" unit="Mtr" v-model="formData.pembuatanTeras" layout="vertical" />
          <ProgressInput title="Ripping" unit="Ha" v-model="formData.ripping" layout="vertical" @update:modelValue="calculateProgress" />
          <ProgressInput title="Luku" unit="Ha" v-model="formData.luku" layout="vertical" @update:modelValue="calculateProgress" />
          <ProgressInput title="Tumbang/Chipping" unit="Ha" v-model="formData.tumbangChipping" layout="vertical" @update:modelValue="calculateProgress" />
          <ProgressInput title="Menanam Mucuna" unit="Ha" v-model="formData.menanamMucuna" layout="vertical" @update:modelValue="calculateProgress" />
          <ProgressInput title="Lubang Tanam KS" unit="Ha" v-model="formData.lubangTanamKS" layout="vertical" @update:modelValue="calculateProgress" />
          <ProgressInput title="Mempupuk Lubang KS" unit="Ha" v-model="formData.memupukLubangKS" layout="vertical" @update:modelValue="calculateProgress" />
          <ProgressInput title="Menanam KS" unit="Ha" v-model="formData.menanamKS" layout="vertical" @update:modelValue="calculateProgress" />
        </div>
      </section>

      <!-- Bagian Data Tambahan -->
      <section class="form-section">
        <h2>Informasi Tambahan</h2>
        <div class="form-grid-secondary">
          <div class="form-group">
            <label>Progress Overall (%)</label>
            <input type="number" v-model.number="formData.progressOverall" min="0" max="100" step="0.01" readonly />
            <small class="form-help">Dihitung otomatis dari total progress bidang dengan satuan Ha</small>
          </div>
          <div class="form-group">
            <label>Tanggal SPPBJ</label>
            <input type="date" v-model="formData.tanggalSPPBJ" required @change="calculateDurasiKerja" />
          </div>
          <div class="form-group">
            <label>Durasi Kerja (Hari)</label>
            <input type="number" v-model.number="formData.durasiKerja" min="0" readonly />
            <small class="form-help">Dihitung otomatis dari tanggal SPPBJ hingga hari ini</small>
          </div>
        </div>
      </section>
      
      <button type="submit" :disabled="isLoading" class="btn btn-primary">
        {{ isEditMode ? 'Memperbarui...' : 'Menyimpan...' }}
      </button>
      
      <button v-if="isEditMode" type="button" @click="cancelEdit" class="btn btn-secondary">
        Batal Edit
      </button>
    </form>

    <!-- Bagian untuk menampilkan data yang sudah diinput -->
    <section class="data-display-section">
      <div class="section-header">
        <h2>Data yang Telah Diinput</h2>
        <button @click="toggleFilter" class="filter-toggle-btn" :class="{ active: showFilter }">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="22 3 2 3 10 12.46 10 19 14 16 14 12.46 22 3"></polygon>
          </svg>
          Filter
        </button>
      </div>
      
      <!-- Filter Section -->
      <div v-if="showFilter" class="filter-section">
        <div class="filter-controls">
          <!-- Filter Kebun -->
          <div class="filter-group">
            <label>Kebun</label>
            <select v-model="filters.kebun">
              <option value="">Semua Kebun</option>
              <option v-for="kebun in uniqueKebunOptions" :key="kebun" :value="kebun">
                {{ kebun }}
              </option>
            </select>
          </div>

          <!-- Filter Tanggal -->
          <div class="filter-group">
            <label>Tanggal</label>
            <div class="date-options">
              <label>
                <input type="radio" value="all" v-model="filters.dateType" /> Semua
              </label>
              <label>
                <input type="radio" value="today" v-model="filters.dateType" /> Hari Ini
              </label>
              <label>
                <input type="radio" value="range" v-model="filters.dateType" /> Rentang
              </label>
              <label>
                <input type="radio" value="custom" v-model="filters.dateType" /> Tanggal Kustom
              </label>
            </div>
            <div v-if="filters.dateType === 'range'" class="date-range-inputs">
              <input type="date" v-model="filters.startDate" />
              <span>s/d</span>
              <input type="date" v-model="filters.endDate" />
            </div>
            <div v-if="filters.dateType === 'custom'" class="custom-date-inputs">
              <input type="date" v-model="filters.customDate" />
            </div>
          </div>

          <!-- Filter No. Urut -->
          <div class="filter-group">
            <label>No. Urut</label>
            <select v-model="filters.noUrut">
              <option value="">Semua No. Urut</option>
              <option v-for="no in uniqueNoUrutOptions" :key="no" :value="no">{{ no }}</option>
            </select>
          </div>

          <!-- Filter Vendor -->
          <div class="filter-group">
            <label>Vendor</label>
            <select v-model="filters.vendor">
              <option value="">Semua Vendor</option>
              <option v-for="vendor in uniqueVendorOptions" :key="vendor" :value="vendor">{{ vendor }}</option>
            </select>
          </div>

          <!-- Filter Afdeling -->
          <div class="filter-group">
            <label>Afdeling</label>
            <select v-model="filters.afdeling">
              <option value="">Semua Afdeling</option>
              <option v-for="afdeling in uniqueAfdelingOptions" :key="afdeling" :value="afdeling">{{ afdeling }}</option>
            </select>
          </div>
        </div>
        
        <div class="filter-actions">
          <button @click="applyFilters" class="btn btn-primary btn-sm">Terapkan</button>
          <button @click="resetFilters" class="btn btn-secondary btn-sm">Reset</button>
        </div>
      </div>
      
      <div v-if="isLoadingData" class="loading-container">
        <div class="spinner"></div>
        <p>Mengambil data...</p>
      </div>

      <div v-else-if="errorData" class="alert alert-error">
        {{ errorData }}
      </div>

      <div v-else-if="filteredDataList.length === 0" class="no-data">
        <p>Belum ada data yang diinput untuk kebun {{ currentUser.kebun }}.</p>
      </div>

      <div v-else class="data-cards-grid">
        <div v-for="item in filteredDataList" :key="item.docId" class="data-card">
          <div class="card-header">
            <h3>{{ formatDate(item.tanggal) }}</h3>
            <span class="badge">{{ item.afdeling }}</span>
          </div>
          <div class="card-body">
            <div class="card-row">
              <div class="card-item">
                  <strong>No. Urut:</strong>
                  <span>{{ item.no }}</span>
              </div>
              <div class="card-item">
                <strong>Nama Vendor:</strong>
                <span>{{ item.namaVendor }}</span>
              </div>
            </div>
            <div class="card-row">
              <div class="card-item">
                <strong>Luas (Ha):</strong>
                <span>{{ formatNumber(item.luas) }}</span>
              </div>
              <div class="card-item">
                <strong>Progress Overall:</strong>
                <span>{{ formatNumber(item.progressOverall) }}%</span>
              </div>
            </div>
            <div class="card-row">
              <div class="card-item">
                <strong>Pembuatan Parit (Mtr):</strong>
                <span>{{ formatNumber(item.pembuatanParit?.sdHariIni || 0) }}</span>
              </div>
              <div class="card-item">
                <strong>Pembuatan Jalan (Mtr):</strong>
                <span>{{ formatNumber(item.pembuatanJalan?.sdHariIni || 0) }}</span>
              </div>
            </div>
            <div class="card-row">
              <div class="card-item">
                <strong>Ripping (Ha):</strong>
                <span>{{ formatNumber(item.ripping?.sdHariIni || 0) }}</span>
              </div>
              <div class="card-item">
                <strong>Luku (Ha):</strong>
                <span>{{ formatNumber(item.luku?.sdHariIni || 0) }}</span>
              </div>
            </div>
            <div class="card-row">
              <div class="card-item">
                <strong>Tanggal SPPBJ:</strong>
                <span>{{ formatDate(item.tanggalSPPBJ) }}</span>
              </div>
              <div class="card-item">
                <strong>Durasi Kerja (Hari):</strong>
                <span>{{ item.durasiKerja }}</span>
              </div>
            </div>
            <div class="card-actions">
              <button @click="openEditModal(item)" class="btn btn-secondary btn-sm">
                Edit Data
              </button>
              <button @click="confirmDelete(item.docId)" class="btn btn-danger btn-sm">
                Hapus
              </button>
              <button 
                v-if="!isToday(item.tanggal)" 
                @click="updateForToday(item)" 
                class="btn btn-primary btn-sm"
              >
                Perbarui Data untuk Hari Ini
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Modal untuk Edit Data -->
    <div v-if="showEditModal" class="modal-overlay" @click.self="closeEditModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Edit Data Tanaman Ulang</h3>
          <button @click="closeEditModal" class="close-btn">&times;</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="updateData">
            <div class="form-grid">
              <div class="form-group">
                <label>No. Urut</label>
                <input type="number" v-model.number="editFormData.no" readonly />
              </div>
              <div class="form-group">
                <label>Afdeling</label>
                <select v-model="editFormData.afdeling" required>
                  <option value="">Pilih Afdeling</option>
                  <option value="I">I</option>
                  <option value="II">II</option>
                  <option value="III">III</option>
                  <option value="IV">IV</option>
                  <option value="V">V</option>
                  <option value="VI">VI</option>
                  <option value="VII">VII</option>
                  <option value="VIII">VIII</option>
                  <option value="IX">IX</option>
                  <option value="X">X</option>
                </select>
              </div>
              <div class="form-group">
                <label>Nama Vendor</label>
                <input type="text" v-model="editFormData.namaVendor" required />
              </div>
              <div class="form-group">
                <label>Luas (Ha)</label>
                <input type="number" v-model.number="editFormData.luas" step="0.01" required />
              </div>
            </div>
            
            <div class="progress-grid">
              <ProgressInput title="Pembuatan Parit" unit="Mtr" v-model="editFormData.pembuatanParit" layout="vertical" />
              <ProgressInput title="Pembuatan Jalan" unit="Mtr" v-model="editFormData.pembuatanJalan" layout="vertical" />
              <ProgressInput title="Pembuatan Teras" unit="Mtr" v-model="editFormData.pembuatanTeras" layout="vertical" />
              <ProgressInput title="Ripping" unit="Ha" v-model="editFormData.ripping" layout="vertical" @update:modelValue="calculateEditProgress" />
              <ProgressInput title="Luku" unit="Ha" v-model="editFormData.luku" layout="vertical" @update:modelValue="calculateEditProgress" />
              <ProgressInput title="Tumbang/Chipping" unit="Ha" v-model="editFormData.tumbangChipping" layout="vertical" @update:modelValue="calculateEditProgress" />
              <ProgressInput title="Menanam Mucuna" unit="Ha" v-model="editFormData.menanamMucuna" layout="vertical" @update:modelValue="calculateEditProgress" />
              <ProgressInput title="Lubang Tanam KS" unit="Ha" v-model="editFormData.lubangTanamKS" layout="vertical" @update:modelValue="calculateEditProgress" />
              <ProgressInput title="Mempupuk Lubang KS" unit="Ha" v-model="editFormData.memupukLubangKS" layout="vertical" @update:modelValue="calculateEditProgress" />
              <ProgressInput title="Menanam KS" unit="Ha" v-model="editFormData.menanamKS" layout="vertical" @update:modelValue="calculateEditProgress" />
            </div>
            
            <div class="form-grid-secondary">
              <div class="form-group">
                <label>Progress Overall (%)</label>
                <input type="number" v-model.number="editFormData.progressOverall" min="0" max="100" step="0.01" readonly />
                <small class="form-help">Dihitung otomatis dari total progress bidang dengan satuan Ha</small>
              </div>
              <div class="form-group">
                <label>Tanggal SPPBJ</label>
                <input type="date" v-model="editFormData.tanggalSPPBJ" required @change="calculateEditDurasiKerja" />
              </div>
              <div class="form-group">
                <label>Durasi Kerja (Hari)</label>
                <input type="number" v-model.number="editFormData.durasiKerja" min="0" readonly />
                <small class="form-help">Dihitung otomatis dari tanggal SPPBJ hingga hari ini</small>
              </div>
            </div>
            
            <div class="modal-actions">
              <button type="submit" :disabled="isUpdating" class="btn btn-primary">
                {{ isUpdating ? 'Memperbarui...' : 'Perbarui' }}
              </button>
              <button type="button" @click="closeEditModal" class="btn btn-secondary">
                Batal
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

<!-- Modal Konfirmasi Replace Data -->
<div v-if="showReplaceConfirmModal" class="modal-overlay" @click.self="closeReplaceConfirmModal">
  <div class="modal-content" @click.stop>
    <div class="modal-header">
      <h3>Konfirmasi Penggantian Data</h3>
      <button @click="closeReplaceConfirmModal" class="close-btn">&times;</button>
    </div>
    <div class="modal-body">
      <p>Beberapa data untuk tanggal yang dipilih sudah ada. Apakah Anda ingin menggantinya?</p>
      
      <div v-if="conflictingData.length > 0" class="conflict-list">
        <h4>Data yang akan diganti:</h4>
        <ul>
          <li v-for="item in conflictingData" :key="item.docId">
            No. {{ item.no }} - Afdeling {{ item.afdeling }} - Kebun {{ item.kebun }}
          </li>
        </ul>
      </div>
      
      <div class="modal-actions">
        <button @click="closeReplaceConfirmModal" class="btn btn-secondary">
          Batal
        </button>
        <button @click="replaceAndSaveExcelData" class="btn btn-danger">
          Ganti Data
        </button>
      </div>
    </div>
  </div>
</div>

    <!-- Modal Konfirmasi Hapus -->
    <div v-if="showDeleteModal" class="modal-overlay" @click.self="closeDeleteModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Konfirmasi Hapus Data</h3>
          <button @click="closeDeleteModal" class="close-btn">&times;</button>
        </div>
        <div class="modal-body">
          <p>Apakah Anda yakin ingin menghapus data ini?</p>
          <div class="modal-actions">
            <button @click="closeDeleteModal" class="btn btn-secondary">
              Batal
            </button>
            <button @click="deleteDataConfirmed" class="btn btn-danger">
              Hapus
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal untuk Tambah Data Tanggal Sebelumnya (Ditingkatkan) -->
    <div v-if="showPreviousDateModal" class="modal-overlay" @click.self="closePreviousDateModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Tambah Data untuk Tanggal Sebelumnya</h3>
          <button @click="closePreviousDateModal" class="close-btn">&times;</button>
        </div>
        <div class="modal-body">
          <!-- Tab untuk memilih metode input -->
          <div class="tab-container">
            <div class="tab-buttons">
              <button 
                @click="activeTab = 'manual'" 
                :class="{ active: activeTab === 'manual' }"
                class="tab-button"
              >
                Input Manual
              </button>
              <button 
                @click="activeTab = 'excel'" 
                :class="{ active: activeTab === 'excel' }"
                class="tab-button"
              >
                Import Excel
              </button>
            </div>
            
            <!-- Tab Input Manual -->
            <div v-if="activeTab === 'manual'" class="tab-content">
              <form @submit.prevent="savePreviousDateData">
                <!-- Step 1: Pilih Kebun -->
                <div class="form-group">
                  <label for="kebun-select">1. Pilih Kebun</label>
                  <select id="kebun-select" v-model="selectedKebun" @change="resetNoUrutSelection" required>
                    <option value="">-- Pilih Kebun --</option>
                    <option v-for="kebun in uniqueKebunOptions" :key="kebun" :value="kebun">
                      {{ kebun }}
                    </option>
                  </select>
                  <small class="form-help">Pilih kebun untuk data yang akan ditambahkan.</small>
                </div>
                
                <!-- Step 2: Pilih No. Urut -->
                <div class="form-group" v-if="selectedKebun">
                  <label for="template-select">2. Pilih Data Template (No. Urut)</label>
                  <select id="template-select" v-model="selectedPreviousDataId" @change="populatePreviousDateForm" required>
                    <option value="">-- Pilih No. Urut --</option>
                    <option v-for="item in filteredDataList" :key="item.docId" :value="item.docId">
                      No. {{ item.no }} - {{ item.afdeling }} - {{ formatDate(item.tanggal) }}
                    </option>
                  </select>
                  <small class="form-help">Pilih data yang akan dijadikan template untuk entri baru.</small>
                </div>
                
                <!-- Step 3: Input Data -->
                <div v-if="selectedPreviousDataId" class="template-form-container">
                  <div class="form-grid">
                    <div class="form-group">
                      <label>Afdeling</label>
                      <select v-model="previousDateData.afdeling" required>
                        <option value="I">I</option>
                        <option value="II">II</option>
                        <option value="III">III</option>
                        <option value="IV">IV</option>
                        <option value="V">V</option>
                        <option value="VI">VI</option>
                        <option value="VII">VII</option>
                        <option value="VIII">VIII</option>
                        <option value="IX">IX</option>
                        <option value="X">X</option>
                      </select>
                    </div>
                    <div class="form-group">
                      <label>Nama Vendor</label>
                      <input type="text" v-model="previousDateData.namaVendor" required />
                    </div>
                    <div class="form-group">
                      <label>Luas (Ha)</label>
                      <input type="number" v-model.number="previousDateData.luas" step="0.01" required />
                    </div>
                    <div class="form-group">
                      <label>Tanggal</label>
                      <input type="date" v-model="previousDateData.tanggal" :max="maxPreviousDate" required />
                      <small class="form-help">Pilih tanggal untuk data ini. Maksimal adalah hari kemarin.</small>
                    </div>
                    <div class="form-group">
                      <label>Tanggal SPPBJ</label>
                      <input type="date" v-model="previousDateData.tanggalSPPBJ" required />
                    </div>
                  </div>
                  
                  <div class="progress-grid">
                    <ProgressInput title="Pembuatan Parit" unit="Mtr" v-model="previousDateData.pembuatanParit" layout="vertical" />
                    <ProgressInput title="Pembuatan Jalan" unit="Mtr" v-model="previousDateData.pembuatanJalan" layout="vertical" />
                    <ProgressInput title="Pembuatan Teras" unit="Mtr" v-model="previousDateData.pembuatanTeras" layout="vertical" />
                    <ProgressInput title="Ripping" unit="Ha" v-model="previousDateData.ripping" layout="vertical" @update:modelValue="calculatePreviousDateProgress" />
                    <ProgressInput title="Luku" unit="Ha" v-model="previousDateData.luku" layout="vertical" @update:modelValue="calculatePreviousDateProgress" />
                    <ProgressInput title="Tumbang/Chipping" unit="Ha" v-model="previousDateData.tumbangChipping" layout="vertical" @update:modelValue="calculatePreviousDateProgress" />
                    <ProgressInput title="Menanam Mucuna" unit="Ha" v-model="previousDateData.menanamMucuna" layout="vertical" @update:modelValue="calculatePreviousDateProgress" />
                    <ProgressInput title="Lubang Tanam KS" unit="Ha" v-model="previousDateData.lubangTanamKS" layout="vertical" @update:modelValue="calculatePreviousDateProgress" />
                    <ProgressInput title="Mempupuk Lubang KS" unit="Ha" v-model="previousDateData.memupukLubangKS" layout="vertical" @update:modelValue="calculatePreviousDateProgress" />
                    <ProgressInput title="Menanam KS" unit="Ha" v-model="previousDateData.menanamKS" layout="vertical" @update:modelValue="calculatePreviousDateProgress" />
                  </div>
                  
                  <div class="form-grid-secondary">
                    <div class="form-group">
                      <label>Progress Overall (%)</label>
                      <input type="number" v-model.number="previousDateData.progressOverall" min="0" max="100" step="0.01" readonly />
                      <small class="form-help">Dihitung otomatis dari total progress bidang dengan satuan Ha</small>
                    </div>
                    <div class="form-group">
                      <label>Durasi Kerja (Hari)</label>
                      <input type="number" v-model.number="previousDateData.durasiKerja" min="0" readonly />
                      <small class="form-help">Dihitung otomatis dari tanggal SPPBJ hingga tanggal yang dipilih</small>
                    </div>
                  </div>
                </div>
                
                <div class="modal-actions">
                  <button type="submit" :disabled="isSavingPreviousDate || !selectedPreviousDataId" class="btn btn-primary">
                    {{ isSavingPreviousDate ? 'Menyimpan...' : 'Simpan' }}
                  </button>
                  <button type="button" @click="closePreviousDateModal" class="btn btn-secondary">
                    Batal
                  </button>
                </div>
              </form>
            </div>
            
<!-- Tab Content untuk Import Excel -->
  <div v-if="activeTab === 'excel'" class="tab-content">
    <div class="excel-import-container">
      <!-- Dokumentasi Format Excel -->
      <div class="excel-documentation">
        <div class="documentation-header">
          <h4>Dokumentasi Format Excel</h4>
          <button @click="downloadTemplate" class="btn btn-sm btn-primary">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            Unduh Template
          </button>
        </div>
        
        <div class="documentation-content">
          <p>Pastikan file Excel Anda mengikuti format berikut:</p>
          
          <div class="documentation-table-container">
            <table class="documentation-table">
              <thead>
                <tr>
                  <th>Kolom</th>
                  <th>Label</th>
                  <th>Contoh</th>
                  <th>Keterangan</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td class="col-letter">A</td>
                  <td>No</td>
                  <td>1</td>
                  <td>Nomor urut unik untuk setiap data</td>
                </tr>
                <tr>
                  <td class="col-letter">B</td>
                  <td>Kebun</td>
                  <td>1KLJ</td>
                  <td>Nama kebun</td>
                </tr>
                <tr>
                  <td class="col-letter">C</td>
                  <td>AFD</td>
                  <td>I</td>
                  <td>Kode afdeling (I, II, III, IV, V, VI, VII, VIII, IX, X)</td>
                </tr>
                <tr>
                  <td class="col-letter">D</td>
                  <td>Nama Vendor</td>
                  <td>PT. Maju Jaya</td>
                  <td>Nama vendor/penyedia jasa</td>
                </tr>
                <tr>
                  <td class="col-letter">E</td>
                  <td>Luas Paket (ha)</td>
                  <td>56,73</td>
                  <td>Luas area dalam hektar (gunakan koma atau titik untuk desimal)</td>
                </tr>
                <tr>
                  <td class="col-letter">F</td>
                  <td>Ripper (ha) Rencana</td>
                  <td>36,44</td>
                  <td>Luas rencana untuk Ripper dalam hektar</td>
                </tr>
                <tr>
                  <td class="col-letter">G</td>
                  <td>Ripper (ha) SdHi</td>
                  <td>36,44</td>
                  <td>Luas Ripper yang sudah dikerjakan hingga hari ini</td>
                </tr>
                <tr>
                  <td class="col-letter">H</td>
                  <td>Luku (ha) Rencana</td>
                  <td>36,44</td>
                  <td>Luas rencana untuk Luku dalam hektar</td>
                </tr>
                <tr>
                  <td class="col-letter">I</td>
                  <td>Luku (ha) SdHi</td>
                  <td>36,44</td>
                  <td>Luas Luku yang sudah dikerjakan hingga hari ini</td>
                </tr>
                <tr>
                  <td class="col-letter">J</td>
                  <td>Tumbang/Chipping (ha) Rencana</td>
                  <td>56,73</td>
                  <td>Luas rencana untuk Tumbang/Chipping dalam hektar</td>
                </tr>
                <tr>
                  <td class="col-letter">K</td>
                  <td>Tumbang/Chipping (ha) SdHi</td>
                  <td>56,73</td>
                  <td>Luas Tumbang/Chipping yang sudah dikerjakan hingga hari ini</td>
                </tr>
                <tr>
                  <td class="col-letter">L</td>
                  <td>Pembuatan Parit (Mtr) Rencana</td>
                  <td>3318</td>
                  <td>Panjang rencana untuk Pembuatan Parit dalam meter</td>
                </tr>
                <tr>
                  <td class="col-letter">M</td>
                  <td>Pembuatan Parit (Mtr) SdHi</td>
                  <td>3275</td>
                  <td>Panjang Pembuatan Parit yang sudah dikerjakan hingga hari ini</td>
                </tr>
                <tr>
                  <td class="col-letter">N</td>
                  <td>Menanam Mucuna (ha) Rencana</td>
                  <td>56,73</td>
                  <td>Luas rencana untuk Menanam Mucuna dalam hektar</td>
                </tr>
                <tr>
                  <td class="col-letter">O</td>
                  <td>Menanam Mucuna (ha) SdHi</td>
                  <td>31,00</td>
                  <td>Luas Menanam Mucuna yang sudah dikerjakan hingga hari ini</td>
                </tr>
                <tr>
                  <td class="col-letter">P</td>
                  <td>Melubang Tanam (ha) Rencana</td>
                  <td>56,73</td>
                  <td>Luas rencana untuk Melubang Tanam dalam hektar</td>
                </tr>
                <tr>
                  <td class="col-letter">Q</td>
                  <td>Melubang Tanam (ha) SdHi</td>
                  <td>26,86</td>
                  <td>Luas Melubang Tanam yang sudah dikerjakan hingga hari ini</td>
                </tr>
                <tr>
                  <td class="col-letter">R</td>
                  <td>Memupuk Lubang Tanam (ha) Rencana</td>
                  <td>56,73</td>
                  <td>Luas rencana untuk Memupuk Lubang Tanam dalam hektar</td>
                </tr>
                <tr>
                  <td class="col-letter">S</td>
                  <td>Memupuk Lubang Tanam (ha) SdHi</td>
                  <td>14,00</td>
                  <td>Luas Memupuk Lubang Tanam yang sudah dikerjakan hingga hari ini</td>
                </tr>
                <tr>
                  <td class="col-letter">T</td>
                  <td>Menanam KS (ha) Rencana</td>
                  <td>56,73</td>
                  <td>Luas rencana untuk Menanam KS dalam hektar</td>
                </tr>
                <tr>
                  <td class="col-letter">U</td>
                  <td>Menanam KS (ha) SdHi</td>
                  <td>13,36</td>
                  <td>Luas Menanam KS yang sudah dikerjakan hingga hari ini</td>
                </tr>
                <tr>
                  <td class="col-letter">V</td>
                  <td>Pembuatan Teras (Mtr) Rencana</td>
                  <td>800</td>
                  <td>Panjang rencana untuk Pembuatan Teras dalam meter</td>
                </tr>
                <tr>
                  <td class="col-letter">W</td>
                  <td>Pembuatan Teras (Mtr) Sd Hari Ini</td>
                  <td>750</td>
                  <td>Panjang Pembuatan Teras yang sudah dikerjakan hingga hari ini</td>
                </tr>
                <tr>
                  <td class="col-letter">X</td>
                  <td>Pembuatan Jalan (Mtr) Rencana</td>
                  <td>1200</td>
                  <td>Panjang rencana untuk Pembuatan Jalan dalam meter</td>
                </tr>
                <tr>
                  <td class="col-letter">Y</td>
                  <td>Pembuatan Jalan (Mtr) Sd Hari Ini</td>
                  <td>1150</td>
                  <td>Panjang Pembuatan Jalan yang sudah dikerjakan hingga hari ini</td>
                </tr>
                <tr>
                  <td class="col-letter">Z</td>
                  <td>Tanggal SPPBJ</td>
                  <td>2024-11-01</td>
                  <td>Format tanggal: YYYY-MM-DD atau DD/MM/YYYY atau DD-MM-YYYY</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div class="example-section">
            <h5>Contoh Data Excel:</h5>
            <div class="example-table-container">
              <table class="example-table">
                <thead>
                  <tr>
                    <th class="col-header">A</th>
                    <th class="col-header">B</th>
                    <th class="col-header">C</th>
                    <th class="col-header">D</th>
                    <th class="col-header">E</th>
                    <th class="col-header">F</th>
                    <th class="col-header">G</th>
                    <th class="col-header">H</th>
                    <th class="col-header">I</th>
                    <th class="col-header">J</th>
                    <th class="col-header">K</th>
                    <th class="col-header">L</th>
                    <th class="col-header">M</th>
                    <th class="col-header">N</th>
                    <th class="col-header">O</th>
                    <th class="col-header">P</th>
                    <th class="col-header">Q</th>
                    <th class="col-header">R</th>
                    <th class="col-header">S</th>
                    <th class="col-header">T</th>
                    <th class="col-header">U</th>
                    <th class="col-header">V</th>
                    <th class="col-header">W</th>
                    <th class="col-header">X</th>
                    <th class="col-header">Y</th>
                    <th class="col-header">Z</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>1</td>
                    <td>1KLJ</td>
                    <td>I</td>
                    <td>PT. Maju Jaya</td>
                    <td>56,73</td>
                    <td>36,44</td>
                    <td>36,44</td>
                    <td>36,44</td>
                    <td>36,44</td>
                    <td>56,73</td>
                    <td>56,73</td>
                    <td>3318</td>
                    <td>3275</td>
                    <td>56,73</td>
                    <td>31,00</td>
                    <td>56,73</td>
                    <td>26,86</td>
                    <td>56,73</td>
                    <td>14,00</td>
                    <td>56,73</td>
                    <td>13,36</td>
                    <td>800</td>
                    <td>750</td>
                    <td>1200</td>
                    <td>1150</td>
                    <td>2024-11-01</td>
                  </tr>
                  <tr>
                    <td>2</td>
                    <td>1KLJ</td>
                    <td>II</td>
                    <td>CV. Sejahtera</td>
                    <td>45,50</td>
                    <td>30,00</td>
                    <td>28,50</td>
                    <td>30,00</td>
                    <td>28,50</td>
                    <td>45,50</td>
                    <td>45,50</td>
                    <td>2500</td>
                    <td>2400</td>
                    <td>45,50</td>
                    <td>25,00</td>
                    <td>45,50</td>
                    <td>20,00</td>
                    <td>45,50</td>
                    <td>12,00</td>
                    <td>45,50</td>
                    <td>10,00</td>
                    <td>600</td>
                    <td>580</td>
                    <td>1000</td>
                    <td>950</td>
                    <td>2024-11-05</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Form upload file Excel -->
      <div class="form-group">
        <label>1. Pilih Tanggal Data</label>
        <input type="date" v-model="excelImportDate" :max="maxPreviousDate" required />
        <small class="form-help">Pilih tanggal untuk data yang akan diimpor. Maksimal adalah hari kemarin.</small>
      </div>
      
      <div class="form-group">
        <label>2. Upload File Excel</label>
        <div class="file-upload-area" @click="triggerFileInput" @dragover.prevent @drop.prevent="handleFileDrop">
          <input 
            type="file" 
            ref="fileInput" 
            @change="handleFileChange" 
            accept=".xlsx, .xls" 
            style="display: none"
          />
          <div v-if="!excelFile" class="file-upload-placeholder">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
            <p>Klik untuk memilih file atau drag and drop di sini</p>
            <p class="file-format-info">Format yang didukung: .xlsx, .xls</p>
          </div>
          <div v-else class="file-selected">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
            <p>{{ excelFile.name }}</p>
            <button @click.stop="removeFile" class="btn btn-sm btn-secondary">Hapus File</button>
          </div>
        </div>
      </div>
      
      <!-- Preview table -->
      <div v-if="excelFile" class="form-group">
        <label>3. Preview Data</label>
        <div class="excel-preview-container">
          <div v-if="isProcessingExcel" class="loading-container">
            <div class="spinner"></div>
            <p>Memproses file Excel...</p>
          </div>
          <div v-else-if="excelData.length > 0" class="excel-preview-table">
            <table>
              <thead>
                <tr>
                  <th>No. Urut</th>
                  <th>Kebun</th>
                  <th>Afdeling</th>
                  <th>Nama Vendor</th>
                  <th>Luas (Ha)</th>
                  <th>Progress (%)</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in excelData" :key="index" :class="{ 'error-row': item.error }">
                  <td>{{ item.no }}</td>
                  <td>{{ item.kebun }}</td>
                  <td>{{ item.afdeling }}</td>
                  <td>{{ item.namaVendor }}</td>
                  <td>{{ formatNumber(item.luas) }}</td>
                  <td>{{ formatNumber(item.progressOverall) }}</td>
                  <td>
                    <span v-if="item.error" class="error-badge">{{ item.error }}</span>
                    <span v-else class="success-badge">Valid</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-else class="no-data">
            <p>Tidak ada data yang dapat diproses dari file Excel.</p>
          </div>
        </div>
      </div>
      
<div class="modal-actions">
  <button 
    @click="handleSaveExcel" 
    :disabled="isSavingExcel || !excelFile || excelData.length === 0 || hasInvalidData" 
    class="btn btn-primary"
  >
    {{ isSavingExcel ? 'Menyimpan...' : 'Simpan Semua Data' }}
  </button>
  <button @click="closePreviousDateModal" class="btn btn-secondary">
    Batal
  </button>
</div>
    </div>
  </div>
  
          </div>
        </div>
      </div>
    </div>

    <!-- Tombol untuk membuka modal tambah data tanggal sebelumnya -->
    <button @click="openPreviousDateModal" class="btn btn-primary floating-btn">
      Tambah Data Tanggal Sebelumnya
    </button>
  </div>
</template>

<script>
import { getDataTU, saveDataTU, updateDataTU, deleteDataTU, getNextSequence } from '../services/dataService';
import { formatDate } from '../utils/dateUtils';
import ProgressInput from '../components/ProgressInput.vue';
import Toastify from 'toastify-js';
import "toastify-js/src/toastify.css";
import * as XLSX from 'xlsx'; // Tambahkan library untuk parsing Excel
import '../assets/TanamanUlangKrani.css';

export default {
  name: 'TanamanUlangKrani',
  components: { ProgressInput },
  data() {
    return {
      isLoading: false,
      isLoadingData: false,
      errorData: '',
      isEditMode: false,
      editDocId: null,
      showEditModal: false,
      showDeleteModal: false,
      deleteDocId: null,
      showPreviousDateModal: false,
      isSavingPreviousDate: false,
      selectedPreviousDataId: '', // Untuk dropdown pemilihan template
      selectedKebun: '', // Untuk dropdown pemilihan kebun
      
      // TAMBAHKAN PROPERTIES UNTUK FILTER
      showFilter: false,
      filters: {
        dateType: 'all', // 'all', 'today', 'range', 'custom'
        startDate: '',
        endDate: '',
        customDate: '',
        kebun: '',
        noUrut: '',
        vendor: '',
        afdeling: ''
      },
      
      // TAMBAHKAN PROPERTIES UNTUK EXCEL IMPORT
      activeTab: 'manual', // 'manual' atau 'excel'
      excelFile: null,
      excelImportDate: '',
      excelData: [],
      isProcessingExcel: false,
      isSavingExcel: false,
      showReplaceConfirmModal: false,
      conflictingData: [],
      formData: {
        no: 0,
        afdeling: '',
        namaVendor: '',
        luas: 0,
        pembuatanParit: { rencana: 0, hariIni: 0, sdHariIni: 0 },
        pembuatanJalan: { rencana: 0, hariIni: 0, sdHariIni: 0 },
        pembuatanTeras: { rencana: 0, hariIni: 0, sdHariIni: 0 },
        ripping: { rencana: 0, hariIni: 0, sdHariIni: 0 },
        luku: { rencana: 0, hariIni: 0, sdHariIni: 0 },
        tumbangChipping: { rencana: 0, hariIni: 0, sdHariIni: 0 },
        menanamMucuna: { rencana: 0, hariIni: 0, sdHariIni: 0 },
        lubangTanamKS: { rencana: 0, hariIni: 0, sdHariIni: 0 },
        memupukLubangKS: { rencana: 0, hariIni: 0, sdHariIni: 0 },
        menanamKS: { rencana: 0, hariIni: 0, sdHariIni: 0 },
        progressOverall: 0,
        tanggalSPPBJ: '',
        durasiKerja: 0,
      },
      editFormData: {
        no: 0,
        afdeling: '',
        namaVendor: '',
        luas: 0,
        pembuatanParit: { rencana: 0, hariIni: 0, sdHariIni: 0 },
        pembuatanJalan: { rencana: 0, hariIni: 0, sdHariIni: 0 },
        pembuatanTeras: { rencana: 0, hariIni: 0, sdHariIni: 0 },
        ripping: { rencana: 0, hariIni: 0, sdHariIni: 0 },
        luku: { rencana: 0, hariIni: 0, sdHariIni: 0 },
        tumbangChipping: { rencana: 0, hariIni: 0, sdHariIni: 0 },
        menanamMucuna: { rencana: 0, hariIni: 0, sdHariIni: 0 },
        lubangTanamKS: { rencana: 0, hariIni: 0, sdHariIni: 0 },
        memupukLubangKS: { rencana: 0, hariIni: 0, sdHariIni: 0 },
        menanamKS: { rencana: 0, hariIni: 0, sdHariIni: 0 },
        progressOverall: 0,
        tanggalSPPBJ: '',
        durasiKerja: 0,
      },
      previousDateData: {
        no: 0,
        afdeling: '',
        namaVendor: '',
        luas: 0,
        pembuatanParit: { rencana: 0, hariIni: 0, sdHariIni: 0 },
        pembuatanJalan: { rencana: 0, hariIni: 0, sdHariIni: 0 },
        pembuatanTeras: { rencana: 0, hariIni: 0, sdHariIni: 0 },
        ripping: { rencana: 0, hariIni: 0, sdHariIni: 0 },
        luku: { rencana: 0, hariIni: 0, sdHariIni: 0 },
        tumbangChipping: { rencana: 0, hariIni: 0, sdHariIni: 0 },
        menanamMucuna: { rencana: 0, hariIni: 0, sdHariIni: 0 },
        lubangTanamKS: { rencana: 0, hariIni: 0, sdHariIni: 0 },
        memupukLubangKS: { rencana: 0, hariIni: 0, sdHariIni: 0 },
        menanamKS: { rencana: 0, hariIni: 0, sdHariIni: 0 },
        progressOverall: 0,
        tanggal: '', // Tanggal kustom untuk data ini
        tanggalSPPBJ: '',
        durasiKerja: 0,
      },
      isUpdating: false,
      dataList: [] // Untuk menyimpan data yang diambil
    };
  },
  computed: {
    currentUser() {
      try {
        const userStr = localStorage.getItem('user');
        // // console.log('=== DEBUG: Raw user string from localStorage ===', userStr);
        
        if (!userStr) {
          // // console.log('=== DEBUG: Tidak ada string user di localStorage ===');
          return {};
        }

        const user = JSON.parse(userStr);
        // // console.log('=== DEBUG: Parsed user object ===', user);
        // // console.log('=== DEBUG: User token exists? ===', !!user.token);
        return user;
      } catch (error) {
        console.error('=== ERROR: Gagal parsing user dari localStorage ===', error);
        return {};
      }
    },
    isLoggedIn() {
      const loggedIn = this.currentUser && this.currentUser.token;
      // // console.log('=== DEBUG: isLoggedIn computed result ===', loggedIn);
      return loggedIn;
    },
    maxPreviousDate() {
      // Maksimal tanggal adalah hari kemarin
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      return yesterday.toISOString().split('T')[0];
    },
    // Computed property untuk mengurutkan dataList untuk dropdown
    sortedDataList() {
      if (!this.dataList || this.dataList.length === 0) return [];
      // Buat salinan untuk menghindari mutasi array asli
      return [...this.dataList].sort((a, b) => b.no - a.no);
    },
       
    // Computed property untuk opsi kebun unik
    uniqueKebunOptions() {
      const kebuns = this.dataList.map(item => item.kebun).filter(Boolean);
      return [...new Set(kebuns)].sort();
    },
        
    // Computed property untuk memfilter data berdasarkan kebun yang dipilih
    filteredDataList() {
      if (!this.dataList || this.dataList.length === 0) return [];
      
      let filtered = [...this.dataList];
      
      // Filter berdasarkan kebun
      if (this.filters.kebun) {
        filtered = filtered.filter(item => item.kebun === this.filters.kebun);
      }
      
      // Filter berdasarkan tanggal
      if (this.filters.dateType === 'today') {
        const today = new Date().toISOString().split('T')[0];
        filtered = filtered.filter(item => {
          const itemDate = this.formatDateForFilter(item.tanggal);
          return itemDate === today;
        });
      } else if (this.filters.dateType === 'range' && this.filters.startDate && this.filters.endDate) {
        filtered = filtered.filter(item => {
          const itemDate = this.formatDateForFilter(item.tanggal);
          return itemDate >= this.filters.startDate && itemDate <= this.filters.endDate;
        });
      } else if (this.filters.dateType === 'custom' && this.filters.customDate) {
        filtered = filtered.filter(item => {
          const itemDate = this.formatDateForFilter(item.tanggal);
          return itemDate === this.filters.customDate;
        });
      }
      
      // Filter berdasarkan no urut
      if (this.filters.noUrut) {
        filtered = filtered.filter(item => item.no === this.filters.noUrut);
      }
      
      // Filter berdasarkan vendor
      if (this.filters.vendor) {
        filtered = filtered.filter(item => item.namaVendor === this.filters.vendor);
      }
      
      // Filter berdasarkan afdeling
      if (this.filters.afdeling) {
        filtered = filtered.filter(item => item.afdeling === this.filters.afdeling);
      }
      
      return filtered.sort((a, b) => {
        // Urutkan berdasarkan tanggal descending
        const dateA = this.formatDateForFilter(a.tanggal);
        const dateB = this.formatDateForFilter(b.tanggal);
        return dateB.localeCompare(dateA);
      });
    },
    // TAMBAHKAN COMPUTED PROPERTIES UNTUK OPSI FILTER
    uniqueNoUrutOptions() {
      const nos = this.dataList.map(item => item.no).filter(Boolean);
      return [...new Set(nos)].sort((a, b) => a - b);
    },
    uniqueAfdelingOptions() {
      const afdelings = this.dataList.map(item => item.afdeling).filter(Boolean);
      return [...new Set(afdelings)].sort();
    },
    uniqueVendorOptions() {
      const vendors = this.dataList.map(item => item.namaVendor).filter(Boolean);
      return [...new Set(vendors)].sort();
    },
    // TAMBAHKAN COMPUTED PROPERTY UNTUK VALIDASI DATA EXCEL
    hasInvalidData() {
      return this.excelData.some(item => item.error);
    }
  },
  methods: {
    // Tambahkan metode ini di dalam methods
    resetNoUrutSelection() {
      this.selectedPreviousDataId = '';
      this.resetPreviousDateForm();
    },
    
    // Metode untuk memformat tanggal untuk filter
    formatDateForFilter(dateValue) {
      if (!dateValue) return '';
      
      let date;
      if (dateValue && typeof dateValue === 'object' && dateValue._seconds !== undefined) {
        date = new Date(dateValue._seconds * 1000 + dateValue._nanoseconds / 1000000);
      } else if (dateValue instanceof Date) {
        date = dateValue;
      } else {
        date = new Date(dateValue);
      }
      
      return date.toISOString().split('T')[0];
    },
    
    // TAMBAHKAN METHODS UNTUK FILTER
    toggleFilter() {
      this.showFilter = !this.showFilter;
    },
    
    applyFilters() {
      // Filter sudah diterapkan melalui computed property filteredDataList
      // Tidak perlu memanggil fetchData() lagi
      Toastify({
        text: "Filter berhasil diterapkan",
        duration: 3000,
        gravity: "top",
        position: "right",
        style: { background: "linear-gradient(to right, #00b09b, #96c93d)" }
      }).showToast();
    },

// ... (lanjutan dari bagian sebelumnya)

    resetFilters() {
      // Kembalikan filter ke nilai awal
      this.filters = {
        dateType: 'all',
        startDate: '',
        endDate: '',
        customDate: '',
        kebun: '',
        noUrut: '',
        vendor: '',
        afdeling: ''
      };
      
      Toastify({
        text: "Filter berhasil direset",
        duration: 3000,
        gravity: "top",
        position: "right",
        style: { background: "linear-gradient(to right, #00b09b, #96c93d)" }
      }).showToast();
    },
    
    logout() {
      localStorage.removeItem('user');
      this.$router.push('/login');
      Toastify({
        text: "Anda telah logout",
        duration: 3000,
        gravity: "top",
        position: "right",
        style: { background: "linear-gradient(to right, #ff5f6d, #ffc371)" }
      }).showToast();
    },
    
    async fetchData() {
      // // console.log('=== DEBUG: Metode fetchData dipanggil ===');
      // // console.log('=== DEBUG: Nilai isLoggedIn saat ini ===', this.isLoggedIn);
      
      if (!this.isLoggedIn) {
        this.errorData = 'Anda belum login. Silakan login terlebih dahulu.';
        // // console.log('=== DEBUG: Pengguna tidak login, proses fetchData dibatalkan ===');
        return;
      }
      
      this.isLoadingData = true;
      this.errorData = '';
      try {
        // // console.log('=== DEBUG: Memanggil getDataTU dari service ===');
        
        // Karena filtering sekarang dilakukan di client-side, kita ambil semua data
        const response = await getDataTU();
        this.dataList = response.data || response;
      } catch (err) {
        this.errorData = 'Gagal mengambil data. ' + (err.response?.data?.message || err.message);
        console.error(err);
      } finally {
        this.isLoadingData = false;
      }
    },
    
    async getNextSequenceNumber() {
      // // console.log('=== DEBUG: Metode getNextSequenceNumber dipanggil ===');
      // // console.log('=== DEBUG: Nilai isLoggedIn saat ini ===', this.isLoggedIn);

      if (!this.isLoggedIn) {
        console.error('=== ERROR: Pengguna tidak login, tidak bisa mendapatkan nomor urut ===');
        this.formData.no = 1;
        return;
      }
      
      try {
        // // console.log('=== DEBUG: Memanggil getNextSequence dari service ===');
        const response = await getNextSequence();
        this.formData.no = response.nextSequence;
      } catch (err) {
        console.error('Error getting next sequence:', err);
        this.formData.no = 1;
      }
    },
    
    calculateProgress() {
      const haFields = ['ripping', 'luku', 'tumbangChipping', 'menanamMucuna', 'lubangTanamKS', 'memupukLubangKS', 'menanamKS'];
      let totalRencana = 0;
      let totalSdHariIni = 0;
      
      haFields.forEach(field => {
        if (this.formData[field] && typeof this.formData[field] === 'object') {
          totalRencana += parseFloat(this.formData[field].rencana) || 0;
          totalSdHariIni += parseFloat(this.formData[field].sdHariIni) || 0;
        }
      });
      
      this.formData.progressOverall = totalRencana > 0 ? (totalSdHariIni / totalRencana) * 100 : 0;
    },
    
    calculateEditProgress() {
      const haFields = ['ripping', 'luku', 'tumbangChipping', 'menanamMucuna', 'lubangTanamKS', 'memupukLubangKS', 'menanamKS'];
      let totalRencana = 0;
      let totalSdHariIni = 0;
      
      haFields.forEach(field => {
        if (this.editFormData[field] && typeof this.editFormData[field] === 'object') {
          totalRencana += parseFloat(this.editFormData[field].rencana) || 0;
          totalSdHariIni += parseFloat(this.editFormData[field].sdHariIni) || 0;
        }
      });
      
      this.editFormData.progressOverall = totalRencana > 0 ? (totalSdHariIni / totalRencana) * 100 : 0;
    },
    
    calculatePreviousDateProgress() {
      const haFields = ['ripping', 'luku', 'tumbangChipping', 'menanamMucuna', 'lubangTanamKS', 'memupukLubangKS', 'menanamKS'];
      let totalRencana = 0;
      let totalSdHariIni = 0;
      
      haFields.forEach(field => {
        if (this.previousDateData[field] && typeof this.previousDateData[field] === 'object') {
          totalRencana += parseFloat(this.previousDateData[field].rencana) || 0;
          totalSdHariIni += parseFloat(this.previousDateData[field].sdHariIni) || 0;
        }
      });
      
      this.previousDateData.progressOverall = totalRencana > 0 ? (totalSdHariIni / totalRencana) * 100 : 0;
    },
    
    calculateDurasiKerja() {
      if (this.formData.tanggalSPPBJ) {
        const sppbjDate = new Date(this.formData.tanggalSPPBJ);
        const today = new Date();
        const diffTime = Math.abs(today - sppbjDate);
        this.formData.durasiKerja = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      } else {
        this.formData.durasiKerja = 0;
      }
    },
    
    calculateEditDurasiKerja() {
      if (this.editFormData.tanggalSPPBJ) {
        const sppbjDate = new Date(this.editFormData.tanggalSPPBJ);
        const today = new Date();
        const diffTime = Math.abs(today - sppbjDate);
        this.editFormData.durasiKerja = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      } else {
        this.editFormData.durasiKerja = 0;
      }
    },
    
    calculatePreviousDateDurasiKerja() {
      // Gunakan tanggal yang dipilih di form, bukan hari ini
      if (this.previousDateData.tanggalSPPBJ && this.previousDateData.tanggal) {
        const sppbjDate = new Date(this.previousDateData.tanggalSPPBJ);
        const selectedDate = new Date(this.previousDateData.tanggal);
        const diffTime = Math.abs(selectedDate - sppbjDate);
        this.previousDateData.durasiKerja = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      } else {
        this.previousDateData.durasiKerja = 0;
      }
    },
    
    isToday(dateValue) {
      if (!dateValue) return false;
      
      let date;
      if (dateValue && typeof dateValue === 'object' && dateValue._seconds !== undefined) {
        date = new Date(dateValue._seconds * 1000 + dateValue._nanoseconds / 1000000);
      } else if (dateValue instanceof Date) {
        date = dateValue;
      } else {
        date = new Date(dateValue);
      }
      
      const today = new Date();
      return date.getDate() === today.getDate() &&
             date.getMonth() === today.getMonth() &&
             date.getFullYear() === today.getFullYear();
    },
    
    updateForToday(item) {
      this.formData = {
        no: item.no,
        afdeling: item.afdeling,
        namaVendor: item.namaVendor,
        luas: item.luas,
        pembuatanParit: { rencana: item.pembuatanParit?.rencana || 0, hariIni: 0, sdHariIni: item.pembuatanParit?.sdHariIni || 0 },
        pembuatanJalan: { rencana: item.pembuatanJalan?.rencana || 0, hariIni: 0, sdHariIni: item.pembuatanJalan?.sdHariIni || 0 },
        pembuatanTeras: { rencana: item.pembuatanTeras?.rencana || 0, hariIni: 0, sdHariIni: item.pembuatanTeras?.sdHariIni || 0 },
        ripping: { rencana: item.ripping?.rencana || 0, hariIni: 0, sdHariIni: item.ripping?.sdHariIni || 0 },
        luku: { rencana: item.luku?.rencana || 0, hariIni: 0, sdHariIni: item.luku?.sdHariIni || 0 },
        tumbangChipping: { rencana: item.tumbangChipping?.rencana || 0, hariIni: 0, sdHariIni: item.tumbangChipping?.sdHariIni || 0 },
        menanamMucuna: { rencana: item.menanamMucuna?.rencana || 0, hariIni: 0, sdHariIni: item.menanamMucuna?.sdHariIni || 0 },
        lubangTanamKS: { rencana: item.lubangTanamKS?.rencana || 0, hariIni: 0, sdHariIni: item.lubangTanamKS?.sdHariIni || 0 },
        memupukLubangKS: { rencana: item.memupukLubangKS?.rencana || 0, hariIni: 0, sdHariIni: item.memupukLubangKS?.sdHariIni || 0 },
        menanamKS: { rencana: item.menanamKS?.rencana || 0, hariIni: 0, sdHariIni: item.menanamKS?.sdHariIni || 0 },
        progressOverall: item.progressOverall || 0,
        tanggalSPPBJ: item.tanggalSPPBJ || '',
        durasiKerja: item.durasiKerja || 0,
      };
      
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      Toastify({
        text: "Data telah dimuat ke form. Silakan edit nilai 'Hari Ini' untuk update data hari ini.",
        duration: 5000,
        gravity: "top",
        position: "right",
        style: { background: "linear-gradient(to right, #00b09b, #96c93d)" }
      }).showToast();
    },
    
    openEditModal(item) {
      this.editFormData = {
        no: item.no,
        afdeling: item.afdeling,
        namaVendor: item.namaVendor,
        luas: item.luas,
        pembuatanParit: { 
          rencana: item.pembuatanParit?.rencana || 0, 
          hariIni: item.pembuatanParit?.hariIni || 0, 
          sdHariIni: item.pembuatanParit?.sdHariIni || 0 
        },
        pembuatanJalan: { 
          rencana: item.pembuatanJalan?.rencana || 0, 
          hariIni: item.pembuatanJalan?.hariIni || 0, 
          sdHariIni: item.pembuatanJalan?.sdHariIni || 0 
        },
        pembuatanTeras: { 
          rencana: item.pembuatanTeras?.rencana || 0, 
          hariIni: item.pembuatanTeras?.hariIni || 0, 
          sdHariIni: item.pembuatanTeras?.sdHariIni || 0 
        },
        ripping: { 
          rencana: item.ripping?.rencana || 0, 
          hariIni: item.ripping?.hariIni || 0, 
          sdHariIni: item.ripping?.sdHariIni || 0 
        },
        luku: { 
          rencana: item.luku?.rencana || 0, 
          hariIni: item.luku?.hariIni || 0, 
          sdHariIni: item.luku?.sdHariIni || 0 
        },
        tumbangChipping: { 
          rencana: item.tumbangChipping?.rencana || 0, 
          hariIni: item.tumbangChipping?.hariIni || 0, 
          sdHariIni: item.tumbangChipping?.sdHariIni || 0 
        },
        menanamMucuna: { 
          rencana: item.menanamMucuna?.rencana || 0, 
          hariIni: item.menanamMucuna?.hariIni || 0, 
          sdHariIni: item.menanamMucuna?.sdHariIni || 0 
        },
        lubangTanamKS: { 
          rencana: item.lubangTanamKS?.rencana || 0, 
          hariIni: item.lubangTanamKS?.hariIni || 0, 
          sdHariIni: item.lubangTanamKS?.sdHariIni || 0 
        },
        memupukLubangKS: { 
          rencana: item.memupukLubangKS?.rencana || 0, 
          hariIni: item.memupukLubangKS?.hariIni || 0, 
          sdHariIni: item.memupukLubangKS?.sdHariIni || 0 
        },
        menanamKS: { 
          rencana: item.menanamKS?.rencana || 0, 
          hariIni: item.menanamKS?.hariIni || 0, 
          sdHariIni: item.menanamKS?.sdHariIni || 0 
        },
        progressOverall: item.progressOverall || 0,
        tanggalSPPBJ: item.tanggalSPPBJ || '',
        durasiKerja: item.durasiKerja || 0,
      };
      
      this.editDocId = item.docId;
      this.showEditModal = true;
    },
    
    closeEditModal() {
      this.showEditModal = false;
      this.editDocId = null;
    },
    
    confirmDelete(docId) {
      // // console.log('=== DEBUG: Konfirmasi hapus data dengan docId ===', docId);
      
      if (!docId || docId === 'null' || docId === 'undefined') {
        Toastify({
          text: "ID dokumen tidak valid. Tidak dapat menghapus data.",
          duration: 3000,
          gravity: "top",
          position: "right",
          style: {
            background: "linear-gradient(to right, #ff5f6d, #ffc371)",
          }
        }).showToast();
        return;
      }
      
      this.deleteDocId = docId;
      this.showDeleteModal = true;
    },
    
    closeDeleteModal() {
      this.showDeleteModal = false;
      this.deleteDocId = null;
    },
    
    async deleteDataConfirmed() {
      // // console.log('=== DEBUG: Menghapus data dengan docId ===', this.deleteDocId);
      
      if (!this.deleteDocId || this.deleteDocId === 'null' || this.deleteDocId === 'undefined') {
        Toastify({
          text: "ID dokumen tidak valid. Tidak dapat menghapus data.",
          duration: 3000,
          gravity: "top",
          position: "right",
          style: {
            background: "linear-gradient(to right, #ff5f6d, #ffc371)",
          }
        }).showToast();
        this.closeDeleteModal(); 
        return;
      }
      
      const docIdToDelete = this.deleteDocId;
      this.closeDeleteModal();
      
      try {
        await deleteDataTU(docIdToDelete);
        
        Toastify({
          text: "Data berhasil dihapus!",
          duration: 3000,
          gravity: "top",
          position: "right",
          style: {
            background: "linear-gradient(to right, #00b09b, #96c93d)",
          }
        }).showToast();
        
        this.fetchData();
      } catch (error) {
        Toastify({
          text: error.response?.data?.message || 'Gagal menghapus data.',
          duration: 3000,
          gravity: "top",
          position: "right",
          style: {
            background: "linear-gradient(to right, #ff5f6d, #ffc371)",
          }
        }).showToast();
      }
    },
    
    async updateData() {
      this.isUpdating = true;
      try {
        this.calculateEditProgress();
        this.calculateEditDurasiKerja();
        await updateDataTU(this.editDocId, this.editFormData);
        Toastify({ text: "Data berhasil diperbarui!", duration: 3000, gravity: "top", position: "right", style: { background: "linear-gradient(to right, #00b09b, #96c93d)" } }).showToast();
        this.closeEditModal();
        this.fetchData();
      } catch (error) {
        Toastify({ text: error.response?.data?.message || 'Gagal memperbarui data.', duration: 3000, gravity: "top", position: "right", style: { background: "linear-gradient(to right, #ff5f6d, #ffc371)" } }).showToast();
      } finally {
        this.isUpdating = false;
      }
    },
    
    async handleSubmit() {
      // // console.log('=== DEBUG: Metode handleSubmit dipanggil ===');
      // // console.log('=== DEBUG: Nilai isLoggedIn saat ini ===', this.isLoggedIn);
      
      if (!this.isLoggedIn) {
        this.errorData = 'Anda belum login. Silakan login terlebih dahulu.';
        // // console.log('=== DEBUG: Pengguna tidak login, proses handleSubmit dibatalkan ===');
        return;
      }
      
      this.isLoading = true;
      try {
        this.calculateProgress();
        this.calculateDurasiKerja();
        await saveDataTU(this.formData);
        Toastify({ text: "Data berhasil disimpan!", duration: 3000, gravity: "top", position: "right", style: { background: "linear-gradient(to right, #00b09b, #96c93d)" } }).showToast();
        this.fetchData();
        this.resetForm();
        this.getNextSequenceNumber();
      } catch (error) {
        Toastify({ text: error.response?.data?.message || 'Gagal menyimpan data.', duration: 3000, gravity: "top", position: "right", style: { background: "linear-gradient(to right, #ff5f6d, #ffc371)" } }).showToast();
      } finally {
        this.isLoading = false;
      }
    },
    
    resetForm() {
      this.formData = {
        no: this.formData.no, // Keep the same sequence number
        afdeling: '',
        namaVendor: '',
        luas: 0,
        pembuatanParit: { rencana: 0, hariIni: 0, sdHariIni: 0 },
        pembuatanJalan: { rencana: 0, hariIni: 0, sdHariIni: 0 },
        pembuatanTeras: { rencana: 0, hariIni: 0, sdHariIni: 0 },
        ripping: { rencana: 0, hariIni: 0, sdHariIni: 0 },
        luku: { rencana: 0, hariIni: 0, sdHariIni: 0 },
        tumbangChipping: { rencana: 0, hariIni: 0, sdHariIni: 0 },
        menanamMucuna: { rencana: 0, hariIni: 0, sdHariIni: 0 },
        lubangTanamKS: { rencana: 0, hariIni: 0, sdHariIni: 0 },
        memupukLubangKS: { rencana: 0, hariIni: 0, sdHariIni: 0 },
        menanamKS: { rencana: 0, hariIni: 0, sdHariIni: 0 },
        progressOverall: 0,
        tanggalSPPBJ: '',
        durasiKerja: 0,
      };
    },
    
    formatDate(dateString) {
      if (!dateString) return '';
      if (typeof dateString === 'object' && dateString._seconds) {
        return new Date(dateString._seconds * 1000).toLocaleDateString('id-ID');
      }
      return formatDate(dateString);
    },
    
    formatNumber(num) {
      if (num === null || num === undefined || isNaN(num)) return '0';
      return parseFloat(num).toLocaleString('id-ID');
    },
    
    openPreviousDateModal() {
      // Set kebun berdasarkan pengguna yang login
      this.selectedKebun = this.currentUser.kebun || '';
      this.selectedPreviousDataId = '';
      this.resetPreviousDateForm();
      this.activeTab = 'manual'; // Reset ke tab manual
      this.excelFile = null;
      this.excelData = [];
      this.excelImportDate = '';
      this.showPreviousDateModal = true;
    },
    
    closePreviousDateModal() {
      this.showPreviousDateModal = false;
    },
    
    populatePreviousDateForm() {
      if (!this.selectedPreviousDataId) {
        this.resetPreviousDateForm();
        return;
      }
      
      const selectedItem = this.dataList.find(item => item.docId === this.selectedPreviousDataId);
      if (!selectedItem) return;

      // Salin data dari item ke form
      this.previousDateData = {
        no: selectedItem.no,
        afdeling: selectedItem.afdeling,
        namaVendor: selectedItem.namaVendor,
        luas: selectedItem.luas,
        pembuatanParit: { rencana: selectedItem.pembuatanParit?.rencana || 0, hariIni: selectedItem.pembuatanParit?.hariIni || 0, sdHariIni: selectedItem.pembuatanParit?.sdHariIni || 0 },
        pembuatanJalan: { rencana: selectedItem.pembuatanJalan?.rencana || 0, hariIni: selectedItem.pembuatanJalan?.hariIni || 0, sdHariIni: selectedItem.pembuatanJalan?.sdHariIni || 0 },
        pembuatanTeras: { rencana: selectedItem.pembuatanTeras?.rencana || 0, hariIni: selectedItem.pembuatanTeras?.hariIni || 0, sdHariIni: selectedItem.pembuatanTeras?.sdHariIni || 0 },
        ripping: { rencana: selectedItem.ripping?.rencana || 0, hariIni: selectedItem.ripping?.hariIni || 0, sdHariIni: selectedItem.ripping?.sdHariIni || 0 },
        luku: { rencana: selectedItem.luku?.rencana || 0, hariIni: selectedItem.luku?.hariIni || 0, sdHariIni: selectedItem.luku?.sdHariIni || 0 },
        tumbangChipping: { rencana: selectedItem.tumbangChipping?.rencana || 0, hariIni: selectedItem.tumbangChipping?.hariIni || 0, sdHariIni: selectedItem.tumbangChipping?.sdHariIni || 0 },
        menanamMucuna: { rencana: selectedItem.menanamMucuna?.rencana || 0, hariIni: selectedItem.menanamMucuna?.hariIni || 0, sdHariIni: selectedItem.menanamMucuna?.sdHariIni || 0 },
        lubangTanamKS: { rencana: selectedItem.lubangTanamKS?.rencana || 0, hariIni: selectedItem.lubangTanamKS?.hariIni || 0, sdHariIni: selectedItem.lubangTanamKS?.sdHariIni || 0 },
        memupukLubangKS: { rencana: selectedItem.memupukLubangKS?.rencana || 0, hariIni: selectedItem.memupukLubangKS?.hariIni || 0, sdHariIni: selectedItem.memupukLubangKS?.sdHariIni || 0 },
        menanamKS: { rencana: selectedItem.menanamKS?.rencana || 0, hariIni: selectedItem.menanamKS?.hariIni || 0, sdHariIni: selectedItem.menanamKS?.sdHariIni || 0 },
        progressOverall: selectedItem.progressOverall || 0,
        tanggalSPPBJ: selectedItem.tanggalSPPBJ || '',
        tanggal: '', // Tanggal akan dipilih user
        durasiKerja: 0, // Akan dihitung ulang
      };
      
      // Hitung ulang durasi kerja (meskipun tanggal belum dipilih, ini tidak akan berpengaruh)
      this.calculatePreviousDateDurasiKerja();
    },
    
    resetPreviousDateForm() {
      this.previousDateData = {
        no: 0,
        afdeling: '',
        namaVendor: '',
        luas: 0,
        pembuatanParit: { rencana: 0, hariIni: 0, sdHariIni: 0 },
        pembuatanJalan: { rencana: 0, hariIni: 0, sdHariIni: 0 },
        pembuatanTeras: { rencana: 0, hariIni: 0, sdHariIni: 0 },
        ripping: { rencana: 0, hariIni: 0, sdHariIni: 0 },
        luku: { rencana: 0, hariIni: 0, sdHariIni: 0 },
        tumbangChipping: { rencana: 0, hariIni: 0, sdHariIni: 0 },
        menanamMucuna: { rencana: 0, hariIni: 0, sdHariIni: 0 },
        lubangTanamKS: { rencana: 0, hariIni: 0, sdHariIni: 0 },
        memupukLubangKS: { rencana: 0, hariIni: 0, sdHariIni: 0 },
        menanamKS: { rencana: 0, hariIni: 0, sdHariIni: 0 },
        progressOverall: 0,
        tanggal: '',
        tanggalSPPBJ: '',
        durasiKerja: 0,
      };
    },
    
    async savePreviousDateData() {
      this.isSavingPreviousDate = true;
      try {
        this.calculatePreviousDateProgress();
        this.calculatePreviousDateDurasiKerja();
        
        // Kirim field kustom ke backend
        const dataToSave = {
          ...this.previousDateData,
          customTanggal: this.previousDateData.tanggal // Beri tahu backend untuk menggunakan tanggal ini
        };
        
        await saveDataTU(dataToSave);
        
        Toastify({ 
          text: "Data untuk tanggal sebelumnya berhasil disimpan!", 
          duration: 3000, 
          gravity: "top", 
          position: "right", 
          style: { background: "linear-gradient(to right, #00b09b, #96c93d)" } 
        }).showToast();
        
        this.closePreviousDateModal();
        this.fetchData();
      } catch (error) {
        Toastify({ 
          text: error.response?.data?.message || 'Gagal menyimpan data.', 
          duration: 3000, 
          gravity: "top", 
          position: "right", 
          style: { background: "linear-gradient(to right, #ff5f6d, #ffc371)" } 
        }).showToast();
      } finally {
        this.isSavingPreviousDate = false;
      }
    },

    // METODE UNTUK IMPORT EXCEL
    triggerFileInput() {
      this.$refs.fileInput.click();
    },

    handleFileChange(event) {
      const file = event.target.files[0];
      if (file) {
        this.excelFile = file;
        this.processExcelFile();
      }
    },

    handleFileDrop(event) {
      const file = event.dataTransfer.files[0];
      if (file && (file.name.endsWith('.xlsx') || file.name.endsWith('.xls'))) {
        this.excelFile = file;
        this.processExcelFile();
      } else {
        Toastify({ 
          text: "Format file tidak didukung. Silakan upload file Excel (.xlsx atau .xls)", 
          duration: 3000, 
          gravity: "top", 
          position: "right", 
          style: { background: "linear-gradient(to right, #ff5f6d, #ffc371)" } 
        }).showToast();
      }
    },

    removeFile() {
      this.excelFile = null;
      this.excelData = [];
      this.$refs.fileInput.value = '';
    },

    async processExcelFile() {
      if (!this.excelFile) return;
      
      this.isProcessingExcel = true;
      this.excelData = [];
      
      try {
        const reader = new FileReader();
        
        reader.onload = (e) => {
          try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            
            // Ambil sheet pertama
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            
            // Konversi ke JSON
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            
            // Skip header row (baris pertama)
            const dataRows = jsonData.slice(1);
            
            // Proses setiap baris - tanpa batasan 5 data
            const processedData = dataRows.map((row, index) => {
              try {
                // Cek apakah kolom A (index 0) memiliki nilai
                if (!row[0] || row[0] === '' || row[0] === null || row[0] === undefined) {
                  return {
                    no: `Baris ${index + 2}`,
                    error: 'Kolom No kosong'
                  };
                }
                
                // Mapping kolom Excel ke field data sesuai urutan baru
                const rowData = {
                  no: parseInt(row[0]) || 0,
                  kebun: row[1] || this.currentUser.kebun,
                  afdeling: row[2] || '',
                  namaVendor: row[3] || '', // Kolom D untuk Nama Vendor
                  luas: parseFloat(row[4]) || 0, // Kolom E untuk Luas Paket
                  
                  // Urutan baru sesuai permintaan
                  ripping: {
                    rencana: parseFloat(row[5]) || 0, // Kolom F
                    sdHariIni: parseFloat(row[6]) || 0  // Kolom G
                  },
                  luku: {
                    rencana: parseFloat(row[7]) || 0,  // Kolom H
                    sdHariIni: parseFloat(row[8]) || 0  // Kolom I
                  },
                  tumbangChipping: {
                    rencana: parseFloat(row[9]) || 0,  // Kolom J
                    sdHariIni: parseFloat(row[10]) || 0 // Kolom K
                  },
                  pembuatanParit: {
                    rencana: parseFloat(row[11]) || 0, // Kolom L
                    sdHariIni: parseFloat(row[12]) || 0 // Kolom M
                  },
                  menanamMucuna: {
                    rencana: parseFloat(row[13]) || 0, // Kolom N
                    sdHariIni: parseFloat(row[14]) || 0 // Kolom O
                  },
                  lubangTanamKS: { // Melubang Tanam
                    rencana: parseFloat(row[15]) || 0, // Kolom P
                    sdHariIni: parseFloat(row[16]) || 0 // Kolom Q
                  },
                  memupukLubangKS: { // Memupuk Lubang Tanam
                    rencana: parseFloat(row[17]) || 0, // Kolom R
                    sdHariIni: parseFloat(row[18]) || 0 // Kolom S
                  },
                  menanamKS: {
                    rencana: parseFloat(row[19]) || 0, // Kolom T
                    sdHariIni: parseFloat(row[20]) || 0 // Kolom U
                  },
                  pembuatanTeras: {
                    rencana: parseFloat(row[21]) || 0, // Kolom V
                    sdHariIni: parseFloat(row[22]) || 0 // Kolom W
                  },
                  pembuatanJalan: {
                    rencana: parseFloat(row[23]) || 0, // Kolom X
                    sdHariIni: parseFloat(row[24]) || 0 // Kolom Y
                  },
                  tanggalSPPBJ: this.parseDate(row[25]) || '', // Kolom Z
                  error: null
                };
                
                // Validasi data
                if (!rowData.no || !rowData.afdeling || rowData.luas <= 0) {
                  rowData.error = 'Data tidak lengkap';
                }
                
                // Hitung progress overall
                this.calculateProgressForExcelData(rowData);
                
                return rowData;
              } catch (error) {
                return {
                  no: row[0] || `Baris ${index + 2}`,
                  error: 'Format data tidak valid'
                };
              }
            });
            
            // Filter hanya baris yang memiliki data (tidak error)
            this.excelData = processedData.filter(item => !item.error || item.error !== 'Kolom No kosong');
            
            if (this.excelData.length === 0) {
              Toastify({ 
                text: "Tidak ada data yang dapat diproses dari file Excel", 
                duration: 3000, 
                gravity: "top", 
                position: "right", 
                style: { background: "linear-gradient(to right, #ff5f6d, #ffc371)" } 
              }).showToast();
            } else {
              const validCount = this.excelData.filter(item => !item.error).length;
              const invalidCount = this.excelData.filter(item => item.error).length;
              
              Toastify({ 
                text: `Berhasil memproses ${validCount} data valid${invalidCount > 0 ? ` dan ${invalidCount} data tidak valid` : ''}`, 
                duration: 3000, 
                gravity: "top", 
                position: "right", 
                style: { background: "linear-gradient(to right, #00b09b, #96c93d)" } 
              }).showToast();
            }
          } catch (error) {
            console.error('Error parsing Excel:', error);
            Toastify({ 
              text: "Gagal memproses file Excel. Pastikan format file benar", 
              duration: 3000, 
              gravity: "top", 
              position: "right", 
              style: { background: "linear-gradient(to right, #ff5f6d, #ffc371)" } 
            }).showToast();
          } finally {
            this.isProcessingExcel = false;
          }
        };
        
        reader.readAsArrayBuffer(this.excelFile);
      } catch (error) {
        console.error('Error reading file:', error);
        this.isProcessingExcel = false;
        Toastify({ 
          text: "Gagal membaca file", 
          duration: 3000, 
          gravity: "top", 
          position: "right", 
          style: { background: "linear-gradient(to right, #ff5f6d, #ffc371)" } 
        }).showToast();
      }
    },
    parseNumber(value) {
      if (!value) return 0;
      
      // Konversi string dengan koma ke number
      if (typeof value === 'string') {
        // Ganti koma dengan titik untuk desimal
        const cleanedValue = value.replace(/[^\d.,-]/g, '').replace(',', '.');
        return parseFloat(cleanedValue) || 0;
      }
      
      return parseFloat(value) || 0;
    },

    parseDate(value) {
      if (!value) return '';
      
      // Jika sudah dalam format YYYY-MM-DD
      if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
        // Konversi ke format DD-MM-YY untuk tampilan
        const parts = value.split('-');
        if (parts.length === 3) {
          const year = parts[0].substring(2); // Ambil 2 digit terakhir tahun
          const month = parts[1];
          const day = parts[2];
          return `${day}-${month}-${year}`;
        }
        return value;
      }
      
      // Konversi dari format DD/MM/YYYY atau DD-MM-YYYY
      if (typeof value === 'string') {
        const parts = value.split(/[\/-]/);
        if (parts.length === 3) {
          const day = parts[0].padStart(2, '0');
          const month = parts[1].padStart(2, '0');
          const year = parts[2].substring(2); // Ambil 2 digit terakhir tahun
          return `${day}-${month}-${year}`;
        }
      }
      
      // Jika adalah objek Date
      if (value instanceof Date) {
        const day = value.getDate().toString().padStart(2, '0');
        const month = (value.getMonth() + 1).toString().padStart(2, '0');
        const year = value.getFullYear().toString().substring(2);
        return `${day}-${month}-${year}`;
      }
      
      return '';
    },

    calculateProgressForExcelData(data) {
      const haFields = ['ripping', 'luku', 'tumbangChipping', 'menanamMucuna', 'lubangTanamKS', 'memupukLubangKS', 'menanamKS'];
      let totalRencana = 0;
      let totalSdHariIni = 0;
      
      haFields.forEach(field => {
        if (data[field] && typeof data[field] === 'object') {
          totalRencana += parseFloat(data[field].rencana) || 0;
          totalSdHariIni += parseFloat(data[field].sdHariIni) || 0;
        }
      });
      
      data.progressOverall = totalRencana > 0 ? (totalSdHariIni / totalRencana) * 100 : 0;
    },

 // Metode baru untuk menangani save Excel dengan pengecekan duplikat
  async handleSaveExcel() {
    if (!this.excelImportDate || this.excelData.length === 0) return;
    
    // Cek data yang valid
    const validData = this.excelData.filter(item => !item.error);
    
    if (validData.length === 0) {
      Toastify({ 
        text: "Tidak ada data valid untuk disimpan", 
        duration: 3000, 
        gravity: "top", 
        position: "right", 
        style: { background: "linear-gradient(to right, #ff5f6d, #ffc371)" } 
      }).showToast();
      return;
    }
    
    // Cek apakah ada data yang sudah ada
    this.checkForExistingData(validData);
  },
  
  // Metode untuk mengecek data yang sudah ada
  checkForExistingData(validData) {
    this.conflictingData = [];
    
    // Format tanggal yang dipilih untuk perbandingan
    const selectedDate = this.formatDateForFilter(this.excelImportDate);
    
    // Cek setiap data dari Excel
    validData.forEach(excelItem => {
      // Cari data yang sudah ada dengan kriteria yang sama
      const existingItem = this.dataList.find(dbItem => {
        const itemDate = this.formatDateForFilter(dbItem.tanggal);
        return itemDate === selectedDate && 
               dbItem.kebun === (excelItem.kebun || this.currentUser.kebun) &&
               dbItem.afdeling === excelItem.afdeling &&
               dbItem.no === excelItem.no;
      });
      
      // Jika data sudah ada, tambahkan ke daftar konflik
      if (existingItem) {
        this.conflictingData.push({
          docId: existingItem.docId,
          no: existingItem.no,
          afdeling: existingItem.afdeling,
          kebun: existingItem.kebun
        });
      }
    });
    
    // Jika ada konflik, tampilkan modal konfirmasi
    if (this.conflictingData.length > 0) {
      this.showReplaceConfirmModal = true;
    } else {
      // Jika tidak ada konflik, langsung simpan
      this.saveExcelData();
    }
  },
  
  // Metode untuk menutup modal konfirmasi
  closeReplaceConfirmModal() {
    this.showReplaceConfirmModal = false;
    this.conflictingData = [];
  },
  
  // Metode untuk mengganti dan menyimpan data Excel
  async replaceAndSaveExcelData() {
    this.closeReplaceConfirmModal();
    this.saveExcelData(true); // Kirim flag replace=true
  },
  
  // Modifikasi metode saveExcelData
  async saveExcelData(isReplace = false) {
    if (!this.excelImportDate || this.excelData.length === 0) return;
    
    this.isSavingExcel = true;
    
    try {
      // Filter hanya data yang valid
      const validData = this.excelData.filter(item => !item.error);
      
      if (validData.length === 0) {
        Toastify({ 
          text: "Tidak ada data valid untuk disimpan", 
          duration: 3000, 
          gravity: "top", 
          position: "right", 
          style: { background: "linear-gradient(to right, #ff5f6d, #ffc371)" } 
        }).showToast();
        return;
      }
      
      // Jika ini adalah operasi replace, hapus data yang sudah ada
      if (isReplace && this.conflictingData.length > 0) {
        const deletePromises = this.conflictingData.map(item => 
          deleteDataTU(item.docId)
        );
        
        await Promise.all(deletePromises);
        
        Toastify({ 
          text: `Menghapus ${this.conflictingData.length} data lama...`, 
          duration: 2000, 
          gravity: "top", 
          position: "right", 
          style: { background: "linear-gradient(to right, #f59e0b, #f97316)" } 
        }).showToast();
      }
      
      // Siapkan data untuk disimpan
      const savePromises = validData.map(item => {
        const dataToSave = {
          ...item,
          tanggal: this.excelImportDate,
          customTanggal: this.excelImportDate,
          kebun: item.kebun || this.currentUser.kebun,
          // Hitung durasi kerja
          durasiKerja: this.calculateDurasiForDate(item.tanggalSPPBJ, this.excelImportDate)
        };
        
        // Hapus field error
        delete dataToSave.error;
        
        return saveDataTU(dataToSave);
      });
      
      // Simpan semua data secara paralel
      await Promise.all(savePromises);
      
      Toastify({ 
        text: `Berhasil ${isReplace ? 'mengganti dan ' : ''}menyimpan ${validData.length} data untuk tanggal ${this.formatDate(this.excelImportDate)}`, 
        duration: 5000, 
        gravity: "top", 
        position: "right", 
        style: { background: "linear-gradient(to right, #00b09b, #96c93d)" } 
      }).showToast();
      
      this.closePreviousDateModal();
      this.fetchData();
    } catch (error) {
      console.error('Error saving Excel data:', error);
      Toastify({ 
        text: error.response?.data?.message || 'Gagal menyimpan data dari Excel', 
        duration: 3000, 
        gravity: "top", 
        position: "right", 
        style: { background: "linear-gradient(to right, #ff5f6d, #ffc371)" } 
      }).showToast();
    } finally {
      this.isSavingExcel = false;
      this.conflictingData = [];
    }
  },

    calculateDurasiForDate(tanggalSPPBJ, targetDate) {
      if (!tanggalSPPBJ || !targetDate) return 0;
      
      // Konversi dari format DD-MM-YY ke Date object
      let sppbjDate;
      if (typeof tanggalSPPBJ === 'string' && /^\d{2}-\d{2}-\d{2}$/.test(tanggalSPPBJ)) {
        const parts = tanggalSPPBJ.split('-');
        const day = parseInt(parts[0]);
        const month = parseInt(parts[1]) - 1; // Bulan dimulai dari 0
        let year = parseInt(parts[2]);
        
        // Jika tahun kurang dari 100, tambahkan 2000
        if (year < 100) {
          year += 2000;
        }
        
        sppbjDate = new Date(year, month, day);
      } else {
        sppbjDate = new Date(tanggalSPPBJ);
      }
      
      const target = new Date(targetDate);
      const diffTime = Math.abs(target - sppbjDate);
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    },
    downloadTemplate() {
      // Buat data template dengan format baru
      const templateData = [
        // Header
        [
          'No', 'Kebun', 'AFD', 'Nama Vendor', 'Luas Paket (ha)', 
          'Ripper (ha) Rencana', 'Ripper (ha) SdHi',
          'Luku (ha) Rencana', 'Luku (ha) SdHi',
          'Tumbang/Chipping (ha) Rencana', 'Tumbang/Chipping (ha) SdHi',
          'Pembuatan Parit (Mtr) Rencana', 'Pembuatan Parit (Mtr) SdHi',
          'Menanam Mucuna (ha) Rencana', 'Menanam Mucuna (ha) SdHi',
          'Melubang Tanam (ha) Rencana', 'Melubang Tanam (ha) SdHi',
          'Memupuk Lubang Tanam (ha) Rencana', 'Memupuk Lubang Tanam (ha) SdHi',
          'Menanam KS (ha) Rencana', 'Menanam KS (ha) SdHi',
          'Pembuatan Teras (Mtr) Rencana', 'Pembuatan Teras (Mtr) Sd Hari Ini',
          'Pembuatan Jalan (Mtr) Rencana', 'Pembuatan Jalan (Mtr) Sd Hari Ini',
          'Tanggal SPPBJ'
        ],
        // Contoh data 1
        [
          1, '1KLJ', 'I', 'PT. Maju Jaya', 56.73,
          36.44, 36.44, // Ripper
          36.44, 36.44, // Luku
          56.73, 56.73, // Tumbang/Chipping
          3318, 3275, // Pembuatan Parit
          56.73, 31.00, // Menanam Mucuna
          56.73, 26.86, // Melubang Tanam
          56.73, 14.00, // Memupuk Lubang Tanam
          56.73, 13.36, // Menanam KS
          800, 750, // Pembuatan Teras
          1200, 1150, // Pembuatan Jalan
          '01-11-24' // Tanggal SPPBJ (DD-MM-YY)
        ],
        // Contoh data 2
        [
          2, '1KLJ', 'II', 'CV. Sejahtera', 45.50,
          30.00, 28.50, // Ripper
          30.00, 28.50, // Luku
          45.50, 45.50, // Tumbang/Chipping
          2500, 2400, // Pembuatan Parit
          45.50, 25.00, // Menanam Mucuna
          45.50, 20.00, // Melubang Tanam
          45.50, 12.00, // Memupuk Lubang Tanam
          45.50, 10.00, // Menanam KS
          600, 580, // Pembuatan Teras
          1000, 950, // Pembuatan Jalan
          '05-11-24' // Tanggal SPPBJ (DD-MM-YY)
        ]
      ];
      
      // Buat worksheet dari data
      const ws = XLSX.utils.aoa_to_sheet(templateData);
      
      // Set lebar kolom agar lebih mudah dibaca
      const colWidths = [
        { wch: 8 }, // No
        { wch: 10 }, // Kebun
        { wch: 8 }, // AFD
        { wch: 15 }, // Nama Vendor
        { wch: 15 }, // Luas Paket (ha)
        { wch: 15 }, // Ripper (ha) Rencana
        { wch: 15 }, // Ripper (ha) SdHi
        { wch: 15 }, // Luku (ha) Rencana
        { wch: 15 }, // Luku (ha) SdHi
        { wch: 20 }, // Tumbang/Chipping (ha) Rencana
        { wch: 20 }, // Tumbang/Chipping (ha) SdHi
        { wch: 20 }, // Pembuatan Parit (Mtr) Rencana
        { wch: 20 }, // Pembuatan Parit (Mtr) SdHi
        { wch: 20 }, // Menanam Mucuna (ha) Rencana
        { wch: 20 }, // Menanam Mucuna (ha) SdHi
        { wch: 20 }, // Melubang Tanam (ha) Rencana
        { wch: 20 }, // Melubang Tanam (ha) SdHi
        { wch: 22 }, // Memupuk Lubang Tanam (ha) Rencana
        { wch: 22 }, // Memupuk Lubang Tanam (ha) SdHi
        { wch: 15 }, // Menanam KS (ha) Rencana
        { wch: 15 }, // Menanam KS (ha) SdHi
        { wch: 22 }, // Pembuatan Teras (Mtr) Rencana
        { wch: 22 }, // Pembuatan Teras (Mtr) Sd Hari Ini
        { wch: 22 }, // Pembuatan Jalan (Mtr) Rencana
        { wch: 22 }, // Pembuatan Jalan (Mtr) Sd Hari Ini
        { wch: 15 }  // Tanggal SPPBJ
      ];
      ws['!cols'] = colWidths;
      
      // Buat workbook dan tambahkan worksheet
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Template Data");
      
      // Generate file dan trigger download
      const fileName = `Template_Data_Tanaman_Ulang_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);
      
      Toastify({ 
        text: "Template Excel berhasil diunduh", 
        duration: 3000, 
        gravity: "top", 
        position: "right", 
        style: { background: "linear-gradient(to right, #00b09b, #96c93d)" } 
      }).showToast();
    },
    
  },
  
  async created() {
    // // console.log('=== DEBUG: Komponen TanamanUlangKrani dibuat ===');
    // // console.log('=== DEBUG: Memeriksa status login saat ini... ===');
    
    if (!this.isLoggedIn) {
      this.errorData = 'Anda belum login. Silakan login terlebih dahulu.';
      // // console.log('=== DEBUG: Tidak ada sesi login, redirect ke halaman login ===');
      this.$router.push('/login');
      return;
    }
    
    await this.getNextSequenceNumber();
    this.fetchData();
  }
}
</script>

<style scoped>
/* ... (semua style yang sudah ada) ... */
.data-entry-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #ddd;
  padding-bottom: 10px;
  margin-bottom: 20px;
  flex-wrap: wrap; /* Agar responsive */
}

header h1 {
  margin: 0;
  color: #333;
}

header p {
  margin: 0;
  color: #555;
}

.nav-links {
  display: flex;
  gap: 1rem;
}

.nav-link {
  color: #4f46e5;
  text-decoration: none;
  font-weight: 600;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  transition: background-color 0.2s;
}

.nav-link:hover {
  background-color: rgba(79, 70, 229, 0.1);
}

/* Style untuk Section dan Grid Baru */
.form-section {
  margin-bottom: 2rem;
  padding: 1.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background-color: #fdfdfd;
}

.form-section h2 {
  text-align: center;
  margin-top: 0;
  margin-bottom: 1.5rem;
  color: #1f2937;
  font-size: 1.25rem;
  font-weight: 600;
}

.form-grid-main, .form-grid-secondary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.progress-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #374151;
}

.form-help {
  display: block;
  margin-top: 0.25rem;
  font-size: 0.75rem;
  color: #6b7280;
}

input, select {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 1rem;
  box-sizing: border-box;
  transition: border-color 0.2s;
}

input:focus, select:focus {
  outline: none;
  border-color: #4f46e5;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

input[readonly] {
  background-color: #f3f4f6;
  color: #6b7280;
}

/* HILANGKAN TOMBOL INCREMENT/DECREMENT */
input[type="number"]::-webkit-outer-spin-button,
input[type="number"]::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type="number"] {
  -moz-appearance: textfield;
}

button {
  margin-top: 20px;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 500;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: background-color 0.2s;
  margin-right: 10px;
}

.btn {
  display: inline-block;
  font-weight: 400;
  text-align: center;
  white-space: nowrap;
  vertical-align: middle;
  user-select: none;
  border: 1px solid transparent;
  padding: 0.375rem 0.75rem;
  font-size: 1rem;
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

.btn-danger {
  color: #fff;
  background-color: #ef4444;
  border-color: #ef4444;
}

.btn-danger:hover {
  color: #fff;
  background-color: #dc2626;
  border-color: #dc2626;
}

.btn-sm {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
}

/* STYLE UNTUK BAGIAN DATA DISPLAY */
.data-display-section {
  margin-top: 40px;
  padding-top: 20px;
  border-top: 2px solid #e5e7eb;
}

.data-display-section h2 {
  text-align: center;
  color: #333;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  color: #6b7280;
}

.spinner {
  border: 4px solid rgba(0, 0, 0, 0.1);
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border-left-color: #4f46e5;
  animation: spin 1s ease infinite;
  margin-bottom: 10px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.no-data {
  text-align: center;
  padding: 40px;
  color: #6b7280;
  background-color: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}

.alert {
  position: relative;
  padding: 0.75rem 1.25rem;
  margin-bottom: 1rem;
  border: 1px solid transparent;
  border-radius: 0.25rem;
}

.alert-error {
  color: #721c24;
  background-color: #f8d7da;
  border-color: #f5c6cb;
}

/* GRID UNTUK KARTU DATA */
.data-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.data-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
  transition: transform 0.2s, box-shadow 0.2s;
}

.data-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 15px rgba(0,0,0,0.1);
}

.card-header {
  background-color: #4f46e5;
  color: white;
  padding: 10px 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h3 {
  margin: 0;
  font-size: 1rem;
}

.badge {
  background-color: rgba(255, 255, 255, 0.2);
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
}

.card-body {
  padding: 15px;
  background-color: #f9f9f9;
}

.card-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.card-item {
  display: flex;
  flex-direction: column;
  text-align: left;
}

.card-item strong {
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.card-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid #eee;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #eee;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
}

.modal-body {
  padding: 20px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.modal-form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 15px;
}

.modal-form-grid .form-group {
  margin-bottom: 15px;
}

.modal-form-grid .form-group label {
  margin-bottom: 5px;
}

/* Enhanced style for previous date modal */
.modal-body .form-group label {
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
  display: block;
}

.modal-body select, .modal-body input[readonly] {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 1rem;
  box-sizing: border-box;
  transition: border-color 0.2s;
  background-color: #fff;
}

.modal-body select:focus, .modal-body input:focus {
  outline: none;
  border-color: #4f46e5;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.modal-body select[readonly], .modal-body input[readonly] {
  background-color: #f3f4f6;
  color: #6b7280;
  cursor: not-allowed;
}

.template-form-container {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.template-form-container h4 {
  margin-top: 0;
  margin-bottom: 1rem;
  color: #1f2937;
  font-size: 1.1rem;
  font-weight: 600;
}

.floating-btn {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 999;
  border-radius: 50px;
  padding: 15px 25px;
  font-weight: 600;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
}

/* Style untuk bagian filter */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.filter-toggle-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background-color: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-toggle-btn:hover {
  background-color: #e5e7eb;
}

.filter-toggle-btn.active {
  background-color: #4f46e5;
  color: white;
  border-color: #4f46e5;
}

.filter-section {
  background-color: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  border: 1px solid #e9ecef;
}

.filter-controls {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.filter-group {
  display: flex;
  flex-direction: column;
}

.filter-group label {
  font-weight: 600;
  margin-bottom: 8px;
  color: #374151;
}

.filter-group select,
.filter-group input[type="date"] {
  width: 100%;
  padding: 10px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 14px;
}

.date-options {
  display: flex;
  gap: 15px;
  margin-bottom: 10px;
}

.date-options label {
  display: flex;
  align-items: center;
  gap: 5px;
  font-weight: normal;
}

.date-range-inputs {
  display: flex;
  align-items: center;
  gap: 10px;
}

.date-range-inputs span {
  color: #6b7280;
}

.filter-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

/* Style untuk tab dan Excel import */
.tab-container {
  width: 100%;
}

.tab-buttons {
  display: flex;
  margin-bottom: 20px;
  border-bottom: 1px solid #e5e7eb;
}

.tab-button {
  padding: 10px 20px;
  background: none;
  border: none;
  cursor: pointer;
  font-weight: 500;
  color: #6b7280;
  border-bottom: 2px solid transparent;
  transition: all 0.2s;
}

.tab-button.active {
  color: #4f46e5;
  border-bottom-color: #4f46e5;
}

.tab-content {
  padding: 20px 0;
}

.excel-import-container {
  width: 100%;
}

.file-upload-area {
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  padding: 40px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  background-color: #f9fafb;
}

.file-upload-area:hover {
  border-color: #4f46e5;
  background-color: #f3f4f6;
}

.file-upload-placeholder svg,
.file-selected svg {
  margin-bottom: 10px;
  color: #6b7280;
}

.file-upload-placeholder p,
.file-selected p {
  margin: 5px 0;
  color: #374151;
}

.file-format-info {
  font-size: 0.875rem;
  color: #6b7280;
}

.excel-preview-container {
  max-height: 400px;
  overflow-y: auto;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  margin-top: 10px;
}

.excel-preview-table {
  width: 100%;
  border-collapse: collapse;
}

.excel-preview-table th,
.excel-preview-table td {
  padding: 10px;
  text-align: left;
  border-bottom: 1px solid #e5e7eb;
}

.excel-preview-table th {
  background-color: #f9fafb;
  font-weight: 600;
  color: #374151;
}

.error-row {
  background-color: #fef2f2;
}

.error-badge {
  display: inline-block;
  padding: 2px 8px;
  background-color: #ef4444;
  color: white;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
}

.success-badge {
  display: inline-block;
  padding: 2px 8px;
  background-color: #10b981;
  color: white;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
}
</style>