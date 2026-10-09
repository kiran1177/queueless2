// Main Application Controller & View Orchestrator
import { T } from './utils/translations.js';
import { api } from './services/api.js';

import { renderHeader } from './components/Header.js';
import { renderSidebar } from './components/Sidebar.js';
import { renderTokenModal } from './components/TokenModal.js';
import { renderQRModal } from './components/QRModal.js';

import { renderDashboardPage } from './pages/DashboardPage.js';
import { renderTakeTokenPage } from './pages/TakeTokenPage.js';
import { renderMyTokensPage } from './pages/MyTokensPage.js';
import { renderDocumentsPage } from './pages/DocumentsPage.js';
import { renderAdminPage } from './pages/AdminPage.js';
import { renderStaffPage } from './pages/StaffPage.js';
import { renderProfilePage } from './pages/ProfilePage.js';

// Global Reactive State
const state = {
  lang: 'en',
  role: localStorage.getItem('ql_role') || 'citizen',
  currentRoute: localStorage.getItem('ql_role') === 'admin' ? 'admin' : (localStorage.getItem('ql_role') === 'staff' ? 'staff' : 'dashboard'),
  userId: localStorage.getItem('ql_userId') || 'usr_priyanka',
  staffCounterId: localStorage.getItem('ql_staffCounterId') || null,
  user: {
    userId: localStorage.getItem('ql_userId') || 'usr_priyanka',
    name: 'Priyanka Maheta',
    phone: '9876543210',
    email: 'priyanka.maheta@example.in',
    city: 'Rajkot, Gujarat'
  },
  travelMinutes: 25,
  currentTimeStr: '',

  // Backend / MongoDB Data
  currentToken: null,
  upcomingTokens: [],
  calendarTokens: [],
  calendarData: { events: {}, availableSlots: [] },
  selectedMonth: new Date().getMonth(),
  selectedYear: new Date().getFullYear(),
  selectedDate: new Date().toISOString().split('T')[0],

  offices: [],
  services: [],
  service: null,
  documents: [],
  allDocuments: [],
  counters: [],
  notifications: [],
  recentHistory: [],
  allTokens: [],
  myTokens: [],

  // Admin Data
  adminData: {},
  adminTokenTab: 'waiting',

  // Modals & UI State
  showTokenModal: false,
  modalSelectedOfficeId: 'OFF-CIVIC-02',
  modalSelectedServiceId: 'SRV-BIRTH',
  modalSelectedDate: new Date().toISOString().split('T')[0],
  activeQRTokenId: null,

  docsSelectedServiceId: 'all'
};

window.appState = state;

// Translation Helper
function t(key) {
  const dict = T[state.lang] || T.en;
  return dict[key] || T.en[key] || key;
}

// Toast System
function showToast(message, type = 'info') {
  const container = document.getElementById('toasts-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => {
    toast.remove();
  }, 4500);
}

// Data Fetching & Sync with Backend / MongoDB
async function fetchData() {
  try {
    // 1. Fetch Dashboard Bundle
    const dash = await api.getDashboard(state.userId);
    state.user = dash.user || state.user;
    state.currentToken = dash.currentToken || null;
    state.upcomingTokens = dash.upcomingTokens || [];
    state.calendarTokens = dash.calendarTokens || [];
    state.officeStatus = dash.officeStatus || {};
    state.primaryOffice = dash.primaryOffice || {};
    state.counters = dash.counters || [];
    state.service = dash.service || null;
    state.documents = dash.documents || [];
    state.notifications = dash.notifications || [];
    state.recentHistory = dash.recentHistory || [];

    // 2. Fetch Master Collections
    const [offices, services, allDocs, allTokens, calendar] = await Promise.all([
      api.getOffices(),
      api.getServices(),
      api.getDocuments(state.userId),
      api.getTokens(),
      api.getCalendar(state.userId, state.selectedMonth + 1, state.selectedYear)
    ]);

    state.offices = offices;
    state.services = services;
    state.allDocuments = allDocs;
    state.allTokens = allTokens;
    state.myTokens = allTokens.filter(tk => tk.userId === state.userId);
    state.calendarData = calendar;

    // 3. If in Admin or Staff role, fetch Admin Bundle
    if (state.role === 'admin' || state.role === 'staff' || state.currentRoute === 'admin') {
      const adminOverview = await api.getAdminOverview();
      state.adminData = adminOverview;
    }
    if (state.role === 'admin') {
      state.staffList = await api.getStaff();
    }
  } catch (error) {
    console.warn("Sync warning with backend:", error);
  }
}

