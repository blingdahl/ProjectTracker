var ChangeRowValue = {};
ChangeRowValue.initialized = false;

ChangeRowValue.init = function() {
  if (ChangeRowValue.initialized) {
    return;
  }
  
  TrackingSheet.init();
  Update.init();
  UrlFetcher.init();
  Log.info('ChangeRowValue.init()');
  
  ChangeRowValue.initialized = true;
  
  ChangeRowValue.setValue = function(sheetId, uuid, columnName, columnKey, newValue) {
    TrackingSheet.forSheetId(sheetId).getRowForUuid(uuid).setValue(TrackingSheet.COLUMNS[columnKey], newValue);
    return 'Set ' + columnName + ' to ' + newValue;
  }
  
  ChangeRowValue.setLink = function(sheetId, uuid, columnName, columnKey, text, href) {
    TrackingSheet.forSheetId(sheetId).getRowForUuid(uuid).setFormula(TrackingSheet.COLUMNS[columnKey], Spreadsheet.hyperlinkFormula(href, text));
    return 'Set ' + columnName + ' link';
  }
  
  ChangeRowValue.clearLink = function(sheetId, uuid, columnName, columnKey) {
    TrackingSheet.forSheetId(sheetId).getRowForUuid(uuid).setFormula(TrackingSheet.COLUMNS[columnKey], '');
    return 'Cleared ' + columnName + ' link';
  }
  
  ChangeRowValue.changeSheet = function(fromSheetId, toSheetId, uuid) {
    return Update.changeSheet(fromSheetId, toSheetId, uuid);
  }
}
