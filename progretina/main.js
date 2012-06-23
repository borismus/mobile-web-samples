var start = new Date();
var load = document.getElementById('console');
var stopButton = document.getElementById('stop');

function stopLoading() {
  if (window.stop) {
    window.stop();
  } else {
    document.execCommand('Stop', false);
  }
}

var order = 1;
function log(msg) {
  var now = new Date();
  var elapsed = (now - start)/1000;
  load.innerHTML += order + '. (' + elapsed + 's) ' + msg + '<br/>';
  order++;
}

function getImageName() {
  var out = null;
  // Get the ?image= GET parameter.
  var matches = window.location.href.match(/\?image=(.*)/);
  if (matches && matches.length > 1) {
    out = matches[1];
  }
  return out;
}

function prefixImages(prefix) {
  var images = document.querySelectorAll('img');
  for (var i = 0; i < images.length; i++) {
    var img = images[i];
    img.src = img.src.replace('$PREFIX', prefix);

    // Whenever an image loads, set class to loaded.
    img.addEventListener('load', function(e) {
      e.target.className = 'loaded';
      log('image#' + e.target.id + ':load fired');
    });
  }
}


prefixImages(getImageName());

window.addEventListener('load', function() {
  log('window:load fired');
});

stopButton.addEventListener('click', stopLoading);
