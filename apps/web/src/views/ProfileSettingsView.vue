<script setup lang="ts">
import { ref, onMounted } from "vue";
import Toast from "primevue/toast";
import { useToast } from "primevue/usetoast";
import OwnerProfileForm from "../components/admin/OwnerProfileForm.vue";
import WorkingHoursEditor from "../components/admin/WorkingHoursEditor.vue";
import {
  useAdminOwner,
  useAdminWorkingHours,
} from "../composables/useAdminDashboard";
import type { Owner, DayOfWeek } from "../types/admin";

const toast = useToast();

const {
  owner,
  isLoading: ownerLoading,
  fetchOwner,
  updateOwner,
} = useAdminOwner();
const {
  workingHours,
  isLoading: workingHoursLoading,
  fetchWorkingHours,
  replaceWorkingHours,
} = useAdminWorkingHours();

const isSavingProfile = ref(false);
const isSavingHours = ref(false);

// Load data on mount
onMounted(async () => {
  await Promise.all([fetchOwner(), fetchWorkingHours()]);
});

const handleProfileSave = async (data: Partial<Owner>) => {
  isSavingProfile.value = true;
  try {
    await updateOwner(data);
    toast.add({
      severity: "success",
      summary: "Успешно",
      detail: "Профиль сохранен",
      life: 3000,
    });
  } catch (error) {
    toast.add({
      severity: "error",
      summary: "Ошибка",
      detail:
        error instanceof Error
          ? error.message
          : "Ошибка при сохранении профиля",
      life: 3000,
    });
  } finally {
    isSavingProfile.value = false;
  }
};

const handleHoursSave = async (
  updates: { weekday: DayOfWeek; startTime: string; endTime: string }[],
) => {
  isSavingHours.value = true;
  try {
    await replaceWorkingHours(updates);

    toast.add({
      severity: "success",
      summary: "Успешно",
      detail: "Рабочие часы сохранены",
      life: 3000,
    });
  } catch (error) {
    toast.add({
      severity: "error",
      summary: "Ошибка",
      detail:
        error instanceof Error
          ? error.message
          : "Ошибка при сохранении рабочих часов",
      life: 3000,
    });
  } finally {
    isSavingHours.value = false;
  }
};
</script>

<template>
  <div class="profile-settings-view">
    <Toast />

    <div class="page-container">
      <!-- Page Header -->
      <div class="page-header">
        <h1 class="page-title">Редактирование профиля</h1>
        <p class="page-subtitle">
          Управляйте основными данными и рабочим расписанием
        </p>
      </div>

      <!-- Two Column Layout -->
      <div class="layout-grid">
        <!-- Left Column: Profile Form -->
        <div class="column left-column">
          <div class="card">
            <OwnerProfileForm
              :owner="owner"
              :is-loading="ownerLoading"
              @save="handleProfileSave"
            />
          </div>
        </div>

        <!-- Right Column: Working Hours -->
        <div class="column right-column">
          <div class="card">
            <WorkingHoursEditor
              :working-hours="workingHours"
              :is-loading="workingHoursLoading"
              @save="handleHoursSave"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.profile-settings-view {
  min-height: 100vh;
  background-color: var(--surface-ground);
  padding: 1.5rem;
}

.page-container {
  max-width: 90rem;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 2rem;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-color);
  margin-bottom: 0.5rem;
}

.page-subtitle {
  font-size: 1rem;
  color: var(--text-color-secondary);
  margin-top: 0.5rem;
}

.layout-grid {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 2rem;
}

.column {
  display: flex;
  flex-direction: column;
}

.card {
  background: var(--surface-card);
  border-radius: 0.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  padding: 1.5rem;
}

/* Responsive adjustments */
@media (max-width: 1024px) {
  .layout-grid {
    grid-template-columns: 1fr;
  }

  .page-header {
    margin-bottom: 1.5rem;
  }

  .page-title {
    font-size: 1.75rem;
  }
}

@media (max-width: 640px) {
  .profile-settings-view {
    padding: 1rem;
  }

  .page-container {
    max-width: 100%;
  }

  .page-title {
    font-size: 1.5rem;
  }

  .page-subtitle {
    font-size: 0.875rem;
  }

  .card {
    padding: 1rem;
  }
}
</style>
