<script setup lang="ts">
import { computed } from 'vue';
import Calendar from 'primevue/calendar';

interface Props {
  modelValue: Date;
  maxDate: Date | null;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'update:modelValue': [date: Date];
}>();

const selectedDate = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});

const minDate = computed(() => {
  return new Date();
});

const calendarMaxDate = computed(() => {
  return props.maxDate || undefined;
});

const handleDateSelect = (date: Date) => {
  emit('update:modelValue', date);
};
</script>

<template>
  <div class="calendar-panel">
    <div class="panel-header">
      <h3 class="panel-title">Календарь</h3>
    </div>
    
    <Calendar
      v-model="selectedDate"
      inline
      showOtherMonths
      :min-date="minDate"
      :max-date="calendarMaxDate"
      @date-select="handleDateSelect"
      class="booking-calendar"
    />
  </div>
</template>

<style scoped>
.calendar-panel {
  background: var(--surface-card);
  border: 1px solid var(--surface-border);
  border-radius: 1rem;
  padding: 1.5rem;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.panel-title {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--surface-900);
}

.booking-calendar {
  width: 100%;
}

.booking-calendar :deep(.p-calendar) {
  width: 100%;
}

.booking-calendar :deep(.p-datepicker) {
  border: none;
  background: transparent;
  width: 100%;
}

.booking-calendar :deep(.p-datepicker-header) {
  background: transparent;
  border: none;
  padding: 0 0 1rem 0;
  margin-bottom: 0.5rem;
  border-bottom: 1px solid var(--surface-border);
}

.booking-calendar :deep(.p-datepicker-title) {
  font-weight: 600;
  font-size: 1rem;
  color: var(--surface-900);
}

.booking-calendar :deep(.p-datepicker-calendar) {
  width: 100%;
}

.booking-calendar :deep(.p-datepicker-calendar th) {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--surface-500);
  text-transform: uppercase;
  padding: 0.5rem;
}

.booking-calendar :deep(.p-datepicker-calendar td) {
  padding: 0.125rem;
}

.booking-calendar :deep(.p-datepicker-calendar td > span) {
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  transition: all 0.2s ease;
}

.booking-calendar :deep(.p-datepicker-calendar td > span:hover) {
  background: var(--surface-100);
}

.booking-calendar :deep(.p-datepicker-calendar td.p-highlight > span) {
  background: var(--primary-color);
  color: white;
  font-weight: 600;
}

.booking-calendar :deep(.p-datepicker-calendar td.p-disabled > span) {
  color: var(--surface-300);
  cursor: not-allowed;
}
</style>
