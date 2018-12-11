function showPreferencesSidebar() {
  Gmail.init();
  Tracking.init();
  var template = HtmlService.createTemplateFromFile('ui/Controls');
  var sheet = SpreadsheetApp.getActiveSheet();
  var sheetId = sheet.getSheetId();
  template.sheetName = sheet.getName();
  template.sheetId = sheetId;
  template.label = Gmail.getLabelForSheet(sheetId);
  template.isTracked = Tracking.getTrackedForSheet(sheetId);
  SpreadsheetApp.getUi().showSidebar(template.evaluate().setTitle('Preferences'));
}

function getPreferencesForSheet(sheetId) {
  Gmail.init();
  Tracking.init();
  return JSON.stringify({'sheetName': Spreadsheet.getNativeSheet(sheetId).getName(),
                         'label': Gmail.getLabelForSheet(sheetId),
                         'isTracked': Tracking.getTrackedForSheet(sheetId)}); 
}