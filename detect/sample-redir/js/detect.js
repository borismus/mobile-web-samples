(function(exports) {
 /**
  * Does client-side detection to decide which device class to serve to this
  * app.
  *
  * @return {String} the device class to serve.
  */
  function detect() {
    // If a particular device class was explicitly requested...
    var explicitClass = getParameterByName('device');
    if (explicitClass) {
      return explicitClass;
    } else {
      // Do mediaquery- and feature-based detection.
      var deviceClass;
      if (hasTouch()) {
        if (isSmall()) {
          deviceClass = 'phone';
        } else {
          deviceClass = 'tablet';
        }
      } else {
        deviceClass = 'desktop';
      }
      return deviceClass;
    }
    // Return a default.
    return 'desktop';
  }

  function hasTouch() {
    return Modernizr.touch;
  }

  function isSmall() {
    return window.matchMedia("(max-width: 650px)").matches;
  }

  function getParameterByName(name)
  {
    name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
      var regexS = "[\\?&]" + name + "=([^&#]*)";
      var regex = new RegExp(regexS);
      var results = regex.exec(window.location.search);
      if(results == null)
        return "";
      else
        return decodeURIComponent(results[1].replace(/\+/g, " "));
  }
  exports.detect = detect;
})(window);


var deviceClass = detect();
window.location.href = deviceClass + '.html';
