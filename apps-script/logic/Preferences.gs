var Preferences = {};
Preferences.initialized = false;

Preferences.init = function() {
  if (Preferences.initialized) {
    return;
  }
  
  Spreadsheet.init();
  Log.info('Preferences.init()');
  
  Preferences.initialized = true;
  
  Preferences.getProperty = function(propertyName) {
    return PropertiesService.getUserProperties().getProperty(propertyName);
  }
  
  Preferences.setProperty = function(propertyName, value) {
    PropertiesService.getUserProperties().setProperty(propertyName, value);
  }
  
  Preferences.clearProperty = function(propertyName) {
    PropertiesService.getUserProperties().deleteProperty(propertyName);
  }
  
  Preferences.labelNamePropertyName = function(sheetId) {
    return 'label:' + sheetId;
  }
  
  Preferences.setLabelNameForSheet = function(sheetId, labelName) {
    Preferences.setProperty(Preferences.labelNamePropertyName(sheetId), labelName);
  }
  
  Preferences.clearLabelNameForSheet = function(sheetId) {
    Preferences.clearProperty(Preferences.labelNamePropertyName(sheetId));
  }
  
  Preferences.getLabelNameForSheet = function(sheetId) {
    return Preferences.getProperty(Preferences.labelNamePropertyName(sheetId));
  }
  
  Preferences.maxThreadsProperty = function(sheetId) {
    return 'maxThreads:' + sheetId;
  }
  
  Preferences.setMaxThreadsForSheet = function(sheetId, maxThreads) {
    Log.start('setMaxThreadsForSheet', [sheetId, maxThreads]);
    Preferences.setProperty(Preferences.maxThreadsProperty(sheetId), maxThreads);
    Log.stop('setMaxThreadsForSheet', [sheetId, maxThreads]);
  }
  
  Preferences.clearMaxThreadsForSheet = function(sheetId) {
    Preferences.clearProperty(Preferences.maxThreadsProperty(sheetId));
  }
  
  Preferences.getMaxThreadsForSheet = function(sheetId) {
    return parseInt(Preferences.getProperty(Preferences.maxThreadsProperty(sheetId))) || Preferences.DEFAULT_MAX_THREADS;
  }

  Preferences.trackedProperty = function(sheetId) {
    return 'tracked:' + sheetId;
  }
  
  Preferences.setTrackedForSheet = function(sheetId, tracked) {
    Preferences.setProperty(Preferences.trackedProperty(sheetId), tracked ? 'true' : 'false');
  }
  
  Preferences.clearTrackedForSheet = function(sheetId) {
    Preferences.clearProperty(Preferences.trackedProperty(sheetId));
  }
  
  Preferences.getTrackedForSheet = function(sheetId) {
    return Preferences.getProperty(Preferences.trackedProperty(sheetId)) === 'true';
  }

  Preferences.tasklistProperty = function(sheetId) {
    return 'tasklist:' + sheetId;
  }
  
  Preferences.setTasklistForSheet = function(sheetId, tasklist) {
    Preferences.setProperty(Preferences.tasklistProperty(sheetId), tasklist);
  }
  
  Preferences.clearTasklistForSheet = function(sheetId) {
    Preferences.clearProperty(Preferences.tasklistProperty(sheetId));
  }
  
  Preferences.getTasklistForSheet = function(sheetId) {
    return Preferences.getProperty(Preferences.tasklistProperty(sheetId));
  }
  
  Preferences.spreadsheetUrlProperty = function() {
    return 'spreadsheetUrl';
  }
  
  Preferences.getSpreadsheetUrl = function() {
    return Preferences.getProperty(Preferences.spreadsheetUrlProperty());
  }
  
  Preferences.setSpreadsheetUrl = function(spreadsheetUrl) {
    return Preferences.setProperty(Preferences.spreadsheetUrlProperty(), spreadsheetUrl);
  }
  
  Preferences.clearSpreadsheetUrl = function(spreadsheetUrl) {
    return Preferences.clearProperty(Preferences.spreadsheetUrlProperty());
  }
  
  Preferences.DEFAULT_MAX_THREADS = 50;
}