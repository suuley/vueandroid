<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { getAllVehicles, getVehicle, saveVehicle, deleteVehicle, currentCharge } from '../db.js'

const vehicles = ref([])
const now = ref(Date.now())
let ticker = null
onMounted(() => { load(); ticker = setInterval(() => { now.value = Date.now() }, 1000) })
onUnmounted(() => clearInterval(ticker))

async function load() {
  vehicles.value = await getAllVehicles()
}

const chargeOf  = (v) => currentCharge(v, now.value)
const balanceOf = (v) => chargeOf(v) - (v.payment || 0)
const formatMoney = (n) => '$' + Number(n || 0).toFixed(2)

const getPlaceholder = () => 'data:image/svg+xml;utf8,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="48"><rect width="100%" height="100%" fill="#e5e7eb"/><text x="50%" y="50%" font-size="24" text-anchor="middle" dominant-baseline="middle">🛺</text></svg>')

/* register form above the table */
const reg = ref({ licensePlate: '', ownerName: '', payment: '', image: '' })
const previewUrl = ref('')
const regError = ref('')
const regOk = ref('')

function onFileChange(e) {
  const file = e.target.files[0]
  if (!file) { reg.value.image = ''; previewUrl.value = ''; return }
  previewUrl.value = URL.createObjectURL(file)
  const reader = new FileReader()
  reader.onload = () => { reg.value.image = reader.result }
  reader.readAsDataURL(file)
}

async function registerVehicle(e) {
  e.preventDefault()
  regError.value = ''; regOk.value = ''
  const plate = reg.value.licensePlate.trim().toUpperCase()
  if (!plate || !reg.value.ownerName.trim()) { regError.value = 'Plate and owner name are required'; return }
  if (await getVehicle(plate)) { regError.value = 'Plate already registered'; return }
  await saveVehicle({
    licensePlate: plate,
    ownerName: reg.value.ownerName.trim(),
    vehicleType: 'Rickshaw',
    image: reg.value.image,
    payment: parseFloat(reg.value.payment) || 0,
    registrationDate: new Date().toISOString()
  })
  regOk.value = plate + ' registered ✅'
  reg.value = { licensePlate: '', ownerName: '', payment: '', image: '' }
  previewUrl.value = ''
  await load()
}

/* inline pay */
const payingPlate = ref(null)
const payAmount = ref('')
async function submitPay(plate) {
  const amt = parseFloat(payAmount.value)
  if (!amt || amt <= 0) return
  const v = await getVehicle(plate)
  if (!v) return
  v.payment = (v.payment || 0) + amt
  await saveVehicle(v)
  payingPlate.value = null
  payAmount.value = ''
  await load()
}

/* delete */
async function removeVehicle(plate) {
  if (!confirm('Delete ' + plate + '? This cannot be undone.')) return
  await deleteVehicle(plate)
  await load()
}
</script>

