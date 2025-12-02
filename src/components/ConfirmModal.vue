<!-- src/components/ConfirmModal.vue -->
<template>
  <div v-if="isVisible" class="modal-overlay">
    <div class="modal-container">
      <div class="modal-header">
        <!-- Ikon Warning -->
        <svg class="warning-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.082 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
        </svg>
        <h3>{{ title }}</h3>
      </div>
      <div class="modal-body">
        <p>{{ message }}</p>
      </div>
      <div class="modal-footer">
        <button @click="handleCancel" class="btn btn-secondary">
          {{ cancelButtonText }}
        </button>
        <button @click="handleConfirm" class="btn btn-danger">
          {{ confirmButtonText }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ConfirmModal',
  props: {
    isVisible: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: 'Konfirmasi'
    },
    message: {
      type: String,
      default: 'Apakah Anda yakin ingin melanjutkan tindakan ini?'
    },
    confirmButtonText: {
      type: String,
      default: 'Ya'
    },
    cancelButtonText: {
      type: String,
      default: 'Batal'
    }
  },
  emits: ['confirm', 'cancel'],
  methods: {
    handleConfirm() {
      this.$emit('confirm');
    },
    handleCancel() {
      this.$emit('cancel');
    }
  }
}
</script>

<style scoped>
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

.modal-container {
  background: white;
  border-radius: 8px;
  max-width: 400px;
  width: 90%;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  overflow: hidden;
}

.modal-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1.5rem 1.5rem 0.5rem;
  background-color: #fef2f2;
  border-bottom: 1px solid #fecaca;
}

.warning-icon {
  width: 3rem;
  height: 3rem;
  color: #f59e0b;
  margin-bottom: 0.5rem;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  color: #991b1b;
}

.modal-body {
  padding: 1.5rem;
  text-align: center;
  color: #4b5563;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  background-color: #f9fafb;
  border-top: 1px solid #e5e7eb;
}
</style>