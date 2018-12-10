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
}
  
function trackedProperty(sheetId) {
  return 'tracked:' + sheetId;
}

function setTrackedForSheet(sheetId, tracked) {
  PropertiesService.getScriptProperties().setProperty(trackedProperty(sheetId), tracked ? 'true' : 'false');
  if (tracked) {
    organizeTracking(sheetId);
  }
}

function clearTrackedForSheet(sheetId) {
  PropertiesService.getScriptProperties().deleteProperty(trackedProperty(sheetId));
}

function getTrackedForSheet(sheetId) {
  return PropertiesService.getScriptProperties().getProperty(trackedProperty(sheetId)) === 'true';
}

  
function organizeAllTracking() {
	Tracking.init();
	TrackingSheet.getAll().forEach(function (trackingSheet) { trackingSheet.organize(); });
}

function organizeTracking(sheetId) {
	Tracking.init();
	Tracking.organize(TrackingSheet.forSheetId(sheetId));
}

function organizeTrackingOnCurrentSheet() {
	Tracking.init();
	organizeTracking(Spreadsheet.getActiveSheetId());
}