# Flipboard effect

Pretty much impossible with existing CSS transforms/transitions and
animations because of the split point not being associated with a piece
of the content. If only there was some way to blit what the browser was
rendering into a canvas (without a crx API).

So we need an alternative transition effect.

# Transition ideas

Each card is a single unit.

New card comes from the bottom (or top). Old card fades out and scales
down.
