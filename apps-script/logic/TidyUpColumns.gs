var TidyUpColumns = {};
TidyUpColumns.initialized = false;

TidyUpColumns.init = function() {
  if (TidyUpColumns.initialized) {
    return;
  }
  
  TrackingSheet.init();
  Log.info('TidyUpColumns.init()');
  
  TidyUpColumns.initialized = true;
  
  TidyUpColumns.tidyUp = function(sheetId) {
    var trackingSheet = TrackingSheet.forSheetId(sheetId);
    trackingSheet.
        setFrozenColumns(0).
        resetColumnOrder().
        resizeColumnToFit(TrackingSheet.COLUMNS.EMAIL).
        resizeColumnToFit(TrackingSheet.COLUMNS.LINK).
        resizeColumnToFit(TrackingSheet.COLUMNS.ACTION).
        resizeColumnToFit(TrackingSheet.COLUMNS.PRIORITY).
        resizeColumnToFit(TrackingSheet.COLUMNS.INBOX).
        hideColumn(TrackingSheet.COLUMNS.THREAD_ID).
        hideColumn(TrackingSheet.COLUMNS.UUID).
        hideColumn(TrackingSheet.COLUMNS.SUBJECT).
        setFrozenColumns(1);
    return 'Tidied up ' + trackingSheet.getSheetName();
  }
}

function tidyUpColumns(spreadsheetUrl, sheetId) {
  Log.start('tidyUpColumns', [spreadsheetUrl, sheetId]);
  TidyUpColumns.init();
  Spreadsheet.setSpreadsheetUrl(spreadsheetUrl);
  var ret = TidyUpColumns.tidyUp(sheetId);
  Log.stop('tidyUpColumns', [spreadsheetUrl, sheetId]);
  return ret;
}
