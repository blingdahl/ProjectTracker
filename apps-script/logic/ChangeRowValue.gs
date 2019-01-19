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
  
  ChangeRowValue.setLink = function(sheetId, uuid, columnName, columnKey, url) {
    var linkText = UrlFetcher.getTitleForUrl(url);
    TrackingSheet.forSheetId(sheetId).getRowForUuid(uuid).setFormula(TrackingSheet.COLUMNS[columnKey], Spreadsheet.hyperlinkFormula(url, linkText || 'Link'));
    return 'Set ' + columnName + ' URL';
  }
  
  ChangeRowValue.changeSheet = function(fromSheetId, toSheetId, uuid) {
    return Update.changeSheet(fromSheetId, toSheetId, uuid);
  }
}
