function doGet(e) {
  Log.start('doGet', [e]);
  TrackingSheet.init();
  Preferences.init();
  var template = HtmlService.createTemplateFromFile('ui/WebAppUi');
  template.spreadsheetUrl = Preferences.Properties.get(Preferences.spreadsheetUrl());
  template.appTitle = Preferences.Properties.get(Preferences.appTitle());
  template.scriptUrl = Preferences.Properties.get(Preferences.scriptUrl());
  Spreadsheet.setSpreadsheetUrl(template.spreadsheetUrl);
  var output = template.evaluate().setWidth(800).setTitle('Project Tracker');
  output.addMetaTag('viewport', 'width=device-width, initial-scale=1');
  Log.stop('doGet', [e]);
  return output;
}
