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
  
  Overview.getTrackingRowsByPriority = function() {
    Log.start('Overview.getTrackingRowsByPriority', []);
    var rowsByPriority = {};
    var trackingSheets = TrackingSheet.getAll();
    trackingSheets.forEach(function(trackingSheet) {
      var rowsByPriorityFromSheet = trackingSheet.getRowsByPriority(trackingSheet);
      for (var priority in rowsByPriorityFromSheet) {
        if (!rowsByPriority[priority]) {
          rowsByPriority[priority] = [];
        }
        rowsByPriority[priority] = rowsByPriority[priority].concat(rowsByPriorityFromSheet[priority]);
      }
    });
    Log.stop('Overview.getTrackingRowsByPriority', []);
    return rowsByPriority;
  }
}