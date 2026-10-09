// Staff Module - Counter Queue Control Page
export function renderStaffPage(state, actions) {
  const t = actions.t;
  const user = state.user || { name: 'Staff User' };
  
  // Get staff's assigned counter
  const staffCounterId = state.staffCounterId || 'window1';
  const counters = state.counters || [];
  const assignedCounter = counters.find(c => c.counterId === staffCounterId) || counters[0] || {};
  
  const tokens = state.adminData?.tokens || {};
  
  // Calculate simple stats for this counter
  // Assuming total tokens assigned to this counter:
  const counterTokens = tokens.all ? tokens.all.filter(tk => tk.counterId === assignedCounter.counterId) : [];
  const waiting = (tokens.waiting || []).length; // System waiting queue for this service
  const completed = counterTokens.filter(tk => tk.status === 'completed').length;
  
  const currentToken = assignedCounter.currentTokenNumber || null;

  return `
    <div class="page-container">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
        <div>
          <h2 style="font-size: 24px; font-weight: 700; color: var(--primary);">
            👨‍💼 Staff Module
          </h2>
          <p style="font-size: 14px; color: var(--text-muted);">
            Welcome ${user.name} &bull; Assigned to: <b>${assignedCounter.counterName || 'Window 1'}</b>
          </p>
        </div>
      </div>

      <!-- Staff Daily Stats -->
      <div class="summary-cards-grid">
        <div class="stat-card">
          <div class="stat-icon blue">🎫</div>
          <div class="stat-meta">
            <div class="stat-label">Total Assigned Today</div>
            <div class="stat-value">${counterTokens.length || 0}</div>
            <div class="stat-sub">Tokens processed here</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon orange">⏳</div>
          <div class="stat-meta">
            <div class="stat-label">Waiting for Counter</div>
            <div class="stat-value">${waiting}</div>
            <div class="stat-sub">Pending in global queue</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon green">✅</div>
          <div class="stat-meta">
            <div class="stat-label">Your Completed</div>
            <div class="stat-value">${completed}</div>
            <div class="stat-sub">Successfully served</div>
          </div>
        </div>
      </div>

      <!-- Counter Control Panel -->
      <div class="dashboard-grid" style="margin-bottom: 24px;">
        <div class="dashboard-col">
          <div class="card-panel">
            <div class="card-panel-header">
              <div class="card-title">
                <span>🖥️</span> Counter Control panel
              </div>
              <span class="badge ${assignedCounter.active ? 'verified' : 'cancelled'}">
                ${assignedCounter.active ? 'Status: OPEN' : 'Status: CLOSED'}
              </span>
            </div>

            <div style="padding: 24px; text-align: center; background-color: var(--bg-muted); border-radius: var(--radius-sm); border: 1px solid var(--border); margin-bottom: 20px;">
              <h3 style="font-size: 16px; color: var(--text-muted); text-transform: uppercase;">Currently Serving</h3>
              <div style="font-size: 64px; font-weight: 800; color: var(--primary); margin: 10px 0;">
                ${currentToken ? currentToken : '<span style="font-size: 32px; color: var(--text-light);">IDLE</span>'}
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              ${currentToken ? `
                <button 
                  class="btn btn-primary" 
                  style="padding: 16px; font-size: 16px;"
                  onclick="window.appActions.adminCompleteCounterToken('${assignedCounter.counterId}')"
                >
                  ✅ Complete Token
                </button>
                <div style="display: flex; flex-direction: column; gap: 8px;">
                  <button 
                    class="btn btn-danger" 
                    onclick="window.appActions.staffMarkNoShow('${assignedCounter.counterId}')"
                  >
                    ❌ Mark No-Show
                  </button>
                  <button 
                    class="btn btn-secondary" 
                    onclick="window.appActions.staffTransferToken('${assignedCounter.counterId}')"
                  >
                    🔄 Transfer Token
                  </button>
                  <button 
                    class="btn btn-secondary" 
                    onclick="window.appActions.staffVerifyDocuments('${assignedCounter.counterId}')"
                  >
                    📄 Verify Documents
                  </button>
                </div>
              ` : `
                <button 
                  class="btn btn-saffron" 
                  style="grid-column: 1 / -1; padding: 16px; font-size: 16px;"
                  onclick="window.appActions.adminCallNextToCounter('${assignedCounter.counterId}')"
                  ${!assignedCounter.active ? 'disabled' : ''}
                >
                  📢 Call Next Token from Queue
                </button>
              `}
            </div>
          </div>
        </div>

        <div class="dashboard-col">
           <!-- Issue Walk-in Offline Token -->
          <div class="card-panel">
            <div class="card-panel-header">
              <div class="card-title">
                <span>🚶</span> Issue Walk-In Slip
              </div>
            </div>
            <p style="font-size: 12px; color: var(--text-muted); margin-bottom: 12px;">
              For citizens at the counter without a digital token.
            </p>

            <form onsubmit="window.appActions.submitWalkinToken(event)">
              <div class="form-group">
                <label>Citizen Full Name</label>
                <input type="text" class="form-input" id="walkin-name" placeholder="e.g. Ramesh Bhai" required />
              </div>
              <input type="hidden" id="walkin-service" value="${assignedCounter.serviceId || 'srv_1'}" />
              <button type="submit" class="btn btn-primary btn-sm" style="width: 100%; margin-top: 8px;">
                + Issue Slip
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  `;
}
