<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import Button from 'primevue/button';
import type { Booking } from '../types/admin';
import { 
  useAdminBookings, 
  useAdminOwner, 
  useAdminTimeOffs,
  useBookingStats,
  toUTCDateString,
  toUTCEndOfDayString,
  formatDateLocal 
} from '../composables/useAdminDashboard';
import BookingStatsCards from '../components/admin/BookingStatsCards.vue';
import BookingTable from '../components/admin/BookingTable.vue';
import AdminCalendar from '../components/admin/AdminCalendar.vue';
import ConfirmDialog from '../components/admin/ConfirmDialog.vue';

// Reactive state
const selectedDate = ref(new Date());
const currentMonth = ref(new Date());

// Confirmation dialog state
const showConfirmDialog = ref(false);
const bookingToCancel = ref<Booking | null>(null);

// Two separate composable instances - one for stats (current month), one for calendar/table (selected month)
const { 
  bookings: statsBookings, 
  fetchBookings: fetchStatsBookings, 
  deleteBooking: deleteStatsBooking 
} = useAdminBookings();

const { 
  bookings: monthBookings, 
  isLoading: loadingMonthBookings, 
  fetchBookings: fetchMonthBookings, 
  deleteBooking: deleteMonthBooking 
} = useAdminBookings();

const { 
  owner, 
  fetchOwner, 
  maxBookingDate 
} = useAdminOwner();
const { 
  fetchTimeOffs 
} = useAdminTimeOffs();
const { calculateStats } = useBookingStats();

// Stats calculated from current month bookings - doesn't change with calendar month selection
const stats = computed(() => calculateStats(statsBookings.value));

const tableTitle = computed(() => {
  const today = new Date();
  if (isSameDay(selectedDate.value, today)) {
    return 'Бронирования на сегодня';
  }
  return `Бронирования на ${formatDateLocal(selectedDate.value)}`;
});

// Filter bookings for the selected date from month bookings
const displayedBookings = computed(() => {
  return filterBookingsByDate(monthBookings.value, selectedDate.value);
});

const isTableLoading = computed(() => {
  return loadingMonthBookings.value;
});

// Helpers
const isSameDay = (date1: Date, date2: Date): boolean => {
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate();
};

const filterBookingsByDate = (bookings: Booking[], date: Date): Booking[] => {
  return bookings.filter(booking => {
    const bookingDate = new Date(booking.startTime);
    return isSameDay(bookingDate, date);
  });
};

// Get month date range
const getMonthDateRange = (date: Date): { dateFrom: string; dateTo: string } => {
  const year = date.getFullYear();
  const month = date.getMonth();
  
  // First day of month
  const firstDay = new Date(year, month, 1);
  // Last day of month
  const lastDay = new Date(year, month + 1, 0);
  
  return {
    dateFrom: toUTCDateString(firstDay),
    dateTo: toUTCEndOfDayString(lastDay)
  };
};

// Load bookings for a specific month (for calendar/table)
const loadBookingsForMonth = async (date: Date) => {
  const { dateFrom, dateTo } = getMonthDateRange(date);
  await fetchMonthBookings({ dateFrom, dateTo });
};

// Load current month bookings for stats (loaded once on mount, never changes with calendar navigation)
const loadStatsBookings = async () => {
  const now = new Date();
  const { dateFrom, dateTo } = getMonthDateRange(now);
  await fetchStatsBookings({ dateFrom, dateTo });
};

// Load data on mount
onMounted(async () => {
  await Promise.all([
    fetchOwner(),
    fetchTimeOffs()
  ]);
  
  // Load current month bookings for stats (fixed, doesn't change with calendar month selection)
  await loadStatsBookings();
  
  // Load bookings for calendar month (for calendar and table)
  await loadBookingsForMonth(currentMonth.value);
});

// Handlers
const handleEditProfile = () => {
  console.log('[MOCK] Edit profile clicked');
};

