var Tracking = {};
Tracking.initialized = false;

Tracking.init = function() {
  if (Tracking.initialized) {
    return;
  }
  
  TrackingSheet.init();
  log(Log.Level.INFO, 'Tracking.init()');
  
  Tracking.initialized = true;

  Tracking.trackedProperty = function(sheetId) {
    return 'tracked:' + sheetId;
  }
  
  Tracking.setTrackedForSheet = function(sheetId, tracked) {
    PropertiesService.getScriptProperties().setProperty(Tracking.trackedProperty(sheetId), tracked ? 'true' : 'false');
  }
  
  Tracking.clearTrackedForSheet = function(sheetId) {
    PropertiesService.getScriptProperties().deleteProperty(Tracking.trackedProperty(sheetId));
  }
  
  Tracking.getTrackedForSheet = function(sheetId) {
    return PropertiesService.getScriptProperties().getProperty(Tracking.trackedProperty(sheetId)) === 'true';
  }
}

function setTrackedForSheet(sheetId, tracked) {
  Tracking.init();
  Tracking.setTrackedForSheet(sheetId, tracked);
}

function clearTrackedForSheet(sheetId) {
  Tracking.clearTrackedForSheet(sheetId);
}

function getTrackedForSheet(sheetId) {
  return Tracking.getTrackedForSheet(sheetId);
}