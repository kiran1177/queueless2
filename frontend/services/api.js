// QueueLess REST API Client communicating with Python FastAPI Backend
const API_BASE = window.location.port === "8000" ? "/api" : "http://127.0.0.1:8000/api";

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  let authHeaders = {};
  if (window.appState && window.appState.userId) {
    authHeaders['X-User-Id'] = window.appState.userId;
    authHeaders['X-User-Role'] = window.appState.role || 'citizen';
  }

  const defaultHeaders = {
    "Content-Type": "application/json",
    "Accept": "application/json",
    ...authHeaders
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers
      }
    });

    if (!response.ok) {
      let errMsg = `Server error (${response.status})`;
      try {
        const errJson = await response.json();
        errMsg = errJson.detail || errJson.message || errMsg;
      } catch (e) {
        // use fallback status text
      }
      throw new Error(errMsg);
    }

    return await response.json();
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error);
    throw error;
  }
}

export const api = {
  // Health
  getHealth: () => request("/health"),

  // Dashboard
  getDashboard: (userId = "usr_priyanka") => request(`/dashboard?userId=${encodeURIComponent(userId)}`),

  // Tokens
  getTokens: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/tokens${qs ? "?" + qs : ""}`);
  },
  getToken: (tokenId) => request(`/tokens/${encodeURIComponent(tokenId)}`),
  createToken: (payload) => request("/tokens", {
    method: "POST",
    body: JSON.stringify(payload)
  }),
  updateTokenStatus: (tokenId, status, counterId = null) => request(`/tokens/${encodeURIComponent(tokenId)}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status, counterId })
  }),
  checkInToken: (tokenId) => request(`/tokens/${encodeURIComponent(tokenId)}/checkin`, {
    method: "POST"
  }),
  cancelToken: (tokenId, userId = "usr_priyanka") => request(`/tokens/${encodeURIComponent(tokenId)}?userId=${encodeURIComponent(userId)}`, {
    method: "DELETE"
  }),

  // Services
  getServices: (officeId = null) => request(`/services${officeId ? `?officeId=${encodeURIComponent(officeId)}` : ""}`),
  getService: (serviceId) => request(`/services/${encodeURIComponent(serviceId)}`),

  // Offices
  getOffices: () => request("/offices"),
  getOffice: (officeId) => request(`/offices/${encodeURIComponent(officeId)}`),

  // Documents
  getDocuments: (userId = "usr_priyanka", serviceId = null) => {
    let url = `/documents?userId=${encodeURIComponent(userId)}`;
    if (serviceId) url += `&serviceId=${encodeURIComponent(serviceId)}`;
    return request(url);
  },
  toggleDocument: (userId, serviceId, documentType, status) => request("/documents/toggle", {
    method: "POST",
    body: JSON.stringify({ userId, serviceId, documentType, status })
  }),

  // Calendar
  getCalendar: (userId = "usr_priyanka", month = null, year = null) => {
    let url = `/calendar?userId=${encodeURIComponent(userId)}`;
    if (month) url += `&month=${month}`;
    if (year) url += `&year=${year}`;
    return request(url);
  },

  // History
  getHistory: (userId = null) => request(`/token-history${userId ? `?userId=${encodeURIComponent(userId)}` : ""}`),

  // Notifications
  getNotifications: (userId = "usr_priyanka") => request(`/notifications?userId=${encodeURIComponent(userId)}`),
  markNotificationRead: (notificationId) => request(`/notifications/${encodeURIComponent(notificationId)}/read`, {
    method: "PATCH"
  }),
  markAllNotificationsRead: (userId = "usr_priyanka") => request(`/notifications/mark-all-read?userId=${encodeURIComponent(userId)}`, {
    method: "POST"
  }),

  // Admin
  getAdminOverview: (officeId = "OFF-RTO-01") => request(`/admin/overview?officeId=${encodeURIComponent(officeId)}`),
  adminCallNext: (counterId, officeId = "OFF-RTO-01") => request(`/admin/call-next?counterId=${counterId}&officeId=${encodeURIComponent(officeId)}`, {
    method: "POST"
  }),
  adminWalkin: (serviceId, officeId = "OFF-RTO-01", citizenName = "Walk-in Citizen") => request(`/admin/walkin?serviceId=${encodeURIComponent(serviceId)}&officeId=${encodeURIComponent(officeId)}&citizenName=${encodeURIComponent(citizenName)}`, {
    method: "POST"
  }),
  adminToggleCounter: (counterId, active) => request(`/admin/counter/${counterId}`, {
    method: "PATCH",
    body: JSON.stringify({ active })
  }),
  adminUpdateCapacity: (dailyCapacity, officeId = "OFF-RTO-01") => request(`/admin/capacity?officeId=${encodeURIComponent(officeId)}`, {
    method: "PATCH",
    body: JSON.stringify({ dailyCapacity })
  }),
  getStaff: () => request("/admin/staff"),
  createStaff: (payload) => request("/admin/staff", {
    method: "POST",
    body: JSON.stringify(payload)
  }),
  adminResetDemo: () => request("/admin/reset-demo", { method: "POST" })
};
