/**
 * Cross-browser function to add an event listener.
 * @param {!HTMLElement} elem  The DOM element to attach event to.
 * @param {string} eventName  The name of the event.
 * @param {!Function} fnHandler  The function to server as one of the specified
 *     event handlers.
 * @return {Function}  Returns the function that was added as an event handler.
 */
var addEvent = function(elem, eventName, fnHandler) {
  var fnToBind = function(e) {
    return fnHandler.call(elem, e || window.event);
  };
   
  // Add the event the W3C way.
  if (elem.addEventListener) {
    elem.addEventListener(eventName, fnToBind, false);
    return fnToBind;
  }
   
  eventName = 'on' + eventName;
   
  // Add the event the Microsoft way.
  if (elem.attachEvent) {
    return elem.attachEvent(eventName, fnToBind) ? fnToBind : null;
  }
   
  // Assign the handler directly to the object's event handler property.
  if(typeof elem[eventName] == 'function') {
    // Add the event by creating a function which will run both the current
    // handler and this new one.
    var f1 = elem[eventName], f2 = fnToBind;
    fnToBind = function() {
      var ret1, ret2;
 
      try { ret1 = f1.apply(this, arguments); }
      catch (e1) { setTimeout(function() { throw e1; }, 0); }
 
      try { ret2 = f2.apply(this, arguments); }
      catch (e2) { setTimeout(function() { throw e2; }, 0); }
 
      // If the previous handler returned a non-undefined value, return it,
      // otherwise return the value returned from the new handler.
      return ret1 === undefined ? ret2 : ret1;
    };
  }
  elem[eventName] = fnToBind;
  return fnToBind;
};