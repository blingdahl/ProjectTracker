function doGet(e) {
  Log.start('doGet', [e]);
  TrackingSheet.init();
  Preferences.init();
  var template = HtmlService.createTemplateFromFile('ui/WebAppUi');
  template.spreadsheetUrl = Preferences.getSpreadsheetUrl();
  Spreadsheet.setSpreadsheetUrl(template.spreadsheetUrl);
  var output = template.evaluate().setWidth(800).setTitle('Project Tracker');
  output.addMetaTag('viewport', 'width=device-width, initial-scale=1');
  Log.stop('doGet', [e]);
  return output;
}
