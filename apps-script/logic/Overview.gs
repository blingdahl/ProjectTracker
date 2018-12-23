var Overview = {};
Overview.initialized = false;

Overview.init = function() {
  if (Overview.initialized) {
    return;
  }
  
  TrackingSheet.init();
  Log.info('Overview.init()');
  
  Overview.initialized = true;
  
  Overview.getRowsFromTrackingSheet = function(trackingSheet, priority) {
    Log.info('Getting ' + priority + ' from ' + trackingSheet.getSheetName());
    var rows = [];
    trackingSheet.getRowsForPriority(priority).forEach(function(trackingRow) {
      rows.push(trackingRow);
    });
    return rows;
  }
  
  Overview.getTrackingRowsForPriorities = function(priorities) {
    Log.start('Overview.getTrackingRowsForPriorities', [priorities]);
    var rows = [];
    var trackingSheets = TrackingSheet.getAll();
    for (var i = 0; i < priorities.length; i++) {
      var priority = priorities[i];
      trackingSheets.forEach(function(trackingSheet) {
        rows = rows.concat(Overview.getRowsFromTrackingSheet(trackingSheet, priority));
      });
    }
    Log.stop('Overview.getTrackingRowsForPriorities', [priorities]);
    return rows;
  }
}

function getOverviewRows(spreadsheetUrl, priorities) {
  Overview.init();
  Spreadsheet.setSpreadsheetUrl(spreadsheetUrl);
  var trackingRows = Overview.getTrackingRowsForPriorities(priorities);
  var objectRows = [];
  trackingRows.forEach(function(trackingRow) {
    objectRows.push(trackingRow.toObject());
  });
  return JSON.stringify(objectRows);
}