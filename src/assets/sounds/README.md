# Sound assets

Drop a short (~0.4–0.8s) whoosh / ignite MP3 at `fire-whoosh.mp3` to enable the
fire-pop sound that plays when a question is answered in the neo-brutal survey
(`/test-neobrutalism`).

The file currently shipped here is an empty placeholder — the app still runs
without a real clip; `use-sound` / howler will just fail to load and the
synthesized fallback sounds from `useGamifiedSound` continue to play.
