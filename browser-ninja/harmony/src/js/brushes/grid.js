function grid( context )
{
	this.init( context );
}

grid.prototype =
{
	context: null,

	init: function( context )
	{
		this.context = context;
		this.context.lineWidth = 1;

		if (RegExp(" AppleWebKit/").test(navigator.userAgent))
			this.context.globalCompositeOperation = 'darker';
	},

	destroy: function()
	{
	},

	strokeStart: function( mouseX, mouseY )
	{
		this.context.strokeStyle = "rgba(" + COLOR[0] + ", " + COLOR[1] + ", " + COLOR[2] + ", 0.01)";	
	},

	stroke: function( mouseX, mouseY )
	{
		var i, cx, cy, dx, dy;
		
		cx = Math.round(mouseX / 100) * 100;
		cy = Math.round(mouseY / 100) * 100;
		
		dx = (cx - mouseX) * 10;
		dy = (cy - mouseY) * 10;

		for (i = 0; i < 50; i++)
		{
			this.context.beginPath();
			this.context.moveTo( cx, cy );
			this.context.quadraticCurveTo(mouseX + Math.random() * dx, mouseY + Math.random() * dy, cx, cy);
			this.context.stroke();
		}
	},

	strokeEnd: function()
	{
		
	}
}
