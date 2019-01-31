var AddItem = {};
AddItem.initialized = false;

AddItem.init = function() {
  if (AddItem.initialized) {
    return;
  }
  
  UrlFetcher.init();
  TrackingSheet.init();
  AddItem.initialized = true;
  
  Log.info('AddUrl.init()');
  
  AddItem.addItem = function(sheetId, title, url, priority, nextActionDate, nextActionDateUpdated) {
    var trackingSheet = TrackingSheet.forSheetId(sheetId);
    var newRow = trackingSheet.addRow();
    newRow.setValue(TrackingSheet.COLUMNS.ITEM, title);
    if (url) {
      newRow.setFormula(TrackingSheet.COLUMNS.LINK, Spreadsheet.hyperlinkFormula(url, UrlFetcher.getTitleForUrl(url)));
    }
    if (priority) {
      newRow.setValue(TrackingSheet.COLUMNS.PRIORITY, priority);
    }
    if (nextActionDate) {
      newRow.setValue(TrackingSheet.COLUMNS.NEXT_ACTION_DATE, nextActionDate);
      newRow.setValue(TrackingSheet.COLUMNS.NEXT_ACTION_DATE_UPDATED, nextActionDateUpdated);
    }
    return 'Added "' + title + '" to ' + trackingSheet.getSheetName() + ' sheet';
  }
}