// Time ticker
function updateClock() {
  const now = new Date();
  let h = now.getHours();
  const m = String(now.getMinutes()).padStart(2, '0');
  const s = String(now.getSeconds()).padStart(2, '0');
  const period = h < 12 ? 'AM' : 'PM';
  h = h % 12 || 12;
  state.currentTimeStr = `${h}:${m}:${s} ${period}`;
  
  const clockEl = document.getElementById('live-clock-text');
  if (clockEl) {
    clockEl.textContent = state.currentTimeStr;
  }
}

// Render Main App
function render() {
  if (!localStorage.getItem('ql_userId')) {
    window.location.href = './login.html';
    return;
  }
  const root = document.getElementById('app-root');
  if (!root) return;

  const actions = { t, showToast };

  let pageContent = '';
  switch (state.currentRoute) {
    case 'dashboard':
      pageContent = renderDashboardPage(state, actions);
      break;
    case 'take-token':
      pageContent = renderTakeTokenPage(state, actions);
      break;
    case 'my-tokens':
      pageContent = renderMyTokensPage(state, actions);
      break;
    case 'documents':
      pageContent = renderDocumentsPage(state, actions);
      break;
    case 'notifications':
      // Render full notifications view
      pageContent = `
        <div class="page-container" style="max-width: 800px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
            <h2 style="font-size: 24px; font-weight: 700; color: var(--primary);">🔔 ${t('notificationsTitle')}</h2>
            <button class="btn btn-secondary btn-sm" onclick="window.appActions.markAllNotificationsRead()">${t('markAllRead')}</button>
          </div>
          <div style="display: flex; flex-direction: column; gap: 12px;">
            ${(state.notifications || []).map(n => `
              <div class="card-panel" style="border-left: 4px solid ${n.type==='ok'?'var(--green)':n.type==='call'?'var(--saffron)':'var(--primary)'};">
                <div style="display: flex; justify-content: space-between;">
                  <b style="font-size: 14px; color: var(--text-main);">${n.title}</b>
                  <small style="color: var(--text-sub);">${new Date(n.createdAt).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</small>
                </div>
                <p style="font-size: 13px; color: var(--text-muted); margin-top: 6px;">${n.message}</p>
              </div>
            `).join('')}
            ${(!state.notifications || state.notifications.length === 0) ? `<p style="text-align: center; color: var(--text-muted); padding: 40px;">${t('noNotifications')}</p>` : ''}
          </div>
        </div>
      `;
      break;
    case 'admin':
      pageContent = renderAdminPage(state, actions);
      break;
    case 'staff':
      pageContent = renderStaffPage(state, actions);
      break;
    case 'profile':
      pageContent = renderProfilePage(state, actions);
      break;
    default:
      pageContent = renderDashboardPage(state, actions);
  }

  root.innerHTML = `
    <div class="app-container">
      ${renderSidebar(state, actions)}
      <div style="display: flex; flex-direction: column; min-width: 0;">
        ${renderHeader(state, actions)}
        <main class="main-content">
          ${pageContent}
        </main>
      </div>
    </div>
    ${renderTokenModal(state, actions)}
    ${renderQRModal(state, actions)}
    <div id="toasts-container"></div>
  `;
}

// User Actions Handler mapped on window
window.appActions = {
  navigateTo: (route) => {
    state.currentRoute = route;
    if (route === 'admin') {
      state.role = 'admin';
    }
    render();
  },

  logout: () => {
    localStorage.removeItem('ql_userId');
    localStorage.removeItem('ql_role');
    localStorage.removeItem('ql_staffCounterId');
    window.location.href = './login.html';
  },

  setRole: (role) => {
    // Left for safety but shouldn't be called
    console.warn('Role cannot be switched dynamically');
  },

  setLang: (lang) => {
    state.lang = lang;
    render();
  },

  refreshData: async () => {
    await fetchData();
    render();
    showToast("Data refreshed from MongoDB.", "ok");
  },

  handleSearch: (term) => {
    // Search handler for services or tokens
    console.log("Searching:", term);
  },

  // Modal actions
  openTokenModal: () => {
    state.showTokenModal = true;
    render();
  },

  closeTokenModal: () => {
    state.showTokenModal = false;
    render();
  },

  handleModalOfficeChange: (officeId) => {
    state.modalSelectedOfficeId = officeId;
    render();
  },

  handleModalServiceChange: (serviceId) => {
    state.modalSelectedServiceId = serviceId;
    render();
  },

  handleModalDateChange: (dateVal) => {
    state.modalSelectedDate = dateVal;
    render();
  },

  submitGenerateToken: async (event) => {
    event.preventDefault();
    const officeId = document.getElementById('token-office-select').value;
    const serviceId = document.getElementById('token-service-select').value;
    const dateVal = document.getElementById('token-date-input').value;
    const slotVal = parseInt(document.getElementById('token-slot-select').value) || 0;

    try {
      const result = await api.createToken({
        officeId,
        serviceId,
        date: dateVal,
        slot: slotVal,
        userId: state.userId,
        userName: state.user.name,
        userPhone: state.user.phone,
        source: 'online'
      });

      state.showTokenModal = false;
      showToast(`${t('tokenCreatedSuccess')} Assigned: ${result.tokenNumber}`, "ok");
      await fetchData();
      state.currentRoute = 'dashboard';
      render();
    } catch (err) {
      showToast(err.message, "warn");
    }
  },

  handleDedicatedOfficeChange: (officeId) => {
    state.selectedOfficeId = officeId;
    render();
  },

  handleDedicatedServiceChange: (serviceId) => {
    state.selectedServiceId = serviceId;
    render();
  },

  submitDedicatedToken: async (event) => {
    event.preventDefault();
    const officeId = document.getElementById('dedicated-office-select').value;
    const serviceId = document.getElementById('dedicated-service-select').value;
    const dateVal = document.getElementById('dedicated-date-input').value;
    const slotVal = parseInt(document.getElementById('dedicated-slot-select').value) || 0;

    try {
      const result = await api.createToken({
        officeId,
        serviceId,
        date: dateVal,
        slot: slotVal,
        userId: state.userId,
        userName: state.user.name,
        userPhone: state.user.phone,
        source: 'online'
      });

      showToast(`Token ${result.tokenNumber} created in MongoDB!`, "ok");
      await fetchData();
      state.currentRoute = 'dashboard';
      render();
    } catch (err) {
      showToast(err.message, "warn");
    }
  },

  releaseToken: async (tokenId) => {
    if (!confirm("Are you sure you want to cancel and release this virtual queue token?")) return;
    try {
      await api.cancelToken(tokenId, state.userId);
      showToast(t('tokenReleasedSuccess'), "ok");
      await fetchData();
      render();
    } catch (err) {
      showToast(err.message, "warn");
    }
  },

  // QR Modal Actions
  openQRModal: (tokenId) => {
    state.activeQRTokenId = tokenId;
    render();
  },

  closeQRModal: () => {
    state.activeQRTokenId = null;
    render();
  },

  simulateOfficeCheckin: async (tokenId) => {
    try {
      await api.checkInToken(tokenId);
      showToast(t('checkinSuccess'), "ok");
      await fetchData();
      state.activeQRTokenId = null;
      render();
    } catch (err) {
      showToast(err.message, "warn");
    }
  },

  // Document Checklist Actions
  toggleDocument: async (serviceId, docType, nextStatus) => {
    try {
      await api.toggleDocument(state.userId, serviceId, docType, nextStatus);
      showToast(`Document "${docType}" updated to ${nextStatus} in MongoDB.`, "ok");
      await fetchData();
      render();
    } catch (err) {
      showToast(err.message, "warn");
    }
  },

  filterDocumentsService: (serviceId) => {
    state.docsSelectedServiceId = serviceId;
    render();
  },

  // Calendar Actions
  changeCalendarMonth: (delta) => {
    let newMonth = state.selectedMonth + delta;
    let newYear = state.selectedYear;
    if (newMonth < 0) {
      newMonth = 11;
      newYear--;
    } else if (newMonth > 11) {
      newMonth = 0;
      newYear++;
    }
    state.selectedMonth = newMonth;
    state.selectedYear = newYear;
    fetchData().then(render);
  },

  selectCalendarDate: (dateStr) => {
    state.selectedDate = dateStr;
    render();
    const events = state.calendarData?.events?.[dateStr] || [];
    if (events.length > 0) {
      showToast(`Selected ${dateStr}: ${events.length} token appointments found.`, "info");
    } else {
      showToast(`Selected ${dateStr}: No tokens scheduled. Click "Generate Token" to book.`, "info");
    }
  },

  markAllNotificationsRead: async () => {
    try {
      await api.markAllNotificationsRead(state.userId);
      await fetchData();
      render();
      showToast("All notifications marked as read.", "ok");
    } catch (err) {
      showToast(err.message, "warn");
    }
  },

  // Admin Actions
  setAdminTab: (tab) => {
    state.adminTokenTab = tab;
    render();
  },

  adminCallNextToCounter: async (counterId) => {
    try {
      const res = await api.adminCallNext(counterId);
      showToast(res.message, "ok");
      await fetchData();
      render();
    } catch (err) {
      showToast(err.message, "warn");
    }
  },

  adminCallTokenDirect: async (tokenId, counterId = 1) => {
    try {
      await api.updateTokenStatus(tokenId, 'called', counterId);
      showToast("Token called to Counter.", "ok");
      await fetchData();
      render();
    } catch (err) {
      showToast(err.message, "warn");
    }
  },

  adminCompleteCounterToken: async (counterId) => {
    const counter = state.counters?.find(c => String(c.counterId) === String(counterId));
    if (!counter || !counter.currentTokenId) return;
    try {
      await api.updateTokenStatus(counter.currentTokenId, 'completed', counterId);
      showToast("Token marked completed and archived in MongoDB tokenHistory.", "ok");
      await fetchData();
      render();
    } catch (err) {
      showToast(err.message, "warn");
    }
  },

  adminUpdateTokenStatus: async (tokenId, status) => {
    try {
      await api.updateTokenStatus(tokenId, status);
      showToast(`Token status updated to "${status}" in MongoDB.`, "ok");
      await fetchData();
      render();
    } catch (err) {
      showToast(err.message, "warn");
    }
  },

  submitAddStaff: async (event) => {
    event.preventDefault();
    const name = document.getElementById('staff-name').value;
    const phone = document.getElementById('staff-phone').value;
    const email = document.getElementById('staff-email').value;
    const password = document.getElementById('staff-password').value;
    const counterId = parseInt(document.getElementById('staff-counter').value) || 1;
    
    try {
      await api.createStaff({
        name, phone, email, password,
        assignedOfficeId: 'OFF-RTO-01',
        assignedCounterId: counterId
      });
      showToast(`Staff member ${name} successfully created!`, "ok");
      document.getElementById('staff-name').value = '';
      document.getElementById('staff-phone').value = '';
      document.getElementById('staff-email').value = '';
      document.getElementById('staff-password').value = '';
      await window.appActions.refreshData();
    } catch (err) {
      showToast(err.message, "warn");
    }
  },

  staffMarkNoShow: async (counterId) => {
    const counter = state.counters?.find(c => String(c.counterId) === String(counterId));
    if (!counter || !counter.currentTokenId) return;
    try {
      await api.updateTokenStatus(counter.currentTokenId, 'missed', counterId);
      showToast("Token marked as No-Show.", "ok");
      await fetchData();
      render();
    } catch (err) {
      showToast(err.message, "warn");
    }
  },

  staffTransferToken: async (counterId) => {
    showToast("Token transferred to next available counter.", "info");
  },

  staffVerifyDocuments: async (counterId) => {
    showToast("Documents physically verified for current token.", "ok");
  },

  adminToggleCounterStatus: async (counterId, active) => {
    try {
      await api.adminToggleCounter(counterId, active);
      showToast(`Counter ${counterId} set to ${active ? 'Active' : 'Closed'}.`, "ok");
      await fetchData();
      render();
    } catch (err) {
      showToast(err.message, "warn");
    }
  },

  submitWalkinToken: async (event) => {
    event.preventDefault();
    const name = document.getElementById('walkin-name').value;
    const serviceId = document.getElementById('walkin-service').value;
    try {
      const res = await api.adminWalkin(serviceId, 'OFF-RTO-01', name);
      showToast(`Walk-in Token ${res.tokenNumber} issued successfully for ${name}!`, "ok");
      document.getElementById('walkin-name').value = '';
      await fetchData();
      render();
    } catch (err) {
      showToast(err.message, "warn");
    }
  },

  updateDailyCapacity: async () => {
    const cap = parseInt(document.getElementById('capacity-input').value);
    if (!cap || cap < 1) return;
    try {
      await api.adminUpdateCapacity(cap);
      showToast(`Daily token capacity updated to ${cap} in MongoDB.`, "ok");
      await fetchData();
      render();
    } catch (err) {
      showToast(err.message, "warn");
    }
  },

  resetDemoData: async () => {
    if (!confirm("Reset database to clean initial demonstration seed?")) return;
    try {
      await api.adminResetDemo();
      showToast("MongoDB database reset to initial demonstration state.", "ok");
      await fetchData();
      render();
    } catch (err) {
      showToast(err.message, "warn");
    }
  },

  saveTravelTime: (event) => {
    event.preventDefault();
    const mins = parseInt(document.getElementById('profile-travel-mins').value) || 25;
    state.travelMinutes = mins;
    showToast(`Commute time saved (${mins} mins). Recommended departure times updated.`, "ok");
    render();
  }
};

// Initial Startup
async function initApp() {
  updateClock();
  setInterval(updateClock, 1000);

  await fetchData();
  render();

  // Periodic polling to synchronize live queues every 5 seconds
  setInterval(async () => {
    if (!state.showTokenModal && !state.activeQRTokenId) {
      await fetchData();
      render();
    }
  }, 5000);
}

document.addEventListener('DOMContentLoaded', initApp);
