// Detailed Active Token Card Component
export function renderCurrentTokenCard(state, actions) {
  const t = actions.t;
  const token = state.currentToken;

  if (!token) {
    return `
      <div class="card-panel">
        <div class="card-panel-header">
          <div class="card-title">
            <span>🎫</span> ${t('currentActiveToken')}
          </div>
        </div>
        <div style="text-align: center; padding: 32px 16px;">
          <div style="font-size: 42px; margin-bottom: 12px;">🎟️</div>
          <h3 style="font-size: 18px; color: var(--text-main); margin-bottom: 6px;">${t('noActiveToken')}</h3>
          <p style="font-size: 13px; color: var(--text-muted); max-width: 480px; margin: 0 auto 20px;">
            ${t('noActiveTokenDesc')}
          </p>
          <button class="btn btn-primary" onclick="window.appActions.openTokenModal()">
            + ${t('btnGenerateToken')}
          </button>
        </div>
      </div>
    `;
  }

  const metrics = token.metrics || {};
  const statusKey = token.status || "waiting";
  const statusBadgeClass = `badge ${statusKey}`;
  const statusLabel = t(`${statusKey}Badge`) || token.status;

  return `
    <div class="card-panel" style="padding: 0; overflow: hidden;">
      <div class="ticket-slip">
        <!-- Left Ticket Half -->
        <div class="ticket-main">
          <div class="ticket-tag">${t('currentActiveToken')} &bull; ${token.date}</div>
          <div class="ticket-number">${token.tokenNumber}</div>
          <div class="ticket-service">${token.serviceName || 'Government Public Service'}</div>
          <div class="ticket-office">${token.officeName || 'Rajkot Office'} &bull; ${token.slotLabel || 'First Available'}</div>

          <div class="ticket-status-row">
            <span class="${statusBadgeClass}">● ${statusLabel}</span>
            ${token.checkInStatus 
              ? `<span class="badge verified">✓ ${t('checkedInBadge')}</span>` 
              : ''}
            <span class="badge" style="background-color: var(--bg-muted); color: var(--text-sub);">
              Source: ${token.source === 'online' ? '🌐 Virtual' : '🏛️ Walk-in'}
            </span>
          </div>
        </div>

        <!-- Right Perforated Stub -->
        <div class="ticket-stub" style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; align-content: center;">
          <div class="stub-stat">
            <small>${t('queuePosition')}</small>
            <b>${metrics.queuePosition ? '#' + metrics.queuePosition : '1'} <span style="font-size: 13px; font-weight: normal; color: var(--text-muted);">(${metrics.peopleAhead || 0} ahead)</span></b>
          </div>

          <div class="stub-stat">
            <small>${t('estimatedWait')}</small>
            <b>${metrics.estimatedWaitingTime || 0} min</b>
          </div>

          <div class="stub-stat">
            <small>${t('counterServing')}</small>
            <b>${metrics.currentServingToken || 'T-005'}</b>
          </div>

          <div class="stub-stat">
            <small>${t('approxArrival')}</small>
            <b style="color: var(--primary);">${metrics.estimatedOutTime || '11:15 AM'}</b>
            <span style="font-size: 11px; color: #B45309; font-weight: 600; display: block;">
              ${metrics.recommendedLeaveBy === 'Leave now' ? '⚠️ Leave now' : `🚗 ${metrics.recommendedLeaveBy || 'Leave in 20 min'}`}
            </span>
          </div>

          <!-- Actions -->
          <div style="grid-column: 1 / -1; display: flex; gap: 8px; margin-top: 6px;">
            ${!token.checkInStatus ? `
              <button class="btn btn-primary btn-sm" style="flex: 1;" onclick="window.appActions.openQRModal('${token.tokenId}')">
                📲 ${t('btnCheckInQR')}
              </button>
            ` : ''}
            <button class="btn btn-danger btn-sm" style="flex: 1;" onclick="window.appActions.releaseToken('${token.tokenId}')">
              ✕ ${t('btnReleaseToken')}
            </button>
          </div>
        </div>
      </div>

      <!-- Why We Estimated This Rationale -->
      <div style="padding: 12px 24px; background-color: #F8FAFC; border-top: 1px solid var(--border);">
        <div class="rationale-box">
          <b>ℹ️ ${t('whyEstimated')}:</b> ${metrics.explanation || `${metrics.peopleAhead || 0} waiting ahead. Calculated dynamically with office counter load.`}
        </div>
      </div>
    </div>
  `;
}
