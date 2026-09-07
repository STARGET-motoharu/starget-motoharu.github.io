STARGET OFFICIAL SITE V24

V16 updates
- FILMS on the top page is limited to 4 items.
- OBJECTS on the top page is limited to 4 items.
- PROJECTS on the top page is limited to 3 items.
- Added FILMS archive: films.html
- Added OBJECTS archive: objects.html
- Added PROJECTS archive: projects.html
- data/site-content.json is now actively read by the website instead of being only a future CMS manifest.
- Added data/site-content.schema.json for the Codex management app contract.
- SOUND list is data-driven (MP3 URL + title).
- YouTube channel links and subscriber values are data-driven.

CODEX MANAGEMENT APP — DATA CONTRACT
The admin app should read/write data/site-content.json (schema_version 2).
Validate writes against data/site-content.schema.json.

1) YouTube
youtube.channels[]
- key: internal stable key (example: starget)
- label: display name
- url: public YouTube channel URL
- handle: @handle
- channel_id: YouTube channel ID when known (recommended for API updates)
- statistics.subscribers: latest subscriber count
- statistics.video_count: latest public video count
- statistics.view_count: latest public channel view count
- statistics.updated_at: ISO 8601 timestamp for the last server-side refresh
- published: show/hide channel

IMPORTANT: YouTube API keys must NOT be stored in site-content.json or frontend JavaScript.
The Codex admin app / server-side Worker should call YouTube Data API, then write the safe subscriber number into this data.

2) FILMS
films[]
- id, title
- media_type: none / mp4 / webm / youtube / vimeo
- media_url: uploaded video URL/path
- poster_url: thumbnail/poster URL/path
- external_url: optional destination page/video URL
- duration, year
- published
- sort_order
Top page uses the first 4 published items; films.html shows all published items.

3) OBJECTS
objects[]
- id, title
- model_url: GLB URL/path
- poster_url: preview image
- description, year
- published
- sort_order
Top page uses the first 4 published items; objects.html shows all published items.

4) PROJECTS
projects[]
- id, title
- year
- categories[]
- url
- status
- published
- sort_order
Top page uses the first 3 published items; projects.html shows all published items.

5) SOUND
sound[]
- id
- title
- mp3_url
- published
- sort_order
All published entries are rendered into the SOUND player.

Recommended admin publishing flow
- Upload MP4 / GLB / poster / MP3 to Cloudflare R2 (or equivalent object storage).
- Save metadata to the admin database (D1 or equivalent).
- Publish a site-content.json-compatible payload for this site.
- Keep API keys, write tokens and admin authentication server-side only.

Local preview
Because site-content.json is loaded with fetch(), open the site over HTTP instead of file://.
Example:
  python3 -m http.server 8000
Then open:
  http://localhost:8000


KOKURYU CUP CONNECTION
- The Kokuryu Cup archive is no longer embedded in this repository.
- PROJECT_001 opens the existing external GitHub Pages site:
  https://starget-motoharu.github.io/Kokuryu-hai/
- Added STARGET return links to the Kokuryu archive top, Cup #01, Cup #02 and gallery pages.
- The connection is relative-path based, so the package works without hard-coding a future STARGET production domain.

V18: STARGET LAB logo slightly reduced. V19 removed the full-screen intro and moved motion to individual content areas.


V19 MOTION UPDATE
- Removed the V18 full-page Japanese craft intro completely.
- Added content-specific scroll entrance motion instead.
- 3D: KUMIKO-inspired frame assembly.
- FILMS: EMAKI-inspired horizontal unroll.
- PROCESS: ORIGAMI / ORIKATA-inspired unfolding.
- OBJECTS: SASHIMONO-inspired parts locking into place.
- CHANNELS: BYOBU-inspired two-panel unfold.
- PROJECTS: TSUGITE-inspired connecting line reveal.
- SOUND: MA-inspired measured rhythmic timing.
- LIVE VISUAL: precision grid / digital scan.
- FAN ART: SHOJI-inspired two-plane alignment.
- CONTACT: NOREN-inspired downward opening.
- Animations respect prefers-reduced-motion and are based primarily on transform/clip-path for performance.


V20 MOTION UPDATE
- Added direction-aware departure motion while scrolling down or back up.
- Departures begin while content is still partially visible, so the closing motion can actually be seen.
- Section-specific exits preserve the craft language: EMAKI rolls close, BYOBU folds back, SHOJI planes separate, NOREN lifts away, and TSUGITE rows disengage.
- Reveal animations reset only after content is fully outside the viewport, so scrolling back can reassemble the content naturally.
- Added slow pointer-hover motion: a restrained vermilion seam and lacquer-like gloss sweep.
- Slowed legacy hover shifts for PROJECTS / SOUND / archive rows / 3D buttons.
- Hover effects are limited to fine-pointer devices; prefers-reduced-motion disables entrance, exit and hover motion.

V21 NEO CRAFT + CONTACT UPDATE
- Advanced hover system translates Japanese craft into interaction rather than decorative motifs.
- KUMIKO: a measured technical lattice appears at the edge of each active section and moves subtly with scroll position.
- KIRIKO: pointer position creates a slow refracted highlight inside interactive cards and links.
- URUSHI: hover depth/gloss is deliberately slow rather than using fast zooms.
- MA: the existing direction-aware entrance/departure timing is retained and paired with slower pointer response.
- Added a delayed registration-ring cursor on desktop/fine-pointer environments.
- CONTACT on the top page now opens contact.html.
- contact.html contains the requested four fields: name, subject, contact method, and message.
- Contact form frontend validates the fields and is ready to POST JSON to a future Worker / management-app endpoint.

CONTACT ENDPOINT CONNECTION
1. Open contact-config.js.
2. Set window.STARGET_CONTACT_ENDPOINT to the HTTPS endpoint supplied by the future management app / Cloudflare Worker.
3. The page sends this JSON shape:
   { name, subject, contact, message, source, created_at }
4. Until an endpoint is configured, submit stays in transparent standby mode and does not pretend that a message was delivered.


V22 CONTACT + SOUND UPDATE
- Contact form can be submitted only after NAME / SUBJECT / DETAILS are filled. CONTACT is optional.
- Added TOMOKORE.mp3 and タイキレーツ＿待機画面＿BGM.mp3 to the SOUND playlist, using the source filenames as titles (without extension, consistent with existing tracks).

V23 additions: YouTube FILMS card, expanded SOUND transport/repeat/shuffle controls, balanced/framed STARGET LAB logo treatment.


V24 SOUND / TOP LAB / FAN ART / COPY UPDATE
- SOUND transport changed: RESTART returns the current track to 00:00; NEXT skips to the next track.
- Repeat controls consolidated into one REPEAT button: OFF -> REPEAT 1 -> REPEAT ALL -> OFF.
- Shuffle remains independently available and works with playlist repeat.
- SOUND_004 display title changed to TAIKIRE-TU (source MP3 filename is unchanged).
- Removed the special frame / heavy blur treatment from the STARGET LAB YouTube channel panel.
- Moved the craft frame treatment to the TOP-page STARGET Lab logo area, with stronger local backdrop blur and restrained vermilion registration lines.
- Disabled ordinary text selection on the STARGET public pages so portfolio titles/copy cannot be normally selected and copied; contact form fields remain selectable/editable.
- Removed visible hashtag text from FAN ART.
- Removed the unsupported X hashtag-search timeline embed and kept a reliable OPEN ON X live-search gateway. An in-page live hashtag feed requires an X API/backend integration.

V25: Removed TOP LAB blur/frame, moved hero background ~3% upward, removed visible FAN ART section pending future community redesign, and added interactive 猿 / 戌 GLB objects.

V27 UPDATE
- Featured 3D: assets/oni-0907.glb
- Existing assets/ushi.glb moved to OBJECTS as 丑
- STARGET LAB @stargetlab enabled for YouTube stats
- GitHub Actions workflow included under .github/workflows/
- YouTube updater included under scripts/
