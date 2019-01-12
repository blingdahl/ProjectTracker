var ChangeRowValue = {};
ChangeRowValue.initialized = false;

ChangeRowValue.init = function() {
  if (ChangeRowValue.initialized) {
    return;
  }
  
  TrackingSheet.init();
  Log.info('ChangeRowValue.init()');
  
  ChangeRowValue.initialized = true;
  
  ChangeRowValue.setAction = function(sheetId, uuid, action) {
    TrackingSheet.forSheetId(sheetId).getRowForUuid(uuid).setValue(TrackingSheet.COLUMNS.ACTION, action);
    return 'Set action to ' + action;
  }
  
  ChangeRowValue.setPriority = function(sheetId, uuid, priority) {
    TrackingSheet.forSheetId(sheetId).getRowForUuid(uuid).setValue(TrackingSheet.COLUMNS.PRIORITY, priority);
    return 'Set priority to ' + priority;
  }
  
  ChangeRowValue.setStatus = function(sheetId, uuid, status) {
    TrackingSheet.forSheetId(sheetId).getRowForUuid(uuid).setValue(TrackingSheet.COLUMNS.STATUS, status);
    return 'Set status to ' + status;
  }
}