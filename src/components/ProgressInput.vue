<template>
  <div class="progress-input-group" :class="`layout-${layout}`">
    <label class="form-label">{{ title }}</label>
    
    <!-- Tampilan Horizontal (Default) -->
    <div v-if="layout === 'horizontal'" class="progress-inputs-horizontal">
      <div class="input-field">
        <label>Rencana</label>
        <input type="number" class="form-input" v-model.number="localModel.rencana" min="0" step="0.01" />
        <small class="unit">{{ unit }}</small>
      </div>
      <div class="input-field">
        <label>Hari Ini</label>
        <input type="number" class="form-input" v-model.number="localModel.hariIni" min="0" step="0.01" />
        <small class="unit">{{ unit }}</small>
      </div>
      <div class="input-field">
        <label>s.d. Hari Ini</label>
        <input type="number" class="form-input" v-model.number="localModel.sdHariIni" min="0" step="0.01" />
        <small class="unit">{{ unit }}</small>
      </div>
      <div class="percentage-display">
        <span>{{ calculatedPercentage.toFixed(2) }}%</span>
      </div>
    </div>

    <!-- Tampilan Vertikal (Baru) -->
    <div v-else class="progress-inputs-vertical">
      <div class="input-field-vertical">
        <label>Rencana</label>
        <div class="input-with-unit">
          <input type="number" class="form-input" v-model.number="localModel.rencana" min="0" step="0.01" />
          <small class="unit">{{ unit }}</small>
        </div>
      </div>
      <div class="input-field-vertical">
        <label>Hari Ini</label>
        <div class="input-with-unit">
          <input type="number" class="form-input" v-model.number="localModel.hariIni" min="0" step="0.01" />
          <small class="unit">{{ unit }}</small>
        </div>
      </div>
      <div class="input-field-vertical">
        <label>s.d. Hari Ini</label>
        <div class="input-with-unit">
          <input type="number" class="form-input" v-model.number="localModel.sdHariIni" min="0" step="0.01" />
          <small class="unit">{{ unit }}</small>
        </div>
      </div>
      <div class="percentage-display-vertical">
        <span>Persentase: {{ calculatedPercentage.toFixed(2) }}%</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ProgressInput',
  props: {
    modelValue: { 
      type: Object, 
      required: true, 
      default: () => ({ rencana: 0, hariIni: 0, sdHariIni: 0 }) 
    },
    title: { type: String, required: true },
    unit: { type: String, default: 'Unit' },
    // Props baru untuk memilih layout
    layout: { 
      type: String, 
      default: 'horizontal', 
      validator: value => ['horizontal', 'vertical'].includes(value) 
    }
  },
  emits: ['update:modelValue'],
  computed: {
    calculatedPercentage() {
      if (this.modelValue.rencana <= 0) return 0;
      return (this.modelValue.sdHariIni / this.modelValue.rencana) * 100;
    },
    localModel: {
      get() { return this.modelValue; },
      set(newValue) { 
        this.$emit('update:modelValue', newValue);
        // Notify parent component that the value has changed
        this.$emit('update:modelValue', newValue);
      }
    }
  },
  watch: {
    'localModel.hariIni'(newVal) {
      // Automatically update sdHariIni when hariIni changes
      if (newVal > 0) {
        this.localModel.sdHariIni = newVal;
      }
    },
    'localModel.rencana'() {
      // Notify parent when rencana changes
      this.$emit('update:modelValue', this.localModel);
    },
    'localModel.sdHariIni'() {
      // Notify parent when sdHariIni changes
      this.$emit('update:modelValue', this.localModel);
    }
  }
}
</script>

<style scoped>
.progress-input-group {
  margin-bottom: 1.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 1rem;
  background-color: #f9fafb;
}
.form-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #374151;
}

/* --- Style untuk Layout Horizontal --- */
.progress-inputs-horizontal {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr auto;
  gap: 1rem;
  align-items: end;
}
.progress-inputs-horizontal .input-field {
  display: flex;
  flex-direction: column;
  position: relative;
}
.progress-inputs-horizontal .input-field label {
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.25rem;
}
.progress-inputs-horizontal .input-field .unit {
  position: absolute;
  right: 10px; bottom: 10px;
  font-size: 0.75rem; color: #9ca3af;
  pointer-events: none;
}
.progress-inputs-horizontal .form-input {
  padding-right: 3.5rem;
}
.progress-inputs-horizontal .percentage-display {
  display: flex;
  align-items: center; justify-content: center;
  background-color: #4f46e5; color: white;
  font-weight: 600; font-size: 1rem;
  padding: 0 1rem; height: 42px;
  border-radius: 0.375rem; min-width: 80px;
}

/* --- Style untuk Layout Vertikal --- */
.progress-inputs-vertical {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.input-field-vertical {
  display: flex;
  flex-direction: column;
}
.input-field-vertical label {
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.25rem;
}
.input-with-unit {
  display: flex;
  align-items: center;
  position: relative;
}
.input-with-unit .unit {
  margin-left: 0.5rem;
  font-size: 0.875rem;
  color: #6b7280;
  white-space: nowrap;
}
.percentage-display-vertical {
  margin-top: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: #e5e7eb;
  border-radius: 0.375rem;
  text-align: center;
  font-weight: 600;
  color: #374151;
}

/* --- Style Umum --- */
.form-input {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 1rem; /* Tambahkan ukuran font yang konsisten */
  transition: border-color 0.2s;
  box-sizing: border-box;
}
.form-input:focus {
  outline: none;
  border-color: #4f46e5;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

/* --- HILANGKAN TOMBOL ANGKA --- */
.progress-input-group input[type="number"]::-webkit-outer-spin-button,
.progress-input-group input[type="number"]::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
.progress-input-group input[type="number"] {
  -moz-appearance: textfield;
}
</style>