// Top Header Component
export function renderHeader(state, actions) {
  const t = actions.t;
  const languages = [
    { code: 'en', label: 'EN' },
    { code: 'gu', label: 'ગુજ' },
    { code: 'hi', label: 'हिं' }
  ];



  return `
    <header class="top-header">
      <div class="header-search">
        <span class="search-icon">🔍</span>
        <input 
          type="text" 
          placeholder="${t('searchPlaceholder')}" 
          id="global-search" 
          oninput="window.appActions.handleSearch(this.value)"
        />
      </div>

      <div class="header-actions">
        <!-- Live Clock -->
        <div class="live-clock-pill" title="Live System Time (Office Hours: 09:00 AM - 05:00 PM)">
          <span class="live-dot"></span>
          <span id="live-clock-text">${state.currentTimeStr || '10:15 AM'}</span>
        </div>

        <button class="btn btn-secondary btn-sm" onclick="window.appActions.logout()">
          Sign Out
        </button>

        <!-- Language Switcher -->
        <div class="segmented-control" role="group" aria-label="Language Selection">
          ${languages.map(l => `
            <button 
              type="button" 
              class="${state.lang === l.code ? 'active' : ''}" 
              onclick="window.appActions.setLang('${l.code}')"
            >
              ${l.label}
            </button>
          `).join('')}
        </div>

        <!-- Refresh Button -->
        <button 
          class="btn btn-secondary btn-sm" 
          onclick="window.appActions.refreshData()" 
          title="Refresh Data from MongoDB"
        >
          🔄
        </button>

        <!-- User Profile Pill -->
        <div class="user-profile-badge" onclick="window.appActions.navigateTo('profile')">
          <div class="user-avatar-circle">
            ${(state.user?.name || 'P')[0]}
          </div>
          <span class="user-name-text">${state.user?.name || 'Priyanka Maheta'}</span>
        </div>
      </div>
    </header>
  `;
}
