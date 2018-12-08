function showPreferencesSidebar() {
  var template = HtmlService.createTemplateFromFile('SheetPreferences');
  var sheet = SpreadsheetApp.getActiveSheet();
  template.sheetName = sheet.getName();
  template.sheetId = sheet.getSheetId();
  SpreadsheetApp.getUi().showSidebar(template.evaluate().setTitle('Preferences'));
}