// ============================================================================
// LIGHTWEIGHT TOAST NOTIFICATIONS
// ============================================================================

export function showToast(message, type = 'info') {
  const root = document.getElementById('toast-root');
  const el = document.createElement('div');
  el.className = `toast toast-${type}`;
  el.textContent = message;
  root.appendChild(el);
  setTimeout(() => el.remove(), 2600);
}
