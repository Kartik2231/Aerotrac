import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { spawn } from 'node:child_process'
import nodemailer from 'nodemailer'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const port = Number(process.env.PORT || 3001)
const isProduction = process.argv.includes('--prod') || process.env.NODE_ENV === 'production'
const dataDir = path.join(__dirname, 'server-data')
const usersFile = path.resolve(process.env.AEROTRAC_DATA_FILE || path.join(dataDir, 'aerotrac.json'))
const sessions = new Map()
const requestBuckets = new Map()
const rateLimit = (request, key, limit = 30, windowMs = 60_000) => {
  const ip = String(request.headers['x-forwarded-for'] || request.socket.remoteAddress || 'unknown').split(',')[0].trim()
  const bucketKey = `${key}:${ip}`
  const now = Date.now()
  const bucket = requestBuckets.get(bucketKey) || { start: now, count: 0 }
  if (now - bucket.start >= windowMs) { bucket.start = now; bucket.count = 0 }
  bucket.count += 1
  requestBuckets.set(bucketKey, bucket)
  return bucket.count <= limit
}

fs.mkdirSync(dataDir, { recursive: true })
fs.mkdirSync(path.dirname(usersFile), { recursive: true })
if (!fs.existsSync(usersFile)) fs.writeFileSync(usersFile, JSON.stringify({ users: [], contacts: [], bookings: [], platforms: [] }, null, 2), { mode: 0o600 })

const readDatabase = () => {
  let parsed
  try { parsed = JSON.parse(fs.readFileSync(usersFile, 'utf8')) } catch { parsed = { users: [], contacts: [], bookings: [], platforms: [] }; writeDatabase(parsed) }
  if (Array.isArray(parsed)) return { users: parsed, contacts: [], bookings: [], platforms: [] }
  return { users: Array.isArray(parsed.users) ? parsed.users : [], contacts: Array.isArray(parsed.contacts) ? parsed.contacts : [], bookings: Array.isArray(parsed.bookings) ? parsed.bookings : [], platforms: Array.isArray(parsed.platforms) ? parsed.platforms : [] }
}
const writeDatabase = (database) => fs.writeFileSync(usersFile, JSON.stringify(database, null, 2), { mode: 0o600 })
const defaultPlatforms = [
  { id: 'TJ-01', name: 'TJ-01 · Tracked Robotic Platform', status: 'AVAILABLE' },
  { id: 'TJ-02', name: 'TJ-02 · Dual-Jet Platform', status: 'AVAILABLE' },
  { id: 'TJ-03', name: 'TJ-03 · Heavy Mobility Platform', status: 'AVAILABLE' },
]
const getPlatforms = (db) => {
  if (db.platforms.length) return db.platforms
  db.platforms = defaultPlatforms
  writeDatabase(db)
  return db.platforms
}
const readUsers = () => readDatabase().users
const writeUsers = (users) => { const db = readDatabase(); db.users = users; writeDatabase(db) }
const normalize = (value) => String(value || '').trim().toLowerCase()
const validEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
const validUsername = (username) => /^[a-zA-Z0-9_.-]{3,32}$/.test(username)
const hashPassword = async (password, salt = crypto.randomBytes(16).toString('hex')) => new Promise((resolve, reject) => {
  crypto.scrypt(password, salt, 64, { N: 16384, r: 8, p: 1 }, (error, derivedKey) => {
    if (error) reject(error)
    else resolve(`${salt}:${derivedKey.toString('hex')}`)
  })
})
const verifyPassword = async (password, stored) => {
  const [salt, key] = stored.split(':')
  if (!salt || !key) return false
  const hashed = await hashPassword(password, salt)
  return crypto.timingSafeEqual(Buffer.from(hashed.split(':')[1], 'hex'), Buffer.from(key, 'hex'))
}
const makeSession = (userId) => {
  const token = crypto.randomBytes(32).toString('base64url')
  sessions.set(token, { userId, expires: Date.now() + 7 * 24 * 60 * 60 * 1000 })
  return token
}
const getSessionUser = (request) => {
  const cookies = request.headers.cookie || ''
  const token = cookies.split(';').map((part) => part.trim()).find((part) => part.startsWith('aerotrac_session='))?.split('=')[1]
  const session = token ? sessions.get(token) : null
  if (!session || session.expires < Date.now()) { if (token) sessions.delete(token); return null }
  const user = readUsers().find((item) => item.id === session.userId)
  return user ? { user, token } : null
}
const sendJson = (response, status, payload, headers = {}) => {
  response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...headers })
  response.end(JSON.stringify(payload))
}
const readBody = (request) => new Promise((resolve, reject) => {
  let body = ''
  request.on('data', (chunk) => { body += chunk; if (body.length > 1e6) request.destroy() })
  request.on('end', () => { try { resolve(JSON.parse(body || '{}')) } catch { reject(new Error('Invalid JSON.')) } })
  request.on('error', reject)
})

