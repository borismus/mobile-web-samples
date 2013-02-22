
function Multidraw(multidrawTarget, drawingTechnology) {

    if (!multidrawTarget.style.position)
        multidrawTarget.style.position = "relative";

    var logging = window.location.search.match(/\blog\b/i) != null;
    var msgs;       // optional textarea for debug messages; may be undefined
    var drawingTarget;  // target of the actual drawing
    var drawingObject; // a canvas, SVG, or VML drawing object; may be undefined

    function SetMsgsAndTargetWidth() {
        var multidrawWidth = multidrawTarget.offsetWidth;
        var multidrawHeight = multidrawTarget.offsetHeight;
        var msgWidth = msgs ? Math.min(460, Math.floor(multidrawWidth / 2)) : 0;
        var drawingWidth = multidrawWidth - msgWidth;

        if (msgs) {
            msgs.style.width = msgWidth.toString() + "px";
            msgs.style.height = multidrawHeight.toString() + "px";
        }

        drawingTarget.style.width = drawingWidth.toString() + "px";
        drawingTarget.style.height = multidrawHeight.toString() + "px";
    }

    if (logging) {
        msgs = document.createElement("textarea");
        msgs.style.position = "absolute";
        msgs.style.top = 0;
        msgs.style.left = 0;
        msgs.style.padding = "4px";
        msgs.style.border = "none";
        msgs.style.borderRight = "solid 1px gray";
        msgs.style.font = "12px Sans-Serif";
        multidrawTarget.appendChild(msgs);

        //  get us back to quirks-style box sizing
        if (typeof msgs.style.boxSizing != 'undefined')
            msgs.style.boxSizing = "border-box";
        else if (typeof msgs.style.MozBoxSizing != 'undefined')
            msgs.style.MozBoxSizing = "border-box";
        else if (typeof msgs.style.webkitBoxSizing != 'undefined')
            msgs.style.webkitBoxSizing = "border-box";
        else if (typeof msgs.style.oBoxSizing != 'undefined')
            msgs.style.oBoxSizing = "border-box";
    }

    drawingTarget = document.createElement("div");
    drawingTarget.style.position = "absolute";
    drawingTarget.style.top = 0;
    drawingTarget.style.right = 0;
    drawingTarget.style.cursor = "default";
    multidrawTarget.appendChild(drawingTarget);

    SetMsgsAndTargetWidth();

    function ClearMessages() {
        if (msgs)
            msgs.value = "";
    }

    function AppendMessage(msg) {
        if (msgs) {
            msg = msg.replace(/\n$/, "") + "\n\n";
            msgs.value += msg;
        }
    }

    function ClearPicture() {
        if (drawingObject && drawingObject.ClearPicture)
            drawingObject.ClearPicture();
        ClearMessages();
    }

    var btnClear = document.createElement("button");
    btnClear.style.position = "absolute";
    btnClear.style.top = "8px";
    btnClear.style.right = "8px";
    btnClear.style.width = "7em";
    btnClear.title = "Clear Picture";
    btnClear.appendChild(document.createTextNode("Clear"));
    if (btnClear.addEventListener)
        btnClear.addEventListener("click", function(evt) { ClearPicture(); evt.preventDefault(); return false; }, false);
    else if (btnClear.attachEvent)
        btnClear.attachEvent("onclick", function() { ClearPicture(); event.returnValue = false; return false; });
    multidrawTarget.appendChild(btnClear);

    function DrawingTechnologyToUse() {
        var tech = "none";

        //	if we have an explicit technology on the construction or the URL, we use it. (helpful for testing.)
        //
        //	normally, we use SVG if it's supported, VML if SVG is not supported and the browser
        //	is IE running in a document mode less than 10, HTML5 canvas if neither SVG or VML
        //	is available, or nothing if none of these three are available.
        if (drawingTechnology)
            tech = drawingTechnology;
        else {
            var qsUseMatch = window.location.search.match(/\buse=(canvas|svg|vml|none)\b/i);

            if (qsUseMatch && qsUseMatch.length == 2) {
                tech = qsUseMatch[1].toLowerCase();
            }
            else if (document.implementation.hasFeature("http://www.w3.org/TR/SVG11/feature#Structure", "1.1")) {
                tech = "svg";
            }
            else if (navigator.userAgent.match(/\bMSIE\b/) && (typeof document.documentMode == 'undefined' || document.documentMode < 10)) {
                tech = "vml";
            }
            else if (typeof document.createElement("canvas").getContext != 'undefined') {
                tech = "canvas";
            }
        }

        return tech;
    }

    var options = {
        logMessage: logging ? AppendMessage : null,
        fillDistance: 25,
        prompt: "Use your mouse, finger, or stylus to draw",
        promptFont: "16px Segoe UI, Verdana, Sans-Serif",
        promptTop: 8,
        promptLeft: 8,
        promptRight: 16 + btnClear.offsetWidth + 8
    };

    switch (DrawingTechnologyToUse()) {
        case "svg":
            options.prompt += " with SVG";
            drawingObject = new SVGDraw(drawingTarget, options);
            break;
        case "vml":
            options.prompt += " with VML";
            drawingObject = new VMLDraw(drawingTarget, options);
            break;
        case "canvas":
            options.prompt += " with HTML5 canvas";
            drawingObject = new CanvasDraw(drawingTarget, options);
            break;
        default:
            var prompt = document.createElement("div");
            prompt.style.position = "absolute";
            prompt.style.top = options.promptTop.toString() + "px";
            prompt.style.left = options.promptLeft.toString() + "px";
            prompt.style.width = (drawingTarget.offsetWidth - options.promptLeft - options.promptRight).toString() + "px";
            prompt.appendChild(document.createTextNode("As best we can tell, your browser does not support HTML5 canvas, SVG, or VML. No drawing for you."));
            drawingTarget.appendChild(prompt);
            document.getElementById("btnClear").setAttribute("disabled", "disabled");
            break;
    }

    function ResizeEventHandler() {
        SetMsgsAndTargetWidth();

        if (drawingObject && drawingObject.SetSizeToTarget)
            drawingObject.SetSizeToTarget();
    }

    if (window.addEventListener) {
        window.addEventListener("resize", ResizeEventHandler, false);
    }
    else if (window.attachEvent) {
        window.attachEvent("onresize", ResizeEventHandler);
    }
}

function InitMultidraw() {
    var multidrawers = [];

    var targets;
    if (document.querySelectorAll) {
        targets = document.querySelectorAll(".multidrawTarget");
    }
    else {
        //  check all the divs in the document
        targets = [];
        var rxClassname = /\bmultidrawTarget\b/;

        var divs = document.getElementsByTagName("div");
        for (var j = 0; j < divs.length; ++j) {
            if (divs[j].className && rxClassname.test(divs[j].className))
                targets.push(divs[j]);
        }
    }

    for (var i = 0; i < targets.length; ++i)
        multidrawers.push(new Multidraw(targets[i], targets[i].getAttribute("tech")));
}

if (window.addEventListener) {
    window.addEventListener("load", InitMultidraw, false);
}
else if (window.attachEvent) {
    window.attachEvent("onload", InitMultidraw);
}
