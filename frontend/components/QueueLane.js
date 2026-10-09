// Live Queue Lane and Counter Status Component
export function renderQueueLane(state, actions) {
  const t = actions.t;
  const counters = state.counters || [];
  const tokens = state.allTokens || [];
  const userTokenNumber = state.currentToken?.tokenNumber;

  // Active waiting / serving tokens
  const activeTokens = tokens.filter(t => ['waiting', 'called', 'processing'].includes(t.status)).slice(0, 12);

  return `
    <div class="card-panel">
      <div class="card-panel-header">
        <div class="card-title">
          <span>🚦</span> ${t('liveQueueTitle')}
        </div>
        <small style="color: var(--text-muted); font-size: 12px;">
          Auto-synchronized with MongoDB
        </small>
      </div>

      <!-- Service Counters Status Grid -->
      <div class="counters-grid" style="margin-bottom: 18px;">
        ${counters.map(c => `
          <div class="counter-card ${c.active ? '' : 'closed'}">
            <div class="counter-card-header">
              <span class="counter-name">${c.counterName}</span>
              <span class="badge ${c.active ? 'verified' : 'cancelled'}" style="font-size: 10px;">
                ${c.active ? 'Open' : t('closed')}
              </span>
            </div>
            <div class="counter-token">
              ${c.currentTokenNumber || t('free')}
            </div>
            <small style="font-size: 11px; color: var(--text-sub); display: block;">
              ${c.serviceType || 'General Services'}
            </small>
          </div>
        `).join('')}
      </div>

      <!-- Horizontal Queue Lane -->
      <div style="font-size: 12px; font-weight: 600; color: var(--text-muted); margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.04em;">
        ${t('inQueue')} Flow
      </div>
      <div class="queue-lane">
        ${activeTokens.length > 0 ? activeTokens.map(tk => {
          const isMine = (tk.tokenNumber === userTokenNumber);
          const isServing = ['called', 'processing'].includes(tk.status);

          return `
            <div class="queue-node ${isServing ? 'serving' : ''} ${isMine ? 'mine' : ''}">
              <b>${tk.tokenNumber}</b>
              <span style="font-size: 11px; color: var(--text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                ${tk.serviceName || tk.serviceId}
              </span>
              <span style="font-size: 10px; font-weight: 600; color: ${isMine ? '#B45309' : 'var(--text-sub)'};">
                ${isMine ? '★ You' : isServing ? 'Counter ' + (tk.counterId || '1') : tk.slotLabel || 'Waiting'}
              </span>
            </div>
          `;
        }).join('') : '<div style="color: var(--text-muted); font-size: 13px; padding: 8px;">No active tokens currently in queue.</div>'}
      </div>
    </div>
  `;
}
