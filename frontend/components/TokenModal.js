// Token Generation Multi-step Modal Component
export function renderTokenModal(state, actions) {
  const t = actions.t;
  if (!state.showTokenModal) return '';

  const offices = state.offices || [];
  const services = state.services || [];
  const selectedOfficeId = state.modalSelectedOfficeId || (offices[0]?.officeId || 'OFF-CIVIC-02');
  const selectedServiceId = state.modalSelectedServiceId || (services[0]?.serviceId || 'SRV-BIRTH');
  
  const currentService = services.find(s => s.serviceId === selectedServiceId) || services[0] || {};
  const requiredDocs = currentService.requiredDocuments || [];

  const availableSlots = state.calendarData?.availableSlots || [
    { slotValue: 0, label: "First available" },
    { slotValue: 540, label: "09:00 AM - 09:30 AM" },
    { slotValue: 570, label: "09:30 AM - 10:00 AM" },
    { slotValue: 600, label: "10:00 AM - 10:30 AM" },
    { slotValue: 630, label: "10:30 AM - 11:00 AM" },
    { slotValue: 660, label: "11:00 AM - 11:30 AM" },
    { slotValue: 840, label: "02:00 PM - 02:30 PM" },
    { slotValue: 870, label: "02:30 PM - 03:00 PM" }
  ];

  const todayStr = new Date().toISOString().split('T')[0];
  const selectedDate = state.modalSelectedDate || todayStr;

  return `
    <div class="modal-overlay" onclick="if(event.target===this) window.appActions.closeTokenModal()">
      <div class="modal-content">
        <div class="modal-header">
          <h3>🎫 ${t('bookTokenTitle')}</h3>
          <button class="btn btn-secondary btn-sm" onclick="window.appActions.closeTokenModal()">✕</button>
        </div>

        <form id="token-form" onsubmit="window.appActions.submitGenerateToken(event)">
          <div class="modal-body">
            <!-- Step 1: Select Office -->
            <div class="form-group">
              <label>${t('step1Office')}</label>
              <select 
                class="form-select" 
                id="token-office-select" 
                onchange="window.appActions.handleModalOfficeChange(this.value)"
              >
                ${offices.map(o => `
                  <option value="${o.officeId}" ${o.officeId === selectedOfficeId ? 'selected' : ''}>
                    ${o.officeName} (${o.remainingCapacity || 10} slots left today)
                  </option>
                `).join('')}
              </select>
            </div>

            <!-- Step 2: Select Service -->
            <div class="form-group">
              <label>${t('step2Service')}</label>
              <select 
                class="form-select" 
                id="token-service-select"
                onchange="window.appActions.handleModalServiceChange(this.value)"
              >
                ${services.map(s => `
                  <option value="${s.serviceId}" ${s.serviceId === selectedServiceId ? 'selected' : ''}>
                    ${s.icon || '📄'} ${s.serviceName} (~${s.estimatedProcessingTime || 15} min)
                  </option>
                `).join('')}
              </select>
            </div>

            <!-- Step 3: Required Documents & Readiness -->
            <div class="form-group" style="background-color: var(--bg-muted); padding: 12px; border-radius: var(--radius-sm); border: 1px solid var(--border);">
              <label style="margin-bottom: 6px;">${t('step3Docs')}</label>
              <ul style="list-style: none; display: flex; flex-direction: column; gap: 6px; font-size: 13px;">
                ${requiredDocs.map(d => `
                  <li style="display: flex; align-items: center; gap: 8px;">
                    <span style="color: var(--green); font-weight: bold;">✓</span>
                    <span>${d}</span>
                  </li>
                `).join('')}
              </ul>
              <small style="color: var(--text-muted); display: block; margin-top: 8px;">
                Please ensure you bring original paper documents for counter verification.
              </small>
            </div>

            <!-- Step 4: Choose Date and Slot -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              <div class="form-group">
                <label>${t('dateLabel')}</label>
                <input 
                  type="date" 
                  class="form-input" 
                  id="token-date-input" 
                  value="${selectedDate}" 
                  min="${todayStr}"
                  onchange="window.appActions.handleModalDateChange(this.value)"
                />
              </div>

              <div class="form-group">
                <label>${t('step4Slot')}</label>
                <select class="form-select" id="token-slot-select">
                  <option value="0">${t('firstAvailable')}</option>
                  ${availableSlots.filter(s => s.slotValue > 0).map(s => `
                    <option value="${s.slotValue}">${s.label}</option>
                  `).join('')}
                </select>
              </div>
            </div>

            <div style="font-size: 12px; color: var(--text-muted); background-color: #FEF3C7; padding: 8px 12px; border-radius: var(--radius-sm); border: 1px solid #FCD34D;">
              ⏱️ Office timings: 9:00 AM - 5:00 PM. Lunch break: 1:00 PM - 2:00 PM. No tokens are processed during lunch hour.
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" onclick="window.appActions.closeTokenModal()">
              ${t('cancel')}
            </button>
            <button type="submit" class="btn btn-primary" id="btn-submit-token">
              ✓ ${t('confirmBooking')}
            </button>
          </div>
        </form>
      </div>
    </div>
  `;
}
