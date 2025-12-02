<template>
  <div class="min-h-screen bg-gray-100 p-4 md:p-8">
    <header class="dashboard-header">
      <h1 class="text-2xl md:text-3xl font-bold">Dashboard PT Perkebunan Nusantara IV Regional 1</h1>
      <p class="mt-2">Monitoring Tanaman Ulang (TU) Kelapa Sawit Tahun 2025</p>
      <br>
      <p class="mt-4 text-lg font-medium">
      Tanggal: {{ currentDate }} | Waktu: {{ currentTime }} WIB
      </p>
    </header>

    <div v-if="isLoading" class="flex justify-center items-center h-64">
      <div class="loading-spinner"></div>
    </div>

    <div v-else-if="errorData" class="bg-red-50 p-4 rounded-lg">
      <p class="text-red-700">Error loading data: {{ errorData }}</p>
    </div>

    <div v-else>
      <!-- Statistik Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mb-8">
        <StatCard 
          :title="filterTitle"
          :value="filteredTotalLuasPaket + ' ha'"
          icon-color="bg-green-500"
          icon-path="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"
        />
        <StatCard 
          title="Progress Tanam Ulang"
          :value="formatPercentage(filteredAvgProgress)"
          :change="formattedProgressChange"
          :change-type="filteredProgressChangeType"
          icon-color="bg-yellow-500"
          icon-path="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
        />
      </div>

      <!-- FITUR RANKING BARU - Leaderboard UI -->
      <div>
        <!-- Toggle Button -->
        <button @click="toggleRanking" class="toggle-button">
          {{ rankingVisible ? 'Sembunyikan' : 'Tampilkan' }} Ranking Progress Harian
        </button>

        <div v-show="rankingVisible" class="mb-8">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-bold">Ranking Progress Harian - {{ selectedDate ? formatDate(selectedDate) : 'Hari Ini' }}</h2>
            <!-- Toggle Regression Analysis -->
            <button @click="toggleRegression" class="toggle-button">
              {{ regressionVisible ? 'Sembunyikan' : 'Tampilkan' }} Analisis Regresi
            </button>
          </div>
          
          <!-- PERUBAHAN: Podium Card untuk Top 3 -->
          <div class="podium-card mb-6">
            <div class="podium-header">
              <h3 class="podium-title">Top 3 Kebun</h3>
            </div>
            <div class="podium-content">
              <div class="podium-positions">
                <!-- Peringkat 2 (Kiri) -->
                <div v-if="topRankingData[1]" class="podium-position position-2">
                  <div class="medal-container medal-silver">
                    <img src="/medal (2).png" alt="Medal Rank 2" class="medal-image">
                  </div>
                  <div class="podium-info">
                    <div class="podium-name">{{ topRankingData[1].name }}</div>
                    <div class="podium-details">
                      <div class="podium-detail">
                        <span class="detail-label">Kebun:</span>
                        <span class="detail-value">{{ topRankingData[1].kebun }}</span>
                      </div>
                      <div class="podium-detail">
                        <span class="detail-label">Afd:</span>
                        <span class="detail-value">{{ topRankingData[1].afd }}</span>
                      </div>
                      <div class="podium-detail">
                        <span class="detail-label">Vendor:</span>
                        <span class="detail-value">{{ topRankingData[1].paket }}</span>
                      </div>
                      <div class="podium-detail">
                        <span class="detail-label">Luas:</span>
                        <span class="detail-value">{{ topRankingData[1].luasPaket.toFixed(2) }} ha</span>
                      </div>
                    </div>
                    <div class="podium-progress">
                      <div class="progress-value">{{ topRankingData[1].progress.toFixed(1) }}%</div>
                      <div class="progress-change" :class="getChangeClass(topRankingData[1].change)">
                        {{ formatProgressChange(topRankingData[1].change) }}
                      </div>
                    </div>
                  </div>
                </div>
                
                <!-- Peringkat 1 (Tengah) dengan gambar medal -->
                <div v-if="topRankingData[0]" class="podium-position position-1">
                  <div class="medal-container medal-gold">
                    <img src="/medal (1).png" alt="Medal Rank 1" class="medal-image">
                  </div>
                  <div class="podium-info">
                    <div class="podium-name">{{ topRankingData[0].name }}</div>
                    <div class="podium-details">
                      <div class="podium-detail">
                        <span class="detail-label">Kebun:</span>
                        <span class="detail-value">{{ topRankingData[0].kebun }}</span>
                      </div>
                      <div class="podium-detail">
                        <span class="detail-label">Afd:</span>
                        <span class="detail-value">{{ topRankingData[0].afd }}</span>
                      </div>
                      <div class="podium-detail">
                        <span class="detail-label">Vendor:</span>
                        <span class="detail-value">{{ topRankingData[0].paket }}</span>
                      </div>
                      <div class="podium-detail">
                        <span class="detail-label">Luas:</span>
                        <span class="detail-value">{{ topRankingData[0].luasPaket.toFixed(2) }} ha</span>
                      </div>
                    </div>
                    <div class="podium-progress">
                      <div class="progress-value">{{ topRankingData[0].progress.toFixed(1) }}%</div>
                      <div class="progress-change" :class="getChangeClass(topRankingData[0].change)">
                        {{ formatProgressChange(topRankingData[0].change) }}
                      </div>
                    </div>
                  </div>
                </div>
                
                <!-- Peringkat 3 (Kanan) -->
                <div v-if="topRankingData[2]" class="podium-position position-3">
                  <div class="medal-container medal-bronze">
                    <img src="/medal (3).png" alt="Medal Rank 3" class="medal-image">
                  </div>
                  <div class="podium-info">
                    <div class="podium-name">{{ topRankingData[2].name }}</div>
                    <div class="podium-details">
                      <div class="podium-detail">
                        <span class="detail-label">Kebun:</span>
                        <span class="detail-value">{{ topRankingData[2].kebun }}</span>
                      </div>
                      <div class="podium-detail">
                        <span class="detail-label">Afd:</span>
                        <span class="detail-value">{{ topRankingData[2].afd }}</span>
                      </div>
                      <div class="podium-detail">
                        <span class="detail-label">Vendor:</span>
                        <span class="detail-value">{{ topRankingData[2].paket }}</span>
                      </div>
                      <div class="podium-detail">
                        <span class="detail-label">Luas:</span>
                        <span class="detail-value">{{ topRankingData[2].luasPaket.toFixed(2) }} ha</span>
                      </div>
                    </div>
                    <div class="podium-progress">
                      <div class="progress-value">{{ topRankingData[2].progress.toFixed(1) }}%</div>
                      <div class="progress-change" :class="getChangeClass(topRankingData[2].change)">
                        {{ formatProgressChange(topRankingData[2].change) }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Regression Analysis Section -->
          <div v-show="regressionVisible && hasRegressionData" class="regression-card mb-6">
            <div class="regression-header">
              <h3 class="regression-title">Analisis Regresi Progress</h3>
              <p class="regression-subtitle">Perbandingan data antara {{ formatDate(selectedDate || currentDateISO) }} dengan {{ formatDate(comparisonDate) }}</p>
            </div>
            <div class="regression-content">
              <div class="regression-summary">
                <div class="summary-item">
                  <span class="summary-label">Perubahan Progress Overall:</span>
                  <span class="summary-value" :class="getChangeClass(regressionData.overallProgressChange)">
                    {{ formatProgressChange(regressionData.overallProgressChange) }}
                  </span>
                </div>
                <div class="summary-item">
                  <span class="summary-label">Perubahan Total Luas:</span>
                  <span class="summary-value" :class="getChangeClass(regressionData.totalLuasChange)">
                    {{ regressionData.totalLuasChange > 0 ? '+' : '' }}{{ regressionData.totalLuasChange.toFixed(2) }} ha
                  </span>
                </div>
              </div>
              
              <div class="regression-details">
                <h4 class="details-title">Detail Perubahan per Kegiatan</h4>
                <div class="activity-regression">
                  <div v-for="(activity, index) in regressionData.activities" :key="index" class="activity-item">
                    <div class="activity-name">{{ activity.name }}</div>
                    <div class="activity-progress">
                      <div class="progress-item">
                        <span class="progress-label">Rencana:</span>
                        <span class="progress-value">{{ activity.rencana }}</span>
                      </div>
                      <div class="progress-item">
                        <span class="progress-label">Hari Ini:</span>
                        <span class="progress-value">{{ activity.hariIni }}</span>
                      </div>
                      <div class="progress-item">
                        <span class="progress-label">S.D. Hari Ini:</span>
                        <span class="progress-value">{{ activity.sdHariIni }}</span>
                      </div>
                      <div class="progress-item">
                        <span class="progress-label">Perubahan:</span>
                        <span class="progress-value change" :class="getChangeClass(activity.change)">
                          {{ activity.change > 0 ? '+' : '' }}{{ activity.change }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <br></br>
          
          <!-- Rest of Ranking List -->
          <div class="ranking-list">
            <div v-for="(item, index) in restRankingData" :key="item.id" 
                 class="ranking-item">
              <div class="rank-position">{{ index + 4 }}</div>
              <div class="item-content">
                <div class="item-name">{{ item.name }}</div>
                <div class="item-details">
                  <span class="item-detail">{{ item.kebun }} - {{ item.afd }} - {{ item.paket }}</span>
                  <span class="item-detail">{{ item.luasPaket.toFixed(2) }} ha</span>
                </div>
              </div>
              <div class="item-progress">
                <div class="progress-value">{{ item.progress.toFixed(1) }}%</div>
                <div class="progress-change" :class="getChangeClass(item.change)">
                  {{ formatProgressChange(item.change) }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <!-- Toggle Button -->
        <button @click="toggleFilters" class="toggle-button">
          {{ filtersVisible ? 'Sembunyikan' : 'Tampilkan' }} Filter
        </button>

        <!-- Filter Container -->
        <div v-show="filtersVisible" class="filter-container">
          <div class="grid grid-cols-2 md:grid-cols-2 gap-4">
            <div>
              <label class="filter-label">Filter Kebun</label>
              <select v-model="filters.kebun" class="filter-input">
                <option value="">Semua Kebun</option>
                <option v-for="kebun in uniqueKebun" :key="kebun" :value="kebun">{{ kebun }}</option>
              </select>
            </div>
            <div>
              <label class="filter-label">Filter Vendor</label>
              <select v-model="filters.namaVendor" class="filter-input">
                <option value="">Semua Vendor</option>
                <option v-for="paket in uniqueVendors" :key="paket" :value="paket">{{ paket }}</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- Charts Section -->
      <!-- First Row: Two Full-Width Charts -->
      <div class="grid grid-cols-1 gap-6 mb-8">
        <div class="chart-container">
          <BarChart 
            :title="chartTitle" 
            :data="barChartData" 
          />
        </div>
        <div class="pie-chart-outer">
          <!-- Tambahkan legenda di atas grafik -->
          <PieChartWithNeedle 
            :title="needleChartTitle"
            :legend="needleChartLegend"
            :data="pieWithNeedleChartData"
            :average-progress="filteredAvgProgress"
          />
        </div>
      </div>
      <!-- Second Row: Multiple Radar Charts -->
      <div class="mb-8">
        <RadarChart 
          title="Progress TU Per Objek Kerja" 
          :charts="radarChartData" 
        />
      </div>

      <!-- Data Grid -->
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
        <div v-else class="px-6 py-2 bg-green-50 border-b border-green-200">
          <p class="text-sm text-green-800">
            Menampilkan data untuk hari ini: <span class="font-semibold">{{ formatDate(currentDateISO) }}</span>
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
              <template v-for="(group, groupName) in paginatedGroupedData" :key="groupName">
                <!-- Header Group Kebun -->
                <tr class="kebun-group">
                  <td colspan="18" class="kebun-header px-6 py-3 cursor-pointer" @click="toggleGroup(groupName)">
                    <div class="flex items-center">
                      <!-- Ikon untuk toggle minimize/maximize -->
                      <svg 
                        class="w-5 h-5 text-green-600 mr-2 transform transition-transform duration-200" 
                        :class="{ 'rotate-90': !minimizedGroups[groupName] }"
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24" 
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                      </svg>
                      <svg class="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                      </svg>
                      <span class="text-lg font-semibold">{{ groupName }}</span>
                      <span class="ml-2 text-sm text-gray-500">({{ group.length }} AFD)</span>
                      <!-- Status indikator -->
                      <span class="ml-2 text-xs px-2 py-1 rounded-full" 
                            :class="minimizedGroups[groupName] ? 'bg-gray-200 text-gray-700' : 'bg-green-100 text-green-800'">
                        {{ minimizedGroups[groupName] ? 'Minimized' : 'Expanded' }}
                      </span>
                    </div>
                  </td>
                </tr>
              
                <!-- Data per AFD dalam group - hanya ditampilkan jika grup tidak diminimalkan -->
                <template v-if="!minimizedGroups[groupName]">
                  <tr v-for="(row, index) in group" :key="row.docId || index" class="data-grid-row">
                    <td class="data-grid-cell font-medium">{{ row.no }}</td>
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
                </template>
              </template>
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
    </div>
    <!-- Floating Action Button for Scroll to Top -->
    <div v-show="showScrollTop" class="fab-container">
      <button @click="scrollToTop" class="fab" title="Scroll to Top">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script>
import { getDataTU } from '../services/dataService';
import { formatDate } from '../utils/dateUtils';
import { exportToExcel } from '../utils/exportUtils.js';
import ProgressItem from '../components/ProgressItem.vue';
import StatCard from '../components/StatCard.vue';
import BarChart from '../components/BarChart.vue';
import PieChartWithNeedle from '../components/PieChartWithNeedle.vue';
import RadarChart from '../components/RadarChart.vue';

export default {
  name: 'TanamanUlangView',
  components: {
    ProgressItem,
    StatCard,
    BarChart,
    PieChartWithNeedle,
    RadarChart
  },
  data() {
    return {
      isLoading: false,
      errorData: '',
      rawData: [],
      currentPage: 1,
      itemsPerPage: 10,
      customItemsPerPage: 10,
      // State untuk melacak grup yang diminimalkan
      minimizedGroups: {},
      // State untuk melihat apakah semua grup diminimalkan
      allGroupsMinimized: false,
      // State untuk filter tanggal - default hari ini
      selectedDate: null,
      currentDateISO: new Date().toISOString().split('T')[0],
      filters: {
        kebun: '',
        afdeling: '',
        namaVendor: '',
        search: ''
      },
      // State untuk UI
      currentTime: '',
      currentDate: '',
      filtersVisible: false,
      rankingVisible: false,
      regressionVisible: false,
      showScrollTop: false,
      // State untuk progress data
      progressDataToday: [],
      progressDataYesterday: [],
      comparisonData: [],
      // State untuk kodering
      koderingMap: {},
      // State untuk mencegah perhitungan berulang
      progressCalculated: false,
      lastCalculatedProgressChange: null,
      // State untuk menyimpan formatted progress change
      formattedProgressChange: null
    };
  },
  computed: {
    // Filter data berdasarkan filter yang dipilih
    filteredData() {
      console.log('🔍 [filteredData] Menghitung filtered data...');
      console.log('  - Total raw data:', this.rawData?.length || 0);
      console.log('  - Selected date:', this.selectedDate);
      console.log('  - Current date ISO:', this.currentDateISO);
      console.log('  - Filters:', this.filters);
      
      if (!this.rawData || !this.rawData.length) {
        console.log('⚠️ [filteredData] Tidak ada raw data');
        return [];
      }
      
      const filterDate = this.selectedDate || this.currentDateISO;
      console.log('  - Filter date yang digunakan:', filterDate);
      
      const result = this.rawData.filter(row => {
        // Filter tanggal - default hari ini
        const filterDateStr = filterDate;
        const rowDateStr = this.formatDateForComparison(row.tanggal);
        
        if (rowDateStr !== filterDateStr) {
          return false;
        }
        
        // Filter kebun
        if (this.filters.kebun && row.kebun !== this.filters.kebun) {
          return false;
        }
        
        // Filter AFD
        if (this.filters.afdeling && row.afdeling !== this.filters.afdeling) {
          return false;
        }
        
        // Filter vendor
        if (this.filters.namaVendor && row.namaVendor !== this.filters.namaVendor) {
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
            this.getProgressData(row.pembuatanJalan, 'rencana').toString(),
            this.getProgressData(row.pembuatanJalan, 'sdHariIni').toString(),
            this.getProgressData(row.pembuatanTeras, 'rencana').toString(),
            this.getProgressData(row.pembuatanTeras, 'sdHariIni').toString(),
            this.getProgressData(row.ripping, 'rencana').toString(),
            this.getProgressData(row.ripping, 'sdHariIni').toString(),
            this.getProgressData(row.luku, 'rencana').toString(),
            this.getProgressData(row.luku, 'sdHariIni').toString(),
            this.getProgressData(row.tumbangChipping, 'rencana').toString(),
            this.getProgressData(row.tumbangChipping, 'sdHariIni').toString(),
            this.getProgressData(row.menanamMucuna, 'rencana').toString(),
            this.getProgressData(row.menanamMucuna, 'sdHariIni').toString(),
            this.getProgressData(row.lubangTanamKS, 'rencana').toString(),
            this.getProgressData(row.lubangTanamKS, 'sdHariIni').toString(),
            this.getProgressData(row.mempupukLubangKS, 'rencana').toString(),
            this.getProgressData(row.mempupukLubangKS, 'sdHariIni').toString(),
            this.getProgressData(row.menanamKS, 'rencana').toString(),
            this.getProgressData(row.menanamKS, 'sdHariIni').toString(),
            row.progressOverall?.toString() || '0',
            row.tanggalSPPBJ,
            row.durasiKerja?.toString() || '0'
          ].join(' ').toLowerCase();
          
          if (!searchableText.includes(searchLower)) {
            return false;
          }
        }
        
        return true;
      });
      
      console.log('✅ [filteredData] Filtered data dihitung');
      console.log('  - Jumlah filtered data:', result.length);
      
      if (result.length > 0) {
        console.log('  - Sample filtered data:', {
          kebun: result[0].kebun,
          afdeling: result[0].afdeling,
          progressOverall: result[0].progressOverall,
          tanggal: result[0].tanggal
        });
      }
      
      return result;
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
    
    // Create paginated version of grouped data
    paginatedGroupedData() {
      if (this.itemsPerPage === 'all') {
        return this.groupedData;
      }
      
      const result = {};
      const startIndex = (this.currentPage - 1) * this.itemsPerPage;
      const endIndex = startIndex + this.itemsPerPage;
      
      // Get slice of data for current page
      const pageData = this.filteredData.slice(startIndex, endIndex);
      
      // Group page data
      pageData.forEach(row => {
        if (!result[row.kebun]) {
          result[row.kebun] = [];
        }
        result[row.kebun].push(row);
      });
      
      return result;
    },
    
    // Unique values for filters
    uniqueKebun() {
      if (!this.rawData || !this.rawData.length) return [];
      const kebunSet = new Set();
      this.rawData.forEach(row => {
        if (row.kebun) kebunSet.add(row.kebun);
      });
      return Array.from(kebunSet).sort();
    },
    
    uniqueVendors() {
      if (!this.rawData || !this.rawData.length) return [];
      const vendorSet = new Set();
      this.rawData.forEach(row => {
        if (row.namaVendor) vendorSet.add(row.namaVendor);
      });
      return Array.from(vendorSet).sort();
    },
    
    // Statistik Cards
    filterTitle() {
      if (this.filters.namaVendor) return `Luas Paket ${this.filters.namaVendor}`;
      if (this.filters.kebun) return `Luas Kebun ${this.filters.kebun}`;
      return 'Luas Tanaman ulang';
    },
    
    totalLuasPaket() {
      if (!this.rawData || !this.rawData.length) return 0;
      return this.rawData.reduce((total, row) => total + (parseFloat(row.luas) || 0), 0);
    },
    
    filteredTotalLuasPaket() {
      if (!this.filteredData || !this.filteredData.length) return 0;
      return this.filteredData.reduce((total, row) => total + (parseFloat(row.luas) || 0), 0);
    },
    
    avgProgress() {
      if (!this.rawData || !this.rawData.length) return 0;
      const totalProgress = this.rawData.reduce((total, row) => total + (parseFloat(row.progressOverall) || 0), 0);
      return totalProgress / this.rawData.length;
    },
    
    filteredAvgProgress() {
      console.log('📊 [filteredAvgProgress] Menghitung rata-rata progress...');
      console.log('  - Jumlah filtered data:', this.filteredData?.length || 0);
      
      if (!this.filteredData || !this.filteredData.length) {
        console.log('⚠️ [filteredAvgProgress] Tidak ada filtered data');
        return 0;
      }
      
      const totalProgress = this.filteredData.reduce((total, row) => {
        const progress = parseFloat(row.progressOverall) || 0;
        console.log(`    - Progress ${row.kebun} ${row.afdeling}: ${progress}%`);
        return total + progress;
      }, 0);
      
      const avgProgress = totalProgress / this.filteredData.length;
      console.log('✅ [filteredAvgProgress] Rata-rata progress dihitung:', avgProgress.toFixed(2) + '%');
      
      return avgProgress;
    },
    
    avgProgressYesterday() {
      if (!this.progressDataYesterday || !this.progressDataYesterday.length) return 0;
      const totalProgress = this.progressDataYesterday.reduce((total, row) => total + (parseFloat(row.progressOverall) || 0), 0);
      return totalProgress / this.progressDataYesterday.length;
    },
    
    filteredAvgProgressYesterday() {
      console.log('📊 [filteredAvgProgressYesterday] Menghitung rata-rata progress kemarin...');
      console.log('  - Jumlah progress data yesterday:', this.progressDataYesterday?.length || 0);
      
      if (!this.progressDataYesterday || !this.progressDataYesterday.length) {
        console.log('⚠️ [filteredAvgProgressYesterday] Tidak ada progress data yesterday');
        return 0;
      }
      
      const filteredYesterdayData = this.progressDataYesterday.filter(row => {
        if (this.filters.kebun && row.kebun !== this.filters.kebun) {
          console.log(`    - Skip ${row.kebun} (filter kebun: ${this.filters.kebun})`);
          return false;
        }
        if (this.filters.namaVendor && row.namaVendor !== this.filters.namaVendor) {
          console.log(`    - Skip ${row.namaVendor} (filter vendor: ${this.filters.namaVendor})`);
          return false;
        }
        return true;
      });
      
      console.log('  - Jumlah filtered yesterday data:', filteredYesterdayData.length);
      
      if (!filteredYesterdayData.length) {
        console.log('⚠️ [filteredAvgProgressYesterday] Tidak ada filtered yesterday data');
        return 0;
      }
      
      const totalProgress = filteredYesterdayData.reduce((total, row) => {
        const progress = parseFloat(row.progressOverall) || 0;
        console.log(`    - Progress kemarin ${row.kebun} ${row.afdeling}: ${progress}%`);
        return total + progress;
      }, 0);
      
      const avgProgress = totalProgress / filteredYesterdayData.length;
      console.log('✅ [filteredAvgProgressYesterday] Rata-rata progress kemarin dihitung:', avgProgress.toFixed(2) + '%');
      
      return avgProgress;
    },
    
    progressChange() {
      return this.avgProgress - this.avgProgressYesterday;
    },
    
    filteredProgressChange() {
      console.log('📈 [filteredProgressChange] Menghitung perubahan progress...');
      console.log('  - Progress hari ini:', this.filteredAvgProgress.toFixed(2) + '%');
      console.log('  - Progress kemarin:', this.filteredAvgProgressYesterday.toFixed(2) + '%');
      
      // Jika sudah dihitung sebelumnya, kembalikan nilai yang sudah ada
      if (this.progressCalculated && this.lastCalculatedProgressChange !== null) {
        console.log('✅ [filteredProgressChange] Menggunakan nilai yang sudah dihitung:', this.lastCalculatedProgressChange);
        return this.lastCalculatedProgressChange;
      }
      
      const change = this.filteredAvgProgress - this.filteredAvgProgressYesterday;
      
      // Simpan nilai untuk digunakan kembali
      this.lastCalculatedProgressChange = change;
      this.progressCalculated = true;
      
      console.log('✅ [filteredProgressChange] Perubahan progress dihitung:', change.toFixed(2) + '%');
      
      return change;
    },
    
    progressChangeType() {
      return this.progressChange >= 0 ? 'positive' : 'negative';
    },
    
    filteredProgressChangeType() {
      return this.filteredProgressChange >= 0 ? 'positive' : 'negative';
    },
    
    // Computed property untuk menyimpan formatted progress change
    formattedProgressChange() {
      return this.formattedProgressChange || '0%';
    },
    
    // Chart titles
    chartTitle() {
      const dateText = this.selectedDate ? formatDate(this.selectedDate) : 'Hari Ini';
      
      if (this.filters.kebun && this.filters.namaVendor) return `Progress TU per Afdeling - ${dateText}`;
      if (this.filters.namaVendor) return `Progress TU per Afdeling - ${dateText}`;
      if (this.filters.kebun) return `Progress TU per Afdeling dan Vendor - ${dateText}`;
      return `Progress TU Per Vendor - ${dateText}`;
    },
    
    needleChartTitle() {
      const dateText = this.selectedDate ? formatDate(this.selectedDate) : 'Hari Ini';
      
      if (this.filters.kebun && this.filters.namaVendor) return `Progress TU berdasarkan kuadran per Afdeling - ${dateText}`;
      if (this.filters.namaVendor) return `Progress TU berdasarkan kuadran per Afdeling - ${dateText}`;
      if (this.filters.kebun) return `Progress TU berdasarkan kuadran per Afdeling dan Vendor - ${dateText}`;
      return `Progress TU Berdasarkan Kuadran Per Vendor - ${dateText}`;
    },
    
    needleChartLegend() {
      return [
        { label: 'Sangat Rendah', color: '#EF4444' },
        { label: 'Rendah', color: '#F59E0B' },
        { label: 'Tinggi', color: '#4F46E5' },
        { label: 'Sangat Tinggi', color: '#10B981' }
      ];
    },
    
    // Bar Chart Data
    barChartData() {
      if (!this.filteredData || !this.filteredData.length) {
        return {
          labels: [],
          datasets: [{
            label: 'Progress Rata-rata (%)',
            data: [],
            backgroundColor: 'rgba(16, 185, 129, 0.5)',
            borderColor: 'rgba(16, 185, 129, 1)',
            borderWidth: 1
          }]
        };
      }
      
      const dataPoints = [];
      const labels = [];
      
      // Group data by vendor or kebun based on filters
      const groupedData = {};
      
      this.filteredData.forEach(row => {
        let key;
        if (this.filters.kebun && this.filters.namaVendor) {
          key = row.afdeling;
        } else if (this.filters.namaVendor) {
          key = `${row.kebun} - ${row.afdeling}`;
        } else if (this.filters.kebun) {
          key = `${row.afdeling} - ${row.namaVendor}`;
        } else {
          key = row.namaVendor;
        }
        
        if (!groupedData[key]) {
          groupedData[key] = {
            totalProgress: 0,
            count: 0,
            totalLuas: 0
          };
        }
        
        groupedData[key].totalProgress += parseFloat(row.progressOverall) || 0;
        groupedData[key].count += 1;
        groupedData[key].totalLuas += parseFloat(row.luas) || 0;
      });
      
      // Create data points for chart
      Object.keys(groupedData).forEach(key => {
        const avgProgress = groupedData[key].totalProgress / groupedData[key].count;
        dataPoints.push(avgProgress);
        labels.push(key);
      });
      
      return {
        labels: labels,
        datasets: [{
          label: 'Progress TU (%)',
          data: dataPoints,
          backgroundColor: 'rgba(16, 185, 129, 0.5)',
          borderColor: 'rgba(16, 185, 129, 1)',
          borderWidth: 1
        }],
        options: {
          scales: {
            y: {
              beginAtZero: true,
              max: 100,
              ticks: {
                callback: function(value) {
                  return value + '%';
                }
              }
            }
          },
          plugins: {
            tooltip: {
              callbacks: {
                label: function(context) {
                  return `Progress: ${context.parsed.y.toFixed(2)}%`;
                }
              }
            }
          }
        }
      };
    },
    
    // Pie Chart with Needle Data
    pieWithNeedleChartData() {
      if (!this.filteredData || !this.filteredData.length) {
        return {
          labels: [],
          datasets: [{
            data: [],
            backgroundColor: [],
            borderColor: [],
            borderWidth: 1
          }]
        };
      }
      
      const dataPoints = [];
      const labels = [];
      
      // Group data by vendor or kebun based on filters
      const groupedData = {};
      
      this.filteredData.forEach(row => {
        let key;
        if (this.filters.kebun && this.filters.namaVendor) {
          key = row.afdeling;
        } else if (this.filters.namaVendor) {
          key = `${row.kebun} - ${row.afdeling}`;
        } else if (this.filters.kebun) {
          key = `${row.afdeling} - ${row.namaVendor}`;
        } else {
          key = row.namaVendor;
        }
        
        if (!groupedData[key]) {
          groupedData[key] = {
            totalProgress: 0,
            count: 0
          };
        }
        
        groupedData[key].totalProgress += parseFloat(row.progressOverall) || 0;
        groupedData[key].count += 1;
      });
      
      // Create data points for chart
      Object.keys(groupedData).forEach(key => {
        const avgProgress = groupedData[key].totalProgress / groupedData[key].count;
        dataPoints.push(avgProgress);
        labels.push(key);
      });
      
      // Generate colors
      const colors = this.generateColors(dataPoints.length);
      
      return {
        labels: labels,
        datasets: [{
          data: dataPoints,
          backgroundColor: colors.map(c => c.background),
          borderColor: colors.map(c => c.border),
          borderWidth: 1
        }],
        options: {
          plugins: {
            tooltip: {
              callbacks: {
                label: function(context) {
                  return `${context.label}: ${context.parsed.toFixed(2)}%`;
                }
              }
            }
          }
        }
      };
    },
    
    // Radar Chart Data
// Radar Chart Data
radarChartData() {
  if (!this.filteredData || !this.filteredData.length) {
    return [];
  }
  
  const activityLabels = [
    'Pembuatan Parit',
    'Pembuatan Jalan',
    'Pembuatan Teras',
    'Ripping',
    'Luku',
    'Tumbang/Chipping',
    'Menanam Mucuna',
    'Lubang Tanam KS',
    'Mempupuk Lubang KS',
    'Menanam KS'
  ];
  
  const chartsData = [];
  
  // Group data by vendor or kebun based on filters
  const groupedData = {};
  
  this.filteredData.forEach(row => {
    let key;
    if (this.filters.kebun && this.filters.namaVendor) {
      key = row.afdeling;
    } else if (this.filters.namaVendor) {
      key = `${row.kebun} - ${row.afdeling}`;
    } else if (this.filters.kebun) {
      key = `${row.afdeling} - ${row.namaVendor}`;
    } else {
      key = row.namaVendor;
    }
    
    if (!groupedData[key]) {
      groupedData[key] = [];
    }
    
    groupedData[key].push(row);
  });
  
  // Create radar charts for each group
  Object.keys(groupedData).forEach(key => {
    const activities = [
      { name: 'Pembuatan Parit', data: [] },
      { name: 'Pembuatan Jalan', data: [] },
      { name: 'Pembuatan Teras', data: [] },
      { name: 'Ripping', data: [] },
      { name: 'Luku', data: [] },
      { name: 'Tumbang/Chipping', data: [] },
      { name: 'Menanam Mucuna', data: [] },
      { name: 'Lubang Tanam KS', data: [] },
      { name: 'Mempupuk Lubang KS', data: [] },
      { name: 'Menanam KS', data: [] }
    ];
    
    // Calculate average progress for each activity
    groupedData[key].forEach(row => {
      // Ambil data dengan benar dari objek progress
      activities[0].data.push(this.calculatePercentage(
        this.getProgressData(row.pembuatanParit, 'sdHariIni'),
        this.getProgressData(row.pembuatanParit, 'rencana')
      ));
      
      activities[1].data.push(this.calculatePercentage(
        this.getProgressData(row.pembuatanJalan, 'sdHariIni'),
        this.getProgressData(row.pembuatanJalan, 'rencana')
      ));
      
      activities[2].data.push(this.calculatePercentage(
        this.getProgressData(row.pembuatanTeras, 'sdHariIni'),
        this.getProgressData(row.pembuatanTeras, 'rencana')
      ));
      
      activities[3].data.push(this.calculatePercentage(
        this.getProgressData(row.ripping, 'sdHariIni'),
        this.getProgressData(row.ripping, 'rencana')
      ));
      
      activities[4].data.push(this.calculatePercentage(
        this.getProgressData(row.luku, 'sdHariIni'),
        this.getProgressData(row.luku, 'rencana')
      ));
      
      activities[5].data.push(this.calculatePercentage(
        this.getProgressData(row.tumbangChipping, 'sdHariIni'),
        this.getProgressData(row.tumbangChipping, 'rencana')
      ));
      
      activities[6].data.push(this.calculatePercentage(
        this.getProgressData(row.menanamMucuna, 'sdHariIni'),
        this.getProgressData(row.menanamMucuna, 'rencana')
      ));
      
      activities[7].data.push(this.calculatePercentage(
        this.getProgressData(row.lubangTanamKS, 'sdHariIni'),
        this.getProgressData(row.lubangTanamKS, 'rencana')
      ));
      
      activities[8].data.push(this.calculatePercentage(
        this.getProgressData(row.mempupukLubangKS, 'sdHariIni'),
        this.getProgressData(row.mempupukLubangKS, 'rencana')
      ));
      
      activities[9].data.push(this.calculatePercentage(
        this.getProgressData(row.menanamKS, 'sdHariIni'),
        this.getProgressData(row.menanamKS, 'rencana')
      ));
    });
    
    // Calculate average for each activity
    const activityData = activities.map(activity => {
      const sum = activity.data.reduce((total, value) => total + value, 0);
      return sum / activity.data.length;
    });
    
    // Siapkan data untuk tooltip
    const tooltipData = [
      { 
        name: 'Pembuatan Parit', 
        rencana: this.getProgressData(groupedData[key][0].pembuatanParit, 'rencana'),
        realisasi: this.getProgressData(groupedData[key][0].pembuatanParit, 'sdHariIni')
      },
      { 
        name: 'Pembuatan Jalan', 
        rencana: this.getProgressData(groupedData[key][0].pembuatanJalan, 'rencana'),
        realisasi: this.getProgressData(groupedData[key][0].pembuatanJalan, 'sdHariIni')
      },
      { 
        name: 'Pembuatan Teras', 
        rencana: this.getProgressData(groupedData[key][0].pembuatanTeras, 'rencana'),
        realisasi: this.getProgressData(groupedData[key][0].pembuatanTeras, 'sdHariIni')
      },
      { 
        name: 'Ripping', 
        rencana: this.getProgressData(groupedData[key][0].ripping, 'rencana'),
        realisasi: this.getProgressData(groupedData[key][0].ripping, 'sdHariIni')
      },
      { 
        name: 'Luku', 
        rencana: this.getProgressData(groupedData[key][0].luku, 'rencana'),
        realisasi: this.getProgressData(groupedData[key][0].luku, 'sdHariIni')
      },
      { 
        name: 'Tumbang/Chipping', 
        rencana: this.getProgressData(groupedData[key][0].tumbangChipping, 'rencana'),
        realisasi: this.getProgressData(groupedData[key][0].tumbangChipping, 'sdHariIni')
      },
      { 
        name: 'Menanam Mucuna', 
        rencana: this.getProgressData(groupedData[key][0].menanamMucuna, 'rencana'),
        realisasi: this.getProgressData(groupedData[key][0].menanamMucuna, 'sdHariIni')
      },
      { 
        name: 'Lubang Tanam KS', 
        rencana: this.getProgressData(groupedData[key][0].lubangTanamKS, 'rencana'),
        realisasi: this.getProgressData(groupedData[key][0].lubangTanamKS, 'sdHariIni')
      },
      { 
        name: 'Mempupuk Lubang KS', 
        rencana: this.getProgressData(groupedData[key][0].mempupukLubangKS, 'rencana'),
        realisasi: this.getProgressData(groupedData[key][0].mempupukLubangKS, 'sdHariIni')
      },
      { 
        name: 'Menanam KS', 
        rencana: this.getProgressData(groupedData[key][0].menanamKS, 'rencana'),
        realisasi: this.getProgressData(groupedData[key][0].menanamKS, 'sdHariIni')
      }
    ];
    
    chartsData.push({
      title: key,
      data: {
        labels: activityLabels,
        datasets: [{
          label: 'Progress (%)',
          data: activityData,
          backgroundColor: 'rgba(59, 130, 246, 0.2)',
          borderColor: 'rgba(59, 130, 246, 1)',
          pointBackgroundColor: 'rgba(59, 130, 246, 1)',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: 'rgba(59, 130, 246, 1)'
        }],
        tooltipData: tooltipData // Tambahkan data untuk tooltip
      },
      options: {
        scales: {
          r: {
            beginAtZero: true,
            max: 100,
            ticks: {
              stepSize: 20,
              callback: function(value) {
                return value + '%';
              }
            }
          }
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: function(context) {
                const dataIndex = context.dataIndex;
                const tooltipItem = context.chart.data.tooltipData[dataIndex];
                return [
                  `${context.label}: ${context.parsed.r.toFixed(2)}%`,
                  `Rencana: ${tooltipItem.rencana}`,
                  `Realisasi: ${tooltipItem.realisasi}`
                ];
              }
            }
          }
        }
      }
    });
  });
  
  return chartsData;
},
    
    // Ranking Data
    topRankingData() {
      if (!this.filteredData || !this.filteredData.length) return [];
      
      const entityProgressMap = new Map();
      
      this.filteredData.forEach(row => {
        const entityKey = `${row.kebun}-${row.afdeling}-${row.namaVendor}`;
        const entityName = `${row.kebun} - AFD ${row.afdeling} - ${row.namaVendor}`;
        
        if (!entityProgressMap.has(entityKey)) {
          entityProgressMap.set(entityKey, {
            id: entityKey,
            name: entityName,
            kebun: row.kebun,
            afd: row.afdeling,
            paket: row.namaVendor,
            todayProgress: 0,
            yesterdayProgress: 0,
            change: 0,
            count: 0,
            luasPaket: 0
          });
        }
        
        const entity = entityProgressMap.get(entityKey);
        entity.todayProgress += parseFloat(row.progressOverall) || 0;
        entity.count += 1;
        entity.luasPaket += parseFloat(row.luas) || 0;
      });
      
      // Proses data kemarin
      this.progressDataYesterday.forEach(item => {
        const entityKey = `${item.kebun}-${item.afdeling}-${item.namaVendor}`;
        
        if (entityProgressMap.has(entityKey)) {
          entityProgressMap.get(entityKey).yesterdayProgress = parseFloat(item.progressOverall) || 0;
        }
      });
      
      // Hitung rata-rata dan perubahan
      const rankingData = Array.from(entityProgressMap.values()).map(entity => {
        entity.progress = entity.count > 0 ? entity.todayProgress / entity.count : 0;
        entity.change = entity.progress - entity.yesterdayProgress;
        return entity;
      });
      
      // Urutkan berdasarkan perubahan progress (terbesar ke terkecil)
      rankingData.sort((a, b) => b.change - a.change);
      
      // Ambil 3 data teratas
      return rankingData.slice(0, 3);
    },
    
    restRankingData() {
      if (!this.filteredData || !this.filteredData.length) return [];
      
      const entityProgressMap = new Map();
      
      this.filteredData.forEach(row => {
        const entityKey = `${row.kebun}-${row.afdeling}-${row.namaVendor}`;
        const entityName = `${row.kebun} - AFD ${row.afdeling} - ${row.namaVendor}`;
        
        if (!entityProgressMap.has(entityKey)) {
          entityProgressMap.set(entityKey, {
            id: entityKey,
            name: entityName,
            kebun: row.kebun,
            afd: row.afdeling,
            paket: row.namaVendor,
            todayProgress: 0,
            yesterdayProgress: 0,
            change: 0,
            count: 0,
            luasPaket: 0
          });
        }
        
        const entity = entityProgressMap.get(entityKey);
        entity.todayProgress += parseFloat(row.progressOverall) || 0;
        entity.count += 1;
        entity.luasPaket += parseFloat(row.luas) || 0;
      });
      
      // Proses data kemarin
      this.progressDataYesterday.forEach(item => {
        const entityKey = `${item.kebun}-${item.afdeling}-${item.namaVendor}`;
        
        if (entityProgressMap.has(entityKey)) {
          entityProgressMap.get(entityKey).yesterdayProgress = parseFloat(item.progressOverall) || 0;
        }
      });
      
      // Hitung rata-rata dan perubahan
      const rankingData = Array.from(entityProgressMap.values()).map(entity => {
        entity.progress = entity.count > 0 ? entity.todayProgress / entity.count : 0;
        entity.change = entity.progress - entity.yesterdayProgress;
        return entity;
      });
      
      // Urutkan berdasarkan perubahan progress (terbesar ke terkecil)
      rankingData.sort((a, b) => b.change - a.change);
      
      // Ambil data dari posisi 4 ke bawah
      return rankingData.slice(3);
    },
    
    // Regression Analysis Data
    hasRegressionData() {
      return this.regressionData && this.regressionData.activities && this.regressionData.activities && this.regressionData.activities.length > 0;
    },
    
    comparisonDate() {
      if (!this.selectedDate) return this.currentDateISO;
      return this.currentDateISO;
    },
    
    regressionData() {
      if (!this.filteredData || !this.filteredData.length || !this.comparisonData || !this.comparisonData.length) {
        return null;
      }
      
      // Create a map of current data for easy lookup
      const currentDataMap = new Map();
      this.filteredData.forEach(row => {
        const key = `${row.kebun}-${row.afdeling}-${row.namaVendor}`;
        currentDataMap.set(key, row);
      });
      
      // Create a map of comparison data for easy lookup
      const comparisonDataMap = new Map();
      this.comparisonData.forEach(row => {
        const key = `${row.kebun}-${row.afdeling}-${row.namaVendor}`;
        comparisonDataMap.set(key, row);
      });
      
      // Calculate overall progress change
      let currentOverallProgress = 0;
      let comparisonOverallProgress = 0;
      let currentTotalLuas = 0;
      let comparisonTotalLuas = 0;
      
      currentDataMap.forEach(row => {
        currentOverallProgress += parseFloat(row.progressOverall) || 0;
        currentTotalLuas += parseFloat(row.luas) || 0;
      });
      
      comparisonDataMap.forEach(row => {
        comparisonOverallProgress += parseFloat(row.progressOverall) || 0;
        comparisonTotalLuas += parseFloat(row.luas) || 0;
      });
      
      const overallProgressChange = currentOverallProgress - comparisonOverallProgress;
      const totalLuasChange = currentTotalLuas - comparisonTotalLuas;
      
      // Calculate activity changes
      const activities = [
        { name: 'Pembuatan Parit', field: 'pembuatanParit' },
        { name: 'Pembuatan Jalan', field: 'pembuatanJalan' },
        { name: 'Pembuatan Teras', field: 'pembuatanTeras' },
        { name: 'Ripping', field: 'ripping' },
        { name: 'Luku', field: 'luku' },
        { name: 'Tumbang/Chipping', field: 'tumbangChipping' },
        { name: 'Menanam Mucuna', field: 'menanamMucuna' },
        { name: 'Lubang Tanam KS', field: 'lubangTanamKS' },
        { name: 'Mempupuk Lubang KS', field: 'mempupukLubangKS' },
        { name: 'Menanam KS', field: 'menanamKS' }
      ];
      
      const activityData = activities.map(activity => {
        let currentRencana = 0;
        let currentHariIni = 0;
        let currentSdHariIni = 0;
        let comparisonRencana = 0;
        let comparisonHariIni = 0;
        let comparisonSdHariIni = 0;
        
        // Sum up current data
        currentDataMap.forEach(row => {
          const progressData = row[activity.field] || {};
          currentRencana += parseFloat(progressData.rencana) || 0;
          currentHariIni += parseFloat(progressData.hariIni) || 0;
          currentSdHariIni += parseFloat(progressData.sdHariIni) || 0;
        });
        
        // Sum up comparison data
        comparisonDataMap.forEach(row => {
          const progressData = row[activity.field] || {};
          comparisonRencana += parseFloat(progressData.rencana) || 0;
          comparisonHariIni += parseFloat(progressData.hariIni) || 0;
          comparisonSdHariIni += parseFloat(progressData.sdHariIni) || 0;
        });
        
        return {
          name: activity.name,
          rencana: currentRencana,
          hariIni: currentHariIni,
          sdHariIni: currentSdHariIni,
          change: currentSdHariIni - comparisonSdHariIni
        };
      });
      
      return {
        overallProgressChange,
        totalLuasChange,
        activities: activityData
      };
    }
  },
  methods: {
    // Metode untuk mereset flag perhitungan progress
    resetProgressCalculation() {
      console.log('🔄 [resetProgressCalculation] Mereset flag perhitungan progress');
      this.progressCalculated = false;
      this.lastCalculatedProgressChange = null;
      this.formattedProgressChange = null;
    },
    
    // Metode baru untuk mengambil data progress dengan aman
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
      
      // Handle different date formats
      let date;
      
      // Handle Firestore timestamp format with _seconds and _nanoseconds
      if (dateValue && typeof dateValue === 'object' && dateValue._seconds !== undefined) {
        // Create a new Date object from Firestore timestamp
        date = new Date(dateValue._seconds * 1000 + dateValue._nanoseconds / 1000000);
      } else if (dateValue instanceof Date) {
        date = dateValue;
      } else if (typeof dateValue === 'string') {
        // Handle Firestore timestamp string format
        if (dateValue.includes('at')) {
          // Format like "November 18, 2025 at 5:28:28.437 PM UTC+7"
          const parts = dateValue.split(' at ');
          if (parts.length === 2) {
            date = new Date(parts[0] + ' ' + parts[1].split(' ')[0]);
          } else {
            date = new Date(dateValue);
          }
        } else {
          date = new Date(dateValue);
        }
      } else if (dateValue.toDate && typeof dateValue.toDate === 'function') {
        // Firestore timestamp object
        date = dateValue.toDate();
      } else {
        date = new Date(dateValue);
      }
      
      // Return YYYY-MM-DD format
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      
      return `${year}-${month}-${day}`;
    },

    // Add this method to your methods section
formatProgressChange(value) {
  if (value === null || value === undefined || isNaN(value)) {
    return '0%';
  }
  
  const absValue = Math.abs(value);
  const sign = value >= 0 ? '+' : '-';
  return `${sign}${absValue.toFixed(1)}%`;
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
      this.fetchData();
    },
    
    async fetchData() {
      this.isLoading = true;
      this.errorData = '';
      try {
        // Reset flag perhitungan progress
        this.resetProgressCalculation();
        
        // Include date filter in API call if selected
        const params = {};
        const filterDate = this.selectedDate || this.currentDateISO;
        params.tanggal = filterDate;
        
        console.log('🔄 [fetchData] Mengambil data untuk tanggal:', filterDate);
        
        const response = await getDataTU(params);
        
        // Debug log untuk melihat struktur response
        console.log('📊 [fetchData] Full response from API:', response);
        console.log('📊 [fetchData] Response data:', response.data);
        
        // Perbaikan: Pastikan kita mengambil data dengan benar
        this.rawData = response.data || response;
        
        // Debug log untuk melihat data yang disimpan
        console.log('💾 [fetchData] Raw data after assignment:', this.rawData);
        console.log('📊 [fetchData] Jumlah data yang diambil:', this.rawData?.length || 0);
        
        // Debug log untuk melihat tanggal yang diformat
        if (this.rawData && this.rawData.length > 0) {
          console.log('📅 [fetchData] Sample data pertama:');
          console.log('  - Tanggal:', this.rawData[0].tanggal);
          console.log('  - Tanggal formatted:', this.formatDateForComparison(this.rawData[0].tanggal));
          console.log('  - Progress Overall:', this.rawData[0].progressOverall);
          console.log('  - Sample progress data:', this.rawData[0].pembuatanParit);
        }
        
        // Save current data for comparison
        this.saveProgressDataToStorage();
        
        // If we have a selected date, load comparison data
        if (this.selectedDate) {
          await this.loadComparisonData();
        }
        
        console.log('✅ [fetchData] Data berhasil diambil dan disimpan');
      } catch (err) {
        this.errorData = err.response?.data?.message || 'Gagal mengambil data.';
        console.error('Error fetching data:', err);
      } finally {
        this.isLoading = false;
      }
    },
    
    // Metode untuk menangani perubahan filter tanggal
    async handleDateFilter() {
      console.log('🔄 [handleDateFilter] Filter tanggal diubah');
      console.log('  - Selected date:', this.selectedDate);
      console.log('  - Current date ISO:', this.currentDateISO);
      
      // Reset flag perhitungan progress
      this.resetProgressCalculation();
      
      this.resetPagination();
      
      // Save current data before fetching new data
      if (!this.selectedDate) {
        // If clearing date filter, save today's data for comparison
        console.log('💾 [handleDateFilter] Menyimpan data hari ini untuk perbandingan');
        this.comparisonData = [...this.rawData];
        console.log('📊 [handleDateFilter] Comparison data set:', this.comparisonData?.length || 0);
      } else {
        // If selecting a date, load today's data for comparison
        console.log('📥 [handleDateFilter] Memuat data hari ini untuk perbandingan');
        await this.loadTodayDataForComparison();
      }
      
      this.fetchData();
    },
    
    // Metode untuk menghapus filter tanggal
    async clearDateFilter() {
      console.log('🔄 [clearDateFilter] Filter tanggal dihapus');
      this.selectedDate = null;
      
      // Reset flag perhitungan progress
      this.resetProgressCalculation();
      
      this.resetPagination();
      
      // Load today's data for comparison
      console.log('📥 [clearDateFilter] Memuat data hari ini untuk perbandingan');
      await this.loadTodayDataForComparison();
      
      this.fetchData();
    },
    
    // Metode untuk memuat data hari ini untuk perbandingan
    async loadTodayDataForComparison() {
      try {
        console.log('📥 [loadTodayDataForComparison] Memuat data hari ini...');
        const params = { tanggal: this.currentDateISO };
        console.log('  - Params:', params);
        
        const response = await getDataTU(params);
        this.comparisonData = response.data || response;
        
        console.log('✅ [loadTodayDataForComparison] Data hari ini berhasil dimuat');
        console.log('  - Jumlah data:', this.comparisonData?.length || 0);
        
        if (this.comparisonData && this.comparisonData.length > 0) {
          console.log('  - Sample data comparison:', {
            kebun: this.comparisonData[0].kebun,
            afdeling: this.comparisonData[0].afdeling,
            progressOverall: this.comparisonData[0].progressOverall
          });
        }
      } catch (err) {
        console.error('❌ [loadTodayDataForComparison] Error loading today\'s data for comparison:', err);
        this.comparisonData = [];
      }
    },
    
    // Metode untuk memuat data perbandingan
    async loadComparisonData() {
      try {
        const params = { tanggal: this.comparisonDate };
        const response = await getDataTU(params);
        this.comparisonData = response.data || response;
      } catch (err) {
        console.error('Error loading comparison data:', err);
        this.comparisonData = [];
      }
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
      if (this.itemsPerPage !== 'custom') {
        this.resetPagination();
      }
    },
    
    applyCustomItemsPerPage() {
      if (this.customItemsPerPage > 0) {
        this.itemsPerPage = this.customItemsPerPage;
        this.resetPagination();
      }
    },
    
    // Metode untuk toggle minimize/maximize grup
    toggleGroup(groupName) {
      // Menggunakan spread operator untuk mempertahankan reaktivitas di Vue 3
      this.minimizedGroups = {
        ...this.minimizedGroups,
        [groupName]: !this.minimizedGroups[groupName]
      };
    },
    
    // Metode untuk minimize semua grup
    minimizeAllGroups() {
      const groupNames = Object.keys(this.groupedData);
      const newMinimizedGroups = {};
      
      groupNames.forEach(groupName => {
        newMinimizedGroups[groupName] = true;
      });
      
      this.minimizedGroups = newMinimizedGroups;
      this.allGroupsMinimized = true;
    },
    
    // Metode untuk expand semua grup
    expandAllGroups() {
      const groupNames = Object.keys(this.groupedData);
      const newMinimizedGroups = {};
      
      groupNames.forEach(groupName => {
        newMinimizedGroups[groupName] = false;
      });
      
      this.minimizedGroups = newMinimizedGroups;
      this.allGroupsMinimized = false;
    },
    
    // Metode untuk UI
    toggleFilters() {
      this.filtersVisible = !this.filtersVisible;
    },
    
    toggleRanking() {
      this.rankingVisible = !this.rankingVisible;
    },
    
    toggleRegression() {
      this.regressionVisible = !this.regressionVisible;
    },
    
    updateDateTime() {
      const now = new Date();
      this.currentTime = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      this.currentDate = now.toLocaleDateString('id-ID', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
      });
    },
    
    // Fungsi untuk menentukan kelas perubahan progress
    getChangeClass(change) {
      if (change > 0) return 'positive-change';
      if (change < 0) return 'negative-change';
      return 'neutral-change';
    },
    
    // Fungsi untuk menghasilkan warna untuk chart
    generateColors(count) {
      const colors = [];
      const baseColors = [
        'rgba(16, 185, 129, 0.7)',  'rgba(59, 130, 246, 0.7)', 'rgba(139, 92, 246, 0.7)', 'rgba(245, 158, 11, 0.7)', 'rgba(239, 68, 68, 0.7)', 'rgba(236, 72, 153, 0.7)', 'rgba(14, 165, 233, 0.7)', 'rgba(168, 85, 247, 0.7)', 'rgba(34, 197, 94, 0.7)', 'rgba(249, 115, 22, 0.7)'
      ];
      
      const borderColors = [
        'rgba(16, 185, 129, 1)', 'rgba(59, 130, 246, 1)', 'rgba(139, 92, 246, 1)', 'rgba(245, 158, 11, 1)', 'rgba(239, 68, 68, 1)', 'rgba(236, 72, 153, 1)', 'rgba(14, 165, 233, 1)', 'rgba(168, 85, 247, 1)', 'rgba(34, 197, 94, 1)', 'rgba(249, 115, 22, 1)'
      ];
      
      for (let i = 0; i < count; i++) {
        colors.push({
          background: baseColors[i % baseColors.length],
          border: borderColors[i % borderColors.length]
        });
      }
      
      return colors;
    },
    
    // Metode untuk scroll to top
    handleScroll() {
      this.showScrollTop = window.pageYOffset > 300;
    },
    
    scrollToTop() {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    },
    
    // Metode untuk localStorage
    saveProgressDataToStorage() {
      if (!this.rawData || !this.rawData.length) {
        console.log('⚠️ [saveProgressDataToStorage] Tidak ada data untuk disimpan');
        return;
      }
      
      const today = new Date().toISOString().split('T')[0];
      const storageKey = `progressData_${today}`;
      
      console.log('💾 [saveProgressDataToStorage] Menyimpan data ke localStorage');
      console.log('  - Storage key:', storageKey);
      console.log('  - Jumlah data:', this.rawData.length);
      
      // Extract relevant progress data
      const progressData = this.rawData.map(row => ({
        kebun: row.kebun,
        afdeling: row.afdeling,
        namaVendor: row.namaVendor,
        progressOverall: row.progressOverall,
        // Include all activity data for regression analysis
        pembuatanParit: row.pembuatanParit,
        pembuatanJalan: row.pembuatanJalan,
        pembuatanTeras: row.pembuatanTeras,
        ripping: row.ripping,
        luku: row.luku,
        tumbangChipping: row.tumbangChipping,
        menanamMucuna: row.menanamMucuna,
        lubangTanamKS: row.lubangTanamKS,
        mempupukLubangKS: row.mempupukLubangKS,
        menanamKS: row.menanamKS,
        luas: row.luas
      }));
      
      localStorage.setItem(storageKey, JSON.stringify(progressData));
      console.log('✅ [saveProgressDataToStorage] Data berhasil disimpan ke localStorage');
    },
    
    loadProgressDataFromStorage() {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      const storageKey = `progressData_${yesterdayStr}`;
      
      console.log('📥 [loadProgressDataFromStorage] Mencoba memuat data kemarin dari localStorage');
      console.log('  - Storage key:', storageKey);
      
      const storedData = localStorage.getItem(storageKey);
      
      if (storedData) {
        try {
          this.progressDataYesterday = JSON.parse(storedData);
          console.log('✅ [loadProgressDataFromStorage] Data kemarin berhasil dimuat');
          console.log('  - Jumlah data:', this.progressDataYesterday.length);
          
          if (this.progressDataYesterday.length > 0) {
            console.log('  - Sample data kemarin:', {
              kebun: this.progressDataYesterday[0].kebun,
              afdeling: this.progressDataYesterday[0].afdeling,
              progressOverall: this.progressDataYesterday[0].progressOverall
            });
          }
          
          return true;
        } catch (err) {
          console.error('❌ [loadProgressDataFromStorage] Error parsing stored progress data:', err);
        }
      } else {
        console.log('⚠️ [loadProgressDataFromStorage] Tidak ada data kemarin di localStorage');
      }
      
      return false;
    }
  },
  watch: {
    filteredData() {
      console.log('🔄 [watch:filteredData] Data berubah, mereset flag perhitungan');
      this.resetProgressCalculation();
      this.resetPagination();
      
      // Reset state minimizedGroups ketika data berubah
      this.minimizedGroups = {};
      this.allGroupsMinimized = false;
    },
    itemsPerPage(newVal) {
      if (newVal !== 'custom' && newVal !== 'all') {
        this.customItemsPerPage = newVal;
      }
    },
    filteredProgressChange(newValue) {
      console.log('📈 [watch:filteredProgressChange] Perubahan progress...');
      console.log('  - Progress hari ini:', this.filteredAvgProgress.toFixed(2) + '%');
      console.log('  - Progress kemarin:', this.filteredAvgProgressYesterday.toFixed(2) + '%');
      
      // Hitung ulang perubahan
      const change = this.filteredAvgProgress - this.filteredAvgProgressYesterday;
      
      // Simpan nilai untuk digunakan kembali
      this.lastCalculatedProgressChange = change;
      this.progressCalculated = true;
      
      // Format perubahan progress
      this.formattedProgressChange = this.formatProgressChange(change);
      
      console.log('✅ [watch:filteredProgressChange] Perubahan progress dihitung:', change.toFixed(2) + '%');
      
      return change;
    },
    formattedProgressChange(newVal) {
      console.log('🎨 [formattedProgressChange] Memformat perubahan progress...');
      console.log('  - Input change:', newVal);
      
      if (newVal === null || newVal === undefined || isNaN(newVal)) {
        console.log('⚠️ [formattedProgressChange] Change tidak valid, mengembalikan 0%');
        this.formattedProgressChange = '0%';
        return '0%';
      }
      
      const absChange = Math.abs(newVal);
      const sign = newVal >= 0 ? '+' : '-';
      const formatted = `${sign}${absChange.toFixed(1)}%`;
      
      console.log('✅ [formattedProgressChange] Formatted change:', formatted);
      
      return formatted;
    }
  },
  async created() {
    this.updateDateTime();
    this.timeInterval = setInterval(() => {
      this.updateDateTime();
    }, 1000);
    
    // Add scroll event listener
    window.addEventListener('scroll', this.handleScroll);
    
    // Load yesterday's progress data
    this.loadProgressDataFromStorage();
    
    // Load today's data for comparison by default
    await this.loadTodayDataForComparison();
    
    // Fetch data for today by default
    this.fetchData();
  },
  beforeUnmount() {
    clearInterval(this.timeInterval);
    // Remove scroll event listener
    window.removeEventListener('scroll', this.handleScroll);
  }
}
</script>

