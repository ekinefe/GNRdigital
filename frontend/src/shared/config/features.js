// Parts of the site that can be switched off while they have nothing to show.
// Relative-import safe (no '@'): seo.js, which the Worker's sitemap imports, reads it.
export const features = {
    // Off until the first public post. Off: no Blog in the header, footer, command palette, sitemap or 404 list,
    // and /blog and /blog/:slug show the 404. Writing posts in the admin panel still works. Set true to bring it back.
    blog: false,
};
