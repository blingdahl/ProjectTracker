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
    var dataRows = trackingSheet.getDataRows();
    var numRows = dataRows.slice(-1)[0].getRowNumber();
    trackingSheet.setNumRows(numRows + Organize.EXTRA_ROWS);
    var rows = trackingSheet.getAllRows();
    for (var i = 0; i < rows.length; i++) {
      var row = rows[i];
      row.setDataValidation(TrackingSheet.COLUMNS.PRIORITY, TrackingSheet.PRIORITIES);
    }
    trackingSheet.sortBy(TrackingSheet.COLUMNS.EMAIL_LAST_DATE).sortBy(TrackingSheet.COLUMNS.INBOX, false).sortBy(TrackingSheet.COLUMNS.PRIORITY);
    return 'Organized ' + trackingSheet.getSheetName();
  }
  
  Organize.organizeAll = function() {
    TrackingSheet.getAll().forEach(function (trackingSheet) { Organize.organizeSheet(trackingSheet); });
  }
  
  Organize.organize = function(sheetId) {
    return Organize.organizeSheet(TrackingSheet.forSheetId(sheetId));
  }
}

Organize.EXTRA_ROWS = 10;

function organizeAll() {
  Organize.init();
  Organize.organizeAll();
}

function organize(spreadsheetUrl, sheetId) {
  Log.start('organize', [sheetId]);
  Organize.init();
  Spreadsheet.setSpreadsheetUrl(spreadsheetUrl);
  var ret = Organize.organize(sheetId);
  Log.stop('organize', [sheetId]);
  return ret;
}