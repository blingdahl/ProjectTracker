var Organize = {};
Organize.initialized = false;

Organize.init = function() {
  if (Organize.initialized) {
    return;
  }
  
  TrackingSheet.init();
  log(Log.Level.INFO, 'Organize.init()');
  
  Organize.initialized = true;

  Organize.organize = function(trackingSheet) {
    var rows = trackingSheet.getRows();
    for (var i = 0; i < rows.length; i++) {
      var row = rows[i];
      row.setDataValidation(TrackingSheet.COLUMNS.PRIORITY, TrackingSheet.PRIORITIES);
    }
    trackingSheet.sortBy(TrackingSheet.COLUMNS.PRIORITY);
    log(Log.Level.INFO, 'Organized');
  }
  
  Organize.organizeAll = function() {
    TrackingSheet.getAll().forEach(function (trackingSheet) { Organize.organize(trackingSheet); });
  }
  
  Organize.organize = function(sheetId) {
    Organize.organize(TrackingSheet.forSheetId(sheetId));
  }
  
  Organize.organizeOnCurrentSheet = function() {
    Organize.organize(Spreadsheet.getActiveSheetId());
  }
}

function organizeAll() {
  Organize.init();
  Organize.organizeAll();
}

function organize(sheetId) {
  Organize.init();
  Organize.organize(sheetId);
  return 'Organized';
}

function organizeOnCurrentSheet() {
  Organize.init();
  Organize.organizeOnCurrentSheet();
}