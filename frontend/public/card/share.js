// /card/share (GNR-181): tapping the address under the QR sends it on. On a phone it opens the share sheet
// (WhatsApp, Messenger, Messages…); with a mouse it copies the address. Without this file, or if both fail,
// the link simply opens /card. Loaded from this origin, so the CSP (script-src 'self') allows it.
const link = document.querySelector('a.url');
const label = link && link.querySelector('.url-text');

function say(text) {
    const before = label.dataset.text || label.textContent;
    label.dataset.text = before;
    label.textContent = text;
    clearTimeout(say.timer);
    say.timer = setTimeout(() => { label.textContent = before; }, 2000);
}

if (link && label) {
    link.addEventListener('click', async (event) => {
        const url = link.href;
        const touch = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
        if (touch && navigator.share) {
            event.preventDefault();
            try {
                await navigator.share({ title: document.title, url });
            } catch (err) {
                if (err && err.name !== 'AbortError') window.location.href = url; // AbortError: the sheet was closed
            }
            return;
        }
        if (navigator.clipboard && navigator.clipboard.writeText) {
            event.preventDefault();
            try {
                await navigator.clipboard.writeText(url);
                say('Link copied');
            } catch {
                window.location.href = url;
            }
        }
    });
}