<template>
  <main class="container wide">
    <header>
      <div class="logo">🛺</div>
      <h1>Vehicle Dashboard</h1>
      <p class="rate">Register above · pay, delete or view in one place</p>
    </header>

    <form class="reg-inline" @submit="registerVehicle">
      <input v-model="reg.licensePlate" placeholder="Plate e.g. RK-1234" required>
      <input v-model="reg.ownerName" placeholder="Owner name" required>
      <input v-model="reg.payment" type="number" min="0" step="0.01" placeholder="Initial payment ($)">
      <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" @change="onFileChange">
      <button type="submit">➕ Register</button>
    </form>
    <img v-if="previewUrl" :src="previewUrl" class="reg-preview" alt="Image preview">
    <p v-if="regError" class="message">{{ regError }}</p>
    <p v-if="regOk" class="ok">{{ regOk }}</p>

    <div class="table-wrap">
      <table>
        <thead>
          <tr><th>Image</th><th>Plate</th><th>Owner</th><th>Charge</th><th>Payment</th><th>Balance</th><th>Actions</th></tr>
        </thead>
        <tbody>
          <tr v-for="v in vehicles" :key="v.licensePlate">
            <td><img class="thumb" :src="v.image || getPlaceholder()" alt=""></td>
            <td class="plate">{{ v.licensePlate }}</td>
            <td>{{ v.ownerName }}</td>
            <td>{{ formatMoney(chargeOf(v)) }}</td>
            <td>{{ formatMoney(v.payment) }}</td>
            <td :class="balanceOf(v) > 0 ? 'owed' : 'credit'">{{ formatMoney(balanceOf(v)) }}</td>
            <td>
              <div v-if="payingPlate === v.licensePlate" class="pay-inline">
                <input v-model="payAmount" type="number" min="0.01" step="0.01" placeholder="$">
                <button class="btn pay" @click="submitPay(v.licensePlate)">✓</button>
                <button class="btn cancel" @click="payingPlate = null">✕</button>
              </div>
              <div v-else class="row-btns">
                <button class="btn pay" @click="payingPlate = v.licensePlate; payAmount = ''">💳 Pay</button>
                <button class="btn del" @click="removeVehicle(v.licensePlate)">🗑 Delete</button>
                <router-link class="btn view" :to="{ path: '/', query: { plate: v.licensePlate } }">👁 View</router-link>
              </div>
            </td>
          </tr>
          <tr v-if="vehicles.length === 0"><td colspan="7" class="empty">No rickshaws yet — register the first one above.</td></tr>
        </tbody>
      </table>
    </div>
  </main>
</template>

<style>
.container.wide { max-width: 1000px; }
.reg-inline { display: flex; gap: 8px; flex-wrap: wrap; background: #fff; padding: 14px; border-radius: 12px; box-shadow: 0 4px 14px rgba(0,0,0,.08); }
.reg-inline input { padding: 10px 12px; border: 2px solid #d1d5db; border-radius: 8px; font-size: 14px; }
.reg-inline input:focus { border-color: #f59e0b; outline: none; }
.reg-inline button { padding: 10px 18px; border: none; border-radius: 8px; background: #16a34a; color: #fff; font-weight: 600; cursor: pointer; }
.reg-preview { width: 90px; height: 70px; object-fit: cover; border-radius: 8px; margin-top: 10px; border: 2px dashed #f59e0b; }
.ok { margin-top: 10px; color: #16a34a; font-weight: 600; text-align: center; }
.table-wrap { margin-top: 20px; background: #fff; border-radius: 12px; box-shadow: 0 4px 14px rgba(0,0,0,.08); overflow-x: auto; }
table { width: 100%; border-collapse: collapse; font-size: 14px; }
th { text-align: left; padding: 12px 10px; color: #6b7280; font-size: 12px; text-transform: uppercase; border-bottom: 2px solid #f3f4f6; }
td { padding: 10px; border-bottom: 1px solid #f3f4f6; vertical-align: middle; }
.thumb { width: 64px; height: 48px; object-fit: cover; border-radius: 6px; background: #e5e7eb; }
.plate { font-weight: 700; }
.owed { color: #dc2626; font-weight: 700; }
.credit { color: #16a34a; font-weight: 700; }
.empty { text-align: center; color: #6b7280; padding: 24px; }
.row-btns { display: flex; gap: 6px; flex-wrap: wrap; }
.btn { border: none; border-radius: 8px; padding: 7px 10px; font-size: 12px; font-weight: 600; cursor: pointer; text-decoration: none; color: #fff; }
.btn.pay { background: #2563eb; } .btn.del { background: #dc2626; } .btn.view { background: #f59e0b; } .btn.cancel { background: #6b7280; }
.pay-inline { display: flex; gap: 6px; }
.pay-inline input { width: 90px; padding: 6px 8px; border: 2px solid #d1d5db; border-radius: 8px; }
</style>