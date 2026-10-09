// Dedicated Token Booking & Generation Page
export function renderTakeTokenPage(state, actions) {
  const t = actions.t;
  const offices = state.offices || [];
  const services = state.services || [];
  const currentToken = state.currentToken;

  const selectedOfficeId = state.selectedOfficeId || (offices[0]?.officeId || 'OFF-CIVIC-02');
  const selectedServiceId = state.selectedServiceId || (services[0]?.serviceId || 'SRV-BIRTH');

  const selectedOffice = offices.find(o => o.officeId === selectedOfficeId) || offices[0] || {};
  const selectedService = services.find(s => s.serviceId === selectedServiceId) || services[0] || {};
  const requiredDocs = selectedService.requiredDocuments || [];

  const todayStr = new Date().toISOString().split('T')[0];

  return `
    <div class="page-container">
      <div style="margin-bottom: 24px;">
        <h2 style="font-size: 24px; font-weight: 700; color: var(--primary);">
          🎫 ${t('navTakeToken')} - Virtual Queue Pass
        </h2>
        <p style="font-size: 14px; color: var(--text-muted);">
          Take an authentic, verified token remotely and visit the government office only when your turn is approaching.
        </p>
      </div>

      ${currentToken ? `
        <div class="card-panel" style="border-left: 4px solid var(--saffron); margin-bottom: 24px;">
          <h3 style="font-size: 16px; color: #B45309; margin-bottom: 6px;">
            ⚠️ You already hold an active token: <b>${currentToken.tokenNumber}</b>
          </h3>
          <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 14px;">
            To ensure fair queue distribution for all citizens, one active token is permitted at a time.
          </p>
          <div style="display: flex; gap: 10px;">
            <button class="btn btn-primary btn-sm" onclick="window.appActions.navigateTo('dashboard')">
              View Active Token on Dashboard &rarr;
            </button>
            <button class="btn btn-danger btn-sm" onclick="window.appActions.releaseToken('${currentToken.tokenId}')">
              Cancel Existing Token
            </button>
          </div>
        </div>
      ` : ''}

      <div class="dashboard-grid">
        <!-- Token Booking Form Panel -->
        <div class="card-panel">
          <form onsubmit="window.appActions.submitDedicatedToken(event)">
            <!-- 1. Select Office -->
            <div class="form-group">
              <label>1. ${t('step1Office')}</label>
              <select 
                class="form-select" 
                id="dedicated-office-select"
                onchange="window.appActions.handleDedicatedOfficeChange(this.value)"
              >
                ${offices.map(o => `
                  <option value="${o.officeId}" ${o.officeId === selectedOfficeId ? 'selected' : ''}>
                    ${o.officeName} &bull; Capacity: ${o.remainingCapacity || 12} remaining
                  </option>
                `).join('')}
              </select>
            </div>

            <!-- 2. Select Service -->
            <div class="form-group">
              <label>2. ${t('step2Service')}</label>
              <select 
                class="form-select" 
                id="dedicated-service-select"
                onchange="window.appActions.handleDedicatedServiceChange(this.value)"
              >
                ${services.map(s => `
                  <option value="${s.serviceId}" ${s.serviceId === selectedServiceId ? 'selected' : ''}>
                    ${s.icon || '📄'} ${s.serviceName} (~${s.estimatedProcessingTime || 15} min)
                  </option>
                `).join('')}
              </select>
              <small style="color: var(--text-muted);">${selectedService.description || ''}</small>
            </div>

            <!-- 3. Required Documents & Verification -->
            <div class="form-group" style="background-color: var(--bg-muted); padding: 14px; border-radius: var(--radius-sm); border: 1px solid var(--border);">
              <label style="margin-bottom: 8px;">3. ${t('step3Docs')}</label>
              <ul class="doc-checklist">
                ${requiredDocs.map(d => `
                  <li class="doc-item verified" style="cursor: default;">
                    <div class="doc-item-title">
                      <span style="color: var(--green); font-weight: bold;">✓</span>
                      <span>${d}</span>
                    </div>
                    <span class="badge verified">Mandatory</span>
                  </li>
                `).join('')}
              </ul>
              <small style="display: block; color: var(--text-sub); margin-top: 10px;">
                Original physical documents will be stamped and countersigned during processing.
              </small>
            </div>

            <!-- 4. Date and Slot -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
              <div class="form-group">
                <label>4. ${t('dateLabel')}</label>
                <input 
                  type="date" 
                  class="form-input" 
                  id="dedicated-date-input" 
                  value="${todayStr}" 
                  min="${todayStr}"
                />
              </div>

              <div class="form-group">
                <label>${t('slotLabel')}</label>
                <select class="form-select" id="dedicated-slot-select">
                  <option value="0">${t('firstAvailable')}</option>
                  <option value="540">09:00 AM - 09:30 AM</option>
                  <option value="570">09:30 AM - 10:00 AM</option>
                  <option value="600">10:00 AM - 10:30 AM</option>
                  <option value="630">10:30 AM - 11:00 AM</option>
                  <option value="660">11:00 AM - 11:30 AM</option>
                  <option value="840">02:00 PM - 02:30 PM</option>
                  <option value="870">02:30 PM - 03:00 PM</option>
                </select>
              </div>
            </div>

            <div style="margin-top: 20px;">
              <button 
                type="submit" 
                class="btn btn-primary" 
                style="width: 100%; padding: 12px;"
                ${currentToken ? 'disabled' : ''}
              >
                ✓ ${t('confirmBooking')}
              </button>
            </div>
          </form>
        </div>

        <!-- Office Capacity & Information Sidebar -->
        <div class="dashboard-col">
          <div class="card-panel">
            <h3 style="font-size: 16px; margin-bottom: 12px; color: var(--primary);">
              🏛️ ${selectedOffice.officeName || 'Office Details'}
            </h3>
            <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 12px;">
              📍 ${selectedOffice.location || 'Rajkot, Gujarat'}
            </p>

            <div style="display: flex; flex-direction: column; gap: 10px; font-size: 13px;">
              <div style="display: flex; justify-content: space-between; padding-bottom: 8px; border-bottom: 1px solid var(--border);">
                <span style="color: var(--text-sub);">Working Hours:</span>
                <b>9:00 AM - 5:00 PM</b>
              </div>
              <div style="display: flex; justify-content: space-between; padding-bottom: 8px; border-bottom: 1px solid var(--border);">
                <span style="color: var(--text-sub);">Lunch Break:</span>
                <b>1:00 PM - 2:00 PM</b>
              </div>
              <div style="display: flex; justify-content: space-between; padding-bottom: 8px; border-bottom: 1px solid var(--border);">
                <span style="color: var(--text-sub);">Active Counters:</span>
                <b>${selectedOffice.activeCounters || 3} Counters</b>
              </div>
              <div style="display: flex; justify-content: space-between; padding-bottom: 8px; border-bottom: 1px solid var(--border);">
                <span style="color: var(--text-sub);">Daily Capacity:</span>
                <b>${selectedOffice.dailyCapacity || 20} Tokens</b>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span style="color: var(--text-sub);">Current Wait Time:</span>
                <b style="color: var(--saffron);">~${selectedOffice.estimatedWaitingTime || 20} minutes</b>
              </div>
            </div>
          </div>

          <!-- Official Workflow Steps -->
          <div class="card-panel">
            <h4 style="font-size: 14px; margin-bottom: 10px; color: var(--text-main);">
              How Virtual Queuing Works:
            </h4>
            <ol style="padding-left: 18px; font-size: 12px; color: var(--text-muted); display: flex; flex-direction: column; gap: 6px;">
              <li>Select service and book your virtual token from home.</li>
              <li>MongoDB assigns a safe unique sequence number and calculates waiting time.</li>
              <li>Receive real-time departure alert based on your distance and queue speed.</li>
              <li>Scan the QR code at the entrance kiosk upon arrival to confirm your presence.</li>
              <li>Proceed straight to the designated counter when your token is called.</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  `;
}
