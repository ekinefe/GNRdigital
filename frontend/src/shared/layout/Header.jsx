import React, { useEffect, useId, useState } from 'react';
import Wordmark from '@/shared/ui/Wordmark';
import ScrollProgress from './ScrollProgress';
import { Link, useLocation } from 'react-router-dom';
import { House, NotebookPen, Menu, X, PersonStanding, Mail, Code, QrCode } from 'lucide-react';
import { SHARE_PATH } from '@/shared/config/cardPaths';

const Header = () => {
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const menuId = useId();

    // Close the drawer when the route changes or Escape is pressed.
    useEffect(() => { setIsMobileMenuOpen(false); }, [location.pathname]);
    useEffect(() => {
        if (!isMobileMenuOpen) return undefined;
        const onKey = (e) => e.key === 'Escape' && setIsMobileMenuOpen(false);
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [isMobileMenuOpen]);

    // Header shrinks a little once the page is scrolled.
    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 8);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    // Helper to check if link is active
    const isActive = (path) => (path === '/' ? location.pathname === '/' : location.pathname === path || location.pathname.startsWith(`${path}/`));

    // Centralized Navigation Data (keeps code DRY)
    const navItems = [
        { path: "/", icon: House, label: "Home" },
        { path: "/projects", icon: Code, label: "Portfolio" },
        { path: "/blog", icon: NotebookPen, label: "Blog" },
        { path: "/about", icon: PersonStanding, label: "About" },
        { path: "/contact", icon: Mail, label: "Contact" }
    ].filter(Boolean);

    return (
        <header className="fixed top-0 left-0 w-full z-header border-b border-cyber-border bg-cyber-black/90 backdrop-blur-md">
            <div className={`max-w-screen-2xl mx-auto px-4 md:px-10 ${scrolled ? 'h-14' : 'h-16'} transition-[height] duration-base flex items-center justify-between`}>

                {/* === LEFT: LOGO === */}
                <Link to="/" className="group z-header flex-shrink-0" onClick={() => setIsMobileMenuOpen(false)}>
                    <div className="border border-cyber-text bg-cyber-black px-3 py-1.5 font-mono text-lg text-cyber-text transition-colors duration-300 group-hover:border-cyber-pink group-hover:text-cyber-pink">
                        <Wordmark />
                    </div>
                </Link>

                {/* === RIGHT: NAVIGATION (Desktop), next to Share === */}
                <nav aria-label="Main" className="hidden md:flex items-center gap-2 ml-auto">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`
                                relative group flex items-center gap-2 px-2 lg:px-4 py-2 font-mono text-sm uppercase tracking-wider transition-all duration-300
                                ${isActive(item.path) ? 'text-cyber-pink' : 'text-cyber-muted hover:text-white'}
                            `}
                        >
                            {item.icon && <item.icon aria-hidden="true" className={`w-4 h-4 transition-transform duration-300 ${isActive(item.path) ? 'scale-110' : 'group-hover:scale-110'}`} />}
                            <span>{item.label}</span>

                            {/* Active Indicator (The "LED" Line) */}
                            <span className={`
                                absolute bottom-0 left-0 h-[2px] bg-cyber-pink transition-all duration-300
                                ${isActive(item.path) ? 'w-full' : 'w-0 group-hover:w-full group-hover:bg-cyber-border'}
                            `} />
                        </Link>
                    ))}
                </nav>

                {/* === RIGHT (Desktop): SHARE === plain <a>: /card/share is a static page outside the React app */}
                <a
                    href={SHARE_PATH}
                    aria-label="Share"
                    className="hidden md:inline-flex items-center gap-2 ml-2 px-3 lg:px-4 py-2 border border-cyber-border font-mono text-sm uppercase tracking-wider text-cyber-text hover:border-cyber-pink hover:text-cyber-pink transition-colors duration-fast focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyber-cyan"
                >
                    <QrCode aria-hidden="true" className="w-4 h-4" />
                    <span className="hidden lg:inline">Share</span>{/* icon only on narrow tablets so the row fits */}
                </a>

                {/* === RIGHT (Mobile): SHARE + MENU TOGGLE === */}
                <div className="md:hidden flex items-center gap-1 z-header">
                    <a
                        href={SHARE_PATH}
                        aria-label="Share (QR code)"
                        className="text-cyber-text hover:text-cyber-pink transition-colors p-2 border border-transparent hover:border-cyber-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyber-cyan"
                    >
                        <QrCode aria-hidden="true" className="w-6 h-6" />
                    </a>
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
                        aria-expanded={isMobileMenuOpen}
                        aria-controls={menuId}
                        className="text-cyber-text hover:text-cyber-pink transition-colors p-2 border border-transparent hover:border-cyber-border"
                    >
                        {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>

            </div>

            <ScrollProgress />

            {/* === MOBILE MENU OVERLAY === */}
            {/* Terminal list: no boxes, thin rules between rows; the current page is pink with a "> ... _" prompt. */}
            {isMobileMenuOpen && (
                <div id={menuId} className="md:hidden absolute top-full left-0 w-full bg-cyber-black border-b border-cyber-border shadow-2xl">
                    <nav aria-label="Mobile" className="flex flex-col px-4 py-4 font-mono">
                        {navItems.map((item) => {
                            const active = isActive(item.path);
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    aria-current={active ? 'page' : undefined}
                                    className={`flex items-center gap-2 py-4 border-b border-cyber-border/60 text-base uppercase tracking-wider transition-colors duration-fast focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyber-cyan ${active ? 'text-cyber-pink' : 'text-cyber-text hover:text-cyber-pink'}`}
                                >
                                    <span aria-hidden="true" className={active ? '' : 'invisible'}>&gt;</span>
                                    <span>{item.label}</span>
                                    {active && <span aria-hidden="true">_</span>}
                                </Link>
                            );
                        })}
                        <a
                            href={SHARE_PATH}
                            className="flex items-center gap-2 py-4 text-base uppercase tracking-wider text-cyber-muted hover:text-cyber-pink transition-colors duration-fast focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyber-cyan"
                        >
                            <span aria-hidden="true" className="invisible">&gt;</span>
                            <span>Share</span>
                            <QrCode aria-hidden="true" className="w-4 h-4" />
                        </a>
                    </nav>
                </div>
            )}
        </header>
    );
};

export default Header;