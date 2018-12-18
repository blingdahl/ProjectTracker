function doGet(e) {
  Log.start('doGet', [e]);
  TrackingSheet.init();
  Preferences.init();
  var template = HtmlService.createTemplateFromFile('ui/WebAppUi');
  template.spreadsheetUrl = Preferences.getSpreadsheetUrl();
  Spreadsheet.setSpreadsheetUrl(template.spreadsheetUrl);
  if (template.spreadsheetUrl) {
    template.sheets = [];
    TrackingSheet.getAll().forEach(function(trackingSheet) {
      template.sheets.push(Preferences.getPreferencesForSheet(trackingSheet.getSheetId()));
    });
  }
  var ret = template.evaluate().setWidth(400).setTitle('Project Tracker');
  Log.stop('doGet', [e]);
  return ret;
}
