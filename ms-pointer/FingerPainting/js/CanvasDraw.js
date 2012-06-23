function CanvasDraw(target, options) {

    var bgcanvas, bgctx, fgcanvas, fgctx;
    var darkColorNames = [];
    var backgroundPolylines = [];
    var foregroundPolylines = {};

    bgcanvas = document.createElement("canvas");
    if (typeof bgcanvas.getContext == 'undefined') {
        var nocanvas = document.createElement("div");
        nocanvas.style.position = "absolute";
        nocanvas.style.top = options.promptTop + "px";
        nocanvas.style.left = options.promptLeft + "px";
        nocanvas.style.font = options.promptFont;
        nocanvas.appendChild(document.createTextNode("Canvas drawing is not supported for your browser. Try SVG or VML."));
        target.appendChild(nocanvas);
        return;
    }
    bgctx = bgcanvas.getContext("2d");
    bgcanvas.style.position = "absolute";
    target.appendChild(bgcanvas);

    fgcanvas = document.createElement("canvas");
    fgctx = fgcanvas.getContext("2d");
    fgcanvas.style.position = "absolute";
    target.appendChild(fgcanvas);

    (function () {
        var darkness = 180;
        for (var i = 0; i < svgNamedColors.length; ++i) {
            if (svgNamedColors[i].rgb.r < darkness || svgNamedColors[i].rgb.g < darkness || svgNamedColors[i].rgb.b < darkness)
                darkColorNames.push(svgNamedColors[i].name);
        }

        if (options.logMessage)
            options.logMessage("Drawing using HTML5 canvas with a palette of " + darkColorNames.length + " named colors.");
    })();

    SetSizeToTarget();
    PointerDraw(target, BeginPolyline, ExtendPolylineTo, EndPolyline, options.logMessage);

    function DrawCanvasBackground() {
        bgctx.globalAlpha = 1;
        bgctx.fillStyle = "White";
        bgctx.fillRect(0, 0, bgctx.canvas.width, bgctx.canvas.height);

        bgctx.fillStyle = "Black";
        bgctx.font = options.promptFont;
        bgctx.fillText(options.prompt, options.promptLeft, options.promptTop + parseFloat(options.promptFont));

        for (var id in backgroundPolylines) {
            DrawPolyline(bgctx, backgroundPolylines[id]);
        }
    }

    function BeginPolyline(wrapper, id, x, y) {
        if (foregroundPolylines[id.toString()])
            EndPolyline(wrapper, id);

        foregroundPolylines[id.toString()] = { points: [{ x: x, y: y}], color: darkColorNames[Math.floor(Math.random() * darkColorNames.length)] };
        RequestRedraw();
    }

    function ExtendPolylineTo(wrapper, id, x, y) {
        if (foregroundPolylines[id.toString()])
            foregroundPolylines[id.toString()].points.push({ x: x, y: y });
        RequestRedraw();
    }

    function EndPolyline(wrapper, id) {
        var polyline = foregroundPolylines[id.toString()];
        if (polyline) {
            var p0 = polyline.points[0];
            var pLast = polyline.points[polyline.points.length - 1];
            var distance = Math.sqrt(Math.pow(p0.x - pLast.x, 2) + Math.pow(p0.y - pLast.y, 2));
            polyline.fill = (distance < options.fillDistance);
            polyline.ended = true;
            RequestRedraw();
        }
    }

    function SetSizeToTarget() {
        bgcanvas.width = target.offsetWidth;
        bgcanvas.height = target.offsetHeight;
        fgcanvas.width = target.offsetWidth;
        fgcanvas.height = target.offsetHeight;
        DrawCanvasBackground();
    }

    this.SetSizeToTarget = function () { SetSizeToTarget(); };

    this.ClearPicture = function () {
        backgroundPolylines.length = 0;
        DrawCanvasBackground();
    };

    var redrawPending = false;

    function RequestRedraw() {

        function RedrawForeground() {
            redrawPending = false;

            fgctx.clearRect(0, 0, fgctx.canvas.width, fgctx.canvas.height);

            for (var id in foregroundPolylines) {
                DrawPolyline(foregroundPolylines[id].ended ? bgctx : fgctx, foregroundPolylines[id]);

                if (foregroundPolylines[id].ended) {
                    backgroundPolylines.push(foregroundPolylines[id]);
                    delete foregroundPolylines[id.toString()];
                }
            }
        }

        if (!redrawPending) {
            redrawPending = true;

            if (window.msRequestAnimationFrame)
                window.msRequestAnimationFrame(RedrawForeground);
            else if (window.webkitRequestAnimationFrame)
                window.webkitRequestAnimationFrame(RedrawForeground);
            else
                window.setTimeout(RedrawForeground, Math.floor(1000 / 60));
        }
    }

    function DrawPolyline(ctx, polyline) {
        if (polyline.points.length == 1) {
            ctx.beginPath();
            ctx.arc(polyline.points[0].x, polyline.points[0].y, 10, 0, Math.PI, true);
            ctx.arc(polyline.points[0].x, polyline.points[0].y, 10, Math.PI, Math.PI * 2, true);
            ctx.fillStyle = polyline.color;
            ctx.globalAlpha = 0.5;
            ctx.fill();
        }
        else if (polyline.points.length > 1) {
            ctx.beginPath();
            ctx.moveTo(polyline.points[0].x, polyline.points[0].y);

            for (var i = 1; i < polyline.points.length; ++i)
                ctx.lineTo(polyline.points[i].x, polyline.points[i].y);

            ctx.lineCap = "round";
            ctx.lineJoin = "round";
            ctx.lineWidth = 20;
            ctx.strokeStyle = polyline.color;
            ctx.globalAlpha = 0.5;
            ctx.stroke();

            if (polyline.fill) {
                ctx.fillStyle = polyline.color;
                ctx.globalAlpha = 0.3;
                ctx.fill();
            }
        }
    }
}