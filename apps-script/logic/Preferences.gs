var Preferences = {};
Preferences.initialized = false;

Preferences.init = function() {
  if (Preferences.initialized) {
    return;
  }
  
  Spreadsheet.init();
  Log.info('Preferences.init()');
  
  Preferences.initialized = true;
  
  Preferences.Properties = {}
  
  Preferences.Properties.get = function(propertyName, opt_defaultValue) {
    return PropertiesService.getUserProperties().getProperty(propertyName) || opt_defaultValue;
  }
  
  Preferences.Properties.set = function(propertyName, value) {
    PropertiesService.getUserProperties().setProperty(propertyName, value);
  }
  
  Preferences.Properties.clear = function(propertyName) {
    PropertiesService.getUserProperties().deleteProperty(propertyName);
  }
  
  Preferences.Names = {}
  
  Preferences.Names.labelName = function(sheetId) {
    return 'label:' + sheetId;
  }
  
  Preferences.Names.maxThreads = function(sheetId) {
    return 'maxThreads:' + sheetId;
  }

  Preferences.Names.tracked = function(sheetId) {
    return 'tracked:' + sheetId;
  }

  Preferences.Names.tasklist = function(sheetId) {
    return 'tasklist:' + sheetId;
  }
  
  Preferences.Names.spreadsheetUrl = function() {
    return 'spreadsheetUrl';
  }
  
  Preferences.Names.appTitle = function() {
    return 'appTitle';
  }
  
  Preferences.Names.scriptUrl = function() {
    return 'scriptUrl';
  }
}