async function handleApi(request, response) {
  const url = new URL(request.url, `http://${request.headers.host || 'localhost'}`)
  if (request.method === 'GET' && url.pathname === '/api/platform') {
    const session = getSessionUser(request)
    if (!session) return sendJson(response, 401, { message: 'Authentication required to access the AEROTRAC platform.' })
    return sendJson(response, 200, {
      database: 'AEROTRAC',
      platform: { id: 'TJ-01', name: 'Tracked Robotic Platform', status: 'ONLINE' },
      metrics: { range: '2.4 KM', pressure: '18.6 BAR', efficiency: '94.8%', deployments: '03' },
      modules: ['Tracked mobility', 'Dual-jet delivery', 'Telemetry link', 'Control core']
    })
  }
  if (request.method === 'GET' && url.pathname === '/api/platform/booking-context') {
    const session = getSessionUser(request)
    if (!session) return sendJson(response, 401, { message: 'Session Link Unavailable – Please Retry' })
    const db = readDatabase()
    return sendJson(response, 200, {
      user: { id: session.user.id, username: session.user.username, email: session.user.email },
      platforms: getPlatforms(db).filter((item) => item.status !== 'OFFLINE'),
    })
  }
  if (request.method === 'GET' && url.pathname === '/api/platform/dashboard') {
    const session = getSessionUser(request)
    if (!session) return sendJson(response, 401, { message: 'Authentication required to access the platform dashboard.' })
    const db = readDatabase()
    const platforms = getPlatforms(db)
    const userBookings = db.bookings.filter((item) => item.userId === session.user.id).sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))
    const booking = userBookings[0] || null
    const upcomingBookings = db.bookings
      .filter((item) => ['PENDING', 'BOOKED'].includes(item.status))
      .sort((a, b) => `${a.date} ${a.timeSlot}`.localeCompare(`${b.date} ${b.timeSlot}`))
      .map((item) => ({ id: item.id, platformId: item.platformId, platformName: item.platformName, userId: item.userId, username: item.username, date: item.date, timeSlot: item.timeSlot, status: item.status }))
    return sendJson(response, 200, {
      user: { id: session.user.id, username: session.user.username, email: session.user.email },
      booking,
      status: booking?.status || 'NOT_BOOKED',
      upcomingBookings,
      platforms,
      plans: [
        { id: 'monthly', name: 'Monthly', termMonths: 1, amount: 125000 },
        { id: 'six-month', name: '6 Month', termMonths: 6, amount: 675000 },
        { id: 'annual', name: '1 Year', termMonths: 12, amount: 1200000 },
        { id: 'two-year', name: '2 Year', termMonths: 24, amount: 2280000 },
        { id: 'three-year', name: '3 Year', termMonths: 36, amount: 3240000 },
      ],
    })
  }

  if (request.method === 'GET' && url.pathname === '/api/notifications') {
    const session = getSessionUser(request)
    if (!session) return sendJson(response, 401, { message: 'Authentication required to view notifications.' })
    const db = readDatabase()
    const notifications = db.bookings
      .filter((item) => item.userId === session.user.id)
      .sort((a, b) => String(b.updatedAt || b.createdAt).localeCompare(String(a.updatedAt || a.createdAt)))
      .flatMap((booking) => {
        const items = [{
          id: `${booking.id}-created`,
          type: 'BOOKING',
          title: booking.status === 'BOOKED' ? 'Platform booked' : 'Platform request received',
          message: `${booking.planName} · ${booking.termMonths} months · ₹${Number(booking.amount).toLocaleString('en-IN')}`,
          createdAt: booking.updatedAt || booking.createdAt,
          status: booking.status,
          bookingId: booking.id,
        }]
        if (booking.paymentStatus && booking.paymentStatus !== 'PENDING') {
          items.push({
            id: `${booking.id}-payment`,
            type: 'PAYMENT',
            title: booking.paymentStatus === 'PAID' ? 'Payment confirmed' : 'Payment submitted',
            message: `₹${Number(booking.amount).toLocaleString('en-IN')} · ${booking.planName} · ${booking.paymentMethod || 'PAYMENT'}`,
            createdAt: booking.paidAt || booking.updatedAt || booking.createdAt,
            status: booking.paymentStatus,
            bookingId: booking.id,
          })
        }
        return items
      })
    return sendJson(response, 200, { notifications })
  }

  if (request.method === 'POST' && url.pathname === '/api/platform/payment/confirm') {
    const session = getSessionUser(request)
    if (!session) return sendJson(response, 401, { message: 'Please login or register before making a payment.' })
    try {
      const body = await readBody(request)
      const plans = {
        monthly: { name: 'Monthly', termMonths: 1, amount: 125000 },
        'six-month': { name: '6 Month', termMonths: 6, amount: 675000 },
        annual: { name: '1 Year', termMonths: 12, amount: 1200000 },
        'two-year': { name: '2 Year', termMonths: 24, amount: 2280000 },
        'three-year': { name: '3 Year', termMonths: 36, amount: 3240000 },
      }
      const selected = plans[String(body.id || '')]
      if (!selected) return sendJson(response, 400, { message: 'Select a valid AEROTRAC platform plan.' })
      const db = readDatabase()
      const booking = db.bookings.find((item) => item.id === String(body.bookingId || '') && item.userId === session.user.id)
      if (!booking) return sendJson(response, 404, { message: 'Booking session not found. Please retry.' })
      if (booking.planId !== body.id) return sendJson(response, 400, { message: 'Selected payment plan does not match this booking.' })
      if (booking.status === 'BOOKED') return sendJson(response, 409, { message: 'Platform is already booked.' })
      booking.status = 'PENDING'
      booking.paymentStatus = 'AWAITING_CONFIRMATION'
      const paymentMethod = String(body.paymentMethod || 'UPI').toUpperCase()
      if (!['UPI', 'CARD', 'NETBANKING', 'BANK_TRANSFER'].includes(paymentMethod)) return sendJson(response, 400, { message: 'Select a valid payment method.' })
      booking.paymentMethod = paymentMethod
      booking.paymentVpa = process.env.AEROTRAC_PAYMENT_UPI || 'kk3961230@okicici'
      booking.updatedAt = new Date().toISOString()
      writeDatabase(db)
      return sendJson(response, 200, { booking, status: booking.status })
    } catch (error) {
      return sendJson(response, 400, { message: error.message || 'Unable to submit payment confirmation.' })
    }
  }

  if (request.method === 'POST' && url.pathname === '/api/platform/book') {
    const session = getSessionUser(request)
    if (!session) return sendJson(response, 401, { message: 'Please login or register before booking a platform.' })
    try {
      const body = await readBody(request)
      const plans = {
        monthly: { name: 'Monthly', termMonths: 1, amount: 125000 },
        'six-month': { name: '6 Month', termMonths: 6, amount: 675000 },
        annual: { name: '1 Year', termMonths: 12, amount: 1200000 },
        'two-year': { name: '2 Year', termMonths: 24, amount: 2280000 },
        'three-year': { name: '3 Year', termMonths: 36, amount: 3240000 },
      }
      const selectedPlan = plans[String(body.planId || '')]
      if (!selectedPlan) return sendJson(response, 400, { message: 'Select a valid payment plan.' })
      const db = readDatabase()
      const platforms = getPlatforms(db)
      const platform = platforms.find((item) => item.id === String(body.platformId || ''))
      if (!platform) return sendJson(response, 400, { message: 'Platform not found. Please retry.' })
      if (platform.status === 'OFFLINE') return sendJson(response, 409, { message: 'Platform Unavailable – Choose Another Slot' })
      const date = String(body.date || '').trim()
      const timeSlot = String(body.timeSlot || '').trim()
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !date || date < new Date().toISOString().slice(0, 10)) return sendJson(response, 400, { message: 'Select a valid future booking date.' })
      const allowedSlots = ['09:00 - 10:00', '10:30 - 11:30', '12:00 - 13:00', '14:00 - 15:00', '16:00 - 17:00', '18:00 - 19:00']
      if (!allowedSlots.includes(timeSlot)) return sendJson(response, 400, { message: 'Select a valid time slot.' })
      const activeUserBooking = db.bookings.find((item) => item.userId === session.user.id && ['PENDING_PAYMENT', 'PENDING', 'BOOKED'].includes(item.status))
      if (activeUserBooking) return sendJson(response, 409, { message: `You already have a ${activeUserBooking.status === 'BOOKED' ? 'booked' : 'pending'} platform request.` })
      const clash = db.bookings.find((item) => item.platformId === platform.id && item.date === date && item.timeSlot === timeSlot && ['PENDING_PAYMENT', 'PENDING', 'BOOKED'].includes(item.status))
      if (clash) return sendJson(response, 409, { message: 'Platform Unavailable – Choose Another Slot', code: 'SLOT_CLASH' })
      const now = new Date().toISOString()
      const booking = {
        id: crypto.randomUUID(), platformId: platform.id, platformName: platform.name,
        userId: session.user.id, username: session.user.username, clientName: session.user.username,
        date, timeSlot, planId: body.planId, planName: selectedPlan.name, termMonths: selectedPlan.termMonths,
        amount: selectedPlan.amount, status: 'PENDING_PAYMENT', paymentStatus: 'NOT_PAID', paymentMethod: null,
        paymentVpa: process.env.AEROTRAC_PAYMENT_UPI || 'kk3961230@okicici', createdAt: now, updatedAt: now, paidAt: null,
      }
      db.bookings.push(booking)
      writeDatabase(db)
      return sendJson(response, 201, { booking })
    } catch (error) {
      return sendJson(response, 400, { message: error.message || 'Session Link Unavailable – Please Retry' })
    }
  }

  if (request.method === 'GET' && url.pathname === '/api/health') {
    return sendJson(response, 200, { ok: true, service: 'AEROTRAC', time: new Date().toISOString(), database: fs.existsSync(usersFile) ? 'READY' : 'UNAVAILABLE' })
  }

  if (request.method === 'GET' && url.pathname === '/api/admin/bookings') {
    const adminPassword = process.env.AEROTRAC_ADMIN_PASSWORD || ''
    const supplied = String(request.headers['x-admin-password'] || '')
    if (!adminPassword || Buffer.byteLength(supplied) !== Buffer.byteLength(adminPassword) || !crypto.timingSafeEqual(Buffer.from(supplied), Buffer.from(adminPassword))) return sendJson(response, 403, { message: 'Admin confirmation is not authorized.' })
    const db = readDatabase()
    return sendJson(response, 200, { bookings: db.bookings, contacts: db.contacts, users: db.users.map(({ id, username, email, createdAt, preferences }) => ({ id, username, email, createdAt, preferences })) })
  }

  if (request.method === 'POST' && url.pathname === '/api/admin/platform/confirm') {
    const adminPassword = process.env.AEROTRAC_ADMIN_PASSWORD || ''
    const supplied = String(request.headers['x-admin-password'] || '')
    if (!adminPassword || Buffer.byteLength(supplied) !== Buffer.byteLength(adminPassword) || !crypto.timingSafeEqual(Buffer.from(supplied), Buffer.from(adminPassword))) {
      return sendJson(response, 403, { message: 'Admin confirmation is not authorized.' })
    }
    try {
      const body = await readBody(request)
      const db = readDatabase()
      const booking = db.bookings.find((item) => item.id === String(body.bookingId || ''))
      if (!booking) return sendJson(response, 404, { message: 'Booking not found.' })
      if (!['PENDING', 'AWAITING_CONFIRMATION'].includes(booking.status) && booking.paymentStatus !== 'AWAITING_CONFIRMATION') return sendJson(response, 409, { message: 'Booking is not awaiting payment confirmation.' })
      const clash = db.bookings.find((item) => item.id !== booking.id && item.platformId === booking.platformId && item.date === booking.date && item.timeSlot === booking.timeSlot && item.status === 'BOOKED')
      if (clash) return sendJson(response, 409, { message: 'Platform Unavailable – Choose Another Slot', code: 'SLOT_CLASH' })
      booking.status = 'BOOKED'
      booking.paymentStatus = 'PAID'
      booking.paidAt = booking.paidAt || new Date().toISOString()
      booking.updatedAt = new Date().toISOString()
      writeDatabase(db)
      return sendJson(response, 200, { booking })
    } catch (error) {
      return sendJson(response, 400, { message: error.message || 'Unable to confirm booking.' })
    }
  }

  if (request.method === 'POST' && url.pathname === '/api/contact') {
    if (!rateLimit(request, 'contact', 5, 60_000)) return sendJson(response, 429, { message: 'Too many messages. Please retry in a minute.' })
    const session = getSessionUser(request)
    try {
      const body = await readBody(request)
      const name = String(body.name || '').trim().slice(0, 80)
      const phone = String(body.phone || '').trim().slice(0, 40)
      const email = normalize(body.email)
      const message = String(body.message || '').trim().slice(0, 2000)
      if (name.length < 2) return sendJson(response, 400, { message: 'Please enter your name.' })
      if (phone.length < 7) return sendJson(response, 400, { message: 'Enter a valid phone number.' })
      if (!validEmail(email)) return sendJson(response, 400, { message: 'Enter a valid email address.' })
      if (message.length < 10) return sendJson(response, 400, { message: 'Please add a little more detail to your project message.' })
      const db = readDatabase()
      const contact = { id: crypto.randomUUID(), userId: session?.user.id || null, username: session?.user.username || null, name, phone, email, message, createdAt: new Date().toISOString() }
      db.contacts.push(contact)
      writeDatabase(db)

      const smtpUser = process.env.GMAIL_USER || ''
      const smtpPass = process.env.GMAIL_APP_PASSWORD || ''
      const contactTo = process.env.CONTACT_TO || smtpUser
      if (!smtpUser || !smtpPass || !contactTo) {
        return sendJson(response, 503, { message: 'Message was saved, but email delivery is not configured. Set GMAIL_USER, GMAIL_APP_PASSWORD and CONTACT_TO in .env.' })
      }
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: smtpUser, pass: smtpPass },
      })
      await transporter.sendMail({
        from: `AEROTRAC Website <${smtpUser}>`,
        to: contactTo,
        replyTo: email,
        headers: { 'X-AEROTRAC-Contact-Email': email },
        subject: `New AEROTRAC enquiry — ${name}`,
        text: [
          'New AEROTRAC website enquiry',
          '',
          `Account: ${session?.user.username || 'Guest visitor'}`,
          `Account email: ${session?.user.email || 'Not authenticated'}`,
          `Name: ${name}`,
          `Phone: ${phone}`,
          `Contact email: ${email}`,
          `Received: ${contact.createdAt}`,
          '',
          'Message:',
          message,
        ].join('\n'),
      })
      return sendJson(response, 201, { ok: true })
    } catch (error) {
      return sendJson(response, 502, { message: error.message || 'Unable to deliver enquiry email.' })
    }
  }
  if (request.method === 'GET' && url.pathname === '/api/auth/me') {
    const session = getSessionUser(request)
    return sendJson(response, 200, { user: session ? { id: session.user.id, username: session.user.username, email: session.user.email } : null })
  }
  if (request.method === 'POST' && ['/api/auth/register', '/api/auth/login'].includes(url.pathname)) {
    if (!rateLimit(request, 'auth', 12, 60_000)) return sendJson(response, 429, { message: 'Too many authentication attempts. Please retry shortly.' })
    try {
      const body = await readBody(request)
      const users = readUsers()
      if (url.pathname.endsWith('/register')) {
        const username = String(body.username || '').trim()
        const email = normalize(body.email)
        const password = String(body.password || '')
        if (!validUsername(username)) return sendJson(response, 400, { message: 'Username must be 3–32 characters and use letters, numbers, _, ., or -.' })
        if (!validEmail(email)) return sendJson(response, 400, { message: 'Enter a valid email address.' })
        if (password.length < 8) return sendJson(response, 400, { message: 'Password must be at least 8 characters.' })
        if (users.some((user) => normalize(user.username) === normalize(username))) return sendJson(response, 409, { message: 'That username is already registered.' })
        if (users.some((user) => user.email === email)) return sendJson(response, 409, { message: 'That email is already registered.' })
        const user = { id: crypto.randomUUID(), username, email, passwordHash: await hashPassword(password), createdAt: new Date().toISOString() }
        users.push(user)
        writeUsers(users)
        const token = makeSession(user.id)
        return sendJson(response, 201, { user: { id: user.id, username: user.username, email: user.email } }, { 'Set-Cookie': `aerotrac_session=${token}; HttpOnly; Path=/; SameSite=Lax; Max-Age=604800${isProduction ? '; Secure' : ''}` })
      }
      const identifier = normalize(body.identifier)
      const password = String(body.password || '')
      const user = users.find((item) => normalize(item.username) === identifier || item.email === identifier)
      if (!user || !(await verifyPassword(password, user.passwordHash))) return sendJson(response, 401, { message: 'Invalid username/email or password.' })
      const token = makeSession(user.id)
      return sendJson(response, 200, { user: { id: user.id, username: user.username, email: user.email } }, { 'Set-Cookie': `aerotrac_session=${token}; HttpOnly; Path=/; SameSite=Lax; Max-Age=604800${isProduction ? '; Secure' : ''}` })
    } catch (error) { return sendJson(response, 400, { message: error.message || 'Request failed.' }) }
  }
  if (request.method === 'POST' && url.pathname === '/api/auth/password/change') {
    const session = getSessionUser(request)
    if (!session) return sendJson(response, 401, { message: 'Authentication required.' })
    try {
      const body = await readBody(request)
      const currentPassword = String(body.currentPassword || '')
      const newPassword = String(body.newPassword || '')
      if (newPassword.length < 8) return sendJson(response, 400, { message: 'New password must be at least 8 characters.' })
      if (currentPassword === newPassword) return sendJson(response, 400, { message: 'New password must be different from the current password.' })
      if (!(await verifyPassword(currentPassword, session.user.passwordHash))) return sendJson(response, 401, { message: 'Current password is incorrect.' })
      const users = readUsers()
      const user = users.find((item) => item.id === session.user.id)
      user.passwordHash = await hashPassword(newPassword)
      writeUsers(users)
      return sendJson(response, 200, { ok: true, message: 'Password changed successfully.' })
    } catch (error) { return sendJson(response, 400, { message: error.message || 'Unable to change password.' }) }
  }

  if (request.method === 'POST' && url.pathname === '/api/auth/password/set') {
    const session = getSessionUser(request)
    if (!session) return sendJson(response, 401, { message: 'Authentication required.' })
    try {
      const body = await readBody(request)
      const newPassword = String(body.newPassword || '')
      if (newPassword.length < 8) return sendJson(response, 400, { message: 'Password must be at least 8 characters.' })
      const users = readUsers()
      const user = users.find((item) => item.id === session.user.id)
      user.passwordHash = await hashPassword(newPassword)
      writeUsers(users)
      return sendJson(response, 200, { ok: true, message: 'Password set successfully.' })
    } catch (error) { return sendJson(response, 400, { message: error.message || 'Unable to set password.' }) }
  }

  if (request.method === 'GET' && url.pathname === '/api/account/preferences') {
    const session = getSessionUser(request)
    if (!session) return sendJson(response, 401, { message: 'Authentication required.' })
    const db = readDatabase()
    const user = db.users.find((item) => item.id === session.user.id)
    return sendJson(response, 200, { preferences: user?.preferences || { emailNotifications: true, timezone: 'Asia/Kolkata' } })
  }

  if (request.method === 'POST' && url.pathname === '/api/account/preferences') {
    const session = getSessionUser(request)
    if (!session) return sendJson(response, 401, { message: 'Authentication required.' })
    try {
      const body = await readBody(request)
      const users = readUsers()
      const user = users.find((item) => item.id === session.user.id)
      user.preferences = {
        emailNotifications: body.emailNotifications !== false,
        timezone: String(body.timezone || 'Asia/Kolkata').slice(0, 64),
      }
      writeUsers(users)
      return sendJson(response, 200, { ok: true, preferences: user.preferences })
    } catch (error) { return sendJson(response, 400, { message: error.message || 'Unable to save preferences.' }) }
  }

  if (request.method === 'POST' && url.pathname === '/api/auth/logout') {
    const session = getSessionUser(request)
    if (session) sessions.delete(session.token)
    return sendJson(response, 200, { ok: true }, { 'Set-Cookie': `aerotrac_session=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0${isProduction ? '; Secure' : ''}` })
  }
  return sendJson(response, 404, { message: 'API route not found.' })
}

