function Preferences_setLabelNameForSheet(spreadsheetUrl, sheetId, label, maxThreads) {
  Log.start('setLabelNameForSheet', [spreadsheetUrl, sheetId, label, maxThreads]);
  Preferences.init();
  Spreadsheet.setSpreadsheetUrl(spreadsheetUrl);
  Preferences.setLabelNameForSheet(sheetId, label);
  Preferences.setMaxThreadsForSheet(sheetId, maxThreads);
  Log.stop('setLabelNameForSheet', [spreadsheetUrl, sheetId, label, maxThreads]);
  return 'Set label';
}

function Preferences_clearLabelNameForSheet(spreadsheetUrl, sheetId) {
  Log.start('clearLabelNameForSheet', [spreadsheetUrl, sheetId]);
  Preferences.init();
  Spreadsheet.setSpreadsheetUrl(spreadsheetUrl);
  Preferences.clearLabelNameForSheet(sheetId);
  Log.stop('clearLabelNameForSheet', [spreadsheetUrl, sheetId]);
}

function Preferences_setTrackedForSheet(spreadsheetUrl, sheetId, tracked) {
  Log.start('setTrackedForSheet', [spreadsheetUrl, sheetId, tracked]);
  Preferences.init();
  Spreadsheet.setSpreadsheetUrl(spreadsheetUrl);
  Preferences.setTrackedForSheet(sheetId, tracked);
  Log.stop('setTrackedForSheet', [spreadsheetUrl, sheetId, tracked]);
  return tracked ? 'Added tracking' : 'Removed tracking';
}

function Action_setAction(spreadsheetUrl, sheetId, uuid, action) {
  Log.start('setAction', [spreadsheetUrl, sheetId, uuid, action]);
  Action.init();
  Spreadsheet.setSpreadsheetUrl(spreadsheetUrl);
  var ret = Action.setAction(sheetId, uuid, action);
  Log.stop('setAction', [spreadsheetUrl, sheetId, uuid, action]);
  return ret;
}


function AddUrl_addUrl(spreadsheetUrl, sheetId, url) {
  AddUrl.init();
  Spreadsheet.setSpreadsheetUrl(spreadsheetUrl);
  return AddUrl.addUrl(sheetId, url);
}

function Gmail_syncSheetWithGmail(spreadsheetUrl, sheetId) {
  Log.start('syncSheetWithGmail', [sheetId]);
  Gmail.init();
  Log.info('inSyncWithGmail: ' + spreadsheetUrl);
  Spreadsheet.setSpreadsheetUrl(spreadsheetUrl);
  var ret = Gmail.syncSheet(sheetId);
  Log.stop('syncSheetWithGmail', [sheetId]);
  return ret;
}

function Gmail_renameLabel(spreadsheetUrl, sheetId, toLabelName) {
  Log.start('renameLabel', [spreadsheetUrl, sheetId, toLabelName]);
  Gmail.init();
  Spreadsheet.setSpreadsheetUrl(spreadsheetUrl);
  Gmail.renameLabel(sheetId, toLabelName);
  Log.stop('renameLabel', [spreadsheetUrl, sheetId, toLabelName]);
}

function Label_getAllLabels() {
  Log.start('getAllLabels', []);
  Label.init();
  var ret = JSON.stringify(Label.getAllLabelNames());
  Log.stop('getAllLabels', []);
  return ret;
}

function Organize_organize(spreadsheetUrl, sheetId) {
  Log.start('organize', [spreadsheetUrl, sheetId]);
  Organize.init();
  Spreadsheet.setSpreadsheetUrl(spreadsheetUrl);
  var ret = Organize.organize(sheetId);
  Log.stop('organize', [spreadsheetUrl, sheetId]);
  return ret;
}

function Overview_getOverviewRows(spreadsheetUrl, priorities) {
  Overview.init();
  Spreadsheet.setSpreadsheetUrl(spreadsheetUrl);
  var trackingRows = Overview.getTrackingRowsForPriorities(priorities);
  var objectRows = [];
  trackingRows.forEach(function(trackingRow) {
    objectRows.push(trackingRow.toObject());
  });
  return JSON.stringify(objectRows);
}

function TidyUpColumns_tidyUpColumns(spreadsheetUrl, sheetId) {
  Log.start('tidyUpColumns', [spreadsheetUrl, sheetId]);
  TidyUpColumns.init();
  Spreadsheet.setSpreadsheetUrl(spreadsheetUrl);
  var ret = TidyUpColumns.tidyUp(sheetId);
  Log.stop('tidyUpColumns', [spreadsheetUrl, sheetId]);
  return ret;
}
