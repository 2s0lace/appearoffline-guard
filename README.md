# Unruminate

A calm, mindful browser extension (Chrome & Firefox, Manifest V3) built to interrupt impulsive browsing and rumination loops. Based on [penge/block-site](https://github.com/penge/block-site) (MIT).

## Features

- **30-second mindful pause** — centered, smooth 60fps breathing ring with calm 3-second blurred number transitions. Pauses automatically if you switch tabs.
- **Conscious reason logging** — before unlocking a blocked site, choose what is driving the urge (**Need**, **Boredom**, **Rumination**, or **Other**) and write down why you are visiting.
- **History & pattern stats** — see how many times you unlocked sites out of boredom vs. rumination vs. genuine need (Today / This Week / This Month / All Time), with individual entry deletion and full history reset.
- **Two unlock modes**:
  1. **Standard** — 30s pause + reason logging (ready out of the box for everyday use).
  2. **With one-time AI / partner code** — requires a single-use code (`XXXX-XXXX`) to temporarily unlock a site or modify settings. Includes a built-in **Generate 50 codes** button in Options that saves **only SHA-256 hashes** inside the extension so you can hand the plaintext codes to your AI assistant or accountability partner.
- **Auto re-block** — temporary unlocks (5 / 10 / 15 / 30 min) automatically re-check and re-block open tabs when time expires.
- **5 languages & Light/Dark themes** — Polish, English, Spanish, French, and German, with Light (default) and Dark themes.

## Build & Install (Chrome / Edge / Brave)

```bash
npm install
npm run lint
npm test
```

Build for Chrome (PowerShell):

```powershell
$env:TARGET="chrome"; npx tsup
```

Build for Firefox (PowerShell):

```powershell
$env:TARGET="firefox"; npx tsup
```

Load in Chrome / Edge / Brave:
1. Open `chrome://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked** and select `dist/chrome`

## License

MIT — built on top of [penge/block-site](https://github.com/penge/block-site) by Pavel Bucka.