<style scoped>
/* Dashboard Header Styles */
.dashboard-header {
  margin-bottom: 2rem;
  text-align: center;
}

/* Toggle Button Styles */
.toggle-button {
  background-color: #4f46e5;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  cursor: pointer;
  margin-bottom: 1rem;
  transition: background-color 0.2s;
}

.toggle-button:hover {
  background-color: #4338ca;
}

/* Filter Container Styles */
.filter-container {
  background-color: white;
  border-radius: 0.5rem;
  padding: 1rem;
  margin-bottom: 1rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
}

.filter-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.25rem;
}

.filter-input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
}

/* Chart Container Styles */
.chart-container {
  background-color: white;
  border-radius: 0.5rem;
  padding: 1rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
}

.pie-chart-outer {
  background-color: white;
  border-radius: 0.5rem;
  padding: 1rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
}

/* Podium Styles */
.podium-card {
  background-color: white;
  border-radius: 0.5rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
}

.podium-header {
  text-align: center;
  margin-bottom: 1.5rem;
}

.podium-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
}

.podium-positions {
  display: flex;
  justify-content: center;
  align-items: flex-end;
  gap: 1rem;
}

.podium-position {
  flex: 1;
  max-width: 300px;
  text-align: center;
  position: relative;
}

.position-1 {
  order: 2;
  transform: translateY(-20px);
}

