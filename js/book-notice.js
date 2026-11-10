const KEY = 'snu-levels-4-5-added-2026-11';
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
    <h2 id="book-update-title">Levels 4 and 5 are now available!</h2>
    <p id="book-update-description">SNU Korean 4B and 5B have been added! Practise vocabulary and grammar chapter by chapter, with content organised to match each book.</p>
    <p class="muted">Choose Level 4 or Level 5, select book B, and start learning.</p>
    <div class="book-notice-actions"><button type="button" data-dismiss="visit">Close</button><button type="button" class="secondary" data-dismiss="week">Hide for a week</button></div>`;
  const dismiss = week => {
    if (week) write('localStorage', KEY, String(Date.now() + WEEK));
    else write('sessionStorage', KEY, 'closed');
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
