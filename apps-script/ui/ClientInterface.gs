function Preferences_setLabelNameForSheet(spreadsheetUrl, sheetId, labelName, maxThreads) {
  Log.start('Preferences_setLabelNameForSheet', [spreadsheetUrl, sheetId, labelName, maxThreads]);
  Preferences.init();
  Spreadsheet.setSpreadsheetUrl(spreadsheetUrl);
  Preferences.Properties.set(Preferences.Names.labelName(sheetId), labelName);
  Preferences.Properties.set(Preferences.Names.maxThreads(sheetId), maxThreads);
  Log.stop('Preferences_setLabelNameForSheet', [spreadsheetUrl, sheetId, labelName, maxThreads]);
  return 'Set label';
}

function Preferences_clearLabelNameForSheet(spreadsheetUrl, sheetId) {
  Log.start('Preferences_clearLabelNameForSheet', [spreadsheetUrl, sheetId]);
  Preferences.init();
  Spreadsheet.setSpreadsheetUrl(spreadsheetUrl);
  Preferences.Properties.clear(Preferences.labelName(sheetId));
  Log.stop('Preferences_clearLabelNameForSheet', [spreadsheetUrl, sheetId]);
}

function Preferences_setTrackedForSheet(spreadsheetUrl, sheetId, tracked) {
  Log.start('Preferences_setTrackedForSheet', [spreadsheetUrl, sheetId, tracked]);
  Preferences.init();
  Spreadsheet.setSpreadsheetUrl(spreadsheetUrl);
  Preferences.Properties.set(Preferences.Names.tracked(sheetId), tracked);
  Log.stop('Preferences_setTrackedForSheet', [spreadsheetUrl, sheetId, tracked]);
  return tracked ? 'Added tracking' : 'Removed tracking';
}

function Action_setAction(spreadsheetUrl, sheetId, uuid, action) {
  Log.start('Action_setAction', [spreadsheetUrl, sheetId, uuid, action]);
  Action.init();
  Spreadsheet.setSpreadsheetUrl(spreadsheetUrl);
  var ret = Action.setAction(sheetId, uuid, action);
  Log.stop('Action_setAction', [spreadsheetUrl, sheetId, uuid, action]);
  return ret;
}


function AddUrl_addUrl(spreadsheetUrl, sheetId, url) {
  Log.start('AddUrl_addUrl', [spreadsheetUrl, sheetId, url]);
  AddUrl.init();
  Spreadsheet.setSpreadsheetUrl(spreadsheetUrl);
  var ret = AddUrl.addUrl(sheetId, url);
  Log.stop('AddUrl_addUrl', [spreadsheetUrl, sheetId, url]);
  return ret;
}

function Gmail_syncSheetWithGmail(spreadsheetUrl, sheetId) {
  Log.start('Gmail_syncSheetWithGmail', [spreadsheetUrl, sheetId]);
  Gmail.init();
  Spreadsheet.setSpreadsheetUrl(spreadsheetUrl);
  var ret = Gmail.syncSheet(sheetId);
  Log.stop('Gmail_syncSheetWithGmail', [spreadsheetUrl, sheetId]);
  return ret;
}

function Gmail_renameLabel(spreadsheetUrl, sheetId, toLabelName) {
  Log.start('Gmail_renameLabel', [spreadsheetUrl, sheetId, toLabelName]);
  Gmail.init();
  Spreadsheet.setSpreadsheetUrl(spreadsheetUrl);
  Gmail.renameLabel(sheetId, toLabelName);
  Log.stop('Gmail_renameLabel', [spreadsheetUrl, sheetId, toLabelName]);
}

function Label_getAllLabels() {
  Log.start('Label_getAllLabels', []);
  Label.init();
  var ret = JSON.stringify(Label.getAllLabelNames());
  Log.stop('Label_getAllLabels', []);
  return ret;
}

function Organize_organize(spreadsheetUrl, sheetId) {
  Log.start('Organize_organize', [spreadsheetUrl, sheetId]);
  Organize.init();
  Spreadsheet.setSpreadsheetUrl(spreadsheetUrl);
  var ret = Organize.organize(sheetId);
  Log.stop('Organize_organize', [spreadsheetUrl, sheetId]);
  return ret;
}

function Overview_getOverviewRows(spreadsheetUrl, priorities) {
  Log.start('Overview_getOverviewRows', [spreadsheetUrl, priorities]);
  Overview.init();
  Spreadsheet.setSpreadsheetUrl(spreadsheetUrl);
  var trackingRows = Overview.getTrackingRowsForPriorities(priorities);
  var objectRows = [];
  trackingRows.forEach(function(trackingRow) {
    objectRows.push(trackingRow.toObject());
  });
  Log.stop('Overview_getOverviewRows', [spreadsheetUrl, priorities]);
  return JSON.stringify(objectRows);
}

function TidyUpColumns_tidyUpColumns(spreadsheetUrl, sheetId) {
  Log.start('TidyUpColumns_tidyUpColumns', [spreadsheetUrl, sheetId]);
  TidyUpColumns.init();
  Spreadsheet.setSpreadsheetUrl(spreadsheetUrl);
  var ret = TidyUpColumns.tidyUp(sheetId);
  Log.stop('TidyUpColumns_tidyUpColumns', [spreadsheetUrl, sheetId]);
  return ret;
}

function Preferences_updateScriptPreferences(spreadsheetUrl, appTitle, scriptUrl) {
  Log.start('Preferences_updateScriptPreferences', [spreadsheetUrl, appTitle, scriptUrl]);
  Preferences.init();
  Spreadsheet.init();
  Spreadsheet.setSpreadsheetUrl(spreadsheetUrl);
  Preferences.Properties.set(Preferences.Names.spreadsheetUrl(), spreadsheetUrl);
  Preferences.Properties.set(Preferences.Names.appTitle(), appTitle);
  Preferences.Properties.set(Preferences.Names.scriptUrl(), scriptUrl);
  Log.stop('Preferences_updateScriptPreferences', [spreadsheetUrl, appTitle, scriptUrl]);
  return 'Updated preferences';
}