// The ways to reach me, in one list for the contact card (/card, built in modules/card/cardPages.js) and the
// Contact page. URLs come from profile.js; a link whose value there is empty is left out.
// Relative imports on purpose: vite.config.js loads this file through cardPages.js, and has no '@' alias.
import { Globe, FolderCode, Mail, UserPlus } from 'lucide-react';
import { Github, Linkedin, Instagram } from '../ui/brandIcons.js';
import { profile } from './profile.js';
import { about } from '../content/about.js';
import { CARD_PATH, SHARE_PATH } from './cardPaths.js';

export { CARD_PATH, SHARE_PATH };
export const VCARD_PATH = `/card/${about.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.vcf`;

// "https://example.com/card" -> "example.com/card"
export const shortUrl = (url) => url.replace(/^https?:\/\//, '').replace(/\/$/, '');

/**
 * @returns {{ key: string, label: string, icon: Function, detail: string, href: string, external?: boolean, download?: boolean }[]}
 */
export function contactLinks() {
    const links = [
        { key: 'website', label: 'Website', icon: Globe, detail: 'Home', href: '/' },
        { key: 'portfolio', label: 'Portfolio', icon: FolderCode, detail: 'Projects', href: '/projects' },
        { key: 'linkedin', label: 'LinkedIn', icon: Linkedin, detail: profile.linkedin && shortUrl(profile.linkedin).replace(/^www\.linkedin\.com\//, ''), href: profile.linkedin, external: true },
        { key: 'instagram', label: 'Instagram', icon: Instagram, detail: profile.instagram && `@${shortUrl(profile.instagram).split('/').pop()}`, href: profile.instagram, external: true },
        { key: 'github', label: 'GitHub', icon: Github, detail: profile.github && shortUrl(profile.github).replace(/^github\.com\//, ''), href: profile.github, external: true },
        { key: 'email', label: 'Email', icon: Mail, detail: profile.email, href: profile.email && `mailto:${profile.email}` },
        { key: 'vcard', label: 'Save contact', icon: UserPlus, detail: '.vcf', href: VCARD_PATH, download: true },
    ];
    return links.filter((l) => l.href);
}
