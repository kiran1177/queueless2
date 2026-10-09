// Admin & Staff Queue Control Page
export function renderAdminPage(state, actions) {
  const t = actions.t;
  const adminData = state.adminData || {};
  const metrics = adminData.metrics || {
    totalToday: 14,
    waiting: 6,
    processing: 3,
    completed: 4,
    missed: 1,
    dailyCapacity: 20
  };

  const counters = adminData.counters || state.counters || [];
  const tokens = adminData.tokens || {};
  const currentTab = state.adminTokenTab || 'waiting'; // 'all', 'waiting', 'processing', 'completed'

  const activeTokenList = (currentTab === 'all') 
    ? (tokens.all || []) 
    : (tokens[currentTab] || []);

  const services = state.services || [];

  return `
    <div class="page-container">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
        <div>
          <h2 style="font-size: 24px; font-weight: 700; color: var(--primary);">
            ⚙️ ${t('adminOverview')}
          </h2>
          <p style="font-size: 14px; color: var(--text-muted);">
            Rajkot Regional Office & Civic Center &bull; Real-time MongoDB Queue Monitor & Dispatch
          </p>
        </div>

        <div style="display: flex; gap: 10px;">
          <button class="btn btn-secondary btn-sm" onclick="window.appActions.resetDemoData()">
            🔄 Reset Demo Seed
          </button>
        </div>
      </div>

      <!-- Admin Stat Metrics -->
      <div class="summary-cards-grid">
        <div class="stat-card">
          <div class="stat-icon blue">📊</div>
          <div class="stat-meta">
            <div class="stat-label">Total Issued Today</div>
            <div class="stat-value">${metrics.totalToday}</div>
            <div class="stat-sub">${metrics.dailyCapacity - metrics.totalToday} slots remaining</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon orange">⏳</div>
          <div class="stat-meta">
            <div class="stat-label">Waiting in Queue</div>
            <div class="stat-value">${metrics.waiting}</div>
            <div class="stat-sub">Citizens waiting remotely</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon purple">🏛️</div>
          <div class="stat-meta">
            <div class="stat-label">Processing / Called</div>
            <div class="stat-value">${metrics.processing}</div>
            <div class="stat-sub">Active at service counters</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon green">✅</div>
          <div class="stat-meta">
            <div class="stat-label">Completed Today</div>
            <div class="stat-value">${metrics.completed}</div>
            <div class="stat-sub">In MongoDB tokenHistory</div>
          </div>
        </div>
      </div>

      <!-- Visual Flow Ribbon: ALL TOKENS -> PROCESSING -> COMPLETED -->
      <div class="card-panel" style="margin-bottom: 24px; background: linear-gradient(90deg, #EFF6FF 0%, #F5F3FF 50%, #ECFDF5 100%);">
        <div style="display: flex; align-items: center; justify-content: space-around; font-weight: 700; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em;">
          <div style="display: flex; align-items: center; gap: 8px; color: var(--primary);">
            <span>🎫 ALL TOKENS (${metrics.totalToday})</span>
          </div>
          <span style="color: var(--text-light); font-size: 20px;">&rarr;</span>
          <div style="display: flex; align-items: center; gap: 8px; color: #6D28D9;">
            <span>⏱️ PROCESSING (${metrics.processing})</span>
          </div>
          <span style="color: var(--text-light); font-size: 20px;">&rarr;</span>
          <div style="display: flex; align-items: center; gap: 8px; color: var(--green);">
            <span>✅ COMPLETED (${metrics.completed})</span>
          </div>
        </div>
      </div>

      <!-- Service Counters Dispatch & Admin Management -->
      <div class="dashboard-grid" style="margin-bottom: 24px;">
        <!-- Service Counters Management -->
        <div class="card-panel">
          <div class="card-panel-header">
            <div class="card-title">
              <span>🏛️</span> Active Service Windows & Counters
            </div>
            <span class="badge verified">Live Dispatch</span>
          </div>

          <div style="display: flex; flex-direction: column; gap: 14px;">
            ${counters.map(c => `
              <div style="padding: 14px; border: 1px solid var(--border); border-radius: var(--radius-sm); background-color: #FAFCFE; display: flex; justify-content: space-between; align-items: center;">
                <div>
                  <b style="font-size: 15px; color: var(--text-main);">${c.counterName}</b>
                  <span class="badge ${c.active ? 'verified' : 'cancelled'}" style="margin-left: 8px; font-size: 11px;">
                    ${c.active ? 'Active' : 'Closed'}
                  </span>
                  <p style="font-size: 12px; color: var(--text-muted); margin-top: 4px;">
                    Assigned: <b>${c.serviceType || 'General Public Services'}</b>
                  </p>
                  <p style="font-size: 13px; font-weight: 700; color: var(--primary); margin-top: 2px;">
                    Serving Token: ${c.currentTokenNumber ? c.currentTokenNumber : '<span style="color: var(--green);">Idle / Free</span>'}
                  </p>
                </div>

                <div style="display: flex; flex-direction: column; gap: 6px;">
                  <button 
                    class="btn btn-secondary btn-sm" 
                    onclick="window.appActions.adminToggleCounterStatus('${c.counterId}', ${!c.active})"
                  >
                    ${c.active ? 'Close Window' : 'Open Window'}
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Staff Users & Capacity Settings -->
        <div class="dashboard-col">
          <!-- Staff Management -->
          <div class="card-panel">
            <div class="card-panel-header">
              <div class="card-title">
                <span>👥</span> Staff Users Management
              </div>
            </div>
            <p style="font-size: 12px; color: var(--text-muted); margin-bottom: 12px;">
              Assign staff members to specific offices and counters.
            </p>

            <form onsubmit="window.appActions.submitAddStaff(event)">
              <div class="form-group">
                <label>Staff Name</label>
                <input type="text" class="form-input" id="staff-name" placeholder="e.g. Anil Kumar" required />
              </div>
              <div class="form-group">
                <label>Phone Number</label>
                <input type="text" class="form-input" id="staff-phone" placeholder="e.g. 9988776655" required />
              </div>
              <div class="form-group">
                <label>Email</label>
                <input type="email" class="form-input" id="staff-email" placeholder="e.g. anil@example.com" />
              </div>
              <div class="form-group">
                <label>Initial Password</label>
                <input type="password" class="form-input" id="staff-password" required />
              </div>

              <div class="form-group">
                <label>Assign to Counter</label>
                <select class="form-select" id="staff-counter">
                  ${counters.map(c => `
                    <option value="${c.counterId}">${c.counterName}</option>
                  `).join('')}
                </select>
              </div>

              <button type="submit" class="btn btn-primary btn-sm" style="width: 100%; margin-top: 8px;">
                + Add Staff Member
              </button>
            </form>
            
            <div style="margin-top: 24px;">
              <h4 style="font-size: 14px; margin-bottom: 8px;">Current Staff Accounts</h4>
              <div style="max-height: 250px; overflow-y: auto; border: 1px solid var(--border); border-radius: 4px;">
                <table class="gov-table" style="font-size: 12px; margin: 0;">
                  <thead>
                    <tr><th>Name</th><th>Phone</th><th>Counter</th><th>Status</th></tr>
                  </thead>
                  <tbody>
                    ${(state.staffList || []).map(s => `
                      <tr>
                        <td>${s.name}</td>
                        <td>${s.phone}</td>
                        <td>C-${s.assignedCounterId}</td>
                        <td>${s.status}</td>
                      </tr>
                    `).join('')}
                    ${!(state.staffList && state.staffList.length > 0) ? '<tr><td colspan="4" style="text-align:center">No staff found.</td></tr>' : ''}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- Capacity Setting -->
          <div class="card-panel">
            <div class="card-panel-header">
              <div class="card-title">
                <span>⚙️</span> Office Daily Capacity
              </div>
            </div>
            <div style="display: flex; gap: 10px; align-items: center;">
              <input 
                type="number" 
                class="form-input" 
                id="capacity-input" 
                value="${metrics.dailyCapacity}" 
                min="5" 
                max="200" 
                style="max-width: 90px;"
              />
              <button class="btn btn-secondary btn-sm" onclick="window.appActions.updateDailyCapacity()">
                Update Limit
              </button>
            </div>
            <small style="color: var(--text-sub); display: block; margin-top: 8px;">
              Configures maximum allowable tokens per day in MongoDB.
            </small>
          </div>
        </div>
      </div>

      <!-- Token Management Table -->
      <div class="card-panel">
        <div class="card-panel-header">
          <div class="card-title">
            <span>📋</span> Live Token Queue & Status Control
          </div>

          <!-- Filter Tabs -->
          <div class="segmented-control">
            <button class="${currentTab === 'waiting' ? 'active' : ''}" onclick="window.appActions.setAdminTab('waiting')">
              Waiting (${metrics.waiting})
            </button>
            <button class="${currentTab === 'processing' ? 'active' : ''}" onclick="window.appActions.setAdminTab('processing')">
              Processing (${metrics.processing})
            </button>
            <button class="${currentTab === 'completed' ? 'active' : ''}" onclick="window.appActions.setAdminTab('completed')">
              Completed (${metrics.completed})
            </button>
            <button class="${currentTab === 'all' ? 'active' : ''}" onclick="window.appActions.setAdminTab('all')">
              All (${metrics.totalToday})
            </button>
          </div>
        </div>

        <div class="table-wrapper">
          <table class="gov-table">
            <thead>
              <tr>
                <th>Token</th>
                <th>Service</th>
                <th>Citizen</th>
                <th>Slot</th>
                <th>Source</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${activeTokenList.map(tk => {
                const statusKey = tk.status || 'waiting';
                const badgeClass = `badge ${statusKey}`;

                return `
                  <tr>
                    <td><b>${tk.tokenNumber}</b></td>
                    <td>${tk.serviceName || tk.serviceId}</td>
                    <td>${tk.userName || tk.userId}</td>
                    <td>${tk.slotLabel || 'First available'}</td>
                    <td>
                      <span style="font-size: 11px; color: var(--text-sub);">
                        ${tk.source === 'online' ? '🌐 Virtual' : '🏛️ Walk-in'}
                      </span>
                    </td>
                    <td><span class="${badgeClass}">● ${tk.status}</span></td>
                    <td>
                      <div style="display: flex; gap: 6px;">
                        ${tk.status === 'waiting' ? `
                          <button 
                            class="btn btn-saffron btn-sm" 
                            style="padding: 3px 8px; font-size: 11px;"
                            onclick="window.appActions.adminCallTokenDirect('${tk.tokenId}', 1)"
                          >
                            Call Next
                          </button>
                        ` : ''}
                        ${['called', 'processing'].includes(tk.status) ? `
                          <button 
                            class="btn btn-primary btn-sm" 
                            style="padding: 3px 8px; font-size: 11px;"
                            onclick="window.appActions.adminUpdateTokenStatus('${tk.tokenId}', 'completed')"
                          >
                            ✓ Complete
                          </button>
                          <button 
                            class="btn btn-danger btn-sm" 
                            style="padding: 3px 8px; font-size: 11px;"
                            onclick="window.appActions.adminUpdateTokenStatus('${tk.tokenId}', 'missed')"
                          >
                            Missed
                          </button>
                        ` : ''}
                        ${tk.status === 'completed' ? `
                          <span style="font-size: 11px; color: var(--green);">Archived in DB</span>
                        ` : ''}
                      </div>
                    </td>
                  </tr>
                `;
              }).join('')}
              ${activeTokenList.length === 0 ? '<tr><td colspan="7" style="text-align: center; color: var(--text-muted); padding: 24px;">No tokens in this status category.</td></tr>' : ''}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}
