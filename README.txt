STARGET OFFICIAL SITE V30

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


V31 FIX
- Welcome code 5150 now opens kairo/index.html without requiring Web Storage.
- Removed inner sessionStorage redirect guards that could send Safari/local previews back to Welcome.
- KAIRO IN sound page remains open (no second password).

V33 KAIRO SOUND SPACE UPDATE
- IN label reduced for a quieter / hidden-room feel.
- KAIRO sound page includes a visible BACK TO HP link.
- Recording / auto-loop length changed from 30 seconds to 15 seconds.
- Desktop layout is a fixed one-screen dashboard with no page scrolling.
- RECORD and RESET are directly below the keyboard.
- Keyboard type is lighter with increased spacing.
- Left/right abstract objects now drift, breathe and animate particles.

V34 WELCOME ACCESS UPDATE
- Welcome access is now a two-step lock.
- ACCESS / 01: 5150
- ACCESS / 02: S-0930 (alphanumeric + hyphen input)
- The site opens only after both codes are accepted in order.

V35 ACCESS FLOW
- ACCESS 01: existing 5150 gate (unchanged visual)
- ACCESS 02: new STARGET // ORIGIN puzzle gate
- ACCESS 03: former secondary gate using S-0930
- Successful ACCESS 03 opens kairo/index.html


V36 SECURITY / ACCESS UPDATE
- Three access gates are shuffled into a random order for each new browser-tab session.
- Gate types: 5150 / STARGET ORIGIN / S-0930.
- Direct access to a gate out of sequence redirects to the currently required gate.
- KAIRO and HP pages require completion of all three gates.
- 30 minutes with no pointer, keyboard, touch, wheel, or scroll activity logs the session out and returns to entry.
- Closing the browser/tab clears sessionStorage authentication.
- This remains client-side access control on static hosting and is not equivalent to server-side authentication.
