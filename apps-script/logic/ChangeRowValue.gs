var ChangeRowValue = {};
ChangeRowValue.initialized = false;

ChangeRowValue.init = function() {
  if (ChangeRowValue.initialized) {
    return;
  }
  
  TrackingSheet.init();
  Update.init();
  Log.info('ChangeRowValue.init()');
  
  ChangeRowValue.initialized = true;
  
  ChangeRowValue.setValue = function(sheetId, uuid, columnName, columnKey, newValue) {
    TrackingSheet.forSheetId(sheetId).getRowForUuid(uuid).setValue(TrackingSheet.COLUMNS[columnKey], newValue);
    return 'Set ' + columnName + ' to ' + newValue;
  }
  
  ChangeRowValue.changeSheet = function(fromSheetId, toSheetId, uuid) {
    return Update.changeSheet(fromSheetId, toSheetId, uuid);
  }
}
