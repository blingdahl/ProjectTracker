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

function ChangeRowValue_setAction(spreadsheetUrl, sheetId, uuid, action) {
  Log.start('ChangeRowValue_setAction', [spreadsheetUrl, sheetId, uuid, action]);
  ChangeRowValue.init();
  Spreadsheet.setSpreadsheetUrl(spreadsheetUrl);
  var ret = ChangeRowValue.setAction(sheetId, uuid, action);
  Log.stop('ChangeRowValue_setAction', [spreadsheetUrl, sheetId, uuid, action]);
  return ret;
}

function ChangeRowValue_setPriority(spreadsheetUrl, sheetId, uuid, priority) {
  Log.start('ChangeRowValue_setPriority', [spreadsheetUrl, sheetId, uuid, priority]);
  ChangeRowValue.init();
  Spreadsheet.setSpreadsheetUrl(spreadsheetUrl);
  var ret = ChangeRowValue.setPriority(sheetId, uuid, priority);
  Log.stop('ChangeRowValue_setPriority', [spreadsheetUrl, sheetId, uuid, priority]);
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

function Update_update(spreadsheetUrl, sheetId) {
  Log.start('Update_update', [spreadsheetUrl, sheetId]);
  Update.init();
  Spreadsheet.setSpreadsheetUrl(spreadsheetUrl);
  var ret = Update.update(sheetId);
  Log.stop('Update_update', [spreadsheetUrl, sheetId]);
  return ret;
}

function Label_getAllLabels() {
  Log.start('Label_getAllLabels', []);
  GmailLabel.init();
  var ret = JSON.stringify(Label.getAllLabelNames());
  Log.stop('Label_getAllLabels', []);
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