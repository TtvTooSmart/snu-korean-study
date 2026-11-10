const KEY = 'snu-book-update-2026-11';
const WEEK = 7 * 24 * 60 * 60 * 1000;
function read(storage, key) { try { return window[storage].getItem(key); } catch { return null; } }
function write(storage, key, value) { try { window[storage].setItem(key, value); } catch {} }
export function initBookNotice() {
  if (document.querySelector('#book-update-notice')) return;
  if (read('sessionStorage', KEY) === 'closed' || Number(read('localStorage', KEY)) > Date.now()) return;
  const previous = document.activeElement;
  const dialog = document.createElement('dialog');
  dialog.id = 'book-update-notice';
  dialog.setAttribute('aria-labelledby', 'book-update-title');
  dialog.setAttribute('aria-describedby', 'book-update-description');
  dialog.innerHTML = `<button type="button" class="secondary book-notice-x" aria-label="Close book update notice" autofocus>×</button>
    <p class="eyebrow">Library update</p>
    <h2 id="book-update-title">More books are on the way</h2>
    <p id="book-update-description">Other SNU Korean books are being added. We’re working on 4B first, followed by 5B, with vocabulary and grammar organised to match each book.</p>
    <p class="muted">You can keep studying the books already available.</p>
    <div class="book-notice-actions"><button type="button" data-dismiss="visit">Close</button><button type="button" class="secondary" data-dismiss="week">Hide for a week</button></div>`;
  const dismiss = week => {
    write('sessionStorage', KEY, 'closed');
    if (week) write('localStorage', KEY, String(Date.now() + WEEK));
    dialog.close();
  };
  dialog.querySelector('.book-notice-x').onclick = () => dismiss(false);
  dialog.querySelector('[data-dismiss="visit"]').onclick = () => dismiss(false);
  dialog.querySelector('[data-dismiss="week"]').onclick = () => dismiss(true);
  dialog.addEventListener('cancel', event => { event.preventDefault(); dismiss(false); });
  dialog.addEventListener('close', () => { dialog.remove(); if (previous?.isConnected) previous.focus(); }, {once:true});
  document.body.append(dialog);
  dialog.showModal();
}
if (document.readyState === 'complete') initBookNotice();
else window.addEventListener('load', initBookNotice, {once:true});
