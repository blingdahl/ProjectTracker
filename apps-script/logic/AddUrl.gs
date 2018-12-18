var AddUrl = {};
AddUrl.initialized = false;

AddUrl.init = function() {
  if (AddUrl.initialized) {
    return;
  }
  
  TrackingSheet.init();
  Organize.init();
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
    Organize.organizeSheet(trackingSheet);
    return 'Added "' + title + '" to ' + trackingSheet.getSheetName() + ' sheet';
  }
}

function addUrl(spreadsheetUrl, sheetId, url) {
  AddUrl.init();
  Spreadsheet.setSpreadsheetUrl(spreadsheetUrl);
  return AddUrl.addUrl(sheetId, url);
}