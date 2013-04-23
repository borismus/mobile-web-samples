function GetContext() {
  return document.getElementById("canvas").getContext("2d");
}

function IsAndroid() {
  return navigator.userAgent.toLowerCase().indexOf('android') >= 0;
}

function RescaleRadius(r) {
  // Radius on Chrome for Android varies in [80, 160]. We want to rescale this
  // range to [10, 40].
  // First get normalized value in [0, 1].
  var p = (r - 80) / 80;
  // Then scale out to [10, 40].
  return 30*p + 10;
}

var radiusSupported = false;
var nextCount = 0;
var touchMap = {};
var pointMode = false;
var enableForce = false;

document.addEventListener('keyup', function(e) {
  switch(e.which) {
    // ESC
    case 27:
      var canvas = document.getElementById('canvas');
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
    break;

    // p
    case 80:
      pointMode = !pointMode;
    break;

    // f
    case 70:
      enableForce = !enableForce;
    break;
  }

});

function drawTouches(touches, eventType) {
  var context = GetContext();
  for (var i = 0; i < touches.length; ++i) {
    var touch = touches[i];

    // Map the identifier to a small count (no-op on Chrome, but
    // important for mobile Safari).
    if (!(touch.identifier in touchMap)) {
      touchMap[touch.identifier] = nextCount;
      nextCount++;
    }

    context.beginPath();

    // Spec says to use 1 for unknown radius, can't differentiate between that
    // and real 1 pixel radius.
    if (touch.webkitRadiusX > 1)
      radiusSupported = true;
    var radius = radiusSupported ? touch.webkitRadiusX : 15;
    /* For debugging, output the radius we receive.
    context.font = '20pt Arial';
    context.fillStyle = 'black';
    context.clearRect(0, 0, 100, 100);
    context.fillText(radius, 50, 70);
    */
    if (IsAndroid()) {
      radius = RescaleRadius(radius);
    }
    if (radius > 100) {
      console.error('Got large webkitRadiusX: ' + touch.webkitRadiusX);
      radius=100;
    }
    if (pointMode)
      radius=1/scale;

    // Try to avoid start/end circles overlapping exactly
    if (eventType == 'touchend') {
      radius++;
    }

    context.arc(touch.pageX * scale, touch.pageY * scale, radius * scale, 0, 2.0 * 3.14159, false);
    context.closePath();

    // Fill circle on start/move
    if (eventType != 'touchend') {
      var opacity = pointMode ? 1 : 0.1;

      var hue = (touchMap[touch.identifier] * 30) % 256;
      var lum = 40;
      if (enableForce && touch.webkitForce)
        lum = Math.round(touch.webkitForce / 0.4 * 50 + 20);
      context.fillStyle = 'hsla(' + hue + ',100%,' + lum + '%, ' + opacity + ')';
      context.fill();
    }

    // Outline circle on start/end
    if (eventType != 'touchmove') {
      context.strokeStyle = eventType == 'touchstart' ? 'black' : 'grey';
      context.lineWidth = 2;
      context.stroke();
    }

  }
}

function TouchHandler(event) {
  drawTouches(event.changedTouches,event.type);
  event.preventDefault();
}

var mousePressed = false;

function MouseHandler(event) {
  if (event.type == "mousedown" && event.button == 0) mousePressed = true;
  if (mousePressed && event.button == 0)
    {
      var fakeTouch = {
        identifier: 10,
        pageX : event.pageX,
        pageY : event.pageY
      };
      var eventType = event.type == "mousedown" ? "touchstart" :
        event.type == "mouseup" ? "touchend" : "touchmove";
      drawTouches([fakeTouch], eventType);
      event.preventDefault();

      if (event.type == "mouseup") mousePressed = false;
    }
}

var scale = 1;

function InitializeCanvas() {
  window.onscroll = null;
  var elem = document.getElementById('canvas');
  if (window.devicePixelRatio)
    scale = window.devicePixelRatio;

  elem.width = window.screen.width * scale;
  elem.height = window.screen.height * scale;
  elem.style.width = window.screen.width + 'px';
  elem.style.height = window.screen.height + 'px';

  var context = GetContext();
  context.fillStyle = "#ff0000";
}
