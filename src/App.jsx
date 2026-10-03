import { useEffect, useRef, useState } from 'react'
import { ArrowDown, ArrowUpRight, ChevronLeft, ChevronRight, Cpu, Gauge, Layers3, MoveHorizontal, ShieldCheck, Wrench, Waves, Radio, Route, Mail, Menu, X, MapPin, Phone, CreditCard, CalendarDays, Clock3, CheckCircle2, CircleSlash2, RefreshCw, LayoutDashboard, Bell, Settings, LogOut, KeyRound, LockKeyhole, SlidersHorizontal } from 'lucide-react'
import heroPoster from './assets/hero.png'
import './App.css'

const navItems = [
  { label: 'Platform', href: '#platform' },
  { label: 'Systems', href: '#systems' },
  { label: 'Applications', href: '#applications' },
  { label: 'Gallery', href: '#gallery' },
  { label: 'Contact', href: '#contact' },
]
const metricsData = [
  { id: 'm1', label: 'OPERATIONAL RANGE', target: 2500, suffix: ' M', decimals: 0 },
  { id: 'm2', label: 'NOZZLE PRESSURE', target: 350, suffix: ' BAR', decimals: 0 },
  { id: 'm3', label: 'SYSTEM EFFICIENCY', target: 99.8, suffix: '%', decimals: 1 },
  { id: 'm4', label: 'ACTIVE DEPLOYMENTS', target: 120, suffix: '+', decimals: 0 },
]
const loaderLogs = ['INITIALIZING TJ-01 CORE MODULES...', 'ESTABLISHING TRACKED BASE LINK...', 'CALIBRATING DUAL-JET HIGH-PRESSURE NOZZLES...', 'SYNCHRONIZING TELEMETRY & DATA STREAM...', 'SYSTEM ONLINE. ENGAGING PLATFORM...']
const systemFeatures = [
  { id: '01', title: 'Tracked Mobility Base', desc: 'Heavy-duty continuous track drive designed for all-terrain stability and precise maneuvers in restricted spaces.', icon: Route },
  { id: '02', title: 'Dual High-Pressure Nozzles', desc: 'Synchronized articulation with dual high-pressure hose routing for optimized coverage and target control.', icon: Waves },
  { id: '03', title: 'Serviceable Architecture', desc: 'Modular component design for rapid field diagnostics, minimal downtime, and effortless component replacement.', icon: Wrench },
]
const platformPoints = [
  { icon: MoveHorizontal, title: 'Tracked mobility', copy: 'A continuous-track base supports movement and maneuvering across demanding operating environments.' },
  { icon: Gauge, title: 'Dual-jet delivery', copy: 'Dual high-pressure nozzles and managed hose routing are central to the TJ-01 platform architecture.' },
  { icon: Cpu, title: 'Integrated control', copy: 'Control and telemetry elements bring platform operation and system feedback into one workflow.' },
]

function PlatformPage({ currentUser, platformDashboard, dashboardLoading, bookingLoading, bookingStatus, onBookPlan, onRefreshDashboard, onBack, onLogout }) {
  const booking = platformDashboard?.booking || null
  const status = booking?.status || 'NOT_BOOKED'
  const plans = [
    { id: 'monthly', name: 'Monthly', term: '1 month', amount: 125000, cadence: 'per month' },
    { id: 'six-month', name: '6 Month', term: '6 months', amount: 675000, cadence: 'total' },
    { id: 'annual', name: '1 Year', term: '12 months', amount: 1200000, cadence: 'total' },
    { id: 'two-year', name: '2 Year', term: '24 months', amount: 2280000, cadence: 'total' },
    { id: 'three-year', name: '3 Year', term: '36 months', amount: 3240000, cadence: 'total' },
  ]
  const formatMoney = (amount) => `₹${Number(amount).toLocaleString('en-IN')}`
  const statusLabel = status === 'PENDING' ? 'BOOKING PENDING' : 'PLATFORM NOT BOOKED'
  const statusCopy = status === 'PENDING'
    ? 'Your payment submission is recorded. Dashboard access will unlock after booking confirmation.'
    : 'Choose a deployment plan to start the platform booking process.'

  return (
    <div className="platform-access-only" role="main">
      <header className="platform-access-header">
        <button type="button" className="platform-back" onClick={onBack}><ArrowUpRight size={15} style={{ transform: 'rotate(180deg)' }} /> BACK TO AEROTRAC</button>
        <div className="platform-page-account"><span>{currentUser.username}</span><button type="button" onClick={onLogout}>LOG OUT</button></div>
      </header>

      <main className="platform-access-wrap">
        <section className="platform-access-box">
          <div className="platform-access-heading">
            <span className="section-kicker">AEROTRAC / PLATFORM ACCESS</span>
            <h1>Platform booking</h1>
            <p>{statusCopy}</p>
          </div>

          <div className="platform-access-status">
            <div className="platform-access-status-icon">{status === 'PENDING' ? <Clock3 size={24}/> : <CircleSlash2 size={24}/>}</div>
            <div>
              <span>MY PLATFORM STATUS</span>
              <h2>{statusLabel}</h2>
              {booking && <p>{booking.planName} · {booking.termMonths} months · {formatMoney(booking.amount)} · {booking.paymentStatus}</p>}
            </div>
            <button type="button" className="platform-refresh" onClick={onRefreshDashboard} disabled={dashboardLoading}>
              <RefreshCw size={15} className={dashboardLoading ? 'spin' : ''}/> {dashboardLoading ? 'SYNCING' : 'REFRESH'}
            </button>
          </div>

          {status === 'PENDING' ? (
            <div className="platform-pending-note"><Clock3 size={18}/><span>Booking is pending verification. Your Dashboard will appear automatically once the server confirms the booking.</span></div>
          ) : (
            <>
              <div className="platform-access-plans-head"><span>AEROTRAC / PAYMENT PLANS</span><small>INR</small></div>
              <div className="platform-access-plan-grid">
                {plans.map((plan) => (
                  <article className="platform-access-plan" key={plan.id}>
                    <div><span>{plan.name}</span><CreditCard size={18}/></div>
                    <strong>{formatMoney(plan.amount)}</strong>
                    <small>{plan.term} · {plan.cadence}</small>
                    <button type="button" disabled={bookingLoading} onClick={() => onBookPlan(plan)}>
                      {bookingLoading ? 'PROCESSING…' : 'BOOK PLATFORM'} <ArrowUpRight size={14}/>
                    </button>
                  </article>
                ))}
              </div>
              {bookingStatus.message && <div className={`platform-booking-message ${bookingStatus.type}`} role="status">{bookingStatus.message}</div>}
              <div className="platform-payment-note"><CreditCard size={16}/><span>Payment is required before the platform can be booked. Dashboard access unlocks only after server confirmation.</span></div>
            </>
          )}
        </section>
      </main>
    </div>
  )
}

function BookingFormPage({ currentUser, plan, bookingContext, loading, status, onSubmit, onBack }) {
  const platforms = bookingContext?.platforms || []
  const [form, setForm] = useState({
    platformId: platforms[0]?.id || '',
    date: '',
    timeSlot: '',
  })
  useEffect(() => {
    if (!form.platformId && platforms[0]?.id) setForm((f) => ({ ...f, platformId: platforms[0].id }))
  }, [platforms, form.platformId])
  const submit = (event) => {
    event.preventDefault()
    onSubmit({ ...form, planId: plan?.id })
  }
  const today = new Date().toISOString().slice(0, 10)
  const user = bookingContext?.user || currentUser
  const slots = ['09:00 - 10:00', '10:30 - 11:30', '12:00 - 13:00', '14:00 - 15:00', '16:00 - 17:00', '18:00 - 19:00']
  return (
    <div className="booking-form-page">
      <header className="utility-page-header">
        <button type="button" onClick={onBack} className="utility-back"><ArrowUpRight size={15} style={{ transform: 'rotate(180deg)' }} /> BACK TO PLATFORM</button>
        <span>{currentUser.username}</span>
      </header>
      <main className="booking-form-shell">
        <div className="utility-kicker">AEROTRAC / PLATFORM BOOKING</div>
        <h1>Reserve your<br/><em>platform slot.</em></h1>
        <div className="booking-form-card">
          <div className="booking-form-plan"><span>SELECTED PLAN</span><strong>{plan?.name}</strong><small>₹{Number(plan?.amount || 0).toLocaleString('en-IN')} · {plan?.term}</small></div>
          <form onSubmit={submit} className="booking-form" noValidate>
            <label>Platform Name<select required value={form.platformId} onChange={(e) => setForm((f) => ({ ...f, platformId: e.target.value }))}><option value="">Select platform</option>{platforms.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
            <label>Date<input required type="date" min={today} value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} /></label>
            <label>Time Slot<select required value={form.timeSlot} onChange={(e) => setForm((f) => ({ ...f, timeSlot: e.target.value }))}><option value="">Select time slot</option>{slots.map((slot) => <option key={slot} value={slot}>{slot}</option>)}</select></label>
            <div className="booking-user-details"><span>USER DETAILS / BACKEND</span><strong>{user?.username || '—'}</strong><small>{user?.email || '—'}</small></div>
            {status.message && <div className={`booking-form-status ${status.type}`}>{status.message}</div>}
            <button type="submit" className="booking-submit" disabled={loading || !platforms.length}>{loading ? 'CHECKING SLOT…' : 'CHECK & CONTINUE TO PAYMENT'} <ArrowUpRight size={15}/></button>
          </form>
        </div>
      </main>
    </div>
  )
}

