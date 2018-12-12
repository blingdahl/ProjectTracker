function showPreferencesSidebar() {
  Gmail.init();
  Tracking.init();
  var template = HtmlService.createTemplateFromFile('ui/Controls');
  var sheet = SpreadsheetApp.getActiveSheet();
  var sheetId = sheet.getSheetId();
  template.preferences = getPreferencesForSheetObj(sheetId)
  SpreadsheetApp.getUi().showSidebar(template.evaluate().setTitle('Project Tracker'));
}

function getPreferencesForSheetObj(sheetId) {
  Gmail.init();
  Tracking.init();
  return {'sheetId': sheetId,
          'sheetName': Spreadsheet.getNativeSheet(sheetId).getName(),
          'label': Gmail.getLabelForSheet(sheetId),
          'isTracked': Tracking.getTrackedForSheet(sheetId),
          'maxThreads': Gmail.getMaxThreadsForSheet(sheetId)}; 
}

function getPreferencesForSheet(sheetId) {
  Gmail.init();
  Tracking.init();
  return JSON.stringify(getPreferencesForSheetObj(sheetId)); 
}