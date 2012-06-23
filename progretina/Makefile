convert:
		convert $(image)/original.jpg -interlace line $(image)/progressive.jpg
		convert $(image)/original.jpg -interlace line $(image)/progressive.gif
		convert $(image)/original.jpg -interlace line $(image)/progressive.png

upload:
		rsync -v -r . boris@smus.com:~/public_html/smus.com/m/progres-images