function PaymentPage({ currentUser, plan, booking, paymentLoading, paymentStatus, paymentMethod, setPaymentMethod, onConfirmPayment, onBack }) {
  const formatMoney = (amount) => `₹${Number(amount).toLocaleString('en-IN')}`
  const upiId = 'kk3961230@okicici'
  const upiLink = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=AEROTRAC&am=${encodeURIComponent(plan?.amount || 0)}&cu=INR&tn=${encodeURIComponent(`AEROTRAC ${plan?.name || 'Platform'}`)}`
  return (
    <div className="aerotrac-utility-page payment-page">
      <div className="utility-3d-orbit" aria-hidden="true" />
      <header className="utility-page-header">
        <button type="button" onClick={onBack} className="utility-back"><ArrowUpRight size={15} style={{ transform: 'rotate(180deg)' }} /> BACK TO PLATFORM</button>
        <span>{currentUser.username}</span>
      </header>
      <main className="payment-shell">
        <div className="utility-kicker">AEROTRAC / SECURE PAYMENT</div>
        <h1>Confirm your<br/><em>platform payment.</em></h1>
        <div className="payment-layout">
          <section className="payment-card payment-plan-summary">
            <span className="utility-kicker">SELECTED PLAN</span>
            <h2>{plan?.name}</h2>
            <strong>₹{Number(plan?.amount || 0).toLocaleString('en-IN')}</strong>
            <p>{plan?.term} · {booking?.platformName || 'Platform deployment'} · {booking?.date || ''} {booking?.timeSlot || ''}</p>
          </section>
          <section className="payment-card">
            <span className="utility-kicker">UPI PAYMENT</span>
            <div className="upi-id">{upiId}</div>
            <p>Pay the exact amount using your UPI app. Then return here and confirm that the payment has been submitted.</p>
            <div className="payment-method-grid" role="group" aria-label="Payment methods">
              {[['UPI','UPI'],['CARD','CARD'],['NETBANKING','NET BANKING'],['BANK_TRANSFER','BANK TRANSFER']].map(([id,label]) => <button key={id} type="button" className={paymentMethod === id ? 'payment-method is-active' : 'payment-method'} onClick={() => setPaymentMethod(id)}>{label}</button>)}
            </div>
            {paymentMethod === 'UPI' ? <a className="payment-upi-button" href={upiLink}>OPEN UPI APP <ArrowUpRight size={15}/></a> : <div className="payment-method-note">{paymentMethod === 'CARD' ? 'Card gateway will activate when the live payment provider API is connected.' : paymentMethod === 'NETBANKING' ? 'Net Banking will activate when the live payment provider API is connected.' : 'Bank transfer instructions will activate with the live payment provider.'}</div>}
            <button type="button" className="payment-confirm-button" onClick={onConfirmPayment} disabled={paymentLoading}>
              {paymentLoading ? 'SUBMITTING…' : 'I HAVE PAID / SUBMIT FOR CONFIRMATION'} <CheckCircle2 size={15}/>
            </button>
            {paymentStatus.message && <div className={`payment-status ${paymentStatus.type}`}>{paymentStatus.message}</div>}
            <small className="payment-security-note">Payment confirmation is recorded as pending until it is verified. The dashboard becomes available only after the booking is marked BOOKED.</small>
          </section>
        </div>
      </main>
    </div>
  )
}

function DashboardPage({ currentUser, booking, platformData, dashboardLoading, onRefresh, onBack, onLogout, notifications = [] }) {
  const [now, setNow] = useState(new Date())
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [notificationOpen, setNotificationOpen] = useState(true)
  const [settingsMode, setSettingsMode] = useState(null)
  const [settingsForm, setSettingsForm] = useState({ currentPassword: '', newPassword: '', emailNotifications: true, timezone: 'Asia/Kolkata' })
  const [settingsStatus, setSettingsStatus] = useState({ type: '', message: '' })
  const [settingsLoading, setSettingsLoading] = useState(false)

  const submitSettings = async (event) => {
    event.preventDefault()
    setSettingsStatus({ type: '', message: '' })
    setSettingsLoading(true)
    try {
      let endpoint = ''
      let payload = {}
      if (settingsMode === 'change') {
        if (settingsForm.newPassword.length < 8) throw new Error('New password must be at least 8 characters.')
        endpoint = '/api/auth/password/change'
        payload = { currentPassword: settingsForm.currentPassword, newPassword: settingsForm.newPassword }
      } else if (settingsMode === 'set') {
        if (settingsForm.newPassword.length < 8) throw new Error('Password must be at least 8 characters.')
        endpoint = '/api/auth/password/set'
        payload = { newPassword: settingsForm.newPassword }
      } else {
        endpoint = '/api/account/preferences'
        payload = { emailNotifications: settingsForm.emailNotifications, timezone: settingsForm.timezone }
      }
      const response = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'same-origin', body: JSON.stringify(payload) })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.message || 'Unable to save settings.')
      setSettingsStatus({ type: 'success', message: data.message || 'Settings saved.' })
      setSettingsForm((form) => ({ ...form, currentPassword: '', newPassword: '' }))
    } catch (error) {
      setSettingsStatus({ type: 'error', message: error.message })
    } finally {
      setSettingsLoading(false)
    }
  }

  const openSettingsMode = async (mode) => {
    setSettingsMode(mode)
    setSettingsStatus({ type: '', message: '' })
    if (mode === 'preferences') {
      try {
        const response = await fetch('/api/account/preferences', { credentials: 'same-origin' })
        const data = await response.json().catch(() => ({}))
        if (response.ok && data.preferences) setSettingsForm((form) => ({ ...form, ...data.preferences }))
      } catch {}
    }
  }

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const alerts = notifications.slice(0, 3)
  const metrics = [
    { label: 'OPERATIONAL RANGE', value: platformData?.metrics?.range || '—', note: 'BACKEND DATA' },
    { label: 'NOZZLE PRESSURE', value: platformData?.metrics?.pressure || '—', note: 'BACKEND DATA' },
    { label: 'SYSTEM EFFICIENCY', value: platformData?.metrics?.efficiency || '—', note: 'BACKEND DATA' },
    { label: 'ACTIVE DEPLOYMENTS', value: platformData?.metrics?.deployments || '—', note: 'BACKEND DATA' },
  ]
  const isBooked = booking?.status === 'BOOKED'
  const statusLabel = isBooked ? 'OPERATIONAL' : ['PENDING', 'PENDING_PAYMENT'].includes(booking?.status) ? 'BOOKING PENDING' : 'NOT BOOKED'

  return (
    <div className="aerotrac-dashboard-only">
      <header className="dashboard-only-header">
        <button type="button" onClick={onBack} className="dashboard-back-button">
          <ArrowUpRight size={14} style={{ transform: 'rotate(180deg)' }} /> BACK TO AEROTRAC
        </button>
        <div className="dashboard-header-center">AEROTRAC <span>CONTROL DASHBOARD</span></div>
        <div className="dashboard-header-right">
          <span className="dashboard-user-name">{currentUser.username}</span>
          <button type="button" className="dashboard-icon-button" onClick={() => setNotificationOpen((v) => !v)} aria-label="Notifications">
            <Bell size={17} />
            {alerts.length > 0 && <span className="dashboard-notification-dot" />}
          </button>
          <button type="button" className="dashboard-icon-button" onClick={() => setSettingsOpen((v) => !v)} aria-label="Settings">
            <Settings size={17} />
          </button>
          <button type="button" className="dashboard-logout-button" onClick={onLogout}>LOG OUT</button>
        </div>
      </header>

      <main className="dashboard-only-wrap">
        <section className="dashboard-only-box">
          <div className="dashboard-only-topline">
            <div>
              <span className="dashboard-only-kicker">AEROTRAC / DASHBOARD</span>
              <h1>Dashboard</h1>
              <p>System overview and live platform metrics.</p>
            </div>
            <div className="dashboard-live-clock">
              <span>{now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
              <strong>{now.toLocaleTimeString('en-IN')}</strong>
            </div>
          </div>

          <div className="dashboard-status-heading">
            <div>
              <span>MY PLATFORM STATUS</span>
              <h2>{statusLabel}</h2>
            </div>
            <div className="dashboard-status-live"><span /> {isBooked ? 'SYSTEM ONLINE' : 'AWAITING BOOKING'}</div>
          </div>

          <div className="dashboard-metrics-grid">
            {metrics.map((metric) => (
              <article className="dashboard-metric-card" key={metric.label}>
                <div className="dashboard-metric-icon"><Radio size={17} /></div>
                <span>{metric.label}</span>
                <strong>{metric.value}</strong>
                <small>{metric.note}</small>
              </article>
            ))}
          </div>

          <div className="dashboard-upcoming-section">
            <div className="dashboard-upcoming-head"><div><span>UPCOMING BOOKINGS</span><strong>PLATFORM RESERVATIONS</strong></div></div>
            <div className="dashboard-booking-table-wrap">
              <table className="dashboard-booking-table"><thead><tr><th>Platform Name</th><th>Date</th><th>Time</th><th>Booked By</th></tr></thead>
                <tbody>{(platformData?.upcomingBookings || []).length ? platformData.upcomingBookings.map((item) => <tr key={item.id} className={item.userId === currentUser.id ? 'is-current-user' : ''}><td>{item.platformName}</td><td>{item.date}</td><td>{item.timeSlot}</td><td>{item.username}</td></tr>) : <tr><td colSpan="4" className="dashboard-booking-empty">No upcoming bookings.</td></tr>}</tbody>
              </table>
            </div>
          </div>

          <div className="dashboard-only-footer">
            <span>LIVE SYSTEM DATA</span>
            <button type="button" onClick={onRefresh} disabled={dashboardLoading}>
              <RefreshCw size={14} className={dashboardLoading ? 'spin' : ''} /> {dashboardLoading ? 'SYNCING' : 'REFRESH'}
            </button>
          </div>
        </section>

        {notificationOpen && (
          <aside className="dashboard-alert-panel" aria-label="Real-time notifications">
            <div className="dashboard-alert-head">
              <div><span>REAL-TIME ALERTS</span><strong>Notifications</strong></div>
              <button type="button" onClick={() => setNotificationOpen(false)} aria-label="Close notifications">×</button>
            </div>
            {alerts.length ? alerts.map((item, index) => (
              <div className="dashboard-alert-item" key={`${item.createdAt || item.timestamp || index}-${index}`}>
                <span className="dashboard-alert-icon"><Bell size={13} /></span>
                <div><strong>{item.title || item.type || 'Platform update'}</strong><p>{item.message || item.description || 'New platform activity detected.'}</p><time>{item.createdAt ? new Date(item.createdAt).toLocaleString('en-IN') : 'Just now'}</time></div>
              </div>
            )) : (
              <div className="dashboard-alert-empty"><CheckCircle2 size={16} /><span>No new alerts. Your platform is running normally.</span></div>
            )}
          </aside>
        )}

        {settingsOpen && (
          <div className="dashboard-settings-menu" role="dialog" aria-label="Dashboard settings">
            <div className="dashboard-settings-head"><span>ACCOUNT SETTINGS</span><button type="button" onClick={() => setSettingsOpen(false)}>×</button></div>
            <button type="button" onClick={() => openSettingsMode('change')}><KeyRound size={15} /><span><strong>Change Password</strong><small>Update your current password</small></span></button>
            <button type="button" onClick={() => openSettingsMode('set')}><LockKeyhole size={15} /><span><strong>Set Password</strong><small>Create a new account password</small></span></button>
            <button type="button" onClick={() => openSettingsMode('preferences')}><SlidersHorizontal size={15} /><span><strong>General Preferences</strong><small>Manage account preferences</small></span></button>
            {settingsMode && <form className="dashboard-settings-form" onSubmit={submitSettings}>
              <strong>{settingsMode === 'change' ? 'CHANGE PASSWORD' : settingsMode === 'set' ? 'SET PASSWORD' : 'GENERAL PREFERENCES'}</strong>
              {settingsMode === 'change' && <input type="password" required minLength={8} placeholder="Current password" value={settingsForm.currentPassword} onChange={(e) => setSettingsForm((f) => ({ ...f, currentPassword: e.target.value }))} />}
              {settingsMode !== 'preferences' && <input type="password" required minLength={8} placeholder="New password" value={settingsForm.newPassword} onChange={(e) => setSettingsForm((f) => ({ ...f, newPassword: e.target.value }))} />}
              {settingsMode === 'preferences' && <><label><input type="checkbox" checked={settingsForm.emailNotifications} onChange={(e) => setSettingsForm((f) => ({ ...f, emailNotifications: e.target.checked }))} /> Email notifications</label><select value={settingsForm.timezone} onChange={(e) => setSettingsForm((f) => ({ ...f, timezone: e.target.value }))}><option value="Asia/Kolkata">Asia/Kolkata</option><option value="UTC">UTC</option></select></>}
              {settingsStatus.message && <div className={`settings-status ${settingsStatus.type}`}>{settingsStatus.message}</div>}
              <div className="dashboard-settings-form-actions"><button type="submit" disabled={settingsLoading}>{settingsLoading ? 'SAVING…' : 'SAVE'}</button><button type="button" onClick={() => setSettingsMode(null)}>CLOSE</button></div>
            </form>}
          </div>
        )}
      </main>
    </div>
  )
}

function NotificationsPage({ currentUser, notifications, loading, onRefresh, onDashboard, onSettings, onBack, onLogout }) {
  return (
    <div className="aerotrac-utility-page notifications-page">
      <div className="utility-3d-orbit" aria-hidden="true" />
      <header className="utility-page-header">
        <button type="button" onClick={onBack} className="utility-back"><ArrowUpRight size={15} style={{ transform: 'rotate(180deg)' }} /> BACK TO AEROTRAC</button>
        <div className="utility-account"><span>{currentUser.username}</span><button type="button" onClick={onLogout}><LogOut size={13}/> LOG OUT</button></div>
      </header>
      <main className="dashboard-app-shell">
        <aside className="dashboard-sidebar" aria-label="Dashboard navigation">
          <div className="dashboard-sidebar-brand"><span className="dashboard-brand-mark"><span/><span/></span><div><strong>AEROTRAC</strong><small>WORKSPACE</small></div></div>
          <div className="dashboard-sidebar-section">WORKSPACE</div>
          <nav className="dashboard-sidebar-nav">
            <button type="button" onClick={onDashboard}><LayoutDashboard size={17}/> <span>Dashboard</span></button>
            <button type="button" className="is-active"><Bell size={17}/> <span>Notifications</span></button>
            <button type="button" onClick={onSettings}><Settings size={17}/> <span>Settings</span></button>
          </nav>
          <div className="dashboard-sidebar-bottom">
            <button type="button" onClick={onBack}><ArrowUpRight size={16} style={{ transform: 'rotate(180deg)' }}/> <span>Back to site</span></button>
            <button type="button" onClick={onLogout}><LogOut size={16}/> <span>Log out</span></button>
          </div>
        </aside>
        <section className="dashboard-main-panel notifications-main-panel">
          <div className="dashboard-main-topbar"><div><span className="utility-kicker">AEROTRAC / WORKSPACE</span><h1>Notifications</h1><p>Booking and payment activity for your platform.</p></div></div>
          <div className="notification-list">
            {loading && <div className="notification-empty">SYNCING LIVE ACTIVITY…</div>}
            {!loading && !notifications.length && <div className="notification-empty">No platform activity yet.</div>}
            {!loading && notifications.map((item) => (
              <article className="notification-item" key={item.id}>
                <div className="notification-icon">{item.type === 'PAYMENT' ? <CreditCard size={17}/> : <CheckCircle2 size={17}/>}</div>
                <div className="notification-copy"><strong>{item.title}</strong><p>{item.message}</p></div>
                <time>{new Date(item.createdAt).toLocaleString('en-IN')}</time>
              </article>
            ))}
          </div>
          <button type="button" className="notification-refresh" onClick={onRefresh} disabled={loading}><RefreshCw size={15} className={loading ? 'spin' : ''}/> REFRESH NOTIFICATIONS</button>
        </section>
      </main>
    </div>
  )
}

function SettingsPage({ currentUser, onDashboard, onNotifications, onBack, onLogout }) {
  return (
    <div className="aerotrac-utility-page settings-page">
      <div className="utility-3d-orbit" aria-hidden="true" />
      <header className="utility-page-header">
        <button type="button" onClick={onBack} className="utility-back"><ArrowUpRight size={15} style={{ transform: 'rotate(180deg)' }} /> BACK TO AEROTRAC</button>
        <div className="utility-account"><span>{currentUser.username}</span><button type="button" onClick={onLogout}><LogOut size={13}/> LOG OUT</button></div>
      </header>
      <main className="dashboard-app-shell">
        <aside className="dashboard-sidebar" aria-label="Dashboard navigation">
          <div className="dashboard-sidebar-brand"><span className="dashboard-brand-mark"><span/><span/></span><div><strong>AEROTRAC</strong><small>WORKSPACE</small></div></div>
          <div className="dashboard-sidebar-section">WORKSPACE</div>
          <nav className="dashboard-sidebar-nav">
            <button type="button" onClick={onDashboard}><LayoutDashboard size={17}/> <span>Dashboard</span></button>
            <button type="button" onClick={onNotifications}><Bell size={17}/> <span>Notifications</span></button>
            <button type="button" className="is-active"><Settings size={17}/> <span>Settings</span></button>
          </nav>
          <div className="dashboard-sidebar-bottom">
            <button type="button" onClick={onBack}><ArrowUpRight size={16} style={{ transform: 'rotate(180deg)' }}/> <span>Back to site</span></button>
            <button type="button" onClick={onLogout}><LogOut size={16}/> <span>Log out</span></button>
          </div>
        </aside>
        <section className="dashboard-main-panel settings-main-panel">
          <div className="dashboard-main-topbar"><div><span className="utility-kicker">AEROTRAC / WORKSPACE</span><h1>Settings</h1><p>Account and workspace preferences.</p></div></div>
          <div className="settings-grid">
            <article className="dashboard-card"><div className="dashboard-card-top"><span>ACCOUNT</span><Settings size={18}/></div><h2>{currentUser.username}</h2><p>Your authenticated AEROTRAC workspace account.</p></article>
            <article className="dashboard-card"><div className="dashboard-card-top"><span>NOTIFICATIONS</span><Bell size={18}/></div><h2>Live alerts</h2><p>Booking and payment activity is available in the Notifications section.</p><button type="button" onClick={onNotifications}>OPEN NOTIFICATIONS <ArrowUpRight size={14}/></button></article>
            <article className="dashboard-card"><div className="dashboard-card-top"><span>SESSION</span><CheckCircle2 size={18}/></div><h2>Active</h2><p>Your current AEROTRAC session is authenticated.</p></article>
          </div>
        </section>
      </main>
    </div>
  )
}

function ContactPage({ currentUser, contactForm, setContactForm, contactStatus, setContactStatus, contactLoading, setContactLoading, onBack }) {
  const submit = async (event) => {
    event.preventDefault()
    setContactLoading(true)
    setContactStatus({ type: '', message: '' })
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify(contactForm),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.message || 'Unable to send your message.')
      setContactStatus({ type: 'success', message: 'Message sent successfully. We will contact you shortly.' })
      setContactForm({ name: '', email: '', phone: '', message: '' })
    } catch (error) {
      setContactStatus({ type: 'error', message: error.message || 'Unable to send your message.' })
    } finally {
      setContactLoading(false)
    }
  }
  return (
    <div className="contact-page" role="main">
      <header className="utility-page-header contact-page-header">
        <button type="button" onClick={onBack} className="utility-back"><ArrowUpRight size={15} style={{ transform: 'rotate(180deg)' }} /> BACK TO AEROTRAC</button>
        {currentUser ? <span>{currentUser.username}</span> : <span>PUBLIC ENQUIRY</span>}
      </header>
      <main className="contact-page-shell">
        <div className="utility-kicker">AEROTRAC / CONTACT</div>
        <h1>Let’s move<br/><em>engineering forward.</em></h1>
        <div className="contact-page-grid">
          <section className="contact-page-copy">
            <span className="contact-page-label">DIRECT ENQUIRY CHANNEL</span>
            <h2>Tell us what you need.</h2>
            <p>Your message is delivered to the AEROTRAC owner inbox. Your email stays as the Reply-To address so the response goes directly back to you.</p>
            <div className="contact-page-meta"><Mail size={17}/><span>Owner inbox delivery</span></div>
            <div className="contact-page-meta"><MapPin size={17}/><span>India / Engineering &amp; Field Operations</span></div>
          </section>
          <form className="contact-page-form" onSubmit={submit} noValidate>
            <label>Name<input required minLength={2} maxLength={80} value={contactForm.name} onChange={(e) => setContactForm((f) => ({ ...f, name: e.target.value }))} placeholder="Your name" /></label>
            <label>Email<input required type="email" value={contactForm.email} onChange={(e) => setContactForm((f) => ({ ...f, email: e.target.value }))} placeholder="you@example.com" /></label>
            <label>Phone<input required minLength={7} maxLength={40} value={contactForm.phone || ''} onChange={(e) => setContactForm((f) => ({ ...f, phone: e.target.value }))} placeholder="+91..." /></label>
            <label>Message<textarea required minLength={10} maxLength={2000} rows={7} value={contactForm.message} onChange={(e) => setContactForm((f) => ({ ...f, message: e.target.value }))} placeholder="Tell us about your project or requirement." /></label>
            {contactStatus.message && <div className={`contact-page-status ${contactStatus.type}`} role="status">{contactStatus.message}</div>}
            <button type="submit" className="contact-page-submit" disabled={contactLoading}>{contactLoading ? 'SENDING…' : 'SEND MESSAGE'} <ArrowUpRight size={15}/></button>
          </form>
        </div>
      </main>
    </div>
  )
}

function AdminPage({ onBack }) {
  const [password, setPassword] = useState('')
  const [data, setData] = useState(null)
  const [status, setStatus] = useState({ type: '', message: '' })
  const [loading, setLoading] = useState(false)
  const load = async () => {
    if (!password) return setStatus({ type: 'error', message: 'Enter the server admin password.' })
    setLoading(true); setStatus({ type: '', message: '' })
    try {
      const response = await fetch('/api/admin/bookings', { headers: { 'x-admin-password': password } })
      const body = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(body.message || 'Admin access denied.')
      setData(body)
    } catch (error) { setStatus({ type: 'error', message: error.message }) }
    finally { setLoading(false) }
  }
  const confirm = async (bookingId) => {
    setLoading(true); setStatus({ type: '', message: '' })
    try {
      const response = await fetch('/api/admin/platform/confirm', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-admin-password': password }, body: JSON.stringify({ bookingId }) })
      const body = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(body.message || 'Unable to confirm booking.')
      setStatus({ type: 'success', message: 'Booking marked BOOKED.' }); await load()
    } catch (error) { setStatus({ type: 'error', message: error.message }); setLoading(false) }
  }
  return <div className="admin-page"><header className="utility-page-header"><button type="button" onClick={onBack} className="utility-back"><ArrowUpRight size={15} style={{ transform: 'rotate(180deg)' }} /> BACK TO AEROTRAC</button><span>ADMIN</span></header><main className="admin-shell"><div className="utility-kicker">AEROTRAC / ADMIN</div><h1>Operations<br/><em>control.</em></h1><div className="admin-auth-card"><input type="password" placeholder="Server admin password" value={password} onChange={(e) => setPassword(e.target.value)} /><button type="button" onClick={load} disabled={loading}>{loading ? 'CHECKING…' : 'OPEN ADMIN'}</button></div>{status.message && <div className={`admin-status ${status.type}`}>{status.message}</div>}{data && <><section className="admin-list"><div className="admin-list-head"><strong>PENDING / BOOKED BOOKINGS</strong><span>{data.bookings.length}</span></div>{data.bookings.length ? data.bookings.map((item) => <article className="admin-row" key={item.id}><div><strong>{item.platformName}</strong><small>{item.username} · {item.date} · {item.timeSlot}</small></div><div><b>{item.status}</b><small>₹{Number(item.amount || 0).toLocaleString('en-IN')} · {item.paymentMethod || '—'}</small></div>{item.status === 'PENDING' && <button type="button" onClick={() => confirm(item.id)} disabled={loading}>CONFIRM BOOKING</button>}</article>) : <p className="admin-empty">No bookings yet.</p>}</section><section className="admin-list"><div className="admin-list-head"><strong>CONTACT ENQUIRIES</strong><span>{data.contacts.length}</span></div>{data.contacts.slice().reverse().slice(0,20).map((item) => <article className="admin-row" key={item.id}><div><strong>{item.name}</strong><small>{item.email} · {item.phone}</small></div><p>{item.message}</p></article>)}</section></>}</main></div>
}

function App() {
  const videoRef = useRef(null)
  const touchY = useRef(null)
  const audioRef = useRef(null)
  const progressRef = useRef(0)
  const [loaderProgress, setLoaderProgress] = useState(0)
  const [logIndex, setLogIndex] = useState(0)
  const [isLoaderActive, setIsLoaderActive] = useState(true)
  const [isLoaded, setIsLoaded] = useState(false)
  const [counts, setCounts] = useState(metricsData.map(() => 0))
  const [introProgress, setIntroProgress] = useState(0)
  const [unlocked, setUnlocked] = useState(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(false)
  const [videoScrollLocked, setVideoScrollLocked] = useState(false)
  const [galleryIndex, setGalleryIndex] = useState(0)
  const [galleryVisibleCount, setGalleryVisibleCount] = useState(() => (typeof window !== 'undefined' && window.innerWidth <= 700 ? 1 : typeof window !== 'undefined' && window.innerWidth <= 1000 ? 2 : 3))
  const [authMode, setAuthMode] = useState(null)
  const [authForm, setAuthForm] = useState({ identifier: '', email: '', password: '', confirmPassword: '' })
  const [authStatus, setAuthStatus] = useState({ type: '', message: '' })
  const [authLoading, setAuthLoading] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [authReady, setAuthReady] = useState(false)
  const [platformOpen, setPlatformOpen] = useState(false)
  const [pendingPlatformAccess, setPendingPlatformAccess] = useState(false)
  const [pendingContactAccess, setPendingContactAccess] = useState(false)
  const [contactForm, setContactForm] = useState({ name: '', email: '', phone: '', message: '' })
  const [contactStatus, setContactStatus] = useState({ type: '', message: '' })
  const [contactLoading, setContactLoading] = useState(false)
  const [platformData, setPlatformData] = useState(null)
  const [platformDashboard, setPlatformDashboard] = useState(null)
  const [dashboardLoading, setDashboardLoading] = useState(false)
  const [bookingLoading, setBookingLoading] = useState(false)
  const [bookingStatus, setBookingStatus] = useState({ type: '', message: '' })
  const [paymentPlan, setPaymentPlan] = useState(null)
  const [paymentOpen, setPaymentOpen] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState({ type: '', message: '' })
  const [paymentLoading, setPaymentLoading] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('UPI')
  const [bookingFormOpen, setBookingFormOpen] = useState(false)
  const [bookingContext, setBookingContext] = useState(null)
  const [bookingDraft, setBookingDraft] = useState(null)
  const [bookingFormLoading, setBookingFormLoading] = useState(false)
  const [bookingFormStatus, setBookingFormStatus] = useState({ type: '', message: '' })
  const [dashboardOpen, setDashboardOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [notificationsLoading, setNotificationsLoading] = useState(false)
  const [contactOpen, setContactOpen] = useState(false)
  const [siteNotice, setSiteNotice] = useState('')
  const [adminOpen, setAdminOpen] = useState(false)

  const advanceProgress = (delta) => {
    if (unlocked || delta <= 0) return
    const next = Math.min(100, progressRef.current + delta)
    progressRef.current = next
    setIntroProgress(next)
    if (next >= 100) {
      setUnlocked(true)
      document.body.classList.remove('intro-locked')
    }
  }
  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const totalDuration = reducedMotion ? 250 : 1700
    const intervalTime = 25
    const totalSteps = totalDuration / intervalTime
    let step = 0
    let counterInterval
    const loaderInterval = setInterval(() => {
      step++
      const progress = Math.min(Math.round((step / totalSteps) * 100), 100)
      setLoaderProgress(progress)
      if (progress > 80) setLogIndex(4)
      else if (progress > 60) setLogIndex(3)
      else if (progress > 40) setLogIndex(2)
      else if (progress > 20) setLogIndex(1)
      if (step >= totalSteps) {
        clearInterval(loaderInterval)
        setTimeout(() => {
          setIsLoaderActive(false)
          setIsLoaded(true)
          let frame = 0
          const totalFrames = reducedMotion ? 1 : 90
          counterInterval = setInterval(() => {
            frame++
            const eased = 1 - Math.pow(1 - frame / totalFrames, 3)
            setCounts(metricsData.map((item) => item.decimals ? Number((item.target * eased).toFixed(item.decimals)) : Math.floor(item.target * eased)))
            if (frame >= totalFrames) {
              clearInterval(counterInterval)
              setCounts(metricsData.map((item) => item.target))
            }
          }, 2200 / totalFrames)
        }, reducedMotion ? 0 : 250)
      }
    }, intervalTime)
    return () => { clearInterval(loaderInterval); clearInterval(counterInterval) }
  }, [])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.volume = 0.34
    audio.loop = true
    audio.muted = true
    setSoundEnabled(false)
    const onPlay = () => setSoundEnabled(!audio.muted)
    const onPause = () => setSoundEnabled(false)
    const onEnded = () => setSoundEnabled(false)
    audio.addEventListener('play', onPlay)
    audio.addEventListener('pause', onPause)
    audio.addEventListener('ended', onEnded)
    return () => {
      audio.removeEventListener('play', onPlay)
      audio.removeEventListener('pause', onPause)
      audio.removeEventListener('ended', onEnded)
    }
  }, [])

  useEffect(() => {
    const tiltNodes = [...document.querySelectorAll('[data-tilt]')]
    const cleanups = tiltNodes.map((node) => {
      const move = (event) => {
        const rect = node.getBoundingClientRect()
        const x = (event.clientX - rect.left) / rect.width - 0.5
        const y = (event.clientY - rect.top) / rect.height - 0.5
        node.style.setProperty('--rx', `${(-y * 7).toFixed(2)}deg`)
        node.style.setProperty('--ry', `${(x * 9).toFixed(2)}deg`)
        node.style.setProperty('--mx', `${(x * 18).toFixed(1)}px`)
        node.style.setProperty('--my', `${(y * 18).toFixed(1)}px`)
      }
      const leave = () => {
        node.style.setProperty('--rx', '0deg')
        node.style.setProperty('--ry', '0deg')
        node.style.setProperty('--mx', '0px')
        node.style.setProperty('--my', '0px')
      }
      node.addEventListener('pointermove', move)
      node.addEventListener('pointerleave', leave)
      return () => {
        node.removeEventListener('pointermove', move)
        node.removeEventListener('pointerleave', leave)
      }
    })
    return () => cleanups.forEach((cleanup) => cleanup())
  }, [unlocked])

  useEffect(() => {
    fetch('/api/auth/me', { credentials: 'same-origin' })
      .then((response) => response.ok ? response.json() : null)
      .then((data) => {
        if (data?.user) setCurrentUser(data.user)
      })
      .catch(() => {})
      .finally(() => setAuthReady(true))
  }, [])

  useEffect(() => {
    if (!authReady) return
    const path = window.location.pathname
    if (path === '/admin') { setAdminOpen(true); setPlatformOpen(false); setContactOpen(false); setDashboardOpen(false) } else if (path === '/platform') {
      if (currentUser) {
        setPlatformOpen(false)
        setContactOpen(false)
        setNotificationsOpen(false)
        setSettingsOpen(false)
        loadPlatformDashboard().then((result) => {
          const hasRequest = ['PENDING', 'BOOKED', 'PENDING_PAYMENT'].includes(result?.dashboard?.booking?.status)
          setDashboardOpen(hasRequest)
          setPlatformOpen(!hasRequest)
          window.history.replaceState(hasRequest ? { dashboard: true } : { platform: true }, '', hasRequest ? '/dashboard' : '/platform')
        })
      } else {
        window.history.replaceState({}, '', '/')
        setPendingPlatformAccess(true)
        openAuth('login')
      }
    } else if (path === '/contact') {
      setAuthMode(null)
      setContactOpen(true)
      setPlatformOpen(false)
      setDashboardOpen(false)
    } else if (path === '/dashboard') {
      if (currentUser) {
        loadPlatformDashboard().then((result) => {
          const hasRequest = ['PENDING', 'BOOKED', 'PENDING_PAYMENT'].includes(result?.dashboard?.booking?.status)
          setDashboardOpen(hasRequest)
          setPlatformOpen(!hasRequest)
          setContactOpen(false)
          if (!hasRequest) window.history.replaceState({ platform: true }, '', '/platform')
        })
      } else {
        window.history.replaceState({}, '', '/')
        setPendingPlatformAccess(true)
        openAuth('login')
      }
    } else if (path === '/settings') {
      if (currentUser) {
        setSettingsOpen(false)
        setNotificationsOpen(false)
        setDashboardOpen(true)
        setPlatformOpen(false)
        window.history.replaceState({ dashboard: true }, '', '/dashboard')
        loadPlatformDashboard()
      } else {
        window.history.replaceState({}, '', '/')
        setPendingPlatformAccess(true)
        openAuth('login')
      }
    } else if (path === '/notifications') {
      if (currentUser) {
        setNotificationsOpen(false)
        setSettingsOpen(false)
        setDashboardOpen(true)
        setPlatformOpen(false)
        window.history.replaceState({ dashboard: true }, '', '/dashboard')
        loadPlatformDashboard()
        loadNotifications()
      } else {
        window.history.replaceState({}, '', '/')
        setPendingPlatformAccess(true)
        openAuth('login')
      }
    }
  }, [authReady, currentUser])

  const loadNotifications = async () => {
    if (!currentUser) return
    setNotificationsLoading(true)
    try {
      const response = await fetch('/api/notifications', { credentials: 'same-origin' })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.message || 'Unable to load notifications.')
      setNotifications(data.notifications || [])
    } catch {
      setNotifications([])
    } finally {
      setNotificationsLoading(false)
    }
  }

  const loadPlatformDashboard = async () => {
    if (!currentUser) return
    setDashboardLoading(true)
    try {
      const [platformResponse, dashboardResponse] = await Promise.all([
        fetch('/api/platform', { credentials: 'same-origin' }),
        fetch('/api/platform/dashboard', { credentials: 'same-origin' }),
      ])
      let nextPlatform = null
      let nextDashboard = null
      if (platformResponse.ok) nextPlatform = await platformResponse.json()
      if (dashboardResponse.ok) nextDashboard = await dashboardResponse.json()
      if (nextPlatform) setPlatformData(nextPlatform)
      if (nextDashboard) setPlatformDashboard(nextDashboard)
      return { platform: nextPlatform, dashboard: nextDashboard }
    } catch {
      setPlatformDashboard(null)
      return { platform: null, dashboard: null }
    } finally {
      setDashboardLoading(false)
    }
  }

  useEffect(() => {
    if (!currentUser) return
    loadPlatformDashboard()
    loadNotifications()
    const interval = window.setInterval(() => {
      loadPlatformDashboard()
      loadNotifications()
    }, 10000)
    return () => window.clearInterval(interval)
  }, [currentUser])

  const openBookingForm = async (plan) => {
    setBookingStatus({ type: '', message: '' })
    setBookingFormStatus({ type: '', message: '' })
    setPaymentPlan(plan)
    setPaymentMethod('UPI')
    setBookingFormOpen(true)
    setBookingFormLoading(true)
    try {
      const response = await fetch('/api/platform/booking-context', { credentials: 'same-origin' })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.message || 'Session Link Unavailable – Please Retry')
      setBookingContext(data)
    } catch (error) {
      setBookingFormStatus({ type: 'error', message: error.message || 'Session Link Unavailable – Please Retry' })
    } finally {
      setBookingFormLoading(false)
    }
  }

  const handleBookingSubmit = async (draft) => {
    setBookingFormLoading(true)
    setBookingFormStatus({ type: '', message: '' })
    try {
      const response = await fetch('/api/platform/book', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'same-origin',
        body: JSON.stringify(draft),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.message || 'Session Link Unavailable – Please Retry')
      setBookingDraft(data.booking)
      setBookingFormOpen(false)
      setPaymentStatus({ type: '', message: '' })
      setPaymentOpen(true)
    } catch (error) {
      setBookingFormStatus({ type: 'error', message: error.message || 'Session Link Unavailable – Please Retry' })
    } finally {
      setBookingFormLoading(false)
    }
  }

  const handleBookPlan = (plan) => {
    openBookingForm(plan)
  }

  const handleConfirmPayment = async () => {
    if (!paymentPlan || !bookingDraft) return
    setPaymentLoading(true)
    setPaymentStatus({ type: '', message: '' })
    try {
      const response = await fetch('/api/platform/payment/confirm', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'same-origin',
        body: JSON.stringify({ id: paymentPlan.id, bookingId: bookingDraft.id, paymentMethod }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.message || 'Unable to submit payment confirmation.')
      setPlatformDashboard((current) => ({ ...(current || {}), booking: data.booking, status: data.booking.status }))
      await loadNotifications()
      setPaymentOpen(false)
      setBookingDraft(null)
      setPaymentStatus({ type: 'success', message: `Platform ${data.booking.platformName || 'TJ-01'} booked successfully.` })
      setSiteNotice(`Platform ${data.booking.platformName || 'TJ-01'} booked successfully. Payment verification is pending.`)
      setPlatformOpen(false)
      setDashboardOpen(false)
      setBookingStatus({ type: 'success', message: `Platform ${data.booking.platformName || 'TJ-01'} booking submitted successfully.` })
      window.history.replaceState({ home: true }, '', '/')
    } catch (error) {
      setPaymentStatus({ type: 'error', message: error.message })
    } finally {
      setPaymentLoading(false)
    }
  }

  useEffect(() => {
    const onPop = () => {
      const path = window.location.pathname
      setAdminOpen(path === '/admin')
      setPlatformOpen(path === '/platform' && Boolean(currentUser))
      setContactOpen(path === '/contact' && Boolean(currentUser))
      setDashboardOpen(path === '/dashboard' && Boolean(currentUser))
      setNotificationsOpen(path === '/notifications' && Boolean(currentUser))
      setSettingsOpen(path === '/settings' && Boolean(currentUser))
    }
    window.addEventListener('popstate', onPop)
    window.addEventListener('hashchange', onPop)
    return () => { window.removeEventListener('popstate', onPop); window.removeEventListener('hashchange', onPop) }
  }, [currentUser])

  const handleExplorePlatform = async (event) => {
    event?.preventDefault()
    if (!authReady) return
    if (currentUser) {
      setAuthMode(null)
      setContactOpen(false)
      setNotificationsOpen(false)
      setSettingsOpen(false)
      const dashboardResult = await loadPlatformDashboard()
      const hasRequest = ['PENDING', 'BOOKED', 'PENDING_PAYMENT'].includes(dashboardResult?.dashboard?.booking?.status)
      setDashboardOpen(hasRequest)
      setPlatformOpen(!hasRequest)
      window.history.pushState(hasRequest ? { dashboard: true } : { platform: true }, '', hasRequest ? '/dashboard' : '/platform')
      return
    }
    setPendingPlatformAccess(true)
    openAuth('login')
  }

  const openAuth = (mode) => {
    if (currentUser) return
    setAuthMode(mode)
    setAuthStatus({ type: '', message: '' })
    setAuthForm({ identifier: '', email: '', password: '', confirmPassword: '' })
  }

  const closeAuth = () => {
    if (authLoading) return
    setAuthMode(null)
    setAuthStatus({ type: '', message: '' })
  }

  const handleAuthSubmit = async (event) => {
    event.preventDefault()
    setAuthStatus({ type: '', message: '' })
    if (authMode === 'register' && authForm.password !== authForm.confirmPassword) {
      setAuthStatus({ type: 'error', message: 'Passwords do not match.' })
      return
    }
    setAuthLoading(true)
    try {
      const endpoint = authMode === 'login' ? '/api/auth/login' : '/api/auth/register'
      const payload = authMode === 'login'
        ? { identifier: authForm.identifier, password: authForm.password }
        : { username: authForm.identifier, email: authForm.email, password: authForm.password }
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify(payload),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.message || 'Authentication failed.')
      setCurrentUser(data.user)
      const shouldOpenPlatform = pendingPlatformAccess || window.location.pathname === '/platform'
      const shouldOpenContact = pendingContactAccess || window.location.pathname === '/contact'
      setAuthStatus({ type: 'success', message: authMode === 'login' ? 'Login successful.' : 'Account created successfully.' })
      setPendingPlatformAccess(false)
      setPendingContactAccess(false)
      setAuthMode(null)
      if (shouldOpenPlatform) {
        setContactOpen(false)
        setNotificationsOpen(false)
        setSettingsOpen(false)
        const dashboardResult = await loadPlatformDashboard()
        const hasRequest = ['PENDING', 'BOOKED', 'PENDING_PAYMENT'].includes(dashboardResult?.dashboard?.booking?.status)
        setDashboardOpen(hasRequest)
        setPlatformOpen(!hasRequest)
        window.history.pushState(hasRequest ? { dashboard: true } : { platform: true }, '', hasRequest ? '/dashboard' : '/platform')
      } else if (shouldOpenContact) {
        setContactOpen(true)
        setPlatformOpen(false)
        window.history.pushState({ contact: true }, '', '/contact')
      }
    } catch (error) {
      setAuthStatus({ type: 'error', message: error.message })
    } finally {
      setAuthLoading(false)
    }
  }

  const handleLogout = async () => {
    setPlatformOpen(false)
    setContactOpen(false)
    setPendingPlatformAccess(false)
    setPendingContactAccess(false)
    if (window.location.pathname === '/platform' || window.location.pathname === '/contact') window.history.replaceState({}, '', '/')
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'same-origin' }).catch(() => {})
    setCurrentUser(null)
  }

  const toggleSound = async () => {
    const audio = audioRef.current
    const video = videoRef.current
    if (!audio && !video) return

    try {
      if (soundEnabled) {
        // Sound control is independent from video playback: mute both media sources.
        if (audio) {
          audio.pause()
          audio.muted = true
        }
        if (video) video.muted = true
        setSoundEnabled(false)
        return
      }

      // Turning sound on must never start/stop the video. It only restores audio.
      if (video) video.muted = false
      if (audio) {
        audio.muted = false
        audio.volume = 0.34
        await audio.play()
      }
      setSoundEnabled(true)
    } catch {
      if (audio) {
        audio.pause()
        audio.muted = true
      }
      if (video) video.muted = true
      setSoundEnabled(false)
    }
  }

  useEffect(() => {
    const updateGalleryVisibleCount = () => {
      const width = window.innerWidth
      setGalleryVisibleCount(width <= 700 ? 1 : width <= 1000 ? 2 : 3)
    }
    updateGalleryVisibleCount()
    window.addEventListener('resize', updateGalleryVisibleCount)
    return () => window.removeEventListener('resize', updateGalleryVisibleCount)
  }, [])

  useEffect(() => {
    setGalleryIndex((current) => Math.min(current, Math.max(0, 4 - galleryVisibleCount)))
  }, [galleryVisibleCount])

  const galleryMaxIndex = Math.max(0, 4 - galleryVisibleCount)

  const handleVideoPlaybackMode = async () => {
    const video = videoRef.current
    const audio = audioRef.current
    if (!video) return
    try {
      if (!videoScrollLocked) {
        video.pause()
        if (audio) audio.pause()
        setSoundEnabled(false)
        setVideoScrollLocked(true)
        return
      }

      video.muted = false
      if (audio) {
        audio.muted = false
        audio.volume = 0.34
      }
      await video.play()
      if (audio) await audio.play()
      setSoundEnabled(true)
      setVideoScrollLocked(false)
    } catch {
      video.pause()
      if (audio) audio.pause()
      setSoundEnabled(false)
      setVideoScrollLocked(true)
    }
  }

  const handleContactPage = (event) => {
    event?.preventDefault()
    setAuthMode(null)
    setPlatformOpen(false)
    setDashboardOpen(false)
    setNotificationsOpen(false)
    setSettingsOpen(false)
    setContactOpen(true)
    window.history.pushState({ contact: true }, '', '/contact')
  }

  useEffect(() => {
    const isMobile = window.matchMedia('(max-width: 700px)').matches
    if (isMobile) {
      progressRef.current = 100
      setIntroProgress(100)
      setUnlocked(true)
      document.body.classList.remove('intro-locked')
      return
    }

    if (!unlocked) {
      window.scrollTo(0, 0)
      document.body.classList.add('intro-locked')
    }
    else document.body.classList.remove('intro-locked')
    const wheel = (event) => {
      if (unlocked || isLoaderActive) return
      if (event.deltaY > 0) { event.preventDefault(); advanceProgress(Math.abs(event.deltaY) * 0.055) }
      else if (window.scrollY <= 0) event.preventDefault()
    }
    const touchStart = (event) => { touchY.current = event.touches[0]?.clientY ?? null }
    const touchMove = (event) => {
      if (unlocked || isLoaderActive || touchY.current === null) return
      const current = event.touches[0]?.clientY
      if (current === undefined) return
      const delta = touchY.current - current
      if (delta > 0) { event.preventDefault(); advanceProgress(delta * 0.12) }
      touchY.current = current
    }
    const keydown = (event) => {
      if (unlocked || isLoaderActive) return
      if (['ArrowDown', 'PageDown', ' ', 'End'].includes(event.key)) { event.preventDefault(); advanceProgress(event.key === ' ' ? 8 : 6) }
      if (['ArrowUp', 'PageUp', 'Home'].includes(event.key) && window.scrollY === 0) event.preventDefault()
    }
    window.addEventListener('wheel', wheel, { passive: false })
    window.addEventListener('touchstart', touchStart, { passive: true })
    window.addEventListener('touchmove', touchMove, { passive: false })
    window.addEventListener('keydown', keydown)
    return () => {
      window.removeEventListener('wheel', wheel)
      window.removeEventListener('touchstart', touchStart)
      window.removeEventListener('touchmove', touchMove)
      window.removeEventListener('keydown', keydown)
      document.body.classList.remove('intro-locked')
    }
  }, [unlocked, isLoaderActive])

  const hasPlatformRequest = ['PENDING', 'BOOKED', 'PENDING_PAYMENT'].includes(platformDashboard?.booking?.status)

  if (adminOpen) { return <AdminPage onBack={() => { setAdminOpen(false); window.history.replaceState({}, '', '/') }} /> }

  if (bookingFormOpen && currentUser && paymentPlan) {
    return <BookingFormPage currentUser={currentUser} plan={paymentPlan} bookingContext={bookingContext} loading={bookingFormLoading} status={bookingFormStatus} onSubmit={handleBookingSubmit} onBack={() => setBookingFormOpen(false)} />
  }

  if (paymentOpen && currentUser && paymentPlan && bookingDraft) {
    return <PaymentPage currentUser={currentUser} plan={paymentPlan} booking={bookingDraft} paymentLoading={paymentLoading} paymentStatus={paymentStatus} paymentMethod={paymentMethod} setPaymentMethod={setPaymentMethod} onConfirmPayment={handleConfirmPayment} onBack={() => { setPaymentOpen(false); setBookingFormOpen(true) }} />
  }

  if (dashboardOpen && currentUser && hasPlatformRequest) {
    return <DashboardPage currentUser={currentUser} booking={platformDashboard?.booking || null} platformData={{ ...(platformData || {}), upcomingBookings: platformDashboard?.upcomingBookings || [] }} dashboardLoading={dashboardLoading} notifications={notifications} onRefresh={loadPlatformDashboard} onBack={() => { setDashboardOpen(false); window.history.replaceState({}, '', '/') }} onLogout={handleLogout} />
  }

  if (platformOpen && currentUser) {
    return <PlatformPage currentUser={currentUser} platformDashboard={platformDashboard} dashboardLoading={dashboardLoading} bookingLoading={bookingLoading} bookingStatus={bookingStatus} onBookPlan={handleBookPlan} onRefreshDashboard={loadPlatformDashboard} onBack={() => { setPlatformOpen(false); setDashboardOpen(false); window.history.replaceState({}, '', '/') }} onLogout={handleLogout} />
  }

  if (contactOpen) {
    return <ContactPage currentUser={currentUser} contactForm={contactForm} setContactForm={setContactForm} contactStatus={contactStatus} setContactStatus={setContactStatus} contactLoading={contactLoading} setContactLoading={setContactLoading} onBack={() => { setContactOpen(false); window.history.replaceState({}, '', '/') }} />
  }

  return (
    <main className={`site-shell ${isLoaded ? 'page-loaded' : ''} ${unlocked ? 'site-unlocked' : 'site-locked'}`}>
      <audio ref={audioRef} src="/media/aerotrac-ambient.mp3" loop preload="auto" aria-hidden="true" />
      {isLoaderActive && <div className={`cyber-loader-overlay ${loaderProgress === 100 ? 'loader-finished' : ''}`} aria-label="Loading AEROTRAC">
        <div className="cyber-loader-content"><div className="loader-hud-container"><div className="loader-hud-ring outer"/><div className="loader-hud-ring inner"/><div className="loader-hud-core"><span className="loader-num">{loaderProgress}</span><span className="loader-unit">%</span></div></div>
          <div className="loader-meta-info"><div className="loader-title"><strong>AEROTRAC</strong><span>INTELLIGENT MOTION</span></div><div className="loader-track"><div className="loader-fill" style={{ width: `${loaderProgress}%` }}/></div><div className="loader-log-text"><span className="log-prefix">&gt;&gt;</span> {loaderLogs[logIndex]}</div></div>
        </div>
      </div>}

      <header className="site-header">
        <a className="brand" href="#top" aria-label="AEROTRAC home"><span className="brand-mark" aria-hidden="true"><span/><span/></span><span className="brand-copy"><strong>AEROTRAC</strong><small>INTELLIGENT MOTION</small></span></a>
        <nav id="mobile-primary-nav" className={`desktop-nav ${mobileNavOpen ? 'nav-open' : ''}`} aria-label="Primary navigation">
          <div className="mobile-nav-canvas-head">
            <span>MENU / AEROTRAC</span>
            <button type="button" className="mobile-nav-close" onClick={() => setMobileNavOpen(false)} aria-label="Close navigation"><X size={19}/></button>
          </div>
          <div className="mobile-nav-links">{navItems.map((item, idx) => <a key={item.label} href={item.href} style={{ '--nav-index': idx }} onClick={(event) => { setMobileNavOpen(false); if (item.href === '#platform') { handleExplorePlatform(event); return } if (item.href === '#contact') { handleContactPage(event); return } if (!unlocked && item.href !== '#top') event.preventDefault() }}>{item.label}</a>)}</div>
        </nav>
        <button type="button" className="header-cta" onClick={handleExplorePlatform}><span>{currentUser && hasPlatformRequest ? 'Dashboard' : 'Explore Platform'}</span><ArrowUpRight size={16}/></button>
        <button type="button" className={`mobile-menu ${mobileNavOpen ? "is-open" : ""}`} aria-label={mobileNavOpen ? "Close navigation" : "Open navigation"} aria-expanded={mobileNavOpen} onClick={(event) => { event.stopPropagation(); setMobileNavOpen((open) => !open) }} aria-controls="mobile-primary-nav"><Menu size={21}/><span className="mobile-menu-glow" aria-hidden="true"/></button>
      </header>
      {siteNotice && <div className="site-booking-notice" role="status"><CheckCircle2 size={15}/><span>{siteNotice}</span><button type="button" onClick={() => setSiteNotice('')} aria-label="Close confirmation">×</button></div>}

      {authMode && !currentUser && <div className="auth-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) closeAuth() }}>
        <section className="auth-modal" role="dialog" aria-modal="true" aria-labelledby="auth-modal-title">
          <button type="button" className="auth-close" onClick={closeAuth} aria-label="Close authentication dialog"><X size={18}/></button>
          <span className="auth-kicker">AEROTRAC ACCOUNT</span>
          <h2 id="auth-modal-title">{authMode === 'login' ? 'Welcome back.' : 'Create your account.'}</h2>
          <p>{authMode === 'login' ? 'Sign in to continue to your AEROTRAC workspace.' : 'Create an account to access your AEROTRAC workspace.'}</p>
          <form onSubmit={handleAuthSubmit} noValidate>
            <label>{authMode === 'login' ? 'Username or email' : 'Username'}<input required autoComplete={authMode === 'login' ? 'username' : 'username'} value={authForm.identifier} onChange={(event) => setAuthForm((form) => ({ ...form, identifier: event.target.value }))} /></label>
            {authMode === 'register' && <label>Email<input required type="email" autoComplete="email" value={authForm.email} onChange={(event) => setAuthForm((form) => ({ ...form, email: event.target.value }))} /></label>}
            <label>Password<input required type="password" minLength={8} autoComplete={authMode === 'login' ? 'current-password' : 'new-password'} value={authForm.password} onChange={(event) => setAuthForm((form) => ({ ...form, password: event.target.value }))} /></label>
            {authMode === 'register' && <label>Confirm password<input required type="password" minLength={8} autoComplete="new-password" value={authForm.confirmPassword} onChange={(event) => setAuthForm((form) => ({ ...form, confirmPassword: event.target.value }))} /></label>}
            {authStatus.message && <div className={`auth-message ${authStatus.type}`} role="alert">{authStatus.message}</div>}
            <button type="submit" className="auth-submit" disabled={authLoading}>{authLoading ? 'Please wait…' : authMode === 'login' ? 'Login' : 'Create account'}</button>
          </form>
          <button type="button" className="auth-switch" onClick={() => openAuth(authMode === 'login' ? 'register' : 'login')}>{authMode === 'login' ? 'Need an account? Register' : 'Already have an account? Login'}</button>
        </section>
      </div>}


      {!platformOpen && !contactOpen && <><section className="header-hero" id="top" aria-label="TJ-01 Dual-Jet Robotic System Banner">
        <div className="hero-3d-scene" aria-hidden="true"><div className="hero-3d-orbit orbit-a"/><div className="hero-3d-orbit orbit-b"/><div className="hero-3d-grid"/></div>
        <video ref={videoRef} className="hero-background-video" src="/media/banner.mp4" autoPlay muted loop playsInline preload="auto" aria-label="TJ-01 tracked robotic system in operation" poster={heroPoster} />
        <div className="hero-video-shade" aria-hidden="true"/>
        <div className="hero-video-control">
          <button type="button" onClick={handleVideoPlaybackMode} aria-pressed={videoScrollLocked}>
            {videoScrollLocked ? 'ENABLE AUTOPLAY' : 'SWITCH TO SCROLLLOCK'}
          </button>
        </div>
        <div className="hero-sound-control">
          <button type="button" className={`sound-toggle ${soundEnabled ? 'is-on' : ''}`} onClick={toggleSound} aria-pressed={soundEnabled} aria-label={soundEnabled ? 'Turn sound off' : 'Turn sound on'}>
            <span className="sound-bars" aria-hidden="true"><i/><i/><i/><i/></span>
            <span>{soundEnabled ? 'SOUND ON' : 'SOUND OFF'}</span>
          </button>
        </div>
        <div className="hero-copy"><div className="eyebrow"><span className="status-dot"/>TRACKED ROBOTIC PLATFORM <span className="eyebrow-divider"/> TJ–01</div>
          <h1 className="hero-headline">Engineered for Control –<br/><em>Tracked Power. Dual-Jet Precision.</em></h1>
          <p className="hero-description">Website sections unlock only when progress reaches 100%.</p>
          <button type="button" className="hero-cta" onClick={handleExplorePlatform}><span>{currentUser && hasPlatformRequest ? 'Dashboard' : 'Explore Platform'}</span> <ArrowUpRight size={17}/></button>
          <div className="hero-metrics-grid" data-tilt>{metricsData.map((metric, idx) => <div key={metric.id} className="metric-counter-card" style={{ '--metric-index': idx }}><div className="metric-value">{counts[idx]}<span className="metric-suffix">{metric.suffix}</span></div><div className="metric-label">{metric.label}</div></div>)}</div>
        </div>
        <div className="hero-bottomline"><span><span className="live-dot"/> SYSTEM OVERVIEW</span><span className="scroll-cue">SCROLL TO INITIALIZE <ArrowDown size={14}/></span><span className="hero-index">01 / 05</span></div>
        <div className="intro-progress" aria-label={`Website access progress ${Math.round(introProgress)} percent`}><div className="progress-meta"><span>ACCESSING PLATFORM</span><strong>{Math.round(introProgress)}<small>%</small></strong></div><div className="progress-track" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow={Math.round(introProgress)}><span style={{ width: `${introProgress}%` }}/></div><span className="progress-hint">{unlocked ? 'PLATFORM UNLOCKED' : 'SCROLL TO CONTINUE'}</span></div>
      </section>

      <div className="content-sections" aria-hidden={!unlocked}>
        <section id="platform" className="platform-section reveal-section"><div className="section-kicker">01 — PLATFORM</div><div className="platform-intro"><div><h2>Precision mobility.<br/><span>Purpose-built control.</span></h2></div><p>The TJ-01 tracked robotic platform brings together continuous-track mobility, dual high-pressure jet architecture, and serviceable system design in a compact robotic solution.</p></div>
          <div className="platform-feature-grid">{platformPoints.map(({ icon: Icon, title, copy }, i) => <article className="platform-feature" data-tilt key={title}><div className="feature-icon"><Icon size={23} strokeWidth={1.6}/></div><span className="feature-count">0{i + 1}</span><h3>{title}</h3><p>{copy}</p></article>)}</div>
          <div className="platform-image-rail" aria-label="TJ-01 platform image references">
            <figure className="platform-image-card"><img src="/media/stills/crawler.jpg" alt="TJ-01 tracked crawler close view" loading="lazy"/><figcaption><span>01</span> TRACK SYSTEM</figcaption></figure>
            <figure className="platform-image-card"><img src="/media/stills/platform.jpg" alt="TJ-01 dual-jet platform view" loading="lazy"/><figcaption><span>02</span> DUAL-JET CORE</figcaption></figure>
            <figure className="platform-image-card"><img src="/media/stills/spin.jpg" alt="TJ-01 rotating platform view" loading="lazy"/><figcaption><span>03</span> PLATFORM FORM</figcaption></figure>
          </div>
          <div className="platform-media" data-tilt><div className="platform-media-copy"><span className="micro-label">DESIGNED AROUND THE TASK</span><h3>One integrated<br/>robotic platform.</h3><p>Explore the visible hardware, mobility base, and dual-jet arrangement through the project media.</p><a href="#gallery" className="text-link">View platform gallery <ArrowUpRight size={16}/></a></div><video src="/media/platform-spin.mp4" autoPlay muted loop playsInline preload="metadata" aria-label="DualJet platform rotating view"/></div>
        </section>

        <section id="systems" className="systems-section reveal-section"><header className="systems-header"><div className="systems-tag">TJ-01 ARCHITECTURE</div><h2>Systems engineered to work together.</h2><p>Integrated robotic subsystems designed around mobility, jet delivery, control, and service access.</p></header>
          <div className="systems-grid">{systemFeatures.map((feature, index) => { const Icon = feature.icon; return <article key={feature.id} className="system-card" data-tilt style={{ '--card-index': index }}><div className="card-glow" aria-hidden="true"/><div className="card-top"><div className="system-icon"><Icon size={22}/></div><div className="card-number">{feature.id}</div></div><h3>{feature.title}</h3><p>{feature.desc}</p><div className="card-accent-line" aria-hidden="true"/></article> })}</div>
          <div className="systems-footnote"><Layers3 size={18}/><p>System architecture and descriptive details are based on the features identified in the supplied project.</p></div>
        </section>

        <section id="applications" className="applications-section reveal-section"><div className="section-kicker">03 — APPLICATIONS</div><div className="applications-heading"><h2>Robotics for demanding<br/><span>operating environments.</span></h2><p>Tracked mobility and remotely managed high-pressure delivery can support work in locations where controlled movement and directed operation matter.</p></div><div className="application-cards"><article className="application-card" data-tilt><div className="application-symbol"><ShieldCheck size={25}/></div><span>01 / ACCESS</span><h3>Restricted-space operation</h3><p>A compact tracked configuration for maneuvering through constrained work areas.</p></article><article className="application-card" data-tilt><div className="application-symbol"><Waves size={25}/></div><span>02 / DELIVERY</span><h3>Directed jet tasks</h3><p>Dual nozzle architecture and hose management for controlled high-pressure delivery.</p></article><article className="application-card" data-tilt><div className="application-symbol"><Radio size={25}/></div><span>03 / CONTROL</span><h3>Remote system operation</h3><p>Control and telemetry components support coordinated platform operation and feedback.</p></article></div></section>

        <section id="gallery" className="gallery-section reveal-section"><div className="section-kicker">04 — FIELD NOTES / MEDIA</div><div className="gallery-heading"><div><h2>Platform, in motion.</h2><p>Video assets included with the original project.</p></div><div className="gallery-controls" aria-label="Gallery controls"><button type="button" onClick={() => setGalleryIndex((current) => Math.max(0, current - 1))} disabled={galleryIndex === 0} aria-label="Previous gallery card"><ChevronLeft size={18}/></button><span>{String(galleryIndex + 1).padStart(2, '0')} / {String(galleryMaxIndex + 1).padStart(2, '0')}</span><button type="button" onClick={() => setGalleryIndex((current) => Math.min(galleryMaxIndex, current + 1))} disabled={galleryIndex === galleryMaxIndex} aria-label="Next gallery card"><ChevronRight size={18}/></button></div></div><div className="gallery-viewport"><div className={`gallery-grid gallery-index-${galleryIndex}`}>
            <article className="gallery-card"><div className="gallery-media"><img src="/media/stills/crawler.jpg" alt="TJ-01 tracked crawler" loading="lazy"/></div><div className="gallery-card-body"><div><span>01</span><h3>TRACKED MOBILITY</h3></div><button type="button" onClick={() => window.open('/media/stills/crawler.jpg', '_blank', 'noopener,noreferrer')}>VIEW MEDIA <ArrowUpRight size={14}/></button></div></article>
            <article className="gallery-card"><div className="gallery-media"><img src="/media/stills/platform.jpg" alt="TJ-01 dual-jet platform" loading="lazy"/></div><div className="gallery-card-body"><div><span>02</span><h3>DUAL-JET PLATFORM</h3></div><button type="button" onClick={() => window.open('/media/stills/platform.jpg', '_blank', 'noopener,noreferrer')}>VIEW MEDIA <ArrowUpRight size={14}/></button></div></article>
            <article className="gallery-card"><div className="gallery-media"><video src="/media/dualjet-platform.mp4" controls muted playsInline preload="metadata" aria-label="DualJet platform video"/></div><div className="gallery-card-body"><div><span>03</span><h3>PLATFORM IN MOTION</h3></div><button type="button" onClick={() => window.open('/media/dualjet-platform.mp4', '_blank', 'noopener,noreferrer')}>OPEN VIDEO <ArrowUpRight size={14}/></button></div></article>
            <article className="gallery-card"><div className="gallery-media"><img src="/media/stills/banner.jpg" alt="TJ-01 field banner view" loading="lazy"/></div><div className="gallery-card-body"><div><span>04</span><h3>FIELD PROFILE</h3></div><button type="button" onClick={() => window.open('/media/stills/banner.jpg', '_blank', 'noopener,noreferrer')}>VIEW MEDIA <ArrowUpRight size={14}/></button></div></article>
          </div></div></section>

        <section id="contact" className="contact-section reveal-section"><div className="contact-orbit" aria-hidden="true"/><div className="section-kicker">05 — CONNECT</div><div className="contact-content"><div><h2>Let’s move<br/><span>engineering forward.</span></h2><p>Project enquiries are delivered directly to the AEROTRAC owner inbox.</p></div><div className="contact-gate"><span className="contact-gate-label">SECURE ENQUIRY CHANNEL</span><p>Any visitor can send a project enquiry. Your email is kept as the reply address for the engineering team.</p><button type="button" onClick={handleContactPage}>OPEN CONTACT PAGE <ArrowUpRight size={15}/></button></div></div></section><footer className="site-footer">
  <video className="footer-video" src="/media/crawler.mp4" autoPlay muted loop playsInline preload="metadata" aria-hidden="true"/>
  <div className="footer-video-overlay" aria-hidden="true"/>
  <div className="footer-inner">
    <div className="footer-main">
      <div className="footer-brand-block">
        <a href="#top" className="footer-brand">AEROTRAC <span>INTELLIGENT MOTION</span></a>
        <p>Tracked robotics engineered for controlled movement, high-pressure delivery and intelligent field operation.</p>
        <div className="footer-socials" aria-label="Social media">
          <a href="https://www.linkedin.com/" target="_blank" rel="noreferrer" aria-label="LinkedIn" title="LinkedIn"><span aria-hidden="true">in</span></a>
          <a href="https://www.instagram.com/" target="_blank" rel="noreferrer" aria-label="Instagram" title="Instagram"><span aria-hidden="true">◎</span></a>
          <a href="https://www.youtube.com/" target="_blank" rel="noreferrer" aria-label="YouTube" title="YouTube"><span aria-hidden="true">▶</span></a>
        </div>
      </div>
      <div className="footer-column">
        <small>QUICK NAVIGATION</small>
        <a href="#top">Home</a>
        <a href="#platform">About</a>
        <a href="#systems">Technology</a>
        <a href="#applications">Services</a>
        <a href="/contact" onClick={handleContactPage}>Contact</a>
      </div>
      <div className="footer-column">
        <small>EXPLORE</small>
        {navItems.filter((item) => ['Platform','Systems','Applications','Gallery'].includes(item.label)).map((item) => <a key={item.label} href={item.href} onClick={(event) => { if (item.href === '#platform') handleExplorePlatform(event) }}>{item.label}</a>)}
      </div>
      <div className="footer-contact">
        <small>CONTACT</small>
        <a href="/contact" onClick={handleContactPage}><MapPin size={14}/> India / Engineering &amp; Field Operations</a>
        <a href="tel:+910000000000"><Phone size={14}/> +91 XXX XXX XXXX</a>
        <a href="mailto:hello@aerotrac.example"><Mail size={14}/> hello@aerotrac.example</a>
      </div>
    </div>
    <div className="footer-bottom">
      <span>© 2026 AEROTRAC. ALL RIGHTS RESERVED.</span>
      <span>TJ-01 / TRACKED ROBOTIC PLATFORM</span>
      <a href="#top">BACK TO TOP ↑</a>
    </div>
  </div>
</footer></div>
      </>}
    </main>
  )
}
export default App
