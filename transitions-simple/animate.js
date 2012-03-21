// True if the mouse is down.
var isDown = false;
// Y coordinate of mouse down.
var downY = 0;
// Mouse velocity.
var mouseVelocity = 0;
// Existing offset.
var deltaY = 0;


// Sampling rate in millis.
const SAMPLE_RATE = 20;
// Timer for the sampling.
var posTimer = null;
// Number of positions to keep around.
const MAX_POSITIONS = 3;
// Queue of the last N positions that are known.
var positionInfos = [];


// Default speed (if the user just lets go) in pixels per millisecond.
const DEFAULT_SPEED = 1;

// Page height.
var height = 0;

// Elements involved in the animation.
var $prev = $('.prev');
var $curr = $('.curr');
var $next = $('.next');
// New elements if we've made a transition.
var $newCurr = null;
var $newNext = null;
var $newPrev = null;


/**
 * @param animationState {number} From -1 to 1, where -1 is the previous resource,
 * and 1 the next one.
 */
function animateTo(animationState) {
  var offset = animationState * height;
  positionY($prev, -height + offset);
  positionY($curr, offset);
  positionY($next, height + offset);
  if (animationState < 0) {
    rotateOut($next, animationState);
    rotateOut($curr, -animationState);
  } else {
    rotateOut($prev, animationState);
    rotateOut($curr, -animationState);
  }
}

/**
 * Starts off an animation that eventually snaps a thing in full screen.
 */
function animateInertia(velocity) {
  // Decide how long the animation should take (depending on velocity).
  var speed = velocity != 0 ? Math.abs(velocity) : DEFAULT_SPEED;
  var ms = Math.abs(deltaY / speed);
  var duration = ms / 1000;
  var curve = 'ease-out';
  console.log('duration: ' + duration);
  console.log('velocity: ' + velocity);
  // TODO: Create a custom bezier curve for the transition.
  transitionY($prev, duration, curve);
  transitionY($curr, duration, curve);
  transitionY($next, duration, curve);

  var dy = deltaY + velocity;
  // Depending on velocity and deltaY, decide which thing should be shown.
  if (dy > height/2) {
    // Move to the previous.
    $newCurr = $prev; $newNext = $curr; $newPrev = $prev.prev();
  } else if (dy < -height/2) {
    // Move to the next.
    $newCurr = $next; $newPrev = $curr; $newNext = $next.next();
  } else {
    // Move to the current.
    $newCurr = $curr; $newPrev = $prev; $newNext = $next;
  }
  // If scrolled, set a timer to change the curr, prev, next nodes around.
  if ($newCurr != $curr) {
    setTimeout(swapNodes, duration);
  }
  positionY($newPrev, -height);
  positionY($newCurr, 0);
  positionY($newNext, height);
}

function swapNodes() {
  $curr = $newCurr;
  $next = $newNext;
  $prev = $newPrev;
}

function clearTransitions() {
  transitionYCancel($prev);
  transitionYCancel($curr);
  transitionYCancel($next);
}

function init() {
  // Calculate page height.
  height = $(document).height();
  // Position the prev and next nodes.
  positionY($prev, -height);
  positionY($next, height);
  $('#container').height(height);
}

function positionY($el, amount) {
  $el.css('-webkit-transform', 'translate(0, ' + amount + 'px)');
}

/**
 * -1 < state < 1
 */
function rotateOut($el, state) {
  var transform = $el.css('-webkit-transform');
  var angle = 50 * state;
  var x = 0;
  var newTransform = ' translateY(' + x + 'px) rotateX(' + angle + 'deg)';
  $el.css('-webkit-transform', transform + newTransform);
}

/**
 * @param velocity {number} in pixels per millisecond.
 */
function transitionY($el, duration, curve) {
  $el.css('-webkit-transition', '-webkit-transform ' + duration + 's ' + curve);
}

function transitionYCancel($el) {
  $el.css('-webkit-transition', '');
}

function updateLastKnownY() {
  // Keep an array of last known positions and times.
  positionInfos.push({
    y: deltaY,
    date: new Date()
  });
  // If there are too many positions, remove the last one.
  if (positionInfos.length > MAX_POSITIONS) {
    positionInfos.shift();
  }
}

function down(y) {
  isDown = true;
  downY = y;
  // Start sampling for positions.
  posTimer = setInterval(updateLastKnownY, SAMPLE_RATE);
  // Clear any existing transitions.
  clearTransitions();
}

function move(y) {
  if (isDown) {
    deltaY = y - downY;
    var animationState = deltaY/height;
    // Update the animation state to the specified animationState.
    animateTo(animationState);
  }
}

function up(y) {
  isDown = false;
  // Check the velocity by comparing some recent values.
  // First check the first.
  var firstInfo = positionInfos[MAX_POSITIONS-1];
  var secondInfo = positionInfos[MAX_POSITIONS-2];
  var now = new Date();
  var velocity = null;
  // Check if time between now and first sample is good enough.
  var timeSincePoll = now - firstInfo.date;
  if (timeSincePoll > SAMPLE_RATE/2) {
    velocity = (deltaY - firstInfo.y) / (now - firstInfo.date);
    console.log('using first');
  } else {
    velocity = (deltaY - secondInfo.y) / (now - secondInfo.date);
    console.log('using second');
  }
  if (isNaN(velocity)) {
    console.log('velocity NaN');
  }
  animateInertia(velocity);
  // Predict the position where the thing will come to rest.
  // End sampling for positions.
  clearInterval(posTimer);
}

$(function() {
  // Setup mouse event handlers.
  $(window).mousedown(function(e) { down(e.pageY); });
  $(window).mousemove(function(e) { move(e.pageY); });
  $(window).mouseup(function() { up(); });

  // Setup touch event handlers.
  $(window).bind('touchstart', function(e) {
    down(e.originalEvent.touches[0].pageY);
  });
  $(window).bind('touchmove', function(e) {
    e.preventDefault();
    move(e.originalEvent.touches[0].pageY);
  });
  $(window).bind('touchend', function(e) {
    up();
  });

  init();
});
