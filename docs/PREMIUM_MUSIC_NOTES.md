# Premium showcase music

The scene listening action opens its exact existing song in a persistent official player below the story. The full 29-song library is a separate action. No cue mapping or verified provider URL was changed.

The player now has compact and expanded presentation. Both keep the same iframe mounted, with its full provider controls and branding visible. Expansion changes the surrounding options and available width; it does not hide, crop, or replace the player. Track, provider, explicit retry, and close remain deliberate user actions. Loading text reports the provider document state, never that audio is playing.

The library and player share restrained plum, ivory, and gold styling. The selected-song artwork uses the approved graphic logo. All app controls keep at least 44 px touch targets, song labels keep automatic Hebrew/English direction, and reduced-motion settings remove the small width/chevron transitions.

## Integration

`BackgroundTrack` and all existing `BackgroundMusic` props remain compatible. The optional `onOpenLibrary?: () => void` adds the separate library link. The parent still owns explicit scene-song selection and scrolling to the dock. The component keeps its own expansion state, which does not participate in the iframe key.

## Provider limits

Opening a scene's song is one app action. A further tap on the official provider's Play control may be required on iPad; there is no claimed autoplay. Sign-in, subscription, region, and browser permissions determine actual playback. Apple documents previews while logged out and full tracks when logged in. Spotify can also serve a preview depending on the listener's context. The app cannot style or directly inspect the cross-origin provider controls.

The Spotify frame uses the current recommended 152 px compact height and at least 280 px available width. Apple keeps the existing 175 px song-player height. Provider styling remains native rather than a simulated app player.

References checked 6 November 2026:

- [Spotify: Creating an Embed and choosing its size](https://developer.spotify.com/documentation/embeds/tutorials/creating-an-embed)
- [Spotify: Playback troubleshooting](https://developer.spotify.com/documentation/embeds/tutorials/troubleshooting)
- [Apple Music: Embeddable Player](https://artists.apple.com/support/1117-apple-music-marketing-tools)

No automated tests, regression runs, or new test files were added for this showcase, as requested. The parent handles the integrated production build and visual review. The local showcase has not been published.

## Optional device narration

`DeviceNarration` is an isolated opt-in component. It accepts `scene`, `paragraphs`, `onStart`, `onHighlight`, and `stopSignal`. It uses only an available browser Hebrew voice (`he` / `he-IL` family); there is no English fallback, paid voice service, or human-recorded narration. If the device has no Hebrew voice, it says so. Voice quality and pronunciation are determined by the device, and availability must be checked on the physical iPad.

The parent closes the music player in `onStart` and increments `stopSignal` whenever music opens. Narration stops on scene/text changes, document hiding, page hiding, explicit Stop, and unmount. Paragraph start events call `onHighlight` with the original paragraph index; completion or stop clears it. The parent can apply `narration-current` to the current story paragraph. No narration starts automatically.

The implementation follows the browser's [SpeechSynthesis voice list and events](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis), [explicit voice selection](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesisUtterance/voice), and [cancellation](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis/cancel). These capabilities do not imply that a Hebrew voice is installed on every device.
