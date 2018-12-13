var Tracking = {};
Tracking.initialized = false;

Tracking.init = function() {
  if (Tracking.initialized) {
    return;
  }
  
  Preferences.init();
  TrackingSheet.init();
  log(Log.Level.INFO, 'Tracking.init()');
  
  Tracking.initialized = true;
}