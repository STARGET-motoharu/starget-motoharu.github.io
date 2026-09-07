STARGET YouTube Auto Update Patch

Copy these two folders into the ROOT of your local starget-motoharu.github.io repository:

.github/
scripts/

Do not copy the outer starget-youtube-actions-patch folder itself.

Required GitHub repository secret:
YOUTUBE_API_KEY

The workflow:
- runs on every push to main
- can be run manually
- runs hourly at minute 17 (UTC scheduling)
- refreshes data/site-content.json only inside the deployment runner
- deploys the refreshed site to GitHub Pages
- does NOT commit subscriber-count changes back into the repository

If STARGET LAB.'s handle in data/site-content.json is not correct, the workflow can still update STARGET and will log a warning for the LAB channel. Update the LAB handle later when its exact channel URL is known.

Safety note for V26:
The current @stargetlab value is treated as a temporary placeholder and is skipped. Send/enter the exact STARGET LAB YouTube URL later, then the same workflow will update both channels with the same API key.
