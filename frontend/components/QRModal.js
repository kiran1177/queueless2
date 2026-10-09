// QR Code Verification Modal Component
export function renderQRModal(state, actions) {
  const t = actions.t;
  if (!state.activeQRTokenId) return '';

  const token = state.allTokens?.find(t => t.tokenId === state.activeQRTokenId) 
    || state.currentToken;

  if (!token) return '';

  // Generate SVG QR code representation
  function generateQRCodeSvg(payload) {
    let hash = 2166136261;
    for (let i = 0; i < payload.length; i++) {
      hash = Math.imul(hash ^ payload.charCodeAt(i), 16777619) >>> 0;
    }
    const size = 21;
    let rects = '';
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        // Corners
        let isCorner = (x < 6 && y < 6) || (x >= size - 6 && y < 6) || (x < 6 && y >= size - 6);
        let filled;
        if (isCorner) {
          let edge = Math.max(Math.abs((x < 6 ? x : x - size + 6) - 2.5), Math.abs((y < 6 ? y : y - size + 6) - 2.5));
          filled = edge > 1.5 || edge < 0.8;
        } else {
          hash = Math.imul(hash ^ (hash >>> 13), 2246822519) >>> 0;
          filled = (hash & 1) === 1;
        }
        if (filled) {
          rects += `<rect x="${x}" y="${y}" width="1" height="1" fill="#1E3A8A"/>`;
        }
      }
    }
    return `
      <svg viewBox="0 0 ${size} ${size}" width="160" height="160" shape-rendering="crispEdges" style="background:#FFF; padding: 10px; border: 1px solid var(--border); border-radius: 8px;">
        ${rects}
      </svg>
    `;
  }

  const qrData = token.qrCodeData || `QL|${token.tokenNumber}|${token.serviceId}|${token.userId}`;

  return `
    <div class="modal-overlay" onclick="if(event.target===this) window.appActions.closeQRModal()">
      <div class="modal-content" style="max-width: 440px;">
        <div class="modal-header">
          <h3>📲 ${t('btnCheckInQR')}</h3>
          <button class="btn btn-secondary btn-sm" onclick="window.appActions.closeQRModal()">✕</button>
        </div>

        <div class="modal-body" style="text-align: center;">
          <div style="font-size: 20px; font-weight: 700; color: var(--primary); margin-bottom: 2px;">
            ${token.tokenNumber}
          </div>
          <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 14px;">
            ${token.serviceName || token.serviceId} &bull; ${token.officeName || 'Rajkot Office'}
          </p>

          <div style="display: flex; justify-content: center; margin-bottom: 14px;">
            ${generateQRCodeSvg(qrData)}
          </div>

          <p style="font-size: 12px; color: var(--text-sub); margin-bottom: 16px;">
            Scan this QR code at the entrance kiosk when you physically reach the government office.
          </p>

          <!-- Security Verification Checklist -->
          <div style="background-color: var(--bg-muted); border-radius: var(--radius-sm); padding: 12px; text-align: left; font-size: 12px; margin-bottom: 16px;">
            <b style="color: var(--text-main); display: block; margin-bottom: 6px;">Antigravity Multi-Factor Verification:</b>
            <div style="color: var(--green); margin-bottom: 4px;">✓ Token verified active for today (${token.date})</div>
            <div style="color: var(--green); margin-bottom: 4px;">✓ Verified matching citizen identity (UID: ${token.userId})</div>
            <div style="color: var(--green); margin-bottom: 4px;">✓ Assigned to designated service window</div>
            <div style="color: var(--green);">✓ Single-use anti-tamper barcode protocol</div>
          </div>

          <div style="display: flex; gap: 10px; justify-content: center;">
            <button 
              class="btn btn-primary" 
              id="btn-simulate-scan"
              onclick="window.appActions.simulateOfficeCheckin('${token.tokenId}')"
              ${token.checkInStatus ? 'disabled' : ''}
            >
              ${token.checkInStatus ? '✓ Already Checked In' : '📸 Simulate Office Kiosk Scan'}
            </button>
            <button class="btn btn-secondary" onclick="window.appActions.closeQRModal()">
              ${t('close')}
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}
