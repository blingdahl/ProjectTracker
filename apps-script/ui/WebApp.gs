function doGet(e) {
  Log.start('doGet', [e]);
  TrackingSheet.init();
  Preferences.init();
  var template = HtmlService.createTemplateFromFile('ui/WebAppUi');
  template.spreadsheetUrl = Preferences.getSpreadsheetUrl();
  Spreadsheet.setSpreadsheetUrl(template.spreadsheetUrl);
  var ret = template.evaluate().setWidth(800).setTitle('Project Tracker');
  Log.stop('doGet', [e]);
  return ret;
}
