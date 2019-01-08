function renderControls(spreadsheetUrl) {
  SheetInfo.init();
  var template = HtmlService.createTemplateFromFile('ui/ControlsUi');
  Spreadsheet.setSpreadsheetUrl(spreadsheetUrl);
  template.spreadsheetUrl = spreadsheetUrl;
  template.trackedSheets = [];
  template.untrackedSheets = [];
  var sheets = Spreadsheet.getSpreadsheet().getNativeSheets();
  sheets.forEach(function(sheet) {
    if (sheet.getSheetName() == 'Overview') {
      Log.fine('Not including Overview');
      return;
    }
    if (Preferences.Properties.get(Preferences.Names.tracked(sheet.getSheetId()))) {
      template.trackedSheets.push(SheetInfo.getInfoForSheet(sheet.getSheetId()));
    } else {
      template.untrackedSheets.push({'sheetName': sheet.getSheetName(), 'sheetId': sheet.getSheetId()});
    }
  });
  return template.evaluate().getContent();
}
