var Tracking = {};
Tracking.initialized = false;

Tracking.init = function() {
  if (Tracking.initialized) {
    return;
  }
  
  Preferences.init();
  TrackingSheet.init();
  Log.info('Tracking.init()');
  
  Tracking.initialized = true;
}