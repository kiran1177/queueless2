// Interactive Calendar Component
export function renderCalendar(state, actions) {
  const t = actions.t;
  const calState = state.calendarData || {};
  const currentYear = state.selectedYear || new Date().getFullYear();
  const currentMonth = state.selectedMonth !== undefined ? state.selectedMonth : new Date().getMonth();
  
  const selectedDateStr = state.selectedDate || new Date().toISOString().split('T')[0];
  const todayStr = new Date().toISOString().split('T')[0];

  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const startDayOfWeek = firstDayOfMonth.getDay();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const eventsByDate = calState.events || {};

  // Build grid cells
  let cellsHtml = '';
  // Leading blanks
  for (let i = 0; i < startDayOfWeek; i++) {
    cellsHtml += `<div class="cal-day-cell disabled"></div>`;
  }

  // Days
  for (let d = 1; d <= daysInMonth; d++) {
    const monthStr = String(currentMonth + 1).padStart(2, '0');
    const dayStr = String(d).padStart(2, '0');
    const dateKey = `${currentYear}-${monthStr}-${dayStr}`;

    const isToday = (dateKey === todayStr);
    const isSelected = (dateKey === selectedDateStr);
    const hasEvents = Boolean(eventsByDate[dateKey] && eventsByDate[dateKey].length > 0);

    let cellClasses = ['cal-day-cell'];
    if (isToday) cellClasses.push('today');
    if (isSelected) cellClasses.push('selected');

    cellsHtml += `
      <div 
        class="${cellClasses.join(' ')}" 
        onclick="window.appActions.selectCalendarDate('${dateKey}')"
        title="${hasEvents ? `${eventsByDate[dateKey].length} appointments/tokens` : ''}"
      >
        <span>${d}</span>
        ${hasEvents ? '<span class="cal-event-dot"></span>' : ''}
      </div>
    `;
  }

  return `
    <div class="calendar-widget">
      <div class="calendar-header">
        <h3>${monthNames[currentMonth]} ${currentYear}</h3>
        <div style="display: flex; gap: 4px;">
          <button class="cal-nav-btn" onclick="window.appActions.changeCalendarMonth(-1)" title="Previous Month">&lsaquo;</button>
          <button class="cal-nav-btn" onclick="window.appActions.changeCalendarMonth(1)" title="Next Month">&rsaquo;</button>
        </div>
      </div>

      <div class="calendar-days-header">
        <span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span>
      </div>

      <div class="calendar-grid">
        ${cellsHtml}
      </div>

      <div style="margin-top: 12px; font-size: 11px; color: var(--text-muted); display: flex; align-items: center; gap: 8px;">
        <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background-color: var(--saffron);"></span>
        <span>Dates with queue tokens or appointments</span>
      </div>
    </div>
  `;
}
