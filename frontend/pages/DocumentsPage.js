// Documents Management & Verification Page
export function renderDocumentsPage(state, actions) {
  const t = actions.t;
  const services = state.services || [];
  const selectedServiceId = state.docsSelectedServiceId || 'all';
  const allDocs = state.allDocuments || [];

  const filteredDocs = (selectedServiceId === 'all') 
    ? allDocs 
    : allDocs.filter(d => d.serviceId === selectedServiceId);

  const verifiedDocs = filteredDocs.filter(d => d.status === 'verified');
  const pendingDocs = filteredDocs.filter(d => d.status === 'pending');
  const missingDocs = filteredDocs.filter(d => d.status === 'missing');

  return `
    <div class="page-container">
      <div style="margin-bottom: 24px;">
        <h2 style="font-size: 24px; font-weight: 700; color: var(--primary);">
          📁 Government Document Verification Portal
        </h2>
        <p style="font-size: 14px; color: var(--text-muted);">
          Inspect mandatory certificates, verify required documents in MongoDB, and track counter-readiness.
        </p>
      </div>

      <!-- Service Filter Tabs -->
      <div style="display: flex; gap: 8px; overflow-x: auto; padding-bottom: 12px; margin-bottom: 20px;">
        <button 
          class="btn ${selectedServiceId === 'all' ? 'btn-primary' : 'btn-secondary'} btn-sm"
          onclick="window.appActions.filterDocumentsService('all')"
        >
          All Services (${allDocs.length})
        </button>
        ${services.map(s => `
          <button 
            class="btn ${selectedServiceId === s.serviceId ? 'btn-primary' : 'btn-secondary'} btn-sm"
            onclick="window.appActions.filterDocumentsService('${s.serviceId}')"
          >
            ${s.icon || '📄'} ${s.serviceName}
          </button>
        `).join('')}
      </div>

      <!-- 3-Column Document Status Grid -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px;">
        <!-- Column 1: Verified Documents -->
        <div class="card-panel">
          <div class="card-panel-header">
            <div class="card-title" style="color: var(--green);">
              <span>✓</span> Verified Documents (${verifiedDocs.length})
            </div>
            <span class="badge verified">Ready</span>
          </div>
          
          <div style="display: flex; flex-direction: column; gap: 10px;">
            ${verifiedDocs.map(d => `
              <div style="padding: 12px; border: 1px solid var(--green-border); background-color: var(--green-light); border-radius: var(--radius-sm);">
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                  <b style="font-size: 13px; color: var(--text-main);">${d.documentType}</b>
                  <button 
                    class="btn btn-secondary btn-sm" 
                    style="padding: 2px 6px; font-size: 10px;"
                    onclick="window.appActions.toggleDocument('${d.serviceId}', '${d.documentType}', 'pending')"
                    title="Change status to Pending"
                  >
                    Demote
                  </button>
                </div>
                <small style="color: var(--text-muted); display: block; margin-top: 4px;">Service: ${d.serviceName || d.serviceId}</small>
                <small style="color: #047857; display: block; font-weight: 500; margin-top: 2px;">
                  ${d.notes || 'e-KYC verified & attested.'}
                </small>
              </div>
            `).join('')}
            ${verifiedDocs.length === 0 ? '<p style="color: var(--text-muted); font-size: 13px; padding: 12px 0;">No verified documents under selected filter.</p>' : ''}
          </div>
        </div>

        <!-- Column 2: Pending Verification -->
        <div class="card-panel">
          <div class="card-panel-header">
            <div class="card-title" style="color: var(--amber);">
              <span>⏳</span> Pending Verification (${pendingDocs.length})
            </div>
            <span class="badge pending">Pending</span>
          </div>

          <div style="display: flex; flex-direction: column; gap: 10px;">
            ${pendingDocs.map(d => `
              <div style="padding: 12px; border: 1px solid var(--saffron-border); background-color: var(--amber-light); border-radius: var(--radius-sm);">
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                  <b style="font-size: 13px; color: var(--text-main);">${d.documentType}</b>
                  <button 
                    class="btn btn-primary btn-sm" 
                    style="padding: 2px 6px; font-size: 10px;"
                    onclick="window.appActions.toggleDocument('${d.serviceId}', '${d.documentType}', 'verified')"
                    title="Mark as Verified in MongoDB"
                  >
                    ✓ Verify
                  </button>
                </div>
                <small style="color: var(--text-muted); display: block; margin-top: 4px;">Service: ${d.serviceName || d.serviceId}</small>
                <small style="color: #B45309; display: block; margin-top: 2px;">
                  ${d.notes || 'Bring original document to the counter.'}
                </small>
              </div>
            `).join('')}
            ${pendingDocs.length === 0 ? '<p style="color: var(--text-muted); font-size: 13px; padding: 12px 0;">No pending documents.</p>' : ''}
          </div>
        </div>

        <!-- Column 3: Missing Documents -->
        <div class="card-panel">
          <div class="card-panel-header">
            <div class="card-title" style="color: var(--red);">
              <span>⚠️</span> Missing Documents (${missingDocs.length})
            </div>
            <span class="badge missing">Action Req</span>
          </div>

          <div style="display: flex; flex-direction: column; gap: 10px;">
            ${missingDocs.map(d => `
              <div style="padding: 12px; border: 1px solid var(--red-border); background-color: var(--red-light); border-radius: var(--radius-sm);">
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                  <b style="font-size: 13px; color: var(--text-main);">${d.documentType}</b>
                  <button 
                    class="btn btn-secondary btn-sm" 
                    style="padding: 2px 6px; font-size: 10px;"
                    onclick="window.appActions.toggleDocument('${d.serviceId}', '${d.documentType}', 'verified')"
                    title="Mark as verified"
                  >
                    + Add
                  </button>
                </div>
                <small style="color: var(--text-muted); display: block; margin-top: 4px;">Service: ${d.serviceName || d.serviceId}</small>
                <small style="color: var(--red); display: block; margin-top: 2px;">
                  ${d.notes || 'Mandatory paper certificate required.'}
                </small>
              </div>
            `).join('')}
            ${missingDocs.length === 0 ? '<p style="color: var(--text-muted); font-size: 13px; padding: 12px 0;">No missing documents recorded.</p>' : ''}
          </div>
        </div>
      </div>
    </div>
  `;
}
