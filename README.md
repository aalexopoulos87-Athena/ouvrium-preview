# Ouvrium preview

Clickable static preview of **Ouvrium**, a planned Canadian online pack-opening platform powered by Carta Magica (Montréal & Ottawa).

**Preview only: not open to the public, no purchases, payments or data collection.** `noindex` on every page. Legal texts are drafts pending legal review. Card art is stylized placeholder art; card names/values come from Carta Magica Ottawa's inventory export (10 Nov 2026). Trademarks belong to their owners.

## v2 (16 Nov 2026): themed packs, benchmarked odds, staged reveal
- `themes.html`, `theme-<game>.html` and `pack-<game>-<price>.html`: fan-made themed packs (Pokémon, One Piece, Yu-Gi-Oh!, Gundam, Union Arena) with original motifs only, no official logos or card images, and a non-affiliation notice on every page. Lorcana, Dragon Ball, Magic and Riftbound are shown as "coming" with competitor benchmarks and no Ouvrium odds.
- The odds on each themed page are exactly the odds the demo draw uses (`assets/tp/<pack>.js`). They are set against competitor medians from public data (RipIndex Rip Sim data and the RipVault API, 16 Nov 2026). Chase = card worth 5× the pack price or more.
- The confetti is gone. The reveal is now staged by tier: a grey, blue, purple, gold or prismatic cue on the face-down card, light rays, shockwave, push-in and slow-motion flip for the top tiers, foil glints, holo sweep and a title card. A low pull gets a calm summary. The WebAudio riser, impact and shimmer chord are muted by default. Skip and reduced motion are supported throughout.
- `fairness.html#economics`: Ouvrium vs competitor median for every pack.
