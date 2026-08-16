<script setup>
import { ref } from 'vue'
import { getVehicle, saveVehicle, currentCharge } from '../db.js'

const plate = ref('')
const amount = ref('')
const error = ref('')
const updatedVehicle = ref(null)
const summary = ref(null)

const formatMoney = (n) => '$' + Number(n || 0).toFixed(2)

const handleSubmit = async (e) => {
  e.preventDefault()
  const amt = parseFloat(amount.value)
  const plateUpper = plate.value.trim().toUpperCase()
  if (!plateUpper || !amt || amt <= 0) return

  error.value = ''
  updatedVehicle.value = null

  const v = await getVehicle(plateUpper)
  if (!v) {
    error.value = 'No rickshaw found with plate "' + plateUpper + '"'
    return
  }

  v.payment = (v.payment || 0) + amt
  await saveVehicle(v)

  const charge = currentCharge(v)
  summary.value = { charge, balance: charge - v.payment }
  updatedVehicle.value = v
  amount.value = ''
}
</script>

<template>
  <main class="container">
    <header>
      <div class="logo">💳</div>
      <h1>Post a Payment</h1>
      <p class="rate">Updates the record instantly</p>
    </header>

    <form class="pay-form" @submit="handleSubmit">
      <div class="field">
        <label>License plate *</label>
        <input v-model="plate" type="text" placeholder="e.g. RK-1234" required>
      </div>
      <div class="field">
        <label>Amount ($) *</label>
        <input v-model="amount" type="number" min="0.01" step="0.01" placeholder="e.g. 20" required>
      </div>
      <button type="submit">Post Payment</button>
    </form>

    <p v-if="error" class="message">{{ error }}</p>

    <section v-if="updatedVehicle" class="card success">
      <div class="card-body">
        <h2>✅ Payment recorded</h2>
        <div class="row"><span class="label">Plate</span><span>{{ updatedVehicle.licensePlate }}</span></div>
        <div class="row"><span class="label">Owner</span><span>{{ updatedVehicle.ownerName }}</span></div>
        <div class="money">
          <div class="money-box charge"><span class="money-label">TOTAL CHARGE</span><span>{{ formatMoney(summary.charge) }}</span></div>
          <div class="money-box payment"><span class="money-label">PAYMENT</span><span>{{ formatMoney(updatedVehicle.payment) }}</span></div>
          <div class="money-box balance"><span class="money-label">BALANCE</span><span :class="summary.balance > 0 ? 'owed' : 'credit'">{{ formatMoney(summary.balance) }}</span></div>
        </div>
        <router-link class="btn-link" :to="{ path: '/', query: { plate: updatedVehicle.licensePlate } }">
          View live charge →
        </router-link>
      </div>
    </section>
  </main>
</template>

<style>
.pay-form { background: #fff; border-radius: 14px; padding: 20px; box-shadow: 0 4px 14px rgba(0,0,0,.08); margin-top: 24px; }
.pay-form .field { margin-bottom: 16px; }
.pay-form label { display: block; font-size: 14px; font-weight: 600; color: #4b5563; margin-bottom: 6px; }
.pay-form input { width: 100%; padding: 12px 14px; font-size: 15px; border: 2px solid #d1d5db; border-radius: 10px; outline: none; }
.pay-form input:focus { border-color: #f59e0b; }
.pay-form button { width: 100%; padding: 14px; font-size: 16px; font-weight: 600; border: none; border-radius: 10px; background: #2563eb; color: #fff; cursor: pointer; }
.pay-form button:hover { background: #1d4ed8; }
.success { border: 2px solid #16a34a; }
.success h2 { font-size: 18px; margin-bottom: 10px; color: #16a34a; }
.money { display: flex; gap: 10px; margin-top: 16px; flex-wrap: wrap; }
.money-box { flex: 1; min-width: 130px; border-radius: 10px; padding: 12px; text-align: center; }
.money-box span:last-child { display: block; font-size: 22px; font-weight: 700; margin-top: 4px; }
.money-label { font-size: 12px; color: #6b7280; }
.charge { background: #fef3c7; }
.payment { background: #dbeafe; }
.balance { background: #f3f4f6; }
.owed { color: #dc2626; }
.credit { color: #16a34a; }
.btn-link { display: inline-block; margin-top: 14px; padding: 10px 16px; background: #f59e0b; color: #fff; border-radius: 10px; text-decoration: none; font-weight: 600; }
</style>