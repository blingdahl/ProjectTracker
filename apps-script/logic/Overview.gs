var Overview = {};
Overview.initialized = false;

Overview.init = function() {
  if (Overview.initialized) {
    return;
  }
  
  TrackingSheet.init();
  Log.info('Overview.init()');
  
  Overview.initialized = true;
  
  Overview.getRows = function() {
    Log.start('Overview.getRows', []);
    var rows = [];
    var trackingSheets = TrackingSheet.getAll();
    trackingSheets.forEach(function(trackingSheet) {
      rows = rows.concat(trackingSheet.getDataRows());
    });
    Log.stop('Overview.getRows', []);
    return rows;
  }
  
  Overview.getRowsForSheetId = function(sheetId) {
    Log.start('Overview.getRows', []);
    var rows = TrackingSheet.forSheetId(sheetId).getDataRows();
    Log.stop('Overview.getRows', []);
    return rows;
  }
}
