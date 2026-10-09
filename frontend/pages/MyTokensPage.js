// My Tokens Page (Active, Upcoming & Completed History)
export function renderMyTokensPage(state, actions) {
  const t = actions.t;
  const tokens = state.myTokens || [];

  return `
    <div class="page-container">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
        <div>
          <h2 style="font-size: 24px; font-weight: 700; color: var(--primary);">
            📋 ${t('navMyTokens')}
          </h2>
          <p style="font-size: 14px; color: var(--text-muted);">
            Manage your active queue passes, upcoming appointment slots, and past completed visits.
          </p>
        </div>
        <button class="btn btn-primary" onclick="window.appActions.openTokenModal()">
          + ${t('btnGenerateToken')}
        </button>
      </div>

      ${tokens.length > 0 ? `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 18px;">
          ${tokens.map(tk => {
            const statusKey = tk.status || 'waiting';
            const badgeClass = `badge ${statusKey}`;
            const badgeLabel = t(`${statusKey}Badge`) || tk.status;
            const isActive = ['waiting', 'called', 'processing'].includes(tk.status);

            return `
              <div class="card-panel" style="display: flex; flex-direction: column; justify-content: space-between;">
                <div>
                  <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
                    <div>
                      <span style="font-size: 28px; font-weight: 800; color: var(--primary); display: block;">
                        ${tk.tokenNumber}
                      </span>
                      <small style="color: var(--text-sub); font-size: 11px;">ID: ${tk.tokenId}</small>
                    </div>
                    <span class="${badgeClass}">● ${badgeLabel}</span>
                  </div>

                  <h3 style="font-size: 16px; color: var(--text-main); margin-bottom: 4px;">
                    ${tk.serviceName || tk.serviceId}
                  </h3>
                  <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 14px;">
                    🏛️ ${tk.officeName || tk.officeId}<br>
                    📅 <b>${tk.date}</b> &bull; ⏱️ ${tk.slotLabel || 'First available'}
                  </p>

                  ${isActive ? `
                    <div style="background-color: var(--bg-muted); padding: 10px 12px; border-radius: var(--radius-sm); font-size: 12px; margin-bottom: 14px;">
                      <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                        <span>Queue Position:</span>
                        <b>#${tk.queuePosition || 1}</b>
                      </div>
                      <div style="display: flex; justify-content: space-between;">
                        <span>Estimated Wait:</span>
                        <b style="color: var(--primary);">~${tk.estimatedWaitingTime || 15} minutes</b>
                      </div>
                    </div>
                  ` : ''}
                </div>

                <div style="display: flex; gap: 8px; border-top: 1px solid var(--border); padding-top: 12px;">
                  <button 
                    class="btn btn-secondary btn-sm" 
                    style="flex: 1;" 
                    onclick="window.appActions.openQRModal('${tk.tokenId}')"
                  >
                    📲 View QR Pass
                  </button>
                  ${isActive ? `
                    <button 
                      class="btn btn-danger btn-sm" 
                      onclick="window.appActions.releaseToken('${tk.tokenId}')"
                    >
                      ✕ Cancel
                    </button>
                  ` : ''}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      ` : `
        <div class="card-panel" style="text-align: center; padding: 48px 24px;">
          <div style="font-size: 48px; margin-bottom: 12px;">📭</div>
          <h3 style="font-size: 18px; color: var(--text-main); margin-bottom: 6px;">No Tokens Generated Yet</h3>
          <p style="font-size: 13px; color: var(--text-muted); max-width: 440px; margin: 0 auto 20px;">
            You have not booked any virtual tokens yet. Take a token remotely to avoid physical queues.
          </p>
          <button class="btn btn-primary" onclick="window.appActions.openTokenModal()">
            + Generate Virtual Token
          </button>
        </div>
      `}
    </div>
  `;
}
