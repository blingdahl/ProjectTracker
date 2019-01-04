var Organize = {};
Organize.initialized = false;

Organize.EXTRA_ROWS = 10;

Organize.init = function() {
  if (Organize.initialized) {
    return;
  }

  TrackingSheet.init();
  TaskSync.init();
  Log.info('Organize.init()');

  Organize.initialized = true;

  Organize.organizeSheet = function(trackingSheet) {
    var taskSync = TaskSync.forTrackingSheet(trackingSheet);
    taskSync.copyCompleted();
    var dataRows = trackingSheet.getDataRows();
    trackingSheet.setNumBlankRows(Organize.EXTRA_ROWS);
    var rowNumbersToRemove = [];
    var rows = trackingSheet.getDataRows();
    for (var i = 0; i < rows.length; i++) {
      var row = rows[i];
      row.setDataValidation(TrackingSheet.COLUMNS.PRIORITY, TrackingSheet.PRIORITIES);
      if (!row.getValue(TrackingSheet.COLUMNS.ITEM)) {
        continue;
      }
      if (!row.getValue(TrackingSheet.COLUMNS.THREAD_ID)) {
        row.setDataValidation(TrackingSheet.COLUMNS.ACTION, TrackingSheet.NON_GMAIL_ACTIONS);
      }
      if (!row.getValue(TrackingSheet.COLUMNS.UUID)) {
        row.setValue(TrackingSheet.COLUMNS.UUID, Utilities.getUuid());
      }
      var fullCaseAction = row.getValue(TrackingSheet.COLUMNS.ACTION);
      var action = fullCaseAction.toLowerCase();
      if (action === 'completed') {
        if (!row.getValue(TrackingSheet.COLUMNS.THREAD_ID)) {
          rowNumbersToRemove.push(row.getRowNumber());
        }
      } else if (action) {
        row.setValue(TrackingSheet.COLUMNS.SCRIPT_NOTES, 'Unknown Action: ' + action);
      }
    }
    trackingSheet.removeRowNumbers(rowNumbersToRemove);
    trackingSheet.sortBy(TrackingSheet.COLUMNS.EMAIL_LAST_DATE).sortBy(TrackingSheet.COLUMNS.INBOX, false).sortBy(TrackingSheet.COLUMNS.PRIORITY);
    taskSync.syncToTasks(trackingSheet);
    return 'Organized ' + trackingSheet.getSheetName();
  }
  
  Organize.organize = function(sheetId) {
    return Organize.organizeSheet(TrackingSheet.forSheetId(sheetId));
  }
}