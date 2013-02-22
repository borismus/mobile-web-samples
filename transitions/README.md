# Mobile Web UI transitions

- So we have native scrolling in modern web browsers (Chrome for
  Android, MobileSafari)
- This is great for basic content
- What if you want to do something a bit more flashy, like build a
  Flipboard-like viewer.

## Types of transitions

- Kinds of transitions: swiping, flipping, etc
- Asymmetric vs symmetric transitions
- Some show multiple content simultaneously, others don't
- Content preserving vs not (important for web: no way to fold a div in
  half, for example).

## Order of transforms

- Don't screw up order of rotation and scaling. This is a very common
  mistake. I did it this time too!


## CSS transitions don't play well with 3D transforms

- Matrix interpolation is not well defined. You end up with stupid
  looking animations


## Inertia and velocity

- When you release, want to know how fast your finger was moving to be
  able to use that information to make a reasonable transition.
