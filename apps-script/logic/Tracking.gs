var Tracking = {};
Tracking.initialized = false;

Tracking.init = function() {
  if (Tracking.initialized) {
    return;
  }
  
  TrackingSheet.init();
  log(Log.Level.INFO, 'Tracking.init()');
  
  Tracking.initialized = true;

  Tracking.organize = function(trackingSheet) {
    var rows = trackingSheet.getRows();
    for (var i = 0; i < rows.length; i++) {
      var row = rows[i];
      row.setDataValidation(TrackingSheet.COLUMNS.PRIORITY, TrackingSheet.PRIORITIES);
    }
    trackingSheet.sortBy(TrackingSheet.COLUMNS.PRIORITY);
    log(Log.Level.INFO, 'Set up tracking');
  }

  Tracking.trackedProperty = function(sheetId) {
    return 'tracked:' + sheetId;
  }
  
  Tracking.setTrackedForSheet = function(sheetId, tracked) {
    PropertiesService.getScriptProperties().setProperty(Tracking.trackedProperty(sheetId), tracked ? 'true' : 'false');
    if (tracked) {
      organizeTracking(sheetId);
    }
  }
  
  Tracking.clearTrackedForSheet = function(sheetId) {
    PropertiesService.getScriptProperties().deleteProperty(Tracking.trackedProperty(sheetId));
  }
  
  Tracking.getTrackedForSheet = function(sheetId) {
    return PropertiesService.getScriptProperties().getProperty(Tracking.trackedProperty(sheetId)) === 'true';
  }
  
  Tracking.organizeAllTracking = function() {
    TrackingSheet.getAll().forEach(function (trackingSheet) { trackingSheet.organize(); });
  }
  
  Tracking.organizeTracking = function(sheetId) {
    Tracking.organize(TrackingSheet.forSheetId(sheetId));
  }
  
  Tracking.organizeTrackingOnCurrentSheet = function() {
    organizeTracking(Spreadsheet.getActiveSheetId());
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

function organizeAllTracking() {
  Tracking.init();
  Tracking.organizeAllTracking();
}

function organizeTracking(sheetId) {
  Tracking.init();
  Tracking.organizeTracking(sheetId);
  return 'Organized';
}

function organizeTrackingOnCurrentSheet() {
  Tracking.init();
  Tracking.organizeTrackingOnCurrentSheet();
}