/** Original Broadway Cast Recording metadata, verified2026-11-05.
 * Official links/embeds only; no audio files, lyrics, API tokens or secrets.
 * UI must use displayTitle. Track26 retains the family edition's discreet label.
 * URL verification is not a guarantee of authenticated or regional playback. */
export type MusicService = 'apple' | 'spotify';
export interface MusicCue {
  id: string;
  trackNumber: number;
  trackTitle: string;
  displayTitle: string;
  sceneId: string;
  sourceScene: number;
  appleMusicTrackUrl: string;
  spotifyTrackUrl: string | null;
  appleEmbedUrl: string;
  spotifyEmbedUrl: string | null;
  verification: 'verified' | 'album-fallback';
  verifiedOn: string;
  fallback: {appleMusicAlbumUrl: string; spotifyAlbumUrl: string};
}
export const albums = {
  title: '& Juliet (Original Broadway Cast Recording)',
  apple: 'https://music.apple.com/us/album/juliet-original-broadway-cast-recording/1643207110',
  spotify: 'https://open.spotify.com/album/2lZR9j0d9P7u7bvJZwJOKD',
  appleMusicAlbumUrl: 'https://music.apple.com/us/album/juliet-original-broadway-cast-recording/1643207110',
  spotifyAlbumUrl: 'https://open.spotify.com/album/2lZR9j0d9P7u7bvJZwJOKD',
} as const;
export const musicCues: MusicCue[] = [
  {
    "id": "larger-than-life",
    "trackNumber": 1,
    "trackTitle": "Larger Than Life",
    "displayTitle": "Larger Than Life",
    "sceneId": "opening",
    "sourceScene": 1,
    "appleMusicTrackUrl": "https://music.apple.com/us/album/larger-than-life/1643207110?i=1643207211",
    "spotifyTrackUrl": "https://open.spotify.com/track/3ycsduJ1DZ5vnl2U9A8FKu",
    "appleEmbedUrl": "https://embed.music.apple.com/us/album/larger-than-life/1643207110?i=1643207211",
    "spotifyEmbedUrl": "https://open.spotify.com/embed/track/3ycsduJ1DZ5vnl2U9A8FKu",
    "verification": "verified",
    "verifiedOn": "2026-11-05",
    "fallback": {
      "appleMusicAlbumUrl": "https://music.apple.com/us/album/juliet-original-broadway-cast-recording/1643207110",
      "spotifyAlbumUrl": "https://open.spotify.com/album/2lZR9j0d9P7u7bvJZwJOKD"
    }
  },
  {
    "id": "i-want-it-that-way",
    "trackNumber": 2,
    "trackTitle": "I Want It That Way",
    "displayTitle": "I Want It That Way",
    "sceneId": "opening",
    "sourceScene": 3,
    "appleMusicTrackUrl": "https://music.apple.com/us/album/i-want-it-that-way/1643207110?i=1643207216",
    "spotifyTrackUrl": "https://open.spotify.com/track/2TgOe34llQqTQS1HIPZmYu",
    "appleEmbedUrl": "https://embed.music.apple.com/us/album/i-want-it-that-way/1643207110?i=1643207216",
    "spotifyEmbedUrl": "https://open.spotify.com/embed/track/2TgOe34llQqTQS1HIPZmYu",
    "verification": "verified",
    "verifiedOn": "2026-11-05",
    "fallback": {
      "appleMusicAlbumUrl": "https://music.apple.com/us/album/juliet-original-broadway-cast-recording/1643207110",
      "spotifyAlbumUrl": "https://open.spotify.com/album/2lZR9j0d9P7u7bvJZwJOKD"
    }
  },
  {
    "id": "baby-one-more-time",
    "trackNumber": 3,
    "trackTitle": "…Baby One More Time",
    "displayTitle": "…Baby One More Time",
    "sceneId": "a-new-beginning",
    "sourceScene": 6,
    "appleMusicTrackUrl": "https://music.apple.com/us/album/baby-one-more-time/1643207110?i=1643207218",
    "spotifyTrackUrl": "https://open.spotify.com/track/2hniyiR5o5mLiowBACVoiC",
    "appleEmbedUrl": "https://embed.music.apple.com/us/album/baby-one-more-time/1643207110?i=1643207218",
    "spotifyEmbedUrl": "https://open.spotify.com/embed/track/2hniyiR5o5mLiowBACVoiC",
    "verification": "verified",
    "verifiedOn": "2026-11-05",
    "fallback": {
      "appleMusicAlbumUrl": "https://music.apple.com/us/album/juliet-original-broadway-cast-recording/1643207110",
      "spotifyAlbumUrl": "https://open.spotify.com/album/2lZR9j0d9P7u7bvJZwJOKD"
    }
  },
  {
    "id": "show-me-the-meaning-of-being-lonely",
    "trackNumber": 4,
    "trackTitle": "Show Me the Meaning of Being Lonely",
    "displayTitle": "Show Me the Meaning of Being Lonely",
    "sceneId": "a-new-beginning",
    "sourceScene": 7,
    "appleMusicTrackUrl": "https://music.apple.com/us/album/show-me-the-meaning-of-being-lonely/1643207110?i=1643207222",
    "spotifyTrackUrl": "https://open.spotify.com/track/7vU0NAlfLG4ceuDFPULdYb",
    "appleEmbedUrl": "https://embed.music.apple.com/us/album/show-me-the-meaning-of-being-lonely/1643207110?i=1643207222",
    "spotifyEmbedUrl": "https://open.spotify.com/embed/track/7vU0NAlfLG4ceuDFPULdYb",
    "verification": "verified",
    "verifiedOn": "2026-11-05",
    "fallback": {
      "appleMusicAlbumUrl": "https://music.apple.com/us/album/juliet-original-broadway-cast-recording/1643207110",
      "spotifyAlbumUrl": "https://open.spotify.com/album/2lZR9j0d9P7u7bvJZwJOKD"
    }
  },
  {
    "id": "domino",
    "trackNumber": 5,
    "trackTitle": "Domino",
    "displayTitle": "Domino",
    "sceneId": "journey-to-paris",
    "sourceScene": 9,
    "appleMusicTrackUrl": "https://music.apple.com/us/album/domino/1643207110?i=1643207224",
    "spotifyTrackUrl": "https://open.spotify.com/track/6IcwLTlFSvXUFpWPYdZao1",
    "appleEmbedUrl": "https://embed.music.apple.com/us/album/domino/1643207110?i=1643207224",
    "spotifyEmbedUrl": "https://open.spotify.com/embed/track/6IcwLTlFSvXUFpWPYdZao1",
    "verification": "verified",
    "verifiedOn": "2026-11-05",
    "fallback": {
      "appleMusicAlbumUrl": "https://music.apple.com/us/album/juliet-original-broadway-cast-recording/1643207110",
      "spotifyAlbumUrl": "https://open.spotify.com/album/2lZR9j0d9P7u7bvJZwJOKD"
    }
  },
  {
    "id": "show-me-love",
    "trackNumber": 6,
    "trackTitle": "Show Me Love",
    "displayTitle": "Show Me Love",
    "sceneId": "journey-to-paris",
    "sourceScene": 11,
    "appleMusicTrackUrl": "https://music.apple.com/us/album/show-me-love/1643207110?i=1643207543",
    "spotifyTrackUrl": "https://open.spotify.com/track/1ePpxYAwH0kiqntV6NfFHw",
    "appleEmbedUrl": "https://embed.music.apple.com/us/album/show-me-love/1643207110?i=1643207543",
    "spotifyEmbedUrl": "https://open.spotify.com/embed/track/1ePpxYAwH0kiqntV6NfFHw",
    "verification": "verified",
    "verifiedOn": "2026-11-05",
    "fallback": {
      "appleMusicAlbumUrl": "https://music.apple.com/us/album/juliet-original-broadway-cast-recording/1643207110",
      "spotifyAlbumUrl": "https://open.spotify.com/album/2lZR9j0d9P7u7bvJZwJOKD"
    }
  },
  {
    "id": "blow",
    "trackNumber": 7,
    "trackTitle": "Blow",
    "displayTitle": "Blow",
    "sceneId": "chandelier",
    "sourceScene": 14,
    "appleMusicTrackUrl": "https://music.apple.com/us/album/blow/1643207110?i=1643207547",
    "spotifyTrackUrl": "https://open.spotify.com/track/44aU0TT339Li5AA4rARe8y",
    "appleEmbedUrl": "https://embed.music.apple.com/us/album/blow/1643207110?i=1643207547",
    "spotifyEmbedUrl": "https://open.spotify.com/embed/track/44aU0TT339Li5AA4rARe8y",
    "verification": "verified",
    "verifiedOn": "2026-11-05",
    "fallback": {
      "appleMusicAlbumUrl": "https://music.apple.com/us/album/juliet-original-broadway-cast-recording/1643207110",
      "spotifyAlbumUrl": "https://open.spotify.com/album/2lZR9j0d9P7u7bvJZwJOKD"
    }
  },
  {
    "id": "not-a-girl",
    "trackNumber": 8,
    "trackTitle": "I’m Not a Girl, Not Yet a Woman",
    "displayTitle": "I’m Not a Girl, Not Yet a Woman",
    "sceneId": "emotional",
    "sourceScene": 16,
    "appleMusicTrackUrl": "https://music.apple.com/us/album/im-not-a-girl-not-yet-a-woman/1643207110?i=1643207551",
    "spotifyTrackUrl": "https://open.spotify.com/track/3CL9onFqjkQ8nL6BJ0w5wb",
    "appleEmbedUrl": "https://embed.music.apple.com/us/album/im-not-a-girl-not-yet-a-woman/1643207110?i=1643207551",
    "spotifyEmbedUrl": "https://open.spotify.com/embed/track/3CL9onFqjkQ8nL6BJ0w5wb",
    "verification": "verified",
    "verifiedOn": "2026-11-05",
    "fallback": {
      "appleMusicAlbumUrl": "https://music.apple.com/us/album/juliet-original-broadway-cast-recording/1643207110",
      "spotifyAlbumUrl": "https://open.spotify.com/album/2lZR9j0d9P7u7bvJZwJOKD"
    }
  },
  {
    "id": "overprotected",
    "trackNumber": 9,
    "trackTitle": "Overprotected",
    "displayTitle": "Overprotected",
    "sceneId": "one-kiss",
    "sourceScene": 17,
    "appleMusicTrackUrl": "https://music.apple.com/us/album/overprotected/1643207110?i=1643207552",
    "spotifyTrackUrl": "https://open.spotify.com/track/4vGrgxCVF5dSVclALYmjQ0",
    "appleEmbedUrl": "https://embed.music.apple.com/us/album/overprotected/1643207110?i=1643207552",
    "spotifyEmbedUrl": "https://open.spotify.com/embed/track/4vGrgxCVF5dSVclALYmjQ0",
    "verification": "verified",
    "verifiedOn": "2026-11-05",
    "fallback": {
      "appleMusicAlbumUrl": "https://music.apple.com/us/album/juliet-original-broadway-cast-recording/1643207110",
      "spotifyAlbumUrl": "https://open.spotify.com/album/2lZR9j0d9P7u7bvJZwJOKD"
    }
  },
  {
    "id": "confident",
    "trackNumber": 10,
    "trackTitle": "Confident",
    "displayTitle": "Confident",
    "sceneId": "one-kiss",
    "sourceScene": 18,
    "appleMusicTrackUrl": "https://music.apple.com/us/album/confident/1643207110?i=1643207553",
    "spotifyTrackUrl": "https://open.spotify.com/track/7HGRbJDO4vYwW9ITVPmJJ0",
    "appleEmbedUrl": "https://embed.music.apple.com/us/album/confident/1643207110?i=1643207553",
    "spotifyEmbedUrl": "https://open.spotify.com/embed/track/7HGRbJDO4vYwW9ITVPmJJ0",
    "verification": "verified",
    "verifiedOn": "2026-11-05",
    "fallback": {
      "appleMusicAlbumUrl": "https://music.apple.com/us/album/juliet-original-broadway-cast-recording/1643207110",
      "spotifyAlbumUrl": "https://open.spotify.com/album/2lZR9j0d9P7u7bvJZwJOKD"
    }
  },
  {
    "id": "teenage-dream-break-free",
    "trackNumber": 11,
    "trackTitle": "Teenage Dream / Break Free",
    "displayTitle": "Teenage Dream / Break Free",
    "sceneId": "old-love",
    "sourceScene": 20,
    "appleMusicTrackUrl": "https://music.apple.com/us/album/teenage-dream-break-free/1643207110?i=1643207555",
    "spotifyTrackUrl": "https://open.spotify.com/track/6tbrU7uB2OtP5yN4C8hsMf",
    "appleEmbedUrl": "https://embed.music.apple.com/us/album/teenage-dream-break-free/1643207110?i=1643207555",
    "spotifyEmbedUrl": "https://open.spotify.com/embed/track/6tbrU7uB2OtP5yN4C8hsMf",
    "verification": "verified",
    "verifiedOn": "2026-11-05",
    "fallback": {
      "appleMusicAlbumUrl": "https://music.apple.com/us/album/juliet-original-broadway-cast-recording/1643207110",
      "spotifyAlbumUrl": "https://open.spotify.com/album/2lZR9j0d9P7u7bvJZwJOKD"
    }
  },
  {
    "id": "oops-i-did-it-again",
    "trackNumber": 12,
    "trackTitle": "Oops!...I Did it Again",
    "displayTitle": "Oops!...I Did it Again",
    "sceneId": "a-wedding-and-a-surprise",
    "sourceScene": 21,
    "appleMusicTrackUrl": "https://music.apple.com/us/album/oops-i-did-it-again/1643207110?i=1643207556",
    "spotifyTrackUrl": "https://open.spotify.com/track/0kxGFQSFoNZIdRxpmaRcHw",
    "appleEmbedUrl": "https://embed.music.apple.com/us/album/oops-i-did-it-again/1643207110?i=1643207556",
    "spotifyEmbedUrl": "https://open.spotify.com/embed/track/0kxGFQSFoNZIdRxpmaRcHw",
    "verification": "verified",
    "verifiedOn": "2026-11-05",
    "fallback": {
      "appleMusicAlbumUrl": "https://music.apple.com/us/album/juliet-original-broadway-cast-recording/1643207110",
      "spotifyAlbumUrl": "https://open.spotify.com/album/2lZR9j0d9P7u7bvJZwJOKD"
    }
  },
  {
    "id": "i-kissed-a-girl",
    "trackNumber": 13,
    "trackTitle": "I Kissed A Girl",
    "displayTitle": "I Kissed A Girl",
    "sceneId": "a-wedding-and-a-surprise",
    "sourceScene": 22,
    "appleMusicTrackUrl": "https://music.apple.com/us/album/i-kissed-a-girl/1643207110?i=1643207559",
    "spotifyTrackUrl": "https://open.spotify.com/track/7aU2Kh53aHUW0zIkI72NmE",
    "appleEmbedUrl": "https://embed.music.apple.com/us/album/i-kissed-a-girl/1643207110?i=1643207559",
    "spotifyEmbedUrl": "https://open.spotify.com/embed/track/7aU2Kh53aHUW0zIkI72NmE",
    "verification": "verified",
    "verifiedOn": "2026-11-05",
    "fallback": {
      "appleMusicAlbumUrl": "https://music.apple.com/us/album/juliet-original-broadway-cast-recording/1643207110",
      "spotifyAlbumUrl": "https://open.spotify.com/album/2lZR9j0d9P7u7bvJZwJOKD"
    }
  },
  {
    "id": "its-my-life",
    "trackNumber": 14,
    "trackTitle": "It’s My Life",
    "displayTitle": "It’s My Life",
    "sceneId": "a-wedding-and-a-surprise",
    "sourceScene": 24,
    "appleMusicTrackUrl": "https://music.apple.com/us/album/its-my-life/1643207110?i=1643207565",
    "spotifyTrackUrl": "https://open.spotify.com/track/3TXfkxXBLM0x05qC9J4AD4",
    "appleEmbedUrl": "https://embed.music.apple.com/us/album/its-my-life/1643207110?i=1643207565",
    "spotifyEmbedUrl": "https://open.spotify.com/embed/track/3TXfkxXBLM0x05qC9J4AD4",
    "verification": "verified",
    "verifiedOn": "2026-11-05",
    "fallback": {
      "appleMusicAlbumUrl": "https://music.apple.com/us/album/juliet-original-broadway-cast-recording/1643207110",
      "spotifyAlbumUrl": "https://open.spotify.com/album/2lZR9j0d9P7u7bvJZwJOKD"
    }
  },
  {
    "id": "love-me-like-you-do",
    "trackNumber": 15,
    "trackTitle": "Love Me Like You Do",
    "displayTitle": "Love Me Like You Do",
    "sceneId": "romeo-returns",
    "sourceScene": 25,
    "appleMusicTrackUrl": "https://music.apple.com/us/album/love-me-like-you-do/1643207110?i=1643207779",
    "spotifyTrackUrl": "https://open.spotify.com/track/2phXBi0ugTZq5GI6dxZW7m",
    "appleEmbedUrl": "https://embed.music.apple.com/us/album/love-me-like-you-do/1643207110?i=1643207779",
    "spotifyEmbedUrl": "https://open.spotify.com/embed/track/2phXBi0ugTZq5GI6dxZW7m",
    "verification": "verified",
    "verifiedOn": "2026-11-05",
    "fallback": {
      "appleMusicAlbumUrl": "https://music.apple.com/us/album/juliet-original-broadway-cast-recording/1643207110",
      "spotifyAlbumUrl": "https://open.spotify.com/album/2lZR9j0d9P7u7bvJZwJOKD"
    }
  },
  {
    "id": "since-u-been-gone",
    "trackNumber": 16,
    "trackTitle": "Since U Been Gone",
    "displayTitle": "Since U Been Gone",
    "sceneId": "romeo-returns",
    "sourceScene": 26,
    "appleMusicTrackUrl": "https://music.apple.com/us/album/since-u-been-gone/1643207110?i=1643207781",
    "spotifyTrackUrl": "https://open.spotify.com/track/33Psn9Le39Aqr0fhryNBBd",
    "appleEmbedUrl": "https://embed.music.apple.com/us/album/since-u-been-gone/1643207110?i=1643207781",
    "spotifyEmbedUrl": "https://open.spotify.com/embed/track/33Psn9Le39Aqr0fhryNBBd",
    "verification": "verified",
    "verifiedOn": "2026-11-05",
    "fallback": {
      "appleMusicAlbumUrl": "https://music.apple.com/us/album/juliet-original-broadway-cast-recording/1643207110",
      "spotifyAlbumUrl": "https://open.spotify.com/album/2lZR9j0d9P7u7bvJZwJOKD"
    }
  },
  {
    "id": "whataya-want-from-me",
    "trackNumber": 17,
    "trackTitle": "Whataya Want from Me",
    "displayTitle": "Whataya Want from Me",
    "sceneId": "tell-the-truth",
    "sourceScene": 29,
    "appleMusicTrackUrl": "https://music.apple.com/us/album/whataya-want-from-me/1643207110?i=1643207793",
    "spotifyTrackUrl": "https://open.spotify.com/track/7zyouSj7YXEEaB6cuC09ra",
    "appleEmbedUrl": "https://embed.music.apple.com/us/album/whataya-want-from-me/1643207110?i=1643207793",
    "spotifyEmbedUrl": "https://open.spotify.com/embed/track/7zyouSj7YXEEaB6cuC09ra",
    "verification": "verified",
    "verifiedOn": "2026-11-05",
    "fallback": {
      "appleMusicAlbumUrl": "https://music.apple.com/us/album/juliet-original-broadway-cast-recording/1643207110",
      "spotifyAlbumUrl": "https://open.spotify.com/album/2lZR9j0d9P7u7bvJZwJOKD"
    }
  },
  {
    "id": "one-more-try",
    "trackNumber": 18,
    "trackTitle": "One More Try",
    "displayTitle": "One More Try",
    "sceneId": "learn-to-listen",
    "sourceScene": 31,
    "appleMusicTrackUrl": "https://music.apple.com/us/album/one-more-try/1643207110?i=1643207795",
    "spotifyTrackUrl": "https://open.spotify.com/track/2zYUnwU3yiobFeWmlb0TQy",
    "appleEmbedUrl": "https://embed.music.apple.com/us/album/one-more-try/1643207110?i=1643207795",
    "spotifyEmbedUrl": "https://open.spotify.com/embed/track/2zYUnwU3yiobFeWmlb0TQy",
    "verification": "verified",
    "verifiedOn": "2026-11-05",
    "fallback": {
      "appleMusicAlbumUrl": "https://music.apple.com/us/album/juliet-original-broadway-cast-recording/1643207110",
      "spotifyAlbumUrl": "https://open.spotify.com/album/2lZR9j0d9P7u7bvJZwJOKD"
    }
  },
  {
    "id": "problem-cant-feel-my-face",
    "trackNumber": 19,
    "trackTitle": "Problem / Can’t Feel My Face",
    "displayTitle": "Problem / Can’t Feel My Face",
    "sceneId": "learn-to-listen",
    "sourceScene": 33,
    "appleMusicTrackUrl": "https://music.apple.com/us/album/problem-cant-feel-my-face/1643207110?i=1643207796",
    "spotifyTrackUrl": "https://open.spotify.com/track/15vkRjpiNKYte59cFfAzng",
    "appleEmbedUrl": "https://embed.music.apple.com/us/album/problem-cant-feel-my-face/1643207110?i=1643207796",
    "spotifyEmbedUrl": "https://open.spotify.com/embed/track/15vkRjpiNKYte59cFfAzng",
    "verification": "verified",
    "verifiedOn": "2026-11-05",
    "fallback": {
      "appleMusicAlbumUrl": "https://music.apple.com/us/album/juliet-original-broadway-cast-recording/1643207110",
      "spotifyAlbumUrl": "https://open.spotify.com/album/2lZR9j0d9P7u7bvJZwJOKD"
    }
  },
  {
    "id": "thats-the-way-it-is",
    "trackNumber": 20,
    "trackTitle": "That’s the Way It Is",
    "displayTitle": "That’s the Way It Is",
    "sceneId": "time-to-think",
    "sourceScene": 36,
    "appleMusicTrackUrl": "https://music.apple.com/us/album/thats-the-way-it-is/1643207110?i=1643207799",
    "spotifyTrackUrl": "https://open.spotify.com/track/4gpbXdxDIRmRnJccrjsXsh",
    "appleEmbedUrl": "https://embed.music.apple.com/us/album/thats-the-way-it-is/1643207110?i=1643207799",
    "spotifyEmbedUrl": "https://open.spotify.com/embed/track/4gpbXdxDIRmRnJccrjsXsh",
    "verification": "verified",
    "verifiedOn": "2026-11-05",
    "fallback": {
      "appleMusicAlbumUrl": "https://music.apple.com/us/album/juliet-original-broadway-cast-recording/1643207110",
      "spotifyAlbumUrl": "https://open.spotify.com/album/2lZR9j0d9P7u7bvJZwJOKD"
    }
  },
  {
    "id": "everybody",
    "trackNumber": 21,
    "trackTitle": "Everybody",
    "displayTitle": "Everybody",
    "sceneId": "wedding-band",
    "sourceScene": 38,
    "appleMusicTrackUrl": "https://music.apple.com/us/album/everybody/1643207110?i=1643208117",
    "spotifyTrackUrl": "https://open.spotify.com/track/3Lb6qMqMdAycHsbHBkRyg5",
    "appleEmbedUrl": "https://embed.music.apple.com/us/album/everybody/1643207110?i=1643208117",
    "spotifyEmbedUrl": "https://open.spotify.com/embed/track/3Lb6qMqMdAycHsbHBkRyg5",
    "verification": "verified",
    "verifiedOn": "2026-11-05",
    "fallback": {
      "appleMusicAlbumUrl": "https://music.apple.com/us/album/juliet-original-broadway-cast-recording/1643207110",
      "spotifyAlbumUrl": "https://open.spotify.com/album/2lZR9j0d9P7u7bvJZwJOKD"
    }
  },
  {
    "id": "as-long-as-you-love-me",
    "trackNumber": 22,
    "trackTitle": "As Long as You Love Me",
    "displayTitle": "As Long as You Love Me",
    "sceneId": "wedding-band",
    "sourceScene": 39,
    "appleMusicTrackUrl": "https://music.apple.com/us/album/as-long-as-you-love-me/1643207110?i=1643208120",
    "spotifyTrackUrl": "https://open.spotify.com/track/5BS2GYuO5E3RcvDhZREeQt",
    "appleEmbedUrl": "https://embed.music.apple.com/us/album/as-long-as-you-love-me/1643207110?i=1643208120",
    "spotifyEmbedUrl": "https://open.spotify.com/embed/track/5BS2GYuO5E3RcvDhZREeQt",
    "verification": "verified",
    "verifiedOn": "2026-11-05",
    "fallback": {
      "appleMusicAlbumUrl": "https://music.apple.com/us/album/juliet-original-broadway-cast-recording/1643207110",
      "spotifyAlbumUrl": "https://open.spotify.com/album/2lZR9j0d9P7u7bvJZwJOKD"
    }
  },
  {
    "id": "its-gonna-be-me",
    "trackNumber": 23,
    "trackTitle": "It’s Gonna Be Me",
    "displayTitle": "It’s Gonna Be Me",
    "sceneId": "wedding-band",
    "sourceScene": 40,
    "appleMusicTrackUrl": "https://music.apple.com/us/album/its-gonna-be-me/1643207110?i=1643208128",
    "spotifyTrackUrl": "https://open.spotify.com/track/6qG2glik6KcB2b708sAw8b",
    "appleEmbedUrl": "https://embed.music.apple.com/us/album/its-gonna-be-me/1643207110?i=1643208128",
    "spotifyEmbedUrl": "https://open.spotify.com/embed/track/6qG2glik6KcB2b708sAw8b",
    "verification": "verified",
    "verifiedOn": "2026-11-05",
    "fallback": {
      "appleMusicAlbumUrl": "https://music.apple.com/us/album/juliet-original-broadway-cast-recording/1643207110",
      "spotifyAlbumUrl": "https://open.spotify.com/album/2lZR9j0d9P7u7bvJZwJOKD"
    }
  },
  {
    "id": "stronger",
    "trackNumber": 24,
    "trackTitle": "Stronger",
    "displayTitle": "Stronger",
    "sceneId": "my-own-story",
    "sourceScene": 42,
    "appleMusicTrackUrl": "https://music.apple.com/us/album/stronger/1643207110?i=1643208131",
    "spotifyTrackUrl": "https://open.spotify.com/track/6bLIKRvpBOSllZ83419SIE",
    "appleEmbedUrl": "https://embed.music.apple.com/us/album/stronger/1643207110?i=1643208131",
    "spotifyEmbedUrl": "https://open.spotify.com/embed/track/6bLIKRvpBOSllZ83419SIE",
    "verification": "verified",
    "verifiedOn": "2026-11-05",
    "fallback": {
      "appleMusicAlbumUrl": "https://music.apple.com/us/album/juliet-original-broadway-cast-recording/1643207110",
      "spotifyAlbumUrl": "https://open.spotify.com/album/2lZR9j0d9P7u7bvJZwJOKD"
    }
  },
  {
    "id": "shape-of-my-heart",
    "trackNumber": 25,
    "trackTitle": "Shape of My Heart",
    "displayTitle": "Shape of My Heart",
    "sceneId": "my-own-story",
    "sourceScene": 43,
    "appleMusicTrackUrl": "https://music.apple.com/us/album/shape-of-my-heart/1643207110?i=1643208379",
    "spotifyTrackUrl": "https://open.spotify.com/track/28yALIA3sjJME2sO3UZ7l2",
    "appleEmbedUrl": "https://embed.music.apple.com/us/album/shape-of-my-heart/1643207110?i=1643208379",
    "spotifyEmbedUrl": "https://open.spotify.com/embed/track/28yALIA3sjJME2sO3UZ7l2",
    "verification": "verified",
    "verifiedOn": "2026-11-05",
    "fallback": {
      "appleMusicAlbumUrl": "https://music.apple.com/us/album/juliet-original-broadway-cast-recording/1643207110",
      "spotifyAlbumUrl": "https://open.spotify.com/album/2lZR9j0d9P7u7bvJZwJOKD"
    }
  },
  {
    "id": "perfect",
    "trackNumber": 26,
    "trackTitle": "F****n’ Perfect",
    "displayTitle": "רצועה 26",
    "sceneId": "my-own-story",
    "sourceScene": 44,
    "appleMusicTrackUrl": "https://music.apple.com/us/album/f-n-perfect/1643207110?i=1643208388",
    "spotifyTrackUrl": "https://open.spotify.com/track/5eWPgtI4PfK1Q0hCIO0PUj",
    "appleEmbedUrl": "https://embed.music.apple.com/us/album/f-n-perfect/1643207110?i=1643208388",
    "spotifyEmbedUrl": "https://open.spotify.com/embed/track/5eWPgtI4PfK1Q0hCIO0PUj",
    "verification": "verified",
    "verifiedOn": "2026-11-05",
    "fallback": {
      "appleMusicAlbumUrl": "https://music.apple.com/us/album/juliet-original-broadway-cast-recording/1643207110",
      "spotifyAlbumUrl": "https://open.spotify.com/album/2lZR9j0d9P7u7bvJZwJOKD"
    }
  },
  {
    "id": "roar",
    "trackNumber": 27,
    "trackTitle": "Roar",
    "displayTitle": "Roar",
    "sceneId": "roar",
    "sourceScene": 46,
    "appleMusicTrackUrl": "https://music.apple.com/us/album/roar/1643207110?i=1643208394",
    "spotifyTrackUrl": "https://open.spotify.com/track/4ffhooJFPatL5msqh6F5Fa",
    "appleEmbedUrl": "https://embed.music.apple.com/us/album/roar/1643207110?i=1643208394",
    "spotifyEmbedUrl": "https://open.spotify.com/embed/track/4ffhooJFPatL5msqh6F5Fa",
    "verification": "verified",
    "verifiedOn": "2026-11-05",
    "fallback": {
      "appleMusicAlbumUrl": "https://music.apple.com/us/album/juliet-original-broadway-cast-recording/1643207110",
      "spotifyAlbumUrl": "https://open.spotify.com/album/2lZR9j0d9P7u7bvJZwJOKD"
    }
  },
  {
    "id": "i-want-it-that-way-reprise",
    "trackNumber": 28,
    "trackTitle": "I Want It That Way (Reprise)",
    "displayTitle": "I Want It That Way (Reprise)",
    "sceneId": "only-the-beginning",
    "sourceScene": 47,
    "appleMusicTrackUrl": "https://music.apple.com/us/album/i-want-it-that-way-reprise/1643207110?i=1643208399",
    "spotifyTrackUrl": "https://open.spotify.com/track/2WXOlQ83wZkfzUKZoCEPzj",
    "appleEmbedUrl": "https://embed.music.apple.com/us/album/i-want-it-that-way-reprise/1643207110?i=1643208399",
    "spotifyEmbedUrl": "https://open.spotify.com/embed/track/2WXOlQ83wZkfzUKZoCEPzj",
    "verification": "verified",
    "verifiedOn": "2026-11-05",
    "fallback": {
      "appleMusicAlbumUrl": "https://music.apple.com/us/album/juliet-original-broadway-cast-recording/1643207110",
      "spotifyAlbumUrl": "https://open.spotify.com/album/2lZR9j0d9P7u7bvJZwJOKD"
    }
  },
  {
    "id": "cant-stop-the-feeling",
    "trackNumber": 29,
    "trackTitle": "CAN’T STOP THE FEELING!",
    "displayTitle": "CAN’T STOP THE FEELING!",
    "sceneId": "only-the-beginning",
    "sourceScene": 48,
    "appleMusicTrackUrl": "https://music.apple.com/us/album/cant-stop-the-feeling/1643207110?i=1643208539",
    "spotifyTrackUrl": "https://open.spotify.com/track/61xaclre5j18KBTizgQlVQ",
    "appleEmbedUrl": "https://embed.music.apple.com/us/album/cant-stop-the-feeling/1643207110?i=1643208539",
    "spotifyEmbedUrl": "https://open.spotify.com/embed/track/61xaclre5j18KBTizgQlVQ",
    "verification": "verified",
    "verifiedOn": "2026-11-05",
    "fallback": {
      "appleMusicAlbumUrl": "https://music.apple.com/us/album/juliet-original-broadway-cast-recording/1643207110",
      "spotifyAlbumUrl": "https://open.spotify.com/album/2lZR9j0d9P7u7bvJZwJOKD"
    }
  }
];
export const musicById: Record<string, MusicCue> = Object.fromEntries(musicCues.map(cue => [cue.id, cue]));
