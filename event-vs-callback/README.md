A performance test to compare the performance overhead of creating
events vs. the performance overhead of calling a function.

Setup:

    <div id="el"></div>

    var el = document.querySelector('#el');
    function callback(e) {
      // Handle the event.
    }

Approach 1: events

    // Register an event.
    addEventListener('customEvent', callback);
    // Synthesize a custom event.
    var event = document.createEvent('Event');
    event.initEvent('customEvent', true, true);
    el.dispatchEvent(event);

Approach 2: functions

    // Callback a function.
    var event = document.createEvent('Event');
    event.target = el;
    callback.call(el, event);
