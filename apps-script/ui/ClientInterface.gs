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

function ChangeRowValue_setValue(sheetId, uuid, columnKey, newValue) {
  Log.start('ChangeRowValue_setValue', [sheetId, uuid, columnKey, newValue]);
  ChangeRowValue.init();
  TrackingSheet.init();
  var ret = ChangeRowValue.setValue(sheetId, uuid, columnKey, newValue);
  Log.stop('ChangeRowValue_setValue', [sheetId, uuid, columnKey, newValue]);
  return ret;
}

function ChangeRowValue_setValues(sheetId, uuid, valueMap) {
  Log.start('ChangeRowValue_setValues', [sheetId, uuid, valueMap]);
  ChangeRowValue.init();
  TrackingSheet.init();
  var ret = ChangeRowValue.setValues(sheetId, uuid, valueMap);
  Log.stop('ChangeRowValue_setValues', [sheetId, uuid, valueMap]);
  return ret;
}

function ChangeRowValue_setLink(sheetId, uuid, columnKey, text, href) {
  Log.start('ChangeRowValue_setLink', [sheetId, uuid, columnKey, text, href]);
  ChangeRowValue.init();
  TrackingSheet.init();
  var ret = ChangeRowValue.setLink(sheetId, uuid, columnKey, text, href);
  Log.stop('ChangeRowValue_setLink', [sheetId, uuid, columnKey, text, href]);
  return ret;
}

function ChangeRowValue_clearLink(sheetId, uuid, columnKey) {
  Log.start('ChangeRowValue_setLink', [sheetId, uuid, columnKey]);
  ChangeRowValue.init();
  TrackingSheet.init();
  var ret = ChangeRowValue.clearLink(sheetId, uuid, columnKey);
  Log.stop('ChangeRowValue_setLink', [sheetId, uuid, columnKey]);
  return ret;
}

function ChangeRowValue_changeSheet(fromSheetId, toSheetId, uuid) {
  Log.start('ChangeRowValue_changeSheet', [fromSheetId, toSheetId, uuid]);
  ChangeRowValue.init();
  TrackingSheet.init();
  var ret = ChangeRowValue.changeSheet(fromSheetId, toSheetId, uuid);
  Log.stop('ChangeRowValue_changeSheet', [fromSheetId, toSheetId, uuid]);
  return ret;
}

function AddItem_addItem(sheetId, title, url, priority, nextActionDate, nextActionDateUpdated, dueDate) {
  Log.start('AddItem_addItem', [sheetId, title, url, priority, nextActionDate, nextActionDateUpdated, dueDate]);
  AddItem.init();
  TrackingSheet.init();
  var ret = AddItem.addItem(sheetId, title, url, priority, nextActionDate, nextActionDateUpdated, dueDate);
  Log.stop('AddItem_addItem', [sheetId, title, url, priority, nextActionDate, dueDate]);
  return ret;
}

function UrlFetcher_getTitleForUrl(url) {
  Log.start('UrlFetcher_getTitleForUrl', [url]);
  UrlFetcher.init();
  var ret = UrlFetcher.getTitleForUrl(url);
  Log.stop('UrlFetcher_getTitleForUrl', [url]);
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

function Overview_getRows() {
  Log.start('Overview_getRows', []);
  Overview.init();
  TrackingSheet.init();
  var rows = Overview.getRows();
  var ret = [];
  rows.forEach(function(row) { ret.push(row.toObject()); });
  Log.stop('Overview_getRows', []);
  return JSON.stringify(ret);
}

function Overview_getRowsForSheetId(sheetId) {
  Log.start('Overview_getRowsForSheetId', []);
  Overview.init();
  TrackingSheet.init();
  var rows = Overview.getRowsForSheetId(sheetId);
  var ret = [];
  rows.forEach(function(row) { ret.push(row.toObject()); });
  Log.stop('Overview_getRowsForSheetId', []);
  return JSON.stringify(ret);
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

function Preferences_setValueSetsJsonForFilter(filterName, json) {
  Log.start('Preferences_setValueSetsJsonForFilter', [filterName, json]);
  Preferences.init();
  Preferences.Properties.set(Preferences.Names.filterValueSetsJson(filterName), json);
  Log.stop('Preferences_setValueSetsJsonForFilter', [filterName, json]);
}

function Preferences_getValueSetsJsonForFilter(filterName) {
  Log.start('Preferences_getValueSetsJsonForFilter', [filterName]);
  Preferences.init();
  var json = Preferences.Properties.get(Preferences.Names.filterValueSetsJson(filterName));
  Log.stop('Preferences_getValueSetsJsonForFilter', [filterName]);
  return json;
}