.position-2 {
  order: 1;
  transform: translateY(-10px);
}

.position-3 {
  order: 3;
  transform: translateY(-10px);
}

.medal-container {
  margin-bottom: 0.5rem;
}

.medal-image {
  width: 60px;
  height: 60px;
  object-fit: contain;
}

.podium-info {
  background-color: #f9fafb;
  border-radius: 0.5rem;
  padding: 1rem;
  border: 1px solid #e5e7eb;
}

.podium-name {
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #1f2937;
}

.podium-details {
  margin-bottom: 0.75rem;
}

.podium-detail {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.25rem;
  font-size: 0.875rem;
}

.detail-label {
  font-weight: 500;
  color: #6b7280;
}

.detail-value {
  color: #1f2937;
}

.podium-progress {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.progress-value {
  font-weight: 600;
  font-size: 1.125rem;
  color: #1f2937;
}

.progress-change {
  font-weight: 500;
  font-size: 0.875rem;
  padding: 0.125rem 0.5rem;
  border-radius: 9999px;
}

.positive-change {
  color: #047857;
  background-color: #d1fae5;
}

.negative-change {
  color: #b91c1c;
  background-color: #fee2e2;
}

.neutral-change {
  color: #6b7280;
  background-color: #f3f4f6;
}

/* Regression Analysis Styles */
.regression-card {
  background-color: white;
  border-radius: 0.5rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
}

.regression-header {
  text-align: center;
  margin-bottom: 1.5rem;
}

.regression-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.regression-subtitle {
  font-size: 0.875rem;
  color: #6b7280;
}

.regression-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.regression-summary {
  display: flex;
  justify-content: space-around;
  background-color: #f9fafb;
  border-radius: 0.5rem;
  padding: 1rem;
}

.summary-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.summary-label {
  font-size: 0.875rem;
  color: #6b7280;
  text-align: center;
}

.summary-value {
  font-size: 1.125rem;
  font-weight: 600;
  padding: 0.25rem 0.75rem;
  border-radius: 0.375rem;
}

.regression-details {
  background-color: #f9fafb;
  border-radius: 0.5rem;
  padding: 1rem;
}

.details-title {
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 1rem;
  text-align: center;
}

.activity-regression {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
}

.activity-item {
  background-color: white;
  border-radius: 0.375rem;
  padding: 1rem;
  border: 1px solid #e5e7eb;
}

.activity-name {
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.75rem;
  text-align: center;
}

.activity-progress {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.progress-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.progress-label {
  font-size: 0.875rem;
  color: #6b7280;
}

.progress-value {
  font-size: 0.875rem;
  font-weight: 500;
  color: #1f2937;
}

.progress-value.change {
  font-weight: 600;
  font-size: 0.875rem;
  padding: 0.125rem 0.5rem;
  border-radius: 0.25rem;
}

/* Ranking List Styles */
.ranking-list {
  background-color: white;
  border-radius: 0.5rem;
  padding: 1rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
}

.ranking-item {
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.ranking-item:last-child {
  border-bottom: none;
}

.rank-position {
  width: 40px;
  height: 40px;
  background-color: #f3f4f6;
  border-radius: 50%;
  display: flex;
  align-items: center;
  font-weight: 600;
  color: #6b7280;
  margin-right: 1rem;
}

.item-content {
  flex: 1;
}

.item-name {
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.25rem;
}

.item-details {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
  color: #6b7280;
}

.item-detail {
  margin-right: 1rem;
}

.item-progress {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  min-width: 100px;
}

/* Floating Action Button Styles */
.fab-container {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  z-index: 50;
}

.fab {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background-color: #4f46e5;
  color: white;
  border: none;
  cursor: pointer;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
}

.fab:hover {
  background-color: #4338ca;
}

/* Loading Spinner Styles */
.loading-spinner {
  border: 4px solid rgba(0, 0, 0.1);
  border-radius: 50%;
  border-top: 4px solid #4f46e5;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

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
  
  .podium-positions {
    flex-direction: column;
    align-items: center;
  }
  
  .position-1,
  .position-2,
  .position-3 {
    transform: none;
    order: initial;
    max-width: 100%;
    margin-bottom: 1rem;
  }
}
</style>