const handleMonthChange = async (newMonthDate: Date) => {
  currentMonth.value = newMonthDate;
  await loadBookingsForMonth(newMonthDate);
};

const handleCancelBooking = (bookingId: string) => {
  const booking = displayedBookings.value.find(b => b.id === bookingId);
  if (booking) {
    bookingToCancel.value = booking;
    showConfirmDialog.value = true;
  }
};

const confirmCancelBooking = async () => {
  if (bookingToCancel.value) {
    const today = new Date();
    const isCurrentMonthBooking = new Date(bookingToCancel.value.startTime).getMonth() === today.getMonth() &&
                                   new Date(bookingToCancel.value.startTime).getFullYear() === today.getFullYear();
    
    // Delete from month view
    await deleteMonthBooking(bookingToCancel.value.id);
    
    // If it's current month, also delete from stats
    if (isCurrentMonthBooking) {
      await deleteStatsBooking(bookingToCancel.value.id);
      // Refresh stats
      await loadStatsBookings();
    }
    
    // Refresh current calendar month
    await loadBookingsForMonth(currentMonth.value);
    
    bookingToCancel.value = null;
  }
};
</script>

<template>
  <div class="admin-view">
    <div class="admin-container">
      <!-- Header -->
      <div class="admin-header">
        <div class="header-title-section">
          <h1 class="admin-title">Панель управления</h1>
          <p v-if="owner" class="admin-subtitle">
            {{ owner.name }}
          </p>
        </div>
        <Button
          label="Редактировать профиль"
          icon="pi pi-user-edit"
          severity="secondary"
          class="edit-profile-btn"
          @click="handleEditProfile"
        />
      </div>

      <!-- Stats Cards -->
      <BookingStatsCards :stats="stats" />

      <!-- Main Content Grid -->
      <div class="dashboard-grid">
        <!-- Booking Table -->
        <div class="table-section">
          <BookingTable
            :bookings="displayedBookings"
            :title="tableTitle"
            :is-loading="isTableLoading"
            @cancel="handleCancelBooking"
          />
        </div>

        <!-- Calendar Section -->
        <div class="calendar-section">
          <AdminCalendar
            v-model="selectedDate"
            :bookings="monthBookings"
            :owner="owner"
            :max-date="maxBookingDate"
            @month-change="handleMonthChange"
          />
        </div>
      </div>
    </div>

    <!-- Confirm Cancel Dialog -->
    <ConfirmDialog
      v-model:visible="showConfirmDialog"
      :booking-info="bookingToCancel ? {
        guestName: bookingToCancel.guest.name,
        startTime: formatDateLocal(new Date(bookingToCancel.startTime))
      } : undefined"
      @confirm="confirmCancelBooking"
    />
  </div>
</template>

<style scoped>
.admin-view {
  min-height: calc(100vh - 73px);
  background: linear-gradient(
    135deg,
    var(--surface-50) 0%,
    var(--surface-100) 100%
  );
  padding: 2rem 1.5rem;
}

.admin-container {
  max-width: 1400px;
  margin: 0 auto;
}

.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.header-title-section {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.admin-title {
  margin: 0;
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--surface-900);
}

.admin-subtitle {
  margin: 0;
  font-size: 1rem;
  color: var(--surface-600);
}

.edit-profile-btn {
  border-radius: 0.75rem;
  font-weight: 500;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1.5rem;
  align-items: start;
}

.table-section {
  min-width: 0;
}

.calendar-section {
  min-width: 0;
}

@media (max-width: 1024px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
  
  .calendar-section {
    max-width: 400px;
    margin: 0 auto;
  }
}

@media (max-width: 768px) {
  .admin-view {
    padding: 1rem;
  }
  
  .admin-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .edit-profile-btn {
    width: 100%;
    justify-content: center;
  }
  
  .admin-title {
    font-size: 1.5rem;
  }
  
  .dashboard-grid {
    gap: 1rem;
  }
}
</style>
