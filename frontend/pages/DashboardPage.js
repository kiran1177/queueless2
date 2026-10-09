import { renderSummaryCards } from '../components/SummaryCards.js';
import { renderCurrentTokenCard } from '../components/CurrentTokenCard.js';
import { renderCalendar } from '../components/Calendar.js';
import { renderUpcomingTokens } from '../components/UpcomingTokens.js';
import { renderDocumentChecklist } from '../components/DocumentChecklist.js';
import { renderQueueLane } from '../components/QueueLane.js';

export function renderDashboardPage(state, actions) {
  const t = actions.t;
  const user = state.user || { name: 'Priyanka Maheta' };
  const history = state.recentHistory || [];

  return `
    <div class="dashboard-page">
      <!-- Government Welcome Banner -->
      <div class="gov-banner">
        <div>
          <h2>Namaste, ${user.name}!</h2>
          <p>Welcome to QueueLess Government Virtual Queue Management System</p>
          <div class="banner-pills">
            <span class="banner-pill">🏛️ National e-Governance</span>
            <span class="banner-pill">⏱️ Zero Physical Waiting</span>
            <span class="banner-pill">📄 100% Verified Entry</span>
          </div>
        </div>

        <div>
          <button class="btn btn-saffron" onclick="window.appActions.openTokenModal()">
            + ${t('btnGenerateToken')}
          </button>
        </div>
      </div>

      <!-- 1. Overview / Summary Cards -->
      ${renderSummaryCards(state, actions)}

      <!-- Main Content Section: Current Token Card -->
      <div style="margin-bottom: 24px; max-width: 900px; margin-left: auto; margin-right: auto;">
        ${renderCurrentTokenCard(state, actions)}
      </div>

      <!-- Below Active Token Section: 2-Column Dashboard Grid -->
      <div class="dashboard-grid">
        <!-- Left Column: Calendar, Upcoming, Queue Lane -->
        <div class="dashboard-col">
          <!-- 2 & 3. Calendar and Upcoming Tokens Side-by-Side -->
          <div class="card-panel">
            <div class="card-panel-header">
              <div class="card-title">
                <span>📅</span> ${t('calendarTitle')} & ${t('upcomingTokensTitle')}
              </div>
              <button class="btn btn-secondary btn-sm" onclick="window.appActions.openTokenModal()">
                + New Slot
              </button>
            </div>

            <div class="calendar-upcoming-row">
              <!-- Calendar View -->
              <div>
                ${renderCalendar(state, actions)}
              </div>

              <!-- Upcoming Tokens View -->
              <div>
                <h4 style="font-size: 13px; font-weight: 700; color: var(--text-main); margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.03em;">
                  ${t('upcomingTokensTitle')}
                </h4>
                ${renderUpcomingTokens(state, actions)}
              </div>
            </div>
          </div>

          <!-- Live Queue Lane -->
          ${renderQueueLane(state, actions)}
        </div>

        <!-- Right Side Column: Documents, History, Notifications -->
        <div class="dashboard-col">
          <!-- 5. Document Verification Readiness -->
          ${renderDocumentChecklist(state, actions)}

          <!-- 7. Recent / Completed Activity -->
          <div class="card-panel">
            <div class="card-panel-header">
              <div class="card-title">
                <span>📜</span> ${t('recentActivityTitle')}
              </div>
              <small style="color: var(--text-muted); font-size: 12px;">From MongoDB tokenHistory</small>
            </div>

            ${history.length > 0 ? `
              <div class="table-wrapper">
                <table class="gov-table">
                  <thead>
                    <tr>
                      <th>Token</th>
                      <th>Service</th>
                      <th>Counter</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${history.slice(0, 5).map(h => `
                      <tr>
                        <td><b>${h.tokenNumber}</b></td>
                        <td>${h.serviceName || h.serviceId}</td>
                        <td>Counter ${h.counterId || '1'}</td>
                        <td><span class="badge completed">Completed</span></td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            ` : `
              <p style="font-size: 13px; color: var(--text-muted); text-align: center; padding: 20px 0;">
                ${t('noHistory')}
              </p>
            `}
          </div>

          <!-- 8. Important Notifications & Reminders -->
          <div class="card-panel">
            <div class="card-panel-header">
              <div class="card-title">
                <span>🔔</span> ${t('notificationsTitle')}
              </div>
              <button class="btn btn-secondary btn-sm" onclick="window.appActions.markAllNotificationsRead()">
                ${t('markAllRead')}
              </button>
            </div>

            <div style="display: flex; flex-direction: column; gap: 8px;">
              ${(state.notifications || []).slice(0, 4).map(n => `
                <div style="padding: 10px 12px; border-left: 3px solid ${n.type === 'ok' ? 'var(--green)' : n.type === 'call' ? 'var(--saffron)' : 'var(--primary)'}; background-color: var(--bg-muted); border-radius: 4px; font-size: 12px;">
                  <b style="display: block; color: var(--text-main); margin-bottom: 2px;">${n.title}</b>
                  <p style="color: var(--text-muted);">${n.message}</p>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}
