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
    Log.info('Updated overview');
  }
}

function updateOverview() {
  Log.start('updateOverview', []);
  Overview.init();
  Overview.update();
  Log.start('updateOverview', []);
}
