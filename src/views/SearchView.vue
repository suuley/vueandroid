<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { getVehicle, currentCharge } from '../db.js'

const route = useRoute()
const plateInput = ref('')
const vehicle = ref(null)
const message = ref('')
const now = ref(Date.now())

let ticker = null
onMounted(() => {
  ticker = setInterval(() => { now.value = Date.now() }, 1000)
  // auto-search when arriving via "View" links
  if (route.query.plate) {
    plateInput.value = String(route.query.plate)
    doSearch(plateInput.value)
  }
})
onUnmounted(() => clearInterval(ticker))

const charge  = computed(() => currentCharge(vehicle.value, now.value))
const balance = computed(() => charge.value - (vehicle.value ? vehicle.value.payment : 0))
const nextTickIn = computed(() => {
  if (!vehicle.value) return 0
  const secs = Math.floor((now.value - new Date(vehicle.value.registrationDate).getTime()) / 1000)
  return 60 - (secs % 60)
})

const formatMoney = (n) => '$' + Number(n || 0).toFixed(2)

const getPlaceholder = () => {
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="260" height="200"><rect width="100%" height="100%" fill="#e5e7eb"/><text x="50%" y="50%" font-size="60" text-anchor="middle" dominant-baseline="middle">🛺</text></svg>'
  )
}

async function doSearch(plate) {
  const v = await getVehicle(plate)
  if (!v) {
    vehicle.value = null
    message.value = 'No rickshaw found with plate "' + plate + '"'
  } else {
    message.value = ''
    vehicle.value = v
  }
}

async function handleSearch(e) {
  e.preventDefault()
  const plate = plateInput.value.trim().toUpperCase()
  if (!plate) return
  plateInput.value = plate
  await doSearch(plate)
}
</script>

<template>
  <main class="container">
    <header>
      <div class="logo">🛺</div>
      <h1>Rickshaw Registry</h1>
      <p class="rate">Viewing rate: <strong>$5.00 / minute</strong> — charged live from registration time</p>
    </header>

    <form class="search-bar" @submit="handleSearch">
      <input v-model="plateInput" type="text" placeholder="Enter license plate, e.g. RK-1234" autocomplete="off" required>
      <button type="submit">Search</button>
    </form>

    <p v-if="message" class="message">{{ message }}</p>

    <section v-if="vehicle" class="card">
      <div class="card-img">
        <img :src="vehicle.image || getPlaceholder()" alt="Vehicle image">
      </div>
      <div class="card-body">
        <div class="row"><span class="label">Owner</span><span>{{ vehicle.ownerName }}</span></div>
        <div class="row"><span class="label">License plate</span><span>{{ vehicle.licensePlate }}</span></div>
        <div class="row"><span class="label">Vehicle</span><span>{{ vehicle.vehicleType }}</span></div>
        <div class="row"><span class="label">Registered</span><span>{{ new Date(vehicle.registrationDate).toLocaleString() }}</span></div>

        <div class="money">
          <div class="money-box charge"><span class="money-label">TOTAL CHARGE</span><span>{{ formatMoney(charge) }}</span></div>
          <div class="money-box payment"><span class="money-label">PAYMENT</span><span>{{ formatMoney(vehicle.payment) }}</span></div>
          <div class="money-box balance"><span class="money-label">BALANCE</span><span :class="balance > 0 ? 'owed' : 'credit'">{{ formatMoney(balance) }}</span></div>
        </div>

        <p class="live"><span class="dot"></span> LIVE — next $5 in {{ nextTickIn }}s</p>
      </div>
    </section>
  </main>
</template>

<style>
.search-bar { display: flex; gap: 8px; }
.search-bar input { flex: 1; padding: 14px 16px; font-size: 16px; border: 2px solid #d1d5db; border-radius: 10px; outline: none; text-transform: uppercase; }
.search-bar input:focus { border-color: #f59e0b; }
.search-bar button { padding: 14px 26px; font-size: 16px; font-weight: 600; border: none; border-radius: 10px; background: #f59e0b; color: #fff; cursor: pointer; }
.search-bar button:hover { background: #d97706; }
.card { display: flex; gap: 20px; margin-top: 24px; background: #fff; border-radius: 14px; padding: 20px; box-shadow: 0 4px 14px rgba(0,0,0,.08); flex-wrap: wrap; }
.card-img { flex: 0 0 260px; }
.card-img img { width: 100%; height: 200px; object-fit: cover; border-radius: 10px; background: #e5e7eb; }
.card-body { flex: 1; min-width: 260px; }
.row { display: flex; justify-content: space-between; padding: 7px 0; border-bottom: 1px solid #f3f4f6; }
.label { color: #6b7280; }
.money { display: flex; gap: 10px; margin-top: 16px; flex-wrap: wrap; }
.money-box { flex: 1; min-width: 130px; border-radius: 10px; padding: 12px; text-align: center; }
.money-box span:last-child { display: block; font-size: 22px; font-weight: 700; margin-top: 4px; }
.money-label { font-size: 12px; color: #6b7280; }
.charge { background: #fef3c7; }
.payment { background: #dbeafe; }
.balance { background: #f3f4f6; }
.owed { color: #dc2626; }
.credit { color: #16a34a; }
.live { margin-top: 14px; font-size: 13px; color: #6b7280; display: flex; align-items: center; gap: 6px; }
.dot { width: 9px; height: 9px; background: #22c55e; border-radius: 50%; animation: pulse 1.2s infinite; }
@keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: .3; } }
</style>