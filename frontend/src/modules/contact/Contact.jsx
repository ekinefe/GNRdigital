import React from 'react';
import { Mail, QrCode, IdCard, ArrowRight, ArrowUpRight } from 'lucide-react';
import PageShell from '@/shared/layout/PageShell';
import PageHeader from '@/shared/layout/PageHeader';
import CyberButton from '@/shared/ui/CyberButton';
import { profile } from '@/shared/config/profile';
import { contactLinks, CARD_PATH, SHARE_PATH } from '@/shared/config/contactLinks';
import { useDocumentMeta } from '@/shared/hooks/useDocumentMeta';
import CopyEmail from './CopyEmail';
import ContactForm from './ContactForm';

// The same links as the contact card (/card), minus the ones this site already is (Website, Portfolio) and
// Email (the main column has it).
const ELSEWHERE = ['linkedin', 'instagram', 'github', 'vcard'];

// A mailto link with a copy button, and a form whose messages are read in the admin panel (ADR 0009).
// The side column lists my other links and opens the contact card and its QR code for meeting in person.
const Contact = () => {
    const links = contactLinks().filter((l) => ELSEWHERE.includes(l.key));
    useDocumentMeta({ title: 'Contact', description: 'How to get in touch.' });
    return (
        <PageShell>
            <PageHeader title="Contact" description="Email is the best way to reach me. A good first message says who you are, what you are working on, and what you would like from me." />
            <section className="pb-24 grid gap-16 lg:grid-cols-[3fr_2fr]">
                <div>
                <p className="font-mono text-lg text-cyber-cyan mb-6 break-all">{profile.email}</p>

                <div className="flex flex-wrap items-center gap-4">
                    <a href={`mailto:${profile.email}`}>
                        <CyberButton variant="primary" icon={Mail}>Send email</CyberButton>
                    </a>
                    <CopyEmail email={profile.email} />
                </div>
                <div className="mt-14 relative"><ContactForm /></div>
                </div>

                <aside aria-labelledby="elsewhere" className="lg:border-l lg:border-cyber-border lg:pl-10 self-start">
                    <h2 id="elsewhere" className="font-mono text-sm text-cyber-muted mb-4">Elsewhere</h2>
                    <ul className="grid gap-2 font-mono">
                        {links.map(({ key, label, icon: Icon, detail, href, external, download }) => {
                            const Arrow = external ? ArrowUpRight : ArrowRight;
                            return (
                                <li key={key}>
                                    <a
                                        href={href}
                                        {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                                        {...(download ? { download: true } : {})}
                                        className="flex items-center gap-3 min-h-12 px-4 py-3 border border-cyber-border rounded-lg text-cyber-text hover:border-cyber-pink hover:text-cyber-pink transition-colors duration-fast focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyber-cyan"
                                    >
                                        <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                                        <span className="text-sm font-bold uppercase tracking-wider">{label}</span>
                                        <span className="ml-auto text-xs text-cyber-muted text-right [overflow-wrap:anywhere]">{detail}</span>
                                        <Arrow className="w-4 h-4 shrink-0 text-cyber-muted" aria-hidden="true" />
                                    </a>
                                </li>
                            );
                        })}
                    </ul>

                    <h2 id="in-person" className="font-mono text-sm text-cyber-muted mt-10 mb-2">Meeting in person</h2>
                    <p className="font-mono text-xs text-cyber-muted mb-4 leading-relaxed">Scan the QR code to open all my links on your phone.</p>
                    {/* Plain <a>, not a router Link: /card and /card/share are static pages outside the React app. */}
                    <div className="flex flex-wrap gap-3">
                        <a href={SHARE_PATH}>
                            <CyberButton variant="secondary" icon={QrCode}>Show QR</CyberButton>
                        </a>
                        <a href={CARD_PATH}>
                            <CyberButton variant="secondary" icon={IdCard}>Contact card</CyberButton>
                        </a>
                    </div>
                    <p className="font-mono text-xs text-cyber-muted mt-6 leading-relaxed">Based in {profile.location.city}, {profile.location.country}. {profile.availability.open ? profile.availability.text + '.' : ''}</p>
                </aside>
            </section>
        </PageShell>
    );
};

export default Contact;
