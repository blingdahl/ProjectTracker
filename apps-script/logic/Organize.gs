var Organize = {};
Organize.initialized = false;

Organize.init = function() {
  if (Organize.initialized) {
    return;
  }
  
  TrackingSheet.init();
  log(Log.Level.INFO, 'Organize.init()');
  
  Organize.initialized = true;

  Organize.organizeSheet = function(trackingSheet) {
    var rows = trackingSheet.getAllRows();
    for (var i = 0; i < rows.length; i++) {
      var row = rows[i];
      row.setDataValidation(TrackingSheet.COLUMNS.PRIORITY, TrackingSheet.PRIORITIES);
    }
    trackingSheet.sortBy(TrackingSheet.COLUMNS.PRIORITY);
    log(Log.Level.INFO, 'Organized');
  }
  
  Organize.organizeAll = function() {
    TrackingSheet.getAll().forEach(function (trackingSheet) { Organize.organizeSheet(trackingSheet); });
  }
  
  Organize.organize = function(sheetId) {
    Organize.organizeSheet(TrackingSheet.forSheetId(sheetId));
  }
  
  Organize.organizeCurrentSheet = function() {
    Organize.organize(Spreadsheet.getActiveSheetId());
  }
}

function organizeAll() {
  Organize.init();
  Organize.organizeAll();
}

function organize(sheetId) {
  logStart('organize', [sheetId]);
  Organize.init();
  Organize.organize(sheetId);
  logStop('organize', [sheetId]);
  return 'Organized';
}

function organizeCurrentSheet() {
  logStart('organizeCurrentSheet', [sheetId]);
  Organize.init();
  Organize.organizeCurrentSheet();
  logStop('organizeCurrentSheet', [sheetId]);
}