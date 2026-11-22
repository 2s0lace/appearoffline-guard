<p align="center">
  <img src="assets/icon.svg" width="160" alt="appearoffline: guard icon">
</p>

<h1 align="center">appearoffline: guard</h1>

<p align="center">
  A small Chrome/Firefox extension that adds a 30-second pause and a reason log before opening distracting sites.
</p>

---

I built this because hard site blockers never worked for me (I'd just disable them), and pure willpower didn't either. Usually I'm not even sure why I opened a tab. It's just habit, boredom, or rumination.

Instead of slamming the tab shut, **appearoffline: guard** puts a quiet 30-second countdown in the way. While you wait, the little ghost sleeps with its headphones on. If you still want to go in, you pick why (*need*, *boredom*, *rumination*, or *other*) and write a short note that gets saved to your history.

## Install (no build needed)

Grab the latest zip from [Releases](https://github.com/2s0lace/appearoffline-guard/releases/latest):

**Chrome / Brave / Edge / Arc**
1. Download `appearoffline-guard-chrome.zip` and unzip it somewhere permanent.
2. Open `chrome://extensions` and enable **Developer mode**.
3. Click **Load unpacked** and select the unzipped folder.
4. Pin the icon to your toolbar and click it to add sites.

**Firefox**
1. Download `appearoffline-guard-firefox.zip`.
2. Open `about:debugging#/runtime/this-firefox`.
3. Click **Load Temporary Add-on…** and pick the zip (or `manifest.json` after unzipping).

## What's inside

- **30s pause**: smooth breathing ring that pauses if you switch tabs.
- **Reason log & history**: pick a category (*need*, *boredom*, *rumination*, *other*), write why you're visiting, and review your patterns over today, this week, this month, or all time.
- **Timed unlocks**: unlock a site for 5, 10, 15, or 30 minutes. Once time's up, open tabs get blocked again automatically.
- **Optional strict mode (one-time codes)**: if you want extra friction, turn on code mode. You can generate a batch of 50 single-use codes and hand them to a friend or an AI chat so you have to ask before unlocking. Includes a 24-hour emergency unlock in case you lose your codes.
- **Light & dark themes** + 5 languages (Polish, English, Spanish, French, German).

## Build from source

```bash
npm install
npm run lint
npm test
```

Build bundles (PowerShell):

```powershell
$env:TARGET="chrome"; npx tsup
$env:TARGET="firefox"; npx tsup
```

Output goes to `dist/chrome` and `dist/firefox`.

## Credits & License

Forked from [penge/block-site](https://github.com/penge/block-site) by Pavel Bucka. Licensed under MIT.
