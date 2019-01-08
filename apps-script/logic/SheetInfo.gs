var SheetInfo = {};
SheetInfo.initialized = false;

SheetInfo.init = function() {
  if (SheetInfo.initialized) {
    return;
  }
  
  Preferences.init();
  Label.init();
  Log.info('SheetInfo.init()');
  
  SheetInfo.initialized = true;

  SheetInfo.getInfoForSheet = function(sheetId) {
    Log.start('getInfoForSheet', [sheetId]);
    Log.info(Preferences.Properties.get(Preferences.Names.labelName(sheetId)));
    var labelName = Preferences.Properties.get(Preferences.Names.labelName(sheetId));
    var ret = {'sheetId': sheetId,
               'sheetName': Spreadsheet.getSpreadsheet().getNativeSheet(sheetId).getName(),
               'labelName': labelName,
               'isTracked': Preferences.Properties.get(Preferences.Names.tracked(sheetId)),
               'maxThreads': Preferences.Properties.get(Preferences.Names.maxThreads(sheetId)),
               'searchQuery': Label.searchQuery(labelName)};
    Log.stop('getInfoForSheet', [sheetId]);
    return ret;
  }
}