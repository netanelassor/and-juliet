# & Juliet · הבמה של רון

An illustrated Hebrew musical storybook made for Ron, with all 48 original scenes, 17 chapters, two acts and 29 Original Broadway Cast Recording references.

**Read the book:** https://netanelassor.github.io/and-juliet/

The experience uses live RTL Hebrew text, Rubik, the original illustrations, an illustrated opening curtain, scene-specific stage effects, saved reading progress and official Apple Music/Spotify embeds. Music starts only after a deliberate user action; full playback depends on the provider and account.

## Run locally

```sh
npm ci
npm run dev
```

Open the address printed by Vite. The default port is 4176.

## Check and build

```sh
npm test
VITE_BASE_PATH=/and-juliet/ npm run build
```

The static deployment is `dist/`. Machine-specific preservation checks skip when the original PDF and earlier local deliverables are unavailable; portable story, artwork and music checks still run.

## Deploy

The **Deploy Ron storybook** GitHub Actions workflow builds and publishes to GitHub Pages. It runs manually from Actions. Only the built static site is published.

The app is designed for an 11-inch iPad and supports portrait reflow and reduced motion. The illustrations remain flattened original art; animation consists of stage effects and controlled camera movement. Home-screen icons are included; no offline cache or service worker is provided.

A personal family project, with no official affiliation to the theatrical production. No commercial song recordings, lyrics or service credentials are included.
