function showPreferencesSidebar() {
  logStart('showPreferencesSidebar', []);
  Gmail.init();
  Tracking.init();
  var template = HtmlService.createTemplateFromFile('ui/Controls');
  var sheet = SpreadsheetApp.getActiveSheet();
  var sheetId = sheet.getSheetId();
  template.preferences = Preferences.getPreferencesForSheet(sheetId)
  SpreadsheetApp.getUi().showSidebar(template.evaluate().setTitle('Project Tracker'));
  logStop('showPreferencesSidebar', []);
}

function getPreferencesForSheet(sheetId) {
  logStart('getPreferencesForSheet', []);
  Gmail.init();
  Tracking.init();
  var ret = JSON.stringify(Preferences.getPreferencesForSheet(sheetId)); 
  logStop('getPreferencesForSheet', []);
  return ret;
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename)
      .getContent();
}