var Organize = {};
Organize.initialized = false;

Organize.init = function() {
  if (Organize.initialized) {
    return;
  }
  
  TrackingSheet.init();
  Log.info('Organize.init()');
  
  Organize.initialized = true;

  Organize.organizeSheet = function(trackingSheet) {
    var rows = trackingSheet.getAllRows();
    for (var i = 0; i < rows.length; i++) {
      var row = rows[i];
      row.setDataValidation(TrackingSheet.COLUMNS.PRIORITY, TrackingSheet.PRIORITIES);
    }
    trackingSheet.sortBy(TrackingSheet.COLUMNS.PRIORITY);
    Log.info('Organized');
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
  Log.start('organize', [sheetId]);
  Organize.init();
  Organize.organize(sheetId);
  Log.stop('organize', [sheetId]);
  return 'Organized';
}

function organizeCurrentSheet() {
  Log.start('organizeCurrentSheet', [sheetId]);
  Organize.init();
  Organize.organizeCurrentSheet();
  Log.stop('organizeCurrentSheet', [sheetId]);
}