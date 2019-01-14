var AddItem = {};
AddItem.initialized = false;

AddItem.init = function() {
  if (AddItem.initialized) {
    return;
  }
  
  TrackingSheet.init();
  AddItem.initialized = true;
  
  Log.info('AddUrl.init()');
  
  AddItem.addItem = function(sheetId, title, url, priority) {
    var trackingSheet = TrackingSheet.forSheetId(sheetId);
    var newRow = trackingSheet.addRow();
    newRow.setValue(TrackingSheet.COLUMNS.ITEM, title);
    if (url) {
      newRow.setFormula(TrackingSheet.COLUMNS.LINK, Spreadsheet.hyperlinkFormula(url, 'Link'));
    }
    if (priority) {
      newRow.setValue(TrackingSheet.COLUMNS.PRIORITY, priority);
    }
    return 'Added "' + title + '" to ' + trackingSheet.getSheetName() + ' sheet';
  }
  
  AddItem.getPageTitle = function(url) {
    var docName = Docs.getName(url);
    if (docName) {
      return docName;
    }
    var content = UrlFetchApp.fetch(url).getContentText();
    var xmldoc = Xml.parse(content, true);
    return xmldoc.html.head.getElements("title")[0].getText().replace(/\s+/g, ' ');
  }
}