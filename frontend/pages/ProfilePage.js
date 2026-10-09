// Citizen Profile & Travel Distance Configuration Page
export function renderProfilePage(state, actions) {
  const t = actions.t;
  const user = state.user || {
    name: 'Priyanka Maheta',
    phone: '9876543210',
    email: 'priyanka.maheta@example.in',
    city: 'Rajkot, Gujarat'
  };

  const travelMinutes = state.travelMinutes || 25;

  return `
    <div class="page-container" style="max-width: 800px;">
      <div style="margin-bottom: 24px;">
        <h2 style="font-size: 24px; font-weight: 700; color: var(--primary);">
          👤 ${t('navProfile')} & Travel Settings
        </h2>
        <p style="font-size: 14px; color: var(--text-muted);">
          Configure your residential location and commute duration for personalized leave-by alerts.
        </p>
      </div>

      <div class="card-panel" style="margin-bottom: 20px;">
        <div style="display: flex; gap: 16px; align-items: center; margin-bottom: 20px;">
          <div class="user-avatar-circle" style="width: 56px; height: 56px; font-size: 24px;">
            ${user.name[0]}
          </div>
          <div>
            <h3 style="font-size: 18px; color: var(--text-main);">${user.name}</h3>
            <span class="badge verified">Verified Citizen &bull; Aadhaar Linked</span>
          </div>
        </div>

        <div style="display: flex; flex-direction: column; gap: 12px; font-size: 13px;">
          <div style="display: flex; justify-content: space-between; padding-bottom: 10px; border-bottom: 1px solid var(--border);">
            <span style="color: var(--text-sub);">Mobile Number:</span>
            <b>+91 ${user.phone}</b>
          </div>
          <div style="display: flex; justify-content: space-between; padding-bottom: 10px; border-bottom: 1px solid var(--border);">
            <span style="color: var(--text-sub);">Email Address:</span>
            <b>${user.email || 'Not provided'}</b>
          </div>
          <div style="display: flex; justify-content: space-between; padding-bottom: 10px; border-bottom: 1px solid var(--border);">
            <span style="color: var(--text-sub);">City / Area:</span>
            <b>${user.city}</b>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span style="color: var(--text-sub);">Government Portal ID:</span>
            <b>CIT-${user.userId || '204518'}</b>
          </div>
        </div>
      </div>

      <!-- Travel Time Configuration for Queue Arrival Prediction -->
      <div class="card-panel">
        <div class="card-panel-header">
          <div class="card-title">
            <span>🚗</span> Distance to Government Office
          </div>
        </div>
        <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 16px;">
          QueueLess calculates your recommended departure time by subtracting your travel time plus a 10-minute security checkpoint buffer from the predicted counter call time.
        </p>

        <form onsubmit="window.appActions.saveTravelTime(event)">
          <div class="form-group">
            <label>Distance Zone</label>
            <select 
              class="form-select" 
              id="profile-distance-band"
              onchange="document.getElementById('profile-travel-mins').value = this.value"
            >
              <option value="10" ${travelMinutes === 10 ? 'selected' : ''}>Near Office (&lt; 5 km, ~10 min commute)</option>
              <option value="25" ${travelMinutes === 25 ? 'selected' : ''}>Within City (5 - 15 km, ~25 min commute)</option>
              <option value="50" ${travelMinutes === 50 ? 'selected' : ''}>City Outskirts (15 - 40 km, ~50 min commute)</option>
              <option value="90" ${travelMinutes === 90 ? 'selected' : ''}>Inter-City / Rural (&gt; 40 km, ~90 min commute)</option>
            </select>
          </div>

          <div class="form-group">
            <label>Estimated One-Way Travel Time (Minutes)</label>
            <input 
              type="number" 
              class="form-input" 
              id="profile-travel-mins" 
              value="${travelMinutes}" 
              min="5" 
              max="240" 
              required
            />
          </div>

          <button type="submit" class="btn btn-primary" style="margin-top: 10px;">
            Save Commute Settings
          </button>
        </form>
      </div>
    </div>
  `;
}
