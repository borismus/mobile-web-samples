var canvas;
var context;
var brush;
var x, y;

function init() {
  canvas = document.getElementById("canvas");

  context = canvas.getContext("2d");

  canvas.addEventListener("MSPointerDown", onPointerDown, false);
  canvas.addEventListener("MSPointerOver", onPointerOver, false);
  canvas.addEventListener("MSPointerMove", onPointerMove, false);
  canvas.addEventListener("MSPointerUp", onPointerUp, false);
  canvas.addEventListener("MSGestureDoubleTap", onGestureDoubleTap, false);

  context.fillRect(0, 0, canvas.width, canvas.height);

  brush = {};
}


function onPointerDown(evt) {
  log('onPointerDown');
};

function onPointerOver(evt) {
  log('onPointerOver');
};

function onPointerMove(evt) {
  log('type: ' + evt.pointerType);
  var pointers = evt.getPointerList;
  log('pointer count: ' + pointers);
  log('onPointerMove');
};

function onPointerUp(evt) {
  log('onPointerUp');
};

function onGestureDoubleTap(evt) {
  log('onGestureDoubleTap');
}

var fakeConsole = document.getElementById('fake-console');
function log(msg) {
  fakeConsole.innerHTML = msg + '<br/>' + fakeConsole.innerHTML;
}

init();
