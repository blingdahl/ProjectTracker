var Action = {};
Action.initialized = false;

Action.init = function() {
  if (Action.initialized) {
    return;
  }
  
  TrackingSheet.init();
  Log.info('Action.init()');
  
  Action.initialized = true;
  
  Action.setAction = function(sheetId, uuid, action) {
    TrackingSheet.forSheetId(sheetId).getRowForUuid(uuid).setValue(TrackingSheet.COLUMNS.ACTION, action);
    return 'Set action to ' + action;
  }
}