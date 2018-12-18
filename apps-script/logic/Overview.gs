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
    overviewSheet.setNumBlankRows(Overview.EXTRA_ROWS);
    overviewSheet.clearData();
    var trackingSheets = TrackingSheet.getAll();
    trackingSheets.forEach(function(trackingSheet) {
      overviewSheet.addRowsFromTrackingSheet(trackingSheet, 'P0');
    });
    trackingSheets.forEach(function(trackingSheet) {
      overviewSheet.addRowsFromTrackingSheet(trackingSheet, 'P1');
    });
    overviewSheet.setNumBlankRows(Overview.EXTRA_ROWS);
    Log.info('Updated overview');
  }
  
  Overview.EXTRA_ROWS = 5;
}

function updateOverview(spreadsheetUrl) {
  Log.start('updateOverview', []);
  Overview.init();
  Spreadsheet.setSpreadsheetUrl(spreadsheetUrl);
  Overview.update();
  Log.start('updateOverview', []);
  return 'Updated overview';
}
