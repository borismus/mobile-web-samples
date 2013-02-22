function circles( context )
{
	this.init( context );
}

circles.prototype =
{
	context: null,

	prevMouseX: null, prevMouseY: null,

	points: null, count: null,

	init: function( context )
	{
		this.context = context;
		this.context.lineWidth = 1;
		this.context.globalCompositeOperation = 'source-over';

		this.points = new Array();
	},

	destroy: function()
	{
	},

	strokeStart: function( mouseX, mouseY )
	{
		this.prevMouseX = mouseX;
		this.prevMouseY = mouseY;
		
		this.context.strokeStyle = "rgba(" + COLOR[0] + ", " + COLOR[1] + ", " + COLOR[2] + ", 0.1)";		
	},

	stroke: function( mouseX, mouseY )
	{
		var i, dx, dy, d, cx, cy, steps, step_delta;

		this.points.push( [ mouseX, mouseY ] );

		dx = mouseX - this.prevMouseX;
		dy = mouseY - this.prevMouseY;
		d = Math.sqrt(dx * dx + dy * dy) * 2;
		
		cx = Math.floor(mouseX / 100) * 100 + 50;
		cy = Math.floor(mouseY / 100) * 100 + 50;
		
		steps = Math.floor( Math.random() * 10 );
		step_delta = d / steps;

		for (i = 0; i < steps; i++)
		{
			this.context.beginPath();
			this.context.arc( cx, cy, (steps - i) * step_delta, 0, Math.PI*2, true);
			this.context.stroke();
		}

		this.prevMouseX = mouseX;
		this.prevMouseY = mouseY;
	},

	strokeEnd: function()
	{
		
	}
}