const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.mp4': 'video/mp4', '.mp3': 'audio/mpeg', '.woff2': 'font/woff2' }
const serveStatic = (request, response) => {
  const dist = path.join(__dirname, 'dist')
  let pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname)
  if (pathname === '/') pathname = '/index.html'
  const file = path.normalize(path.join(dist, pathname))
  if (!file.startsWith(dist) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    const fallback = path.join(dist, 'index.html')
    if (fs.existsSync(fallback)) return fs.createReadStream(fallback).pipe(response)
    response.writeHead(404); return response.end('Not found')
  }
  response.writeHead(200, { 'Content-Type': mime[path.extname(file)] || 'application/octet-stream' })
  fs.createReadStream(file).pipe(response)
}

const server = http.createServer(async (request, response) => {
  response.setHeader('X-Content-Type-Options', 'nosniff')
  response.setHeader('X-Frame-Options', 'DENY')
  response.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  if (request.url.startsWith('/api/')) return handleApi(request, response)
  if (isProduction) return serveStatic(request, response)
  response.writeHead(404); response.end('Development frontend is served by Vite.')
})
server.listen(port, () => console.log(`AEROTRAC auth API: http://localhost:${port}`))

if (!isProduction) {
  const vite = spawn(process.execPath, [path.join(__dirname, 'node_modules', 'vite', 'bin', 'vite.js'), '--host', 'localhost', '--port', '5173'], { stdio: 'inherit' })
  vite.on('exit', (code) => process.exit(code ?? 0))
}
