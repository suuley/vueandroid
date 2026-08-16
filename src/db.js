// src/db.js — HTTP data layer (talks to your Vercel API)
export const RATE_PER_MINUTE = 5

// After your first deploy, paste your Vercel URL here, e.g. 'https://rickshaw-xyz.vercel.app'
const API = ''   // '' works while the site is hosted on Vercel itself

async function handle(res) {
  if (!res.ok) {
    let msg = 'Server error'
    try { msg = (await res.json()).error || msg } catch (e) {}
    throw new Error(msg)
  }
  return res
}

export async function getVehicle(plate) {
  const res = await fetch(`${API}/api/vehicles/${encodeURIComponent(plate)}`)
  if (res.status === 404) return null
  return (await handle(res)).json()
}

export async function getAllVehicles() {
  return (await handle(await fetch(`${API}/api/vehicles`))).json()
}

// insert OR overwrite (register + payment updates both use this)
export async function saveVehicle(vehicle) {
  const res = await fetch(`${API}/api/vehicles`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(vehicle)
  })
  return (await handle(res)).json()
}

export async function deleteVehicle(plate) {
  const res = await fetch(`${API}/api/vehicles/${encodeURIComponent(plate)}`, { method: 'DELETE' })
  return (await handle(res)).json()
}

// charge derived from time — no cron anywhere
export function currentCharge(vehicle, nowTs = Date.now()) {
  if (!vehicle) return 0
  const mins = Math.floor((nowTs - new Date(vehicle.registrationDate).getTime()) / 60000)
  return Math.max(0, mins) * RATE_PER_MINUTE
}