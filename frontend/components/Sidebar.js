// Navigation Sidebar Component
export function renderSidebar(state, actions) {
  const t = actions.t;
  const unreadNotifs = state.notifications?.filter(n => !n.read)?.length || 0;

  const citizenNav = [
    { id: 'dashboard', label: t('navDashboard'), icon: '🏛️' },
    { id: 'take-token', label: t('navTakeToken'), icon: '🎫' },
    { id: 'my-tokens', label: t('navMyTokens'), icon: '📋' },
    { id: 'documents', label: t('navDocuments'), icon: '📁' },
    { id: 'notifications', label: t('navNotifications'), icon: '🔔', badge: unreadNotifs },
    { id: 'profile', label: t('navProfile'), icon: '👤' }
  ];

  const adminNav = [
    { id: 'admin', label: t('navAdmin'), icon: '⚙️' },
    { id: 'dashboard', label: t('navDashboard'), icon: '🏛️' },
    { id: 'documents', label: t('navDocuments'), icon: '📁' },
    { id: 'profile', label: t('navProfile'), icon: '👤' }
  ];

  const navItems = (state.role === 'citizen') ? citizenNav : adminNav;

  return `
    <aside class="sidebar">
      <div class="sidebar-header">
        <svg class="emblem-icon" viewBox="0 0 48 48" fill="none" stroke="currentColor">
          <circle cx="24" cy="24" r="21" stroke-width="2.5" stroke="#1E3A8A"/>
          <circle cx="24" cy="24" r="11" stroke-width="1.8" stroke="#D97706" stroke-dasharray="2.5 2"/>
          <circle cx="24" cy="24" r="3.5" fill="#1E3A8A"/>
        </svg>
        <div class="brand-text">
          <h1>Queue<span>Less</span></h1>
          <p>${t('appSubtitle')}</p>
        </div>
      </div>

      <nav class="sidebar-nav">
        ${navItems.map(item => `
          <button 
            type="button"
            class="nav-item ${state.currentRoute === item.id ? 'active' : ''}" 
            onclick="window.appActions.navigateTo('${item.id}')"
          >
            <div class="nav-item-left">
              <span>${item.icon}</span>
              <span>${item.label}</span>
            </div>
            ${item.badge > 0 ? `<span class="nav-badge">${item.badge}</span>` : ''}
          </button>
        `).join('')}
      </nav>

      <div class="sidebar-footer">
        <b>${t('motto')}</b>
        <span class="satyameva">${t('satyameva')}</span>
      </div>
    </aside>
  `;
}
