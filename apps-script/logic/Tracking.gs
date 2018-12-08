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
      row.setDataValidation(Tracking.COLUMN_NAMES.PRIORITY, Tracking.PRIORITIES);
    }
    trackingSheet.sortBy(Tracking.COLUMN_NAMES.PRIORITY);
    log(Log.Level.INFO, 'Set up tracking');
  }
}

  
function organizeAllTracking() {
	Tracking.init();
	TrackingSheet.getAll().forEach(function (trackingSheet) { trackingSheet.organize(); });
}

function organizeTracking(sheetId) {
	Tracking.init();
	Tracking.organize(TrackingSheet.forSheetId(sheetId).organize());
}

function organizeTrackingOnCurrentSheet() {
	Tracking.init();
	organizeTracking(Spreadsheet.getActiveSheetId());
}