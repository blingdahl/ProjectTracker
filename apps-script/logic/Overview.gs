var Overview = {};
Overview.initialized = false;

Overview.init = function() {
  if (Overview.initialized) {
    return;
  }
  
  OverviewSheet.init();
  log(Log.Level.INFO, 'Overview.init()');
  
  Overview.initialized = true;
  
  Overview.update = function() {
    log(Log.Level.INFO, 'Overview.update()');
    var overviewSheet = OverviewSheet.get();
    overviewSheet.clearData();
    var trackingSheets = TrackingSheet.getAll();
    trackingSheets.forEach(function(trackingSheet) {
      if (trackingSheet.getSheetId() === overviewSheet.getSheetId()) {
        return;
      }
      log(Log.Level.INFO, 'Adding P0 from ' + trackingSheet.getSheetName());
      overviewSheet.addRowsFromTrackingSheet(trackingSheet, 'P0');
    });
    trackingSheets.forEach(function(trackingSheet) {
      if (trackingSheet.getSheetId() === overviewSheet.getSheetId()) {
        return;
      }
      log(Log.Level.INFO, 'Adding P1 from ' + trackingSheet.getSheetName());
      overviewSheet.addRowsFromTrackingSheet(trackingSheet, 'P1');
    });
    log(Log.Level.INFO, 'Updated overview');
  }
}

function updateOverview() {
  logStart('updateOverview', []);
  Overview.init();
  Overview.update();
  logStart('updateOverview', []);
}
