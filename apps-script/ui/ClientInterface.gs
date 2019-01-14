function Preferences_setLabelNameForSheet(sheetId, labelName, maxThreads) {
  Log.start('Preferences_setLabelNameForSheet', [sheetId, labelName, maxThreads]);
  Preferences.init();
  Preferences.Properties.set(Preferences.Names.labelName(sheetId), labelName);
  Preferences.Properties.set(Preferences.Names.maxThreads(sheetId), maxThreads);
  Log.stop('Preferences_setLabelNameForSheet', [sheetId, labelName, maxThreads]);
  return 'Set label';
}

function Preferences_clearLabelNameForSheet(sheetId) {
  Log.start('Preferences_clearLabelNameForSheet', [sheetId]);
  Preferences.init();
  Preferences.Properties.clear(Preferences.labelName(sheetId));
  Log.stop('Preferences_clearLabelNameForSheet', [sheetId]);
}

function Preferences_setTrackedForSheet(sheetId, tracked) {
  Log.start('Preferences_setTrackedForSheet', [sheetId, tracked]);
  Preferences.init();
  Preferences.Properties.set(Preferences.Names.tracked(sheetId), tracked);
  Log.stop('Preferences_setTrackedForSheet', [sheetId, tracked]);
  return tracked ? 'Added tracking' : 'Removed tracking';
}

function ChangeRowValue_setAction(sheetId, uuid, action) {
  Log.start('ChangeRowValue_setAction', [sheetId, uuid, action]);
  ChangeRowValue.init();
  TrackingSheet.init();
  var ret = ChangeRowValue.setAction(sheetId, uuid, action);
  Log.stop('ChangeRowValue_setAction', [sheetId, uuid, action]);
  return ret;
}

function ChangeRowValue_setPriority(sheetId, uuid, priority) {
  Log.start('ChangeRowValue_setPriority', [sheetId, uuid, priority]);
  ChangeRowValue.init();
  TrackingSheet.init();
  var ret = ChangeRowValue.setPriority(sheetId, uuid, priority);
  Log.stop('ChangeRowValue_setPriority', [sheetId, uuid, priority]);
  return ret;
}

function ChangeRowValue_setStatus(sheetId, uuid, status) {
  Log.start('ChangeRowValue_setStatus', [sheetId, uuid, status]);
  ChangeRowValue.init();
  TrackingSheet.init();
  var ret = ChangeRowValue.setStatus(sheetId, uuid, status);
  Log.stop('ChangeRowValue_setStatus', [sheetId, uuid, status]);
  return ret;
}

function AddItem_addItem(sheetId, title, url, priority) {
  Log.start('AddItem_addItem', [sheetId, title, url, priority]);
  AddItem.init();
  TrackingSheet.init();
  var ret = AddItem.addItem(sheetId, title, url, priority);
  Log.stop('AddItem_addItem', [sheetId, title, url, priority]);
  return ret;
}

function AddItem_getPageTitle(url) {
  Log.start('AddItem_getPageTitle', [url]);
  AddItem.init();
  var ret = AddItem.getPageTitle(url);
  Log.stop('AddItem_getPageTitle', [url]);
  return ret;
}

function Update_update(sheetId) {
  Log.start('Update_update', [sheetId]);
  Update.init();
  TrackingSheet.init();
  var ret = Update.update(sheetId);
  Log.stop('Update_update', [sheetId]);
  return ret;
}

function Label_getAllLabels() {
  Log.start('Label_getAllLabels', []);
  GmailLabel.init();
  var ret = JSON.stringify(GmailLabel.getAllLabelNames());
  Log.stop('Label_getAllLabels', []);
  return ret;
}

function Overview_getOverviewRows(priorities) {
  Log.start('Overview_getOverviewRows', [priorities]);
  Overview.init();
  TrackingSheet.init();
  var trackingRows = Overview.getTrackingRowsForPriorities(priorities);
  var objectRows = [];
  trackingRows.forEach(function(trackingRow) {
    objectRows.push(trackingRow.toObject());
  });
  Log.stop('Overview_getOverviewRows', [priorities]);
  return JSON.stringify(objectRows);
}

function Overview_getRowsByPriority() {
  Log.start('Overview_getRowsByPriority', []);
  Overview.init();
  TrackingSheet.init();
  var rowsByPriority = Overview.getTrackingRowsByPriority();
  var objectVersion = {};
  for (var priority in rowsByPriority) {
    objectVersion[priority] = [];
    rowsByPriority[priority].forEach(function(row) {
      objectVersion[priority].push(row.toObject());
    });
  }
  Log.stop('Overview_getRowsByPriority', []);
  return JSON.stringify(objectVersion);
}

function TidyUpColumns_tidyUpColumns(sheetId) {
  Log.start('TidyUpColumns_tidyUpColumns', [sheetId]);
  TidyUpColumns.init();
  TrackingSheet.init();
  var ret = TidyUpColumns.tidyUp(sheetId);
  Log.stop('TidyUpColumns_tidyUpColumns', [sheetId]);
  return ret;
}

function Preferences_updateScriptPreferences(appTitle, scriptUrl) {
  Log.start('Preferences_updateScriptPreferences', [appTitle, scriptUrl]);
  Preferences.init();
  TrackingSheet.init();
  Preferences.Properties.set(Preferences.Names.spreadsheetUrl(), spreadsheetUrl);
  Preferences.Properties.set(Preferences.Names.appTitle(), appTitle);
  Preferences.Properties.set(Preferences.Names.scriptUrl(), scriptUrl);
  Log.stop('Preferences_updateScriptPreferences', [appTitle, scriptUrl]);
  return 'Updated preferences';
}