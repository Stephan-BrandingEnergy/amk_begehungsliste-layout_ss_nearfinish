// generate deviceready event
window.setTimeout(function() {
  var e = document.createEvent('Events');
  e.initEvent("deviceready", true, false);
  console.log('dispatching fake deviceready event');
  document.dispatchEvent(e);
}, 500);
