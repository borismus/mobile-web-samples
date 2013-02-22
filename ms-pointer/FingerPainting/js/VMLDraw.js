

function VMLDraw(target, options) {

    if (!(navigator.userAgent.match(/\bMSIE\b/) && (typeof document.documentMode == 'undefined' || document.documentMode < 10))) {
        options.prompt = "VML drawing is not supported for your browser. Try SVG.";
        DrawPrompt();
        return;
    }

    var darkColorNames = ["Black", "Silver", "Gray", "Maroon", "Red", "Purple", "Fuchsia", "Green", "Lime", "Olive", "Yellow", "Navy", "Blue", "Teal", "Aqua"];

    (function() {
        document.namespaces.add("v", "urn:schemas-microsoft-com:vml");
        var ss = document.createStyleSheet();
        ss.addRule("v\\: *", "behavior:url(#default#VML); position:absolute");
        ss.addRule("v\\:rect", "behavior:url(#default#VML); position:absolute");
        ss.addRule("v\\:oval", "behavior:url(#default#VML); position:absolute");
        ss.addRule("v\\:fill", "behavior:url(#default#VML); position:absolute");
        ss.addRule("v\\:polyline", "behavior:url(#default#VML); position:absolute;");
        ss.addRule("v\\:stroke", "behavior:url(#default#VML); position:absolute");

        if (options.logMessage)
            options.logMessage("Drawing using VML from a palette of " + darkColorNames.length + " named colors.");
    })();
    
    function DrawPrompt() {
        var prompt = document.createElement("div");
        prompt.id = "vml_prompt";
        prompt.style.position = "absolute";
        prompt.style.top = options.promptTop.toString() + "px";
        prompt.style.left = options.promptLeft.toString() + "px";
        prompt.style.font = options.promptFont;
        prompt.style.width = Math.max(20, target.offsetWidth - options.promptLeft - options.promptRight).toString() + "px";
        prompt.appendChild(document.createTextNode(options.prompt));
        target.appendChild(prompt);
    }

    DrawPrompt();
    PointerDraw(target, BeginPolyline, ExtendPolylineTo, EndPolyline, options.logMessage);

    this.ClearPicture = function () {
        //  this is the fastest way to delete all the VML we've created under target
        target.innerHTML = "";

        //  and then we restore the prompt we just deleted
        DrawPrompt();
    };

    function SetSizeToTarget() {
        //  only have to adjust the width of the prompt because the VML drawing are just child elements of target
        document.getElementById("vml_prompt").style.width = Math.max(20, target.offsetWidth - options.promptLeft - options.promptRight).toString() + "px";
    }

    this.SetSizeToTarget = function () { SetSizeToTarget(); };

    function BeginPolyline(wrapper, id, x, y) {
        //  remove the id on any existing polyline with this id
        var polyline = document.getElementById("pl" + id);
        if (polyline != null)
            EndPolyline(wrapper, id);

        //  this polyline is what we'll extend
        polyline = document.createElement("v:polyline");

        //  eat click and double-click because it causes problems on IEBlog with jQuery in IE8 mode - probably not generally required
        polyline.attachEvent("onclick", function () { window.event.returnValue = false; window.event.cancelBubble = true; return false; });
        polyline.attachEvent("ondblclick", function () { window.event.returnValue = false; window.event.cancelBubble = true; return false; });

        polyline.id = "pl" + id;
        polyline.setAttribute("filled", "false");
        polyline.setAttribute("stroked", "true");
        var xy = x.toString() + "," + y.toString();
        polyline.setAttribute("points", xy);
        polyline.setAttribute("startPoint", xy);
        //  we don't save an end point until we extend it

        var stroke = document.createElement("v:stroke");
        stroke.setAttribute("opacity", 0.5);
        stroke.setAttribute("weight", "20px");
        var color = darkColorNames[Math.floor(Math.random() * darkColorNames.length)];
        stroke.setAttribute("color", color);
        stroke.setAttribute("endcap", "round");
        polyline.appendChild(stroke);

        target.appendChild(polyline);

        //  we add a circle because a one-point polyline does not display. the circle is removed if the polyline is extended.
        var circle = document.createElement("v:oval");

        //  eat click and double-click because it causes problems on IEBlog with jQuery in IE8 mode - probably not generally required
        circle.attachEvent("onclick", function () { window.event.returnValue = false; window.event.cancelBubble = true; return false; });
        circle.attachEvent("ondblclick", function () { window.event.returnValue = false; window.event.cancelBubble = true; return false; });

        circle.id = "circ" + id;
        circle.setAttribute("stroked", "false");
        circle.style.left = (x - 10).toString() + "px";
        circle.style.top = (y - 10).toString() + "px";
        circle.style.width = "20px";
        circle.style.height = "20px";

        var fill = document.createElement("v:fill");
        fill.setAttribute("opacity", 0.5);
        fill.setAttribute("color", stroke.color.value);
        circle.appendChild(fill);

        target.appendChild(circle);
    }

    function ExtendPolylineTo(wrapper, id, x, y) {
        var circle = document.getElementById("circ" + id);
        if (circle != null) {
            circle.parentNode.removeChild(circle);
        }

        var existingPolyline = document.getElementById("pl" + id);
        if (existingPolyline != null) {
            //  i could not figure out how to edit an existing VML element. so we create a new one and remove the old one.
            var polyline = document.createElement("v:polyline");

            //  eat click and double-click because it causes problems on IEBlog with jQuery in IE8 mode - probably not generally required
            polyline.attachEvent("onclick", function () { window.event.returnValue = false; window.event.cancelBubble = true; return false; });
            polyline.attachEvent("ondblclick", function () { window.event.returnValue = false; window.event.cancelBubble = true; return false; });

            polyline.id = existingPolyline.id;
            existingPolyline.removeAttribute("id");
            polyline.setAttribute("filled", "false");
            polyline.setAttribute("stroked", "true");
            var xy = x.toString() + "," + y.toString();
            polyline.setAttribute("points", existingPolyline.points.value + " " + xy);
            polyline.setAttribute("startPoint", existingPolyline.getAttribute("startPoint"));
            polyline.setAttribute("endPoint", xy);

            var existingStroke = existingPolyline.childNodes[0];    // we know stroke is our only child

            var stroke = document.createElement("v:stroke");
            stroke.setAttribute("opacity", 0.5);
            stroke.setAttribute("weight", "20px");
            stroke.setAttribute("color", existingStroke.color.value);
            stroke.setAttribute("endcap", "round");
            polyline.appendChild(stroke);

            target.appendChild(polyline);

            existingPolyline.parentNode.removeChild(existingPolyline);
        }
    }

    function EndPolyline(wrapper, id) {
        var circle = document.getElementById("circ" + id);
        if (circle != null)
            circle.removeAttribute("id");
        
        var polyline = document.getElementById("pl" + id);
        if (polyline != null) {
            //  the presence of endpoint tells us we've extended the polyline
            var endPoint = polyline.getAttribute("endPoint");
            if (!endPoint) {
                polyline.parentNode.removeChild(polyline); // remove empty polyline
            }
            else {
                var startPoint = polyline.getAttribute("startPoint");
                var startMatch = startPoint.match(/([\d.-]+),([\d.-]+)/);
                var p0 = { x: parseFloat(startMatch[1]), y: parseFloat(startMatch[2]) };
                var endMatch = endPoint.match(/([\d.-]+),([\d.-]+)/);
                var pLast = { x: parseFloat(endMatch[1]), y: parseFloat(endMatch[2]) };

                var distance = Math.sqrt(Math.pow(p0.x - pLast.x, 2) + Math.pow(p0.y - pLast.y, 2));

                if (distance < options.fillDistance) {
                    var stroke = polyline.childNodes[0];
                    var fill = document.createElement("v:fill");
                    fill.setAttribute("opacity", 0.3);
                    fill.setAttribute("color", stroke.color.value);
                    polyline.appendChild(fill);
                    polyline.filled = true;
                }

                polyline.removeAttribute("id");
            }
        }
    }
}