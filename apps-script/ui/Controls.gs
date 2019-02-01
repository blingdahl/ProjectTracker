function renderControls() {
  SheetInfo.init();
  TrackingSheet.init();
  var template = HtmlService.createTemplateFromFile('ui/ControlsUi');
  return template.evaluate().getContent();
}

function renderSheetList() {
  SheetInfo.init();
  TrackingSheet.init();
  var template = HtmlService.createTemplateFromFile('ui/SheetList');
  template.spreadsheetUrl = Preferences.Properties.get(Preferences.Names.spreadsheetUrl());
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
