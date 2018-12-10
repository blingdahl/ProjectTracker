function showPreferencesSidebar() {
  var template = HtmlService.createTemplateFromFile('ui/SheetPreferences');
  var sheet = SpreadsheetApp.getActiveSheet();
  var sheetId = sheet.getSheetId();
  template.sheetName = sheet.getName();
  template.sheetId = sheetId;
  template.label = getLabelForSheet(sheetId);
  template.isTracked = getTrackedForSheet(sheetId) ? 'true' : 'false';
  SpreadsheetApp.getUi().showSidebar(template.evaluate().setTitle('Preferences'));
}