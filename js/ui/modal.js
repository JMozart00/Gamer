// ============================================================================
// GENERIC MODAL SHELL
// Zone-specific renderers (dojo.js, recruit.js, ...) call openModal() with
// a title and inner-HTML body, and re-render via renderModalBody() whenever
// game state changes while the modal is open.
// ============================================================================

const root = () => document.getElementById('modal-root');

let currentZoneRenderer = null;
let currentOnClose = null;

export function openModal(title, bodyHtml, { onRender, onClose } = {}) {
  // Closing any previously open modal first also runs its onClose cleanup
  // (e.g. unsubscribing from gameState), so zone renderers never leak.
  if (isModalOpen()) closeModal();

  const r = root();
  r.innerHTML = `
    <div class="modal" role="dialog" aria-modal="true">
      <div class="modal-header">
        <div class="modal-title">${title}</div>
        <button class="modal-close" id="modal-close-btn">CLOSE</button>
      </div>
      <div class="modal-body" id="modal-body">${bodyHtml}</div>
    </div>
  `;
  r.classList.add('open');
  r.setAttribute('aria-hidden', 'false');
  document.getElementById('modal-close-btn').addEventListener('click', closeModal);
  r.addEventListener('click', (e) => {
    if (e.target === r) closeModal();
  });
  currentZoneRenderer = onRender || null;
  currentOnClose = onClose || null;
}

export function updateModalBody(bodyHtml) {
  const body = document.getElementById('modal-body');
  if (body) body.innerHTML = bodyHtml;
}

export function closeModal() {
  const r = root();
  r.classList.remove('open');
  r.setAttribute('aria-hidden', 'true');
  r.innerHTML = '';
  if (currentOnClose) currentOnClose();
  currentZoneRenderer = null;
  currentOnClose = null;
}

export function isModalOpen() {
  return root().classList.contains('open');
}

export function rerenderOpenModal() {
  if (currentZoneRenderer) currentZoneRenderer();
}
