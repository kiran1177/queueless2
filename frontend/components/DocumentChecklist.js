// Document Readiness Checklist Component
export function renderDocumentChecklist(state, actions) {
  const t = actions.t;
  const currentToken = state.currentToken;
  const service = state.service || {};
  const documents = state.documents || [];

  const requiredDocs = service.requiredDocuments || [
    "Hospital Birth Discharge Summary",
    "Parents Aadhaar Cards",
    "Marriage Certificate of Parents",
    "Permanent Address Proof"
  ];

  // Map user document statuses
  const docsMap = {};
  documents.forEach(d => {
    docsMap[d.documentType] = d.status;
  });

  const verifiedCount = requiredDocs.filter(d => docsMap[d] === 'verified').length;
  const totalCount = requiredDocs.length;
  const percentage = Math.round((verifiedCount / totalCount) * 100);

  return `
    <div class="card-panel">
      <div class="card-panel-header">
        <div>
          <div class="card-title">
            <span>📋</span> ${t('documentReadinessTitle')}
          </div>
          <small style="color: var(--text-muted); font-size: 12px;">
            Service: <b>${service.serviceName || 'Birth Certificate Issuance'}</b>
          </small>
        </div>
        <button class="btn btn-secondary btn-sm" onclick="window.appActions.navigateTo('documents')">
          ${t('btnViewAllDocuments')} &rarr;
        </button>
      </div>

      <!-- Readiness Progress Bar -->
      <div style="margin-bottom: 14px;">
        <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px;">
          <span style="font-weight: 600; color: var(--text-main);">${verifiedCount} of ${totalCount} ${t('readyCount')} (${percentage}%)</span>
          <span style="color: var(--text-muted);">${percentage === 100 ? '✅ 100% Ready for Counter' : '⚠️ Carry physical originals'}</span>
        </div>
        <div style="height: 6px; background-color: var(--bg-muted); border-radius: 99px; overflow: hidden;">
          <div style="height: 100%; width: ${percentage}%; background-color: ${percentage === 100 ? 'var(--green)' : 'var(--saffron)'}; border-radius: 99px; transition: width 0.3s ease;"></div>
        </div>
      </div>

      <!-- Document Items -->
      <ul class="doc-checklist">
        ${requiredDocs.map(docName => {
          const status = docsMap[docName] || 'pending';
          const isVerified = status === 'verified';
          const isMissing = status === 'missing';

          let statusBadgeClass = 'badge pending';
          let statusLabel = t('docPending');
          if (isVerified) {
            statusBadgeClass = 'badge verified';
            statusLabel = t('docVerified');
          } else if (isMissing) {
            statusBadgeClass = 'badge missing';
            statusLabel = t('docMissing');
          }

          return `
            <li 
              class="doc-item ${isVerified ? 'verified' : ''}" 
              onclick="window.appActions.toggleDocument('${service.serviceId || 'SRV-BIRTH'}', '${docName}', '${isVerified ? 'pending' : 'verified'}')"
              title="Click to toggle document verification readiness in MongoDB"
            >
              <div class="doc-item-title">
                <div class="doc-check-box">
                  ${isVerified ? '✓' : ''}
                </div>
                <span>${docName}</span>
              </div>
              <span class="${statusBadgeClass}">● ${statusLabel}</span>
            </li>
          `;
        }).join('')}
      </ul>

      <p style="font-size: 11px; color: var(--text-sub); margin-top: 12px;">
        💡 Click on any document above to toggle verification state in MongoDB. Government counters verify original paper certificates during token call.
      </p>
    </div>
  `;
}
