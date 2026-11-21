// Single source of truth for contact details and public links. Change a URL here, not in the pages.
// Run `npm run check:links` to verify every external link in src/ still resolves.

// The four contact links can also be set without a code change, as build variables (GNR-182): Cloudflare
// Workers Builds → Settings → Build → Variables and secrets, or frontend/.env.local. A variable that is not set,
// or not a valid address, falls back to the value written here, so a new deploy never loses a link.
export const PROFILE_ENV = {
    email: 'PROFILE_EMAIL',
    github: 'PROFILE_GITHUB',
    linkedin: 'PROFILE_LINKEDIN',
    instagram: 'PROFILE_INSTAGRAM', // full https://www.instagram.com/<handle>/ URL
};

const isValid = (key, value) => (key === 'email' ? /^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]+$/ : /^https:\/\/[^\s<>"]+$/).test(value);

// The app and the tests get the variables from Vite (import.meta.env, prefix PROFILE_); vite.config.js, which
// builds the /card pages in Node, gets them from process.env.
function envValue(name) {
    const value = import.meta.env?.[name] ?? globalThis.process?.env?.[name];
    return typeof value === 'string' ? value.trim() : '';
}

/** Names of PROFILE_* variables that are set but ignored because they are not a valid address (warned in the build). */
export function invalidProfileEnv() {
    return Object.entries(PROFILE_ENV).filter(([key, name]) => envValue(name) && !isValid(key, envValue(name))).map(([, name]) => name);
}

const fromEnv = (key, fallback) => {
    const value = envValue(PROFILE_ENV[key]);
    return value && isValid(key, value) ? value : fallback;
};

export const profile = {
    // Getters, so the value is read when it is used: vite.config.js loads frontend/.env.local after this file.
    get email() { return fromEnv('email', 'ekinefegnr@gmail.com'); },
    get github() { return fromEnv('github', 'https://github.com/ekinefe'); },
    get linkedin() { return fromEnv('linkedin', 'https://www.linkedin.com/in/ekin-efe-gungor/'); },
    get instagram() { return fromEnv('instagram', null); }, // the /card and Contact buttons show once it is set
    cv: '/cv.pdf', // public/cv.pdf: replace that file to update the CV (it is the one PDF .gitignore lets through)
    repos: {
        cwKeyer: 'https://github.com/ekinefe/CW_keyer-GNR',
        cwTrainer: 'https://github.com/ekinefe/CW_trainer-GNR',
        ticketManager: 'https://github.com/ekinefe/ticket-manager',
        platform: 'https://github.com/ekinefe/GNRHUB_', // GitHub redirects automatically if the repo is renamed
    },
    // Live sites of my own projects.
    sites: { plannedLost: 'https://plannedlost.com/' },
    location: { city: 'Warsaw', country: 'PL', timeZone: 'Europe/Warsaw' },
    // Shown as the badge on Home. Set open: false to hide it.
    availability: { open: true, text: 'Open to work' },
    license: { name: 'MIT', url: 'https://github.com/ekinefe/GNRHUB_' }, // repo root: a /blob/.../LICENSE link 404s until LICENSE reaches the default branch
    dyrk1a: 'https://dyrk1aprot.com',
};
