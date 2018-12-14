function showPreferencesSidebar() {
  Log.start('showPreferencesSidebar', []);
  Gmail.init();
  Tracking.init();
  var template = HtmlService.createTemplateFromFile('ui/Controls');
  var sheet = SpreadsheetApp.getActiveSheet();
  var sheetId = sheet.getSheetId();
  template.preferences = Preferences.getPreferencesForSheet(sheetId)
  template.autoRefresh = Preferences.getAutoRefresh();
  SpreadsheetApp.getUi().showSidebar(template.evaluate().setTitle('Project Tracker'));
  Log.stop('showPreferencesSidebar', []);
}

function getPreferencesForSheet(sheetId) {
  Log.start('getPreferencesForSheet', []);
  Gmail.init();
  Tracking.init();
  var ret = JSON.stringify(Preferences.getPreferencesForSheet(sheetId)); 
  Log.stop('getPreferencesForSheet', []);
  return ret;
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename)
      .getContent();
}