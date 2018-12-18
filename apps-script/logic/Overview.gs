var Overview = {};
Overview.initialized = false;

Overview.init = function() {
  if (Overview.initialized) {
    return;
  }
  
  OverviewSheet.init();
  Log.info('Overview.init()');
  
  Overview.initialized = true;
  
  Overview.update = function() {
    Log.info('Overview.update()');
    var overviewSheet = OverviewSheet.get();
    overviewSheet.clearData();
    var trackingSheets = TrackingSheet.getAll();
    // TODO(lindahl) Collapse
    trackingSheets.forEach(function(trackingSheet) {
      if (trackingSheet.getSheetId() === overviewSheet.getSheetId()) {
        return;
      }
      Log.info('Adding P0 from ' + trackingSheet.getSheetName());
      overviewSheet.addRowsFromTrackingSheet(trackingSheet, 'P0');
    });
    trackingSheets.forEach(function(trackingSheet) {
      if (trackingSheet.getSheetId() === overviewSheet.getSheetId()) {
        return;
      }
      Log.info('Adding P1 from ' + trackingSheet.getSheetName());
      overviewSheet.addRowsFromTrackingSheet(trackingSheet, 'P1');
    });
    var numRows = overviewSheet.getDataRows().slice(-1)[0].getRowNumber();
    overviewSheet.setNumRows(numRows + Overview.EXTRA_ROWS);
    Log.info('Updated overview');
  }
  
  Overview.EXTRA_ROWS = 0;
}

function updateOverview(spreadsheetUrl) {
  Log.start('updateOverview', []);
  Overview.init();
  Spreadsheet.setSpreadsheetUrl(spreadsheetUrl);
  Overview.update();
  Log.start('updateOverview', []);
  return 'Updated overview';
}
