
function SVGDraw(targetWrapper, options) {

    //  ensure we support SVG in a feature-detect kind of way
    if (!document.implementation.hasFeature("http://www.w3.org/TR/SVG11/feature#Structure", "1.1")) {
        var nosvg = document.createElement("div");
        nosvg.style.position = "absolute";
        nosvg.style.top = options.promptTop + "px";
        nosvg.style.left = options.promptLeft + "px";
        nosvg.style.font = options.promptFont;
        nosvg.appendChild(document.createTextNode("SVG drawing is not supported by your browser. Try VML."));
        targetWrapper.appendChild(nosvg);
        return;
    }

    var svgTarget;
    var darkColorNames = [];

    //  initialization function
    (function () {
        svgTarget = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svgTarget.setAttribute("width", "100%");
        svgTarget.setAttribute("height", "100%");
        svgTarget.setAttribute("draggable", "false");
        targetWrapper.appendChild(svgTarget);

        var rect = document.createElementNS(svgTarget.namespaceURI, "rect");
        rect.setAttribute("x", "0%");
        rect.setAttribute("y", "0%");
        rect.setAttribute("width", "100%");
        rect.setAttribute("height", "100%");
        rect.setAttribute("fill", "white");
        svgTarget.appendChild(rect);

        var prompt = document.createElementNS(svgTarget.namespaceURI, "text");
        prompt.setAttribute("x", options.promptLeft);
        prompt.setAttribute("y", options.promptTop + parseFloat(options.promptFont));
        prompt.setAttribute("font", options.promptFont);
        prompt.setAttribute("fill", "black");
        prompt.appendChild(document.createTextNode(options.prompt));
        svgTarget.appendChild(prompt);

        var darkness = 180;
        for (var i = 0; i < svgNamedColors.length; ++i) {
            if (svgNamedColors[i].rgb.r < darkness || svgNamedColors[i].rgb.g < darkness || svgNamedColors[i].rgb.b < darkness)
                darkColorNames.push(svgNamedColors[i].name);
        }

        if (options.logMessage)
            options.logMessage("Drawing using SVG from a palette of " + darkColorNames.length + " named colors.");
    })();

    //  initialize the PointerDraw function to handle our events
    PointerDraw(targetWrapper, BeginPolyline, ExtendPolylineTo, EndPolyline, options.logMessage);

    //  a public function to clear the picture
    this.ClearPicture = function () {
        var polylines = document.querySelectorAll("polyline, circle");
        for (var i = 0; i < polylines.length; ++i)
            polylines[i].parentNode.removeChild(polylines[i]);
    };

    function SetSizeToTarget() {
        //  nothing to do because the SVG element's width and height is 100%
    }

    //  a public function to handle the change of canvas size
    this.SetSizeToTarget = function () { SetSizeToTarget(); };

    //  function called by PointerDraw for mouse/pointer/touch down/start
    function BeginPolyline(wrapper, id, x, y) {
        //  remove the id on any existing polyline with this id
        var polyline = document.getElementById("pl" + id);
        if (polyline != null)
            EndPolyline(wrapper, id);

        polyline = document.createElementNS(svgTarget.namespaceURI, "polyline");
        polyline.id = "pl" + id;
        polyline.setAttribute("fill", "none");
        polyline.setAttribute("stroke", darkColorNames[Math.floor(Math.random() * darkColorNames.length)]);
        polyline.setAttribute("stroke-opacity", 0.7);
        polyline.setAttribute("stroke-width", 20);
        polyline.setAttribute("stroke-linecap", "round");
        polyline.setAttribute("stroke-linejoin", "round");
        polyline.setAttribute("points", x.toString() + "," + y.toString());
        svgTarget.appendChild(polyline);

        var circle = document.createElementNS(svgTarget.namespaceURI, "circle");
        circle.id = "circ" + id;
        circle.setAttribute("stroke", "none");
        circle.setAttribute("fill", polyline.getAttribute("stroke"));
        circle.setAttribute("fill-opacity", polyline.getAttribute("stroke-opacity"));
        circle.setAttribute("cx", x);
        circle.setAttribute("cy", y);
        circle.setAttribute("r", parseFloat(polyline.getAttribute("stroke-width")) / 2);
        svgTarget.appendChild(circle);
    }

    //  function called by PointerDraw for mouse/pointer/touch move
    function ExtendPolylineTo(wrapper, id, x, y) {
        var circle = document.getElementById("circ" + id);
        if (circle != null)
            circle.parentNode.removeChild(circle);

        var polyline = document.getElementById("pl" + id);
        if (polyline != null) {
            var pt = svgTarget.createSVGPoint();
            pt.x = x;
            pt.y = y;
            polyline.points.appendItem(pt);
        }
    }

    //  function called by PointerDraw for mouse/pointer/touch up/end
    function EndPolyline(wrapper, id) {
        var polyline = document.getElementById("pl" + id);
        if (polyline != null) {
            if (polyline.points.numberOfItems == 1) {
                polyline.parentNode.removeChild(polyline); // remove empty polyline

                var circle = document.getElementById("circ" + id);
                if (circle != null)
                    circle.removeAttribute("id");
            }
            else {
                var p0 = polyline.points.getItem(0);
                var pLast = polyline.points.getItem(polyline.points.numberOfItems - 1);
                var distance = Math.sqrt(Math.pow(p0.x - pLast.x, 2) + Math.pow(p0.y - pLast.y, 2));

                if (distance < options.fillDistance) {
                    polyline.setAttribute("fill", polyline.getAttribute("stroke"));
                    polyline.setAttribute("fill-opacity", 0.3);
                }

                polyline.removeAttribute("id");
            }
        }
    }
}