# Can progressive image formats address the needs of responsive images?

Experimental setup:

1. Convert a large image into progressive formats (GIF, Interlaced PNG,
Progressive JPEG).
2. Make a page that loads images, specifying a constraint for image size.
3. Disable caching.
4. Figure out how to throttle the network.

Collect the following data:

- How large is each converted image?
- Does the browser download sub-pixel image data?
- If so, is there a way to prevent that extra downloading?

# Results

## Creating Images

I used ImageMagick to create various progressive images with the
`-interlace line` parameter. Excerpt from Makefile:

    convert:
        convert $(image)/original.jpg -interlace line $(image)/progressive.jpg
        convert $(image)/original.jpg -interlace line $(image)/progressive.gif
        convert $(image)/original.jpg -interlace line $(image)/progressive.png

I also tried generating JPEG 2000 files with ImageMagick, but it ended
up creating plain old JPEGs instead. Instead, I used Acorn, my favorite
image editing app for Mac, to create JPEG 2000s.

I used 3 images - two large ones of varying detail levels, and one
smaller one. I also had two separate tests: one with `src=` set in HTML,
and one that set the `src=` attribute with JavaScript. Tested in Chrome,
Safari and Firefox.

## Learnings

- The only browser that supports JPEG 2000 was (Mobile) Safari. Chrome
  and Firefox just show invalid images.
- Generally speaking, Chrome continues loading images long after it
  looks "good enough".
- Mobile Safari ignores images that are too large. Doesn't even bother
  with images that are 3000x3000 px.
- Sizing at default compression levels: JPEG < JPEG 2000 < GIF < PNG.
- Chrome and Safari don't have progressive image load if you set `src`
  programatically. Images just "pop" in when they are fully loaded.
  Firefox loads progressively.
- Firefox bug: large JPEG and PNG fire `load` event long before the
  image is actually rendered.
- In Chrome, large JPEG gets its dimensions first, and also loads first.
- In Safari, large JPEG/JPEG2000 loads first.
- Large PNGs in Safari are woefully slow - last by far to fully load.
  However, interlacing is supported, so it's the first thing to appear!
- Safari doesn't seem to have any support for interlaced JPEG.
- Mobile Safari doesn't stop downloading JPEG 2000, even when the
  quality is good enough.

# What needs to happen:

Chrome and Firefox need Progressive JPEG support.

# Interesting links

- Jeff Atwood has been [saving images in progressive formats][atwood]
  since 2005.
- A progressive image proposal using spiral bilinear interlacing,
  optimizing for faster object recognition. Read the [paper][harrison].

[atwood]: http://www.codinghorror.com/blog/2005/12/progressive-image-rendering.html
[harrison]: http://chrisharrison.net/projects/imageloading/ProgressiveImageLoading.pdf

