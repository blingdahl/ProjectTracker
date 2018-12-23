var Action = {};
Action.initialized = false;

Action.init = function() {
  if (Action.initialized) {
    return;
  }
  
  TrackingSheet.init();
  Log.info('Overview.init()');
  
  Action.initialized = true;
  
  Action.setAction = function(sheetId, uuid, action) {
    TrackingSheet.forSheetId(sheetId).getRowForUuid(uuid).setValue(TrackingSheet.COLUMNS.ACTION, action);
    return 'Set action to ' + action;
  }
}

function setAction(spreadsheetUrl, sheetId, uuid, action) {
  Log.start('setAction', [spreadsheetUrl, sheetId, uuid, action]);
  Action.init();
  Spreadsheet.setSpreadsheetUrl(spreadsheetUrl);
  var ret = Action.setAction(sheetId, uuid, action);
  Log.stop('setAction', [spreadsheetUrl, sheetId, uuid, action]);
  return ret;
}