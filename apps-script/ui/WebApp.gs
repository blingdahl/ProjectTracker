function doGet(e) {
  Log.start('doGet', [e]);
  TrackingSheet.init();
  Preferences.init();
  var template = HtmlService.createTemplateFromFile('ui/WebAppUi');
  template.spreadsheetUrl = Preferences.Properties.get(Preferences.Names.spreadsheetUrl());
  template.appTitle = Preferences.Properties.get(Preferences.Names.appTitle(), 'Project Tracker');
  template.scriptUrl = Preferences.Properties.get(Preferences.Names.scriptUrl(), '');
  Spreadsheet.setSpreadsheetUrl(template.spreadsheetUrl);
  var output = template.evaluate().setWidth(800).setTitle(template.appTitle);
  output.addMetaTag('viewport', 'width=device-width, initial-scale=1');
  Log.stop('doGet', [e]);
  return output;
}
