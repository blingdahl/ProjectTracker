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
        resizeColumnToFit(TrackingSheet.COLUMNS.STATUS).
        resizeColumnToFit(TrackingSheet.COLUMNS.PRIORITY).
        resizeColumnToFit(TrackingSheet.COLUMNS.INBOX).
        hideColumn(TrackingSheet.COLUMNS.THREAD_ID).
        hideColumn(TrackingSheet.COLUMNS.UUID).
        hideColumn(TrackingSheet.COLUMNS.SUBJECT).
        hideColumn(TrackingSheet.COLUMNS.TASK_ID).
        setFrozenColumns(1);
    return 'Tidied up ' + trackingSheet.getSheetName();
  }
}
