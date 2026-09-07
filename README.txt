STARGET OFFICIAL SITE V29

PUBLIC URL STRUCTURE
- /            : WELCOME GATE (code: 5150, experience-only client-side gate)
- /kairo/      : STARGET main site
- /kairo/films.html
- /kairo/objects.html
- /kairo/projects.html
- /kairo/contact.html

GitHub Pages deployment uses .github/workflows/deploy-pages.yml.
YouTube statistics are refreshed into kairo/data/site-content.json at deploy time.

IMPORTANT
The 5150 welcome code is a client-side experience gate, not secure authentication.
The in-site KAIRO reward gate remains reserved for future server-side verification via Cloudflare Worker.
