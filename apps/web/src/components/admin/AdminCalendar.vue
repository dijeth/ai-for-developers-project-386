<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import Calendar from 'primevue/calendar';
import Button from 'primevue/button';
import Menu from 'primevue/menu';
import type { Booking, Owner } from '../../types/admin';
import { 
  formatDateLocal
} from '../../composables/useAdminDashboard';

interface Props {
  modelValue: Date;
  bookings: Booking[];
  owner: Owner | null;
  maxDate: Date | null;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'update:modelValue': [date: Date];
  'date-select': [date: Date];
  'month-change': [date: Date];
}>();

const selectedDate = computed({
  get: () => props.modelValue,
  set: (value) => {
    if (value) {
      emit('update:modelValue', value);
      emit('date-select', value);
    }
  }
});

const menuRef = ref<InstanceType<typeof Menu> | null>(null);

const menuItems = ref([
  {
    label: 'Добавить time-off',
    icon: 'pi pi-plus-circle',
    command: () => {
      console.log('[MOCK] Add time-off for', formatDateLocal(selectedDate.value));
    }
  },
  {
    label: 'Изменить рабочие часы',
    icon: 'pi pi-clock',
    command: () => {
      console.log('[MOCK] Edit working hours');
    }
  }
]);

const toggleMenu = (event: Event) => {
  menuRef.value?.toggle(event);
};

// Get set of dates that have bookings (only future/present, not past)
const datesWithBookings = computed(() => {
  const dates = new Set<string>();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  props.bookings.forEach(booking => {
    const date = new Date(booking.startTime);
    // Only show dots for today or future dates
    const bookingDateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    if (bookingDateOnly >= today) {
      const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
      dates.add(key);
    }
  });
  return dates;
});

// Check if a specific date has bookings
const hasBookingsOnDate = (year: number, month: number, day: number): boolean => {
  // month is 0-based in JavaScript Date (matches calendar component)
  const key = `${year}-${month}-${day}`;
  return datesWithBookings.value.has(key);
};

// Force re-render counter for calendar when bookings change
const calendarKey = ref(0);

// Watch for bookings changes and force calendar re-render
watch(() => props.bookings, () => {
  calendarKey.value++;
}, { deep: true });

const minDate = computed(() => {
  return new Date();
});

const handleDateSelect = (date: Date) => {
  emit('date-select', date);
};

const handleMonthChange = (event: { month: number; year: number }) => {
  const newDate = new Date(event.year, event.month, 1);
  emit('month-change', newDate);
};
</script>

<template>
  <div class="admin-calendar-container">
    <div class="calendar-header">
      <h2 class="calendar-title">Календарь бронирований</h2>
      <div class="calendar-actions">
        <Button 
          label="Изменить" 
          icon="pi pi-pencil" 
          severity="secondary" 
          text 
          size="small"
          @click="toggleMenu"
        />
        <Menu ref="menuRef" :model="menuItems" popup />
      </div>
    </div>
    
    <Calendar
      :key="calendarKey"
      v-model="selectedDate"
      inline
      showOtherMonths
      :min-date="minDate"
      :max-date="maxDate || undefined"
      @date-select="handleDateSelect"
      @month-change="handleMonthChange"
      class="admin-calendar"
    >
      <template #date="{ date }">
        <span 
          class="calendar-date" 
          :class="{ 'has-booking': hasBookingsOnDate(date.year, date.month, date.day) }"
        >
          {{ date.day }}
          <span 
            v-if="hasBookingsOnDate(date.year, date.month, date.day)" 
            class="booking-indicator"
          ></span>
        </span>
      </template>
    </Calendar>
    
    <div class="calendar-legend">
      <div class="legend-item">
        <span class="legend-dot has-bookings"></span>
        <span class="legend-label">Есть бронирования</span>
      </div>
      <div class="legend-item">
        <span class="legend-dot disabled"></span>
        <span class="legend-label">Недоступно</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.admin-calendar-container {
  background: var(--surface-card);
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.calendar-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--surface-900);
}

.calendar-actions {
  display: flex;
  gap: 0.5rem;
}

.admin-calendar {
  width: 100%;
}

.admin-calendar :deep(.p-calendar) {
  width: 100%;
}

.admin-calendar :deep(.p-datepicker) {
  border: none;
  background: transparent;
  width: 100%;
}

.admin-calendar :deep(.p-datepicker-header) {
  background: transparent;
  border: none;
  padding: 0 0 1rem 0;
  margin-bottom: 0.5rem;
  border-bottom: 1px solid var(--surface-border);
}

.admin-calendar :deep(.p-datepicker-title) {
  font-weight: 600;
  font-size: 1rem;
  color: var(--surface-900);
}

.admin-calendar :deep(.p-datepicker-calendar) {
  width: 100%;
}

.admin-calendar :deep(.p-datepicker-calendar th) {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--surface-500);
  text-transform: uppercase;
  padding: 0.5rem;
}

.admin-calendar :deep(.p-datepicker-calendar td) {
  padding: 0.125rem;
}

.admin-calendar :deep(.p-datepicker-calendar td > span) {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  transition: all 0.2s ease;
  position: relative;
}

.admin-calendar :deep(.p-datepicker-calendar td > span:hover) {
  background: var(--surface-100);
}

.admin-calendar :deep(.p-datepicker-calendar td.p-highlight > span) {
  background: var(--primary-color);
  color: white;
  font-weight: 600;
}

/* Custom calendar date styling */
.admin-calendar :deep(.p-datepicker-calendar td > span) {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0.25rem 0;
}

.calendar-date {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

/* Booking indicator dot */
.booking-indicator {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--primary-color);
  margin-top: 2px;
}

/* Day with booking - highlighted */
.admin-calendar :deep(.p-datepicker-calendar td:has(.has-booking) > span) {
  background: var(--primary-100);
  color: var(--primary-700);
  font-weight: 600;
}

/* Selected day with booking */
.admin-calendar :deep(.p-datepicker-calendar td.p-highlight:has(.has-booking) > span) {
  background: var(--primary-color);
  color: white;
}

.admin-calendar :deep(.p-datepicker-calendar td.p-highlight:has(.has-booking) .booking-indicator) {
  background: white;
}

/* Disabled days styling */
.admin-calendar :deep(.p-datepicker-calendar td.p-disabled > span) {
  color: var(--surface-300);
  cursor: not-allowed;
}

/* Legend */
.calendar-legend {
  display: flex;
  gap: 1.5rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--surface-border);
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.legend-dot {
  width: 0.75rem;
  height: 0.75rem;
  border-radius: 50%;
}

.legend-dot.has-bookings {
  background: var(--primary-100);
  border: 2px solid var(--primary-500);
}

.legend-dot.disabled {
  background: var(--surface-200);
}

.legend-label {
  font-size: 0.875rem;
  color: var(--surface-600);
}

@media (max-width: 768px) {
  .admin-calendar-container {
    padding: 1rem;
  }
  
  .calendar-legend {
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style>
