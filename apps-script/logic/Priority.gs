var Priority = {};
Priority.initialized = false;

Priority.init = function() {
  if (Priority.initialized) {
    return;
  }
  
  TrackingSheet.init();
  Log.info('Priority.init()');
  
  Priority.initialized = true;
  
  Priority.setPriority = function(sheetId, uuid, priority) {
    TrackingSheet.forSheetId(sheetId).getRowForUuid(uuid).setValue(TrackingSheet.COLUMNS.PRIORITY, priority);
    return 'Set priority to ' + priority;
  }
}
