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
const DEFAULT_SPEED = 0.5;
// Number of chunks to split an animation into.
const N_STEPS = 10;

// Page height.
var height = 0;

// Animation parameters.
var DEPTH = 0.5;

// Elements involved in the animation.
var $prev = null;
var $curr = null;
var $next = null;


/**
 * @param animationState {number} From -1 to 1, where -1 is the previous resource,
 * and 1 the next one.
 */
function animateTo(state) {
  // Get the top and bottom elements involved in the animation depending on
  // animationState.
  var $top = state < 0 ? $prev : $curr;
  var $bot = state < 0 ? $curr : $next;

  var s = state < 0 ? Math.abs(state) : 1 - state;

  var h = Math.sqrt(s*(1-s));
  var topAngle = Math.atan2(h, s);
  var botAngle = Math.atan2(h, 1-s);
  var topScale = Math.sqrt(s);
  var botScale = Math.sqrt(1-s);

  applyTransform($top, -topAngle, topScale, 0);
  applyTransform($bot, botAngle, botScale, height);
}

function applyTransform($el, angle, scale, origin) {
  $el.css('-webkit-transform-origin-y', origin + 'px');
  var transform = 'rotateX({{angle}}deg) scaleY({{scale}}) translateZ(0px) '
      .replace('{{angle}}', angle * 180/Math.PI)
      .replace('{{scale}}', scale);
  $el.css('-webkit-transform', transform);
}

/**
 * Starts off an animation that eventually snaps a thing in full screen.
 */
function animateInertia(velocity) {
  var state = getAnimState();
  // Factor velocity into the state.
  var stateInertia = state + velocity * 20;
  // Get the current speed (but not too slow).
  var speed = Math.max(Math.abs(velocity), DEFAULT_SPEED);
  // Decide how long the animation should take (in millis).
  var duration = Math.abs(stateInertia / speed) * 100;
  // Figure out where to interpolate to.
  if (stateInertia < -0.5) {
    target = -1;
  } else if (stateInertia > 0.5) {
    target = 1;
  } else {
    target = 0;
  }
  // Split the animation up into N chunks, since doing it in one chunk will
  // look really ugly.
  var stepDuration = duration / N_STEPS;
  var totalDelta = target - state;
  for (var i = 1; i < N_STEPS; i++) {
    // Call the timing function to compute much to transition this step.
    var stepDelta = totalDelta / N_STEPS;
    animateStep(state + stepDelta * i, stepDuration * i);
  }
  // Make the last step swap nodes.
  animateStep(target, duration, function() {
    if (target == 1) {
      swapNodes($next);
    } else if (target == -1) {
      swapNodes($prev);
    }
  });
}

function animateStep(target, time, callback) {
  setTimeout(function() {
    animateTo(target);
    if (callback) {
      callback();
    }
  }, time);
}

function swapNodes($newCurr) {
  $curr = $newCurr;
  $next = $curr.next();
  $prev = $curr.prev();
}


function clearTransitions() {
  clearTransition($prev);
  clearTransition($curr);
  clearTransition($next);
}

function init() {
  // Calculate page height.
  height = $(document).height();
  swapNodes($('.curr'));
  // Position the prev and next nodes.
  animateTo(0);
  $('#container').height(height);
}


/**
 * @param velocity {number} in pixels per millisecond.
 */
function startTransition($el, duration, curve) {
  var transition = '-webkit-transform {{time}}s {{curve}}'
      .replace('{{time}}', duration/1000)
      .replace('{{curve}}', curve);
  $el.css('-webkit-transition', transition);

  setTimeout(function() { clearTransition($el); }, duration);
}

function clearTransition($el) {
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
}

function move(y) {
  if (isDown) {
    deltaY = y - downY;
    var animationState = getAnimState();
    // Update the animation state to the specified animationState.
    animateTo(animationState);
  }
}

function getAnimState() {
  return -deltaY / height;
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
    velocity = (firstInfo.y - deltaY) / (now - firstInfo.date);
    console.log('using first');
  } else {
    velocity = (secondInfo.y - deltaY) / (now - secondInfo.date);
    console.log('using second');
  }
  if (isNaN(velocity)) {
    console.error('velocity NaN');
  }
  // Velocity units: percent per millisecond.
  animateInertia(velocity / height);
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
    e.preventDefault();
    down(e.originalEvent.touches[0].pageY);
  });
  $(window).bind('touchmove', function(e) {
    e.preventDefault();
    move(e.originalEvent.touches[0].pageY);
  });
  $(window).bind('touchend', function(e) {
    e.preventDefault();
    up();
  });

  init();
});
