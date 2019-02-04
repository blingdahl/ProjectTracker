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
  
  ChangeRowValue.setValue = function(sheetId, uuid, columnKey, newValue) {
    TrackingSheet.forSheetId(sheetId).getRowForUuid(uuid).setValue(TrackingSheet.COLUMNS[columnKey], newValue);
    return 'Set "' + columnKey.underscoreToCapsString() + '" to "' + newValue + '"';
  }
  
  ChangeRowValue.setValues = function(sheetId, uuid, valueMap) {
    var setValueStrings = [];
    var row = TrackingSheet.forSheetId(sheetId).getRowForUuid(uuid);
    for (var columnKey in valueMap) {
      row.setValue(TrackingSheet.COLUMNS[columnKey], valueMap[columnKey]);
      setValueStrings.push('"' + columnKey.underscoreToCapsString() + '" to "' + valueMap[columnKey] + '"');
    }
    return 'Set ' + setValueStrings.join(', ');
  }
  
  ChangeRowValue.setLink = function(sheetId, uuid, columnKey, text, href) {
    TrackingSheet.forSheetId(sheetId).getRowForUuid(uuid).setFormula(TrackingSheet.COLUMNS[columnKey], Spreadsheet.hyperlinkFormula(href, text));
    return 'Set "' + columnKey.underscoreToCapsString() + '"';
  }
  
  ChangeRowValue.clearLink = function(sheetId, uuid, columnKey) {
    TrackingSheet.forSheetId(sheetId).getRowForUuid(uuid).setFormula(TrackingSheet.COLUMNS[columnKey], '');
    return 'Cleared "' + columnKey.underscoreToCapsString() + '"';
  }
  
  ChangeRowValue.changeSheet = function(fromSheetId, toSheetId, uuid) {
    return Update.changeSheet(fromSheetId, toSheetId, uuid);
  }
}
