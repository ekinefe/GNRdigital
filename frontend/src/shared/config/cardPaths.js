// Addresses of the contact card pages (built in modules/card/cardPages.js). Kept apart from contactLinks.js so the
// footer, which is on every page, can link to them without loading the icons and the About text.
// Static pages, not React routes: link to them with a plain <a href>, never a router <Link>.
export const CARD_PATH = '/card';
export const SHARE_PATH = '/card/share';
