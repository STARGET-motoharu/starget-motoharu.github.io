import fs from 'node:fs';

const API_KEY = process.env.YOUTUBE_API_KEY;
const FILE = 'data/site-content.json';

if (!API_KEY) {
  throw new Error('YOUTUBE_API_KEY is not configured in GitHub Actions secrets.');
}

if (!fs.existsSync(FILE)) {
  throw new Error(`${FILE} was not found.`);
}

const data = JSON.parse(fs.readFileSync(FILE, 'utf8'));
const channels = data?.youtube?.channels;

if (!Array.isArray(channels) || channels.length === 0) {
  throw new Error('No YouTube channels are configured in data/site-content.json.');
}

let updatedCount = 0;

for (const channel of channels) {
  if (channel.published === false) continue;

  // V26 contains @stargetlab as a temporary LAB placeholder.
  // Do not risk showing statistics from an unrelated channel until the real LAB URL/handle is confirmed.
  if (channel.key === 'starget_lab' && channel.handle === '@stargetlab') {
    console.warn('[YouTube] STARGET LAB. skipped: replace the temporary @stargetlab handle with the real channel handle first.');
    continue;
  }

  const params = new URLSearchParams({
    part: 'statistics',
    key: API_KEY,
  });

  if (channel.channel_id) {
    params.set('id', channel.channel_id);
  } else if (channel.handle) {
    params.set('forHandle', channel.handle);
  } else {
    console.warn(`[YouTube] Skipped ${channel.key ?? channel.label ?? 'channel'}: no channel_id or handle.`);
    continue;
  }

  const response = await fetch(`https://www.googleapis.com/youtube/v3/channels?${params.toString()}`);

  if (!response.ok) {
    const body = await response.text();
    console.warn(`[YouTube] API request failed for ${channel.key ?? channel.handle}: HTTP ${response.status}`);
    // Keep the response body out of normal logs unless it is short and non-sensitive.
    if (body && body.length < 500) console.warn(body);
    continue;
  }

  const result = await response.json();
  const item = result.items?.[0];

  if (!item) {
    console.warn(`[YouTube] Channel not found: ${channel.handle ?? channel.channel_id}`);
    continue;
  }

  const stats = item.statistics ?? {};
  channel.channel_id = item.id ?? channel.channel_id ?? null;
  channel.statistics ??= {};

  if (stats.subscriberCount != null) {
    channel.statistics.subscribers = Number(stats.subscriberCount);
  }
  if (stats.videoCount != null) {
    channel.statistics.video_count = Number(stats.videoCount);
  }
  if (stats.viewCount != null) {
    channel.statistics.view_count = Number(stats.viewCount);
  }

  channel.statistics.updated_at = new Date().toISOString();
  updatedCount += 1;

  console.log(`[YouTube] Updated ${channel.label ?? channel.key ?? channel.handle}: ${channel.statistics.subscribers ?? 'subscriber count unavailable'}`);
}

if (updatedCount === 0) {
  throw new Error('YouTube statistics could not be updated for any configured channel. Check the API key restrictions and channel handles.');
}

data.site ??= {};
data.site.content_updated_at = new Date().toISOString();

fs.writeFileSync(FILE, `${JSON.stringify(data, null, 2)}\n`);
console.log(`[YouTube] ${updatedCount} channel(s) updated. Live artifact is ready.`);
