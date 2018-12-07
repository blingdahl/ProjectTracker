function showPreferencesSidebar() {
  let template = HtmlService.createTemplateFromFile('SheetPreferences');
  let sheet = SpreadsheetApp.getActiveSheet();
  template.sheetName = sheet.getName();
  template.sheetId = sheet.getSheetId();
  SpreadsheetApp.getUi().showSidebar(template.evaluate().setTitle('Preferences'));
}