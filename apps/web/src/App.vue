<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Button from 'primevue/button'
import Card from 'primevue/card'
import InputText from 'primevue/inputtext'

interface Owner {
  description?: string
  workingHours: {
    startTime: string
    endTime: string
    workingDays: string[]
  }
}

interface EventType {
  id: string
  title: string
  durationMinutes: number
}

const owner = ref<Owner | null>(null)
const eventTypes = ref<EventType[]>([])
const loading = ref(true)
const error = ref('')

const fetchPublicData = async () => {
  try {
    const [ownerRes, eventsRes] = await Promise.all([
      fetch('/api/owner'),
      fetch('/api/event-types')
    ])
    
    const ownerData = await ownerRes.json()
    const eventsData = await eventsRes.json()
    
    owner.value = ownerData
    eventTypes.value = eventsData.eventTypes || []
  } catch (e) {
    error.value = 'Failed to load data from API'
    console.error(e)
  } finally {
    loading.value = false
  }
}

onMounted(fetchPublicData)
</script>

<template>
  <div class="container">
    <h1>Calendar Booking</h1>
    
    <div v-if="loading" class="loading">Loading...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    
    <template v-else>
      <Card class="owner-card">
        <template #title>Owner Profile</template>
        <template #content>
          <p v-if="owner?.description">{{ owner.description }}</p>
          <p v-else>No description available</p>
          
          <div v-if="owner?.workingHours" class="working-hours">
            <strong>Working Hours:</strong>
            {{ owner.workingHours.startTime }} - {{ owner.workingHours.endTime }}
            <br>
            <strong>Days:</strong> {{ owner.workingHours.workingDays.join(', ') }}
          </div>
        </template>
      </Card>
      
      <h2>Event Types</h2>
      <div class="event-types">
        <Card v-for="event in eventTypes" :key="event.id" class="event-card">
          <template #title>{{ event.title }}</template>
          <template #subtitle>{{ event.durationMinutes }} minutes</template>
          <template #footer>
            <Button label="Book" icon="pi pi-calendar" />
          </template>
        </Card>
      </div>
    </template>
  </div>
</template>

<style>
.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  font-family: system-ui, sans-serif;
}

.loading, .error {
  text-align: center;
  padding: 2rem;
}

.error {
  color: red;
}

.owner-card, .event-card {
  margin-bottom: 1rem;
}

.working-hours {
  margin-top: 1rem;
  padding: 1rem;
  background: #f5f5f5;
  border-radius: 4px;
}

.event-types {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
}
</style>
