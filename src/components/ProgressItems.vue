<template>
  <div class="progress-item">
    <div class="progress-title">{{ title }}</div>
    <div class="progress-values">
      <div class="progress-value">
        <span class="label">Rencana:</span>
        <span class="value">{{ formatNumber(rencana) }} {{ unit }}</span>
      </div>
      <div class="progress-value">
        <span class="label">Hari Ini:</span>
        <span class="value">{{ formatNumber(hariIni) }} {{ unit }}</span>
      </div>
      <div class="progress-value">
        <span class="label">s.d. Hari Ini:</span>
        <span class="value">{{ formatNumber(sdHariIni) }} {{ unit }}</span>
      </div>
    </div>
    <div class="progress-bar-container">
      <div class="progress-bar">
        <div 
          class="progress-fill" 
          :style="{ width: `${Math.min(persentase, 100)}%` }"
          :class="getProgressColorClass(persentase)"
        ></div>
      </div>
      <div class="progress-percentage">{{ formatPercentage(persentase) }}</div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ProgressItem',
  props: {
    title: {
      type: String,
      required: true
    },
    unit: {
      type: String,
      default: 'Unit'
    },
    rencana: {
      type: Number,
      default: 0
    },
    hariIni: {
      type: Number,
      default: 0
    },
    sdHariIni: {
      type: Number,
      default: 0
    },
    persentase: {
      type: Number,
      default: 0
    }
  },
  methods: {
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
    getProgressColorClass(percentage) {
      if (percentage >= 80) return 'progress-fill-success';
      if (percentage >= 50) return 'progress-fill-warning';
      return 'progress-fill-danger';
    }
  }
}
</script>

<style scoped>
.progress-item {
  padding: 0.5rem;
  border-radius: 0.375rem;
  background-color: #f9fafb;
  border: 1px solid #e5e7eb;
}

.progress-title {
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.25rem;
  font-size: 0.875rem;
}

.progress-values {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin-bottom: 0.5rem;
}

.progress-value {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
}

.progress-value .label {
  color: #6b7280;
}

.progress-value .value {
  color: #374151;
  font-weight: 500;
}

.progress-bar-container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.progress-bar {
  flex-grow: 1;
  height: 0.5rem;
  background-color: #e5e7eb;
  border-radius: 9999px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  transition: width 0.3s ease;
}

.progress-fill-success {
  background-color: #10b981;
}

.progress-fill-warning {
  background-color: #f59e0b;
}

.progress-fill-danger {
  background-color: #ef4444;
}

.progress-percentage {
  font-size: 0.75rem;
  font-weight: 600;
  color: #374151;
  min-width: 3rem;
  text-align: right;
}
</style>