var AddUrl = {};
AddUrl.initialized = false;

AddUrl.init = function() {
  if (AddUrl.initialized) {
    return;
  }
  
  TrackingSheet.init();
  AddUrl.initialized = true;
  
  Log.info('AddUrl.init()');
  
  AddUrl.addUrl = function(sheetId, url) {
    var content = UrlFetchApp.fetch(url).getContentText();
    var xmldoc = Xml.parse(content, true);
    var title = xmldoc.html.head.getElements("title")[0].getText().replace(/\s+/g, ' ');
    var trackingSheet = TrackingSheet.forSheetId(sheetId);
    var newRow = trackingSheet.addRow();
    newRow.setValue(TrackingSheet.COLUMNS.ITEM, title);
    newRow.setFormula(TrackingSheet.COLUMNS.LINK, Spreadsheet.hyperlinkFormula(url, 'Link'));
    return 'Added "' + title + '" to ' + trackingSheet.getSheetName() + ' sheet';
  }
}

function addUrl(sheetId, url) {
  AddUrl.init();
  return AddUrl.addUrl(sheetId, url);
}