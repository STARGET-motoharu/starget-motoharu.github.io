# STARGET V15 — CODEX MANAGEMENT APP DATA SPEC

## Source of truth
The website reads `data/site-content.json` (schema version 2).
The management app should validate publish payloads against `data/site-content.schema.json`.

## Publishing rules
- `published: false` = do not render on the public site.
- `sort_order` ascending = display order.
- Home limits are controlled by `site.home_limits`: FILMS 4 / OBJECTS 4 / PROJECTS 3.
- Archive pages show every published item.

## YouTube
`youtube.channels[]`
- `key`: stable internal key
- `label`: public display name
- `url`: channel link
- `handle`: @handle
- `channel_id`: YouTube channel ID when available
- `statistics.subscribers`
- `statistics.video_count`
- `statistics.view_count`
- `statistics.updated_at`
- `published`

Refresh YouTube statistics server-side. Never publish the YouTube API key, admin token, or write credentials in this JSON or frontend JavaScript.

## FILMS
`films[]`: `id`, `title`, `media_type`, `media_url`, `poster_url`, `external_url`, `duration`, `year`, `published`, `sort_order`.
Recommended media storage: R2/object storage. MP4/WebM URLs may be rendered directly; an external link can point to YouTube/Vimeo/project pages.

## OBJECTS
`objects[]`: `id`, `title`, `model_url`, `poster_url`, `description`, `year`, `published`, `sort_order`.
Use GLB for `model_url` unless there is a reason to use split glTF assets.

## PROJECTS
`projects[]`: `id`, `title`, `year`, `categories[]`, `url`, `status`, `published`, `sort_order`.
The home page shows the first three published projects.

## SOUND
`sound[]`: `id`, `title`, `mp3_url`, `published`, `sort_order`.
The public player renders all published sound entries.

## Suggested app workflow
1. Authenticate admin user.
2. Upload MP4/GLB/poster/MP3 files to R2 or equivalent object storage.
3. Store/edit metadata in D1 or equivalent database.
4. A server-side YouTube job refreshes channel statistics.
5. Publish a schema-valid `site-content.json` payload.
6. Public site reads only the published payload; no private credentials are exposed.
