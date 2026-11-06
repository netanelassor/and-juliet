# Optional offline reading

Settings integration is `<OfflineBook/>`; there are no props, App edits, new packages, paid services, or credentials. The Vite config imports the offline build plugin and uses port 4178 for both dev and preview, preserving the separate prototype's port.

The production build inventories its actual output and emits `offline-book-manifest.json` and `offline-book-sw.js`. The inventory contains the built HTML/JS/CSS, all 48 original story illustrations, all 48 thumbnails, every clean plate present in `assets/premium`, cover/character/theatre artwork, local fonts, and icons. The plugin rejects a build missing any of the 48 original illustrations or thumbnails. Its version derives from file contents and the worker implementation. No audio/video extension or remote URL can enter the inventory.

Opening Settings requests only the small inventory and the status of an already installed worker. The explicit “נשמור את הספר לדרך” action registers the worker and starts the book download. Nothing preloads the full book automatically. Size, progress, cancellation, storage errors, and retry are visible. Cancellation preserves completed files; retry resumes from those files. Completion is reported only after every inventory file is cached and the completion marker is written.

The worker is scoped to the application base, including `/and-juliet/` on GitHub Pages. It requests fresh navigation and book assets online, then falls back to saved resources if the network fails. It never forces a page reload for an update. An incomplete new download does not replace the previous complete offline edition; after success it retains the current and one previous complete edition. Cache cleanup is limited to this book's exact scope-specific prefix and never deletes another application's caches.

Download requests omit credentials. Cache keys are plain local URLs, without request cookies or authorization headers. External origins, including Apple Music, Spotify, sign-in, and provider player data, pass through without caching. Music always requires a network connection and remains controlled by its official provider.

The reader should leave the book open until saving finishes. iPadOS may stop an unfinished download after the app is closed or suspended. Service workers require HTTPS or localhost; an insecure LAN address and Vite's development module server do not offer offline saving. Browser storage restrictions, private browsing, capacity limits, and later browser eviction can prevent or remove the saved copy. The UI does not promise permanent storage, background completion, offline music, or a human narration recording.

No automated tests, regression runs, or concurrent builds were performed for this feature. The parent task owns the single integrated production build, visual review, and publication.

Primary references: [Vite plugin API](https://vite.dev/guide/api-plugin.html), [Vite output/public files](https://vite.dev/config/build-options), [service worker scope and registration](https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerContainer/register), [CacheStorage](https://developer.mozilla.org/en-US/docs/Web/API/CacheStorage), and [worker lifecycle limits](https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerGlobalScope).
