// Overview / Summary Cards Component
export function renderSummaryCards(state, actions) {
  const t = actions.t;
  const currentToken = state.currentToken;
  const metrics = currentToken?.metrics || {};
  const officeStatus = state.officeStatus || {};
  const primaryOffice = state.primaryOffice || {};

  // 1. Current Token Value
  const tokenVal = currentToken ? currentToken.tokenNumber : "None";
  const tokenSub = currentToken ? (currentToken.serviceName || "Service in progress") : "No active token today";

  // 2. Queue Position Value
  const posVal = currentToken && metrics.queuePosition ? `#${metrics.queuePosition}` : "-";
  const posSub = currentToken && metrics.peopleAhead !== undefined 
    ? `${metrics.peopleAhead} ${t('inQueue')}` 
    : "Queue clear";

  // 3. Estimated Wait
  const waitVal = currentToken && metrics.estimatedWaitingTime !== undefined 
    ? `${metrics.estimatedWaitingTime} min` 
    : "-";
  const waitSub = currentToken ? `${t('approxArrival')}: ${metrics.estimatedOutTime || '11:15 AM'}` : "Real-time AI prediction";

  // 4. Office Status
  const statusBadge = officeStatus.badge || "Open (9 AM - 5 PM)";
  const statusSub = primaryOffice.officeName || "Rajkot RTO & Civic Office";

  return `
    <div class="summary-cards-grid">
      <!-- Card 1: Current Token -->
      <div class="stat-card">
        <div class="stat-icon blue">🎫</div>
        <div class="stat-meta">
          <div class="stat-label">${t('currentActiveToken')}</div>
          <div class="stat-value">${tokenVal}</div>
          <div class="stat-sub">${tokenSub}</div>
        </div>
      </div>

      <!-- Card 2: Queue Position -->
      <div class="stat-card">
        <div class="stat-icon purple">👥</div>
        <div class="stat-meta">
          <div class="stat-label">${t('queuePosition')}</div>
          <div class="stat-value">${posVal}</div>
          <div class="stat-sub">${posSub}</div>
        </div>
      </div>

      <!-- Card 3: Estimated Wait Time -->
      <div class="stat-card">
        <div class="stat-icon orange">⏱️</div>
        <div class="stat-meta">
          <div class="stat-label">${t('estimatedWait')}</div>
          <div class="stat-value">${waitVal}</div>
          <div class="stat-sub">${waitSub}</div>
        </div>
      </div>

      <!-- Card 4: Office Status -->
      <div class="stat-card">
        <div class="stat-icon green">🏛️</div>
        <div class="stat-meta">
          <div class="stat-label">${t('officeStatus')}</div>
          <div class="stat-value" style="font-size: 16px; font-weight: 700; color: #047857;">${statusBadge}</div>
          <div class="stat-sub">${statusSub}</div>
        </div>
      </div>
    </div>
  `;
}
