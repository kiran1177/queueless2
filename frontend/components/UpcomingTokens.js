// Upcoming Tokens List (Placed next to Calendar)
export function renderUpcomingTokens(state, actions) {
  const t = actions.t;
  const upcoming = state.upcomingTokens || [];

  if (upcoming.length === 0) {
    return `
      <div style="padding: 32px 16px; text-align: center; border: 1px dashed var(--border); border-radius: var(--radius-sm); background-color: #FAFCFE;">
        <div style="font-size: 28px; margin-bottom: 8px;">📅</div>
        <p style="font-size: 13px; color: var(--text-muted);">${t('noUpcomingTokens')}</p>
        <button class="btn btn-secondary btn-sm" style="margin-top: 10px;" onclick="window.appActions.openTokenModal()">
          + ${t('btnGenerateToken')}
        </button>
      </div>
    `;
  }

  return `
    <div class="upcoming-list">
      ${upcoming.map(item => {
        const statusKey = item.status || 'waiting';
        const badgeClass = `badge ${statusKey}`;
        const badgeLabel = t(`${statusKey}Badge`) || item.status;

        return `
          <div class="upcoming-item">
            <div class="upcoming-item-left">
              <div class="upcoming-token-badge">${item.tokenNumber}</div>
              <div class="upcoming-info">
                <h4>${item.serviceName || item.serviceId}</h4>
                <p>
                  🏛️ ${item.officeName || item.officeId} &bull; 
                  📅 <b>${item.date}</b> &bull; 
                  ⏱️ ${item.slotLabel || 'First Available'}
                </p>
              </div>
            </div>

            <div style="display: flex; align-items: center; gap: 10px;">
              <span class="${badgeClass}">● ${badgeLabel}</span>
              <button 
                class="btn btn-secondary btn-sm" 
                onclick="window.appActions.openQRModal('${item.tokenId}')"
                title="View Token & QR"
              >
                QR
              </button>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}
