var Organize = {};
Organize.initialized = false;

Organize.EXTRA_ROWS = 10;

Organize.init = function() {
  if (Organize.initialized) {
    return;
  }

  TrackingSheet.init();
  Log.info('Organize.init()');

  Organize.initialized = true;

  Organize.organizeSheet = function(trackingSheet) {
    var dataRows = trackingSheet.getDataRows();
    trackingSheet.setNumBlankRows(Organize.EXTRA_ROWS);
    var rowNumbersToRemove = [];
    var rows = trackingSheet.getAllRows();
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
      Log.info('Action: ' + fullCaseAction);
      if (action === 'completed') {
        if (row.getValue(TrackingSheet.COLUMNS.THREAD_ID)) {
          row.setValue(TrackingSheet.COLUMNS.SCRIPT_NOTES, 'Cannot mark threads "Completed"');
        } else {
          rowNumbersToRemove.push(row.getRowNumber());
        }
      } else if (action) {
        row.setValue(TrackingSheet.COLUMNS.SCRIPT_NOTES, 'Unknown Action: ' + action);
      }
    }
    trackingSheet.removeRowNumbers(rowNumbersToRemove);
    trackingSheet.sortBy(TrackingSheet.COLUMNS.EMAIL_LAST_DATE).sortBy(TrackingSheet.COLUMNS.INBOX, false).sortBy(TrackingSheet.COLUMNS.PRIORITY);
    return 'Organized ' + trackingSheet.getSheetName();
  }
  
  Organize.organize = function(sheetId) {
    return Organize.organizeSheet(TrackingSheet.forSheetId(sheetId));
  }
}

function organize(spreadsheetUrl, sheetId) {
  Log.start('organize', [spreadsheetUrl, sheetId]);
  Organize.init();
  Spreadsheet.setSpreadsheetUrl(spreadsheetUrl);
  var ret = Organize.organize(sheetId);
  Log.stop('organize', [spreadsheetUrl, sheetId]);
  return ret;
}