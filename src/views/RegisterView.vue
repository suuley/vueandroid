<script setup>
import { ref } from 'vue'
import { saveVehicle, getVehicle } from '../db.js'

const licensePlate = ref('')
const ownerName = ref('')
const payment = ref('')
const imageBase64 = ref('')
const previewUrl = ref('')
const submitting = ref(false)
const error = ref('')
const savedVehicle = ref(null)

const onFileChange = (e) => {
  const file = e.target.files[0]
  if (!file) { imageBase64.value = ''; previewUrl.value = ''; return }
  previewUrl.value = URL.createObjectURL(file)
  const reader = new FileReader()
  reader.onload = () => { imageBase64.value = reader.result }
  reader.readAsDataURL(file)
}

const handleSubmit = async (e) => {
  e.preventDefault()
  const plate = licensePlate.value.trim().toUpperCase()
  if (!plate || !ownerName.value.trim()) return

  submitting.value = true
  error.value = ''
  savedVehicle.value = null

  try {
    const existing = await getVehicle(plate)
    if (existing) {
      error.value = 'License plate already registered'
    } else {
      const vehicle = {
        licensePlate: plate,
        ownerName: ownerName.value.trim(),
        vehicleType: 'Rickshaw',
        image: imageBase64.value,
        payment: parseFloat(payment.value) || 0,
        registrationDate: new Date().toISOString()
      }
      await saveVehicle(vehicle)
      savedVehicle.value = vehicle
      licensePlate.value = ''
      ownerName.value = ''
      payment.value = ''
      imageBase64.value = ''
      previewUrl.value = ''
    }
  } catch (err) {
    error.value = 'Could not save: ' + err.message
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <main class="container">
    <header>
      <div class="logo">🛺</div>
      <h1>Register a Rickshaw</h1>
      <p class="rate">Image preview shows <strong>before</strong> saving — what you see is what gets stored</p>
    </header>

    <form class="reg-form" @submit="handleSubmit">
      <div class="field">
        <label>License plate *</label>
        <input v-model="licensePlate" type="text" placeholder="e.g. RK-5678" required>
      </div>
      <div class="field">
        <label>Owner name *</label>
        <input v-model="ownerName" type="text" placeholder="e.g. John Kamau" required>
      </div>
      <div class="field">
        <label>Initial payment ($, optional)</label>
        <input v-model="payment" type="number" min="0" step="0.01" placeholder="0">
      </div>
      <div class="field">
        <label>Vehicle image</label>
        <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" @change="onFileChange">
        <div v-if="previewUrl" class="preview">
          <img :src="previewUrl" alt="Preview of selected image">
          <span class="preview-label">Preview — this exact image will be stored</span>
        </div>
      </div>
      <button type="submit" :disabled="submitting">
        {{ submitting ? 'Registering…' : 'Register Rickshaw' }}
      </button>
    </form>

    <p v-if="error" class="message">{{ error }}</p>

    <section v-if="savedVehicle" class="card success">
      <div class="card-img"><img :src="savedVehicle.image" alt="Saved vehicle image"></div>
      <div class="card-body">
        <h2>✅ Registered & saved</h2>
        <div class="row"><span class="label">Plate</span><span>{{ savedVehicle.licensePlate }}</span></div>
        <div class="row"><span class="label">Owner</span><span>{{ savedVehicle.ownerName }}</span></div>
        <router-link class="btn-link" :to="{ path: '/', query: { plate: savedVehicle.licensePlate } }">
          View live charge →
        </router-link>
      </div>
    </section>
  </main>
</template>

<style>
.reg-form { background: #fff; border-radius: 14px; padding: 20px; box-shadow: 0 4px 14px rgba(0,0,0,.08); margin-top: 24px; }
.field { margin-bottom: 16px; }
.field label { display: block; font-size: 14px; font-weight: 600; color: #4b5563; margin-bottom: 6px; }
.field input[type="text"], .field input[type="number"] { width: 100%; padding: 12px 14px; font-size: 15px; border: 2px solid #d1d5db; border-radius: 10px; outline: none; }
.field input[type="text"]:focus, .field input[type="number"]:focus { border-color: #f59e0b; }
.field input[type="file"] { font-size: 14px; color: #4b5563; }
.preview { margin-top: 12px; }
.preview img { width: 260px; height: 200px; object-fit: cover; border-radius: 10px; border: 2px dashed #f59e0b; }
.preview-label { display: block; font-size: 12px; color: #6b7280; margin-top: 4px; }
.reg-form button { width: 100%; padding: 14px; font-size: 16px; font-weight: 600; border: none; border-radius: 10px; background: #16a34a; color: #fff; cursor: pointer; }
.reg-form button:hover:not(:disabled) { background: #15803d; }
.reg-form button:disabled { opacity: .6; cursor: not-allowed; }
.success { border: 2px solid #16a34a; }
.success h2 { font-size: 18px; margin-bottom: 10px; color: #16a34a; }
.btn-link { display: inline-block; margin-top: 14px; padding: 10px 16px; background: #f59e0b; color: #fff; border-radius: 10px; text-decoration: none; font-weight: 600; }
</style>