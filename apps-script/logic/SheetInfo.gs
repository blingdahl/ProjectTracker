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
    Log.info(Preferences.getLabelNameForSheet(sheetId));
    var labelName = Preferences.getLabelNameForSheet(sheetId);
    var ret = {'sheetId': sheetId,
               'sheetName': Spreadsheet.getSpreadsheet().getNativeSheet(sheetId).getName(),
               'labelName': labelName,
               'isTracked': Preferences.getTrackedForSheet(sheetId),
               'maxThreads': Preferences.getMaxThreadsForSheet(sheetId),
               'searchQuery': Label.searchQuery(labelName)};
    Log.stop('getInfoForSheet', [sheetId]);
    return ret;
  }
}