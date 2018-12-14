var Preferences = {};
Preferences.initialized = false;

Preferences.init = function() {
  if (Preferences.initialized) {
    return;
  }
  
  Log.info('Preferences.init()');
  
  Preferences.initialized = true;
  
  Preferences.getProperty = function(propertyName) {
    return PropertiesService.getScriptProperties().getProperty(propertyName);
  }
  
  Preferences.setProperty = function(propertyName, value) {
    PropertiesService.getScriptProperties().setProperty(propertyName, value);
  }
  
  Preferences.clearProperty = function(propertyName) {
    PropertiesService.getScriptProperties().deleteProperty(propertyName);
  }
  
  Preferences.labelPropertyName = function(sheetId) {
    return 'label:' + sheetId;
  }
  
  Preferences.setLabelForSheet = function(sheetId, labelName) {
    Preferences.setProperty(Preferences.labelPropertyName(sheetId), labelName);
  }
  
  Preferences.clearLabelForSheet = function(sheetId) {
    PropertiesService.getScriptProperties().deleteProperty(Preferences.labelPropertyName(sheetId));
  }
  
  Preferences.getLabelNameForSheet = function(sheetId) {
    return PropertiesService.getScriptProperties().getProperty(Preferences.labelPropertyName(sheetId));
  }
  
  Preferences.maxThreadsProperty = function(sheetId) {
    return 'maxThreads:' + sheetId;
  }
  
  Preferences.setMaxThreadsForSheet = function(sheetId, maxThreads) {
    Log.start('setMaxThreadsForSheet', [sheetId, maxThreads]);
    PropertiesService.getScriptProperties().setProperty(Preferences.maxThreadsProperty(sheetId), maxThreads);
    Log.stop('setMaxThreadsForSheet', [sheetId, maxThreads]);
  }
  
  Preferences.clearMaxThreadsForSheet = function(sheetId) {
    PropertiesService.getScriptProperties().deleteProperty(Preferences.maxThreadsProperty(sheetId));
  }
  
  Preferences.getMaxThreadsForSheet = function(sheetId) {
    Log.start('getMaxThreadsForSheet', [sheetId]);
    var ret = parseInt(PropertiesService.getScriptProperties().getProperty(Preferences.maxThreadsProperty(sheetId))) || Preferences.DEFAULT_MAX_THREADS;
    Log.stop('getMaxThreadsForSheet', [sheetId]);
    Log.info(ret);
    return ret;
  }

  Preferences.trackedProperty = function(sheetId) {
    return 'tracked:' + sheetId;
  }
  
  Preferences.setTrackedForSheet = function(sheetId, tracked) {
    PropertiesService.getScriptProperties().setProperty(Preferences.trackedProperty(sheetId), tracked ? 'true' : 'false');
  }
  
  Preferences.clearTrackedForSheet = function(sheetId) {
    PropertiesService.getScriptProperties().deleteProperty(Preferences.trackedProperty(sheetId));
  }
  
  Preferences.getTrackedForSheet = function(sheetId) {
    return PropertiesService.getScriptProperties().getProperty(Preferences.trackedProperty(sheetId)) === 'true';
  } 

  Preferences.autoRefreshProperty = function() {
    return 'autoRefresh';
  }
  
  Preferences.setAutoRefresh = function(autoRefresh) {
    PropertiesService.getScriptProperties().setProperty(Preferences.autoRefreshProperty(), autoRefresh ? 'true' : 'false');
  }
  
  Preferences.getAutoRefresh = function(sheetId) {
    return PropertiesService.getScriptProperties().getProperty(Preferences.autoRefreshProperty()) === 'true';
  } 
  
  Preferences.getPreferencesForSheet = function(sheetId) {
    Log.start('getPreferencesForSheet', [sheetId]);
    Preferences.init();
    var ret = {'sheetId': sheetId,
               'sheetName': Spreadsheet.getNativeSheet(sheetId).getName(),
               'label': Preferences.getLabelNameForSheet(sheetId),
               'isTracked': Preferences.getTrackedForSheet(sheetId),
               'maxThreads': Preferences.getMaxThreadsForSheet(sheetId)};
    Log.stop('getPreferencesForSheet', [sheetId]);
    return ret;
  }
  
  Preferences.DEFAULT_MAX_THREADS = 50;
}
  
function labelProperty(sheetId) {
  Log.start('labelProperty', [sheetId]);
  Preferences.init();
  var ret = Preferences.labelProperty(sheetId);
  Log.stop('labelProperty', [sheetId]);
  return ret;
}

function setLabelForSheet(sheetId, label, maxThreads) {
  Log.start('labelProperty', [sheetId, label, maxThreads]);
  Preferences.init();
  Preferences.setLabelForSheet(sheetId, label);
  Preferences.setMaxThreadsForSheet(sheetId, maxThreads);
  Log.stop('labelProperty', [sheetId, label, maxThreads]);
}

function getLabelForSheet(sheetId) {
  Log.start('getLabelForSheet', [sheetId]);
  Preferences.init();
  var ret = Preferences.getLabelForSheet(sheetId);
  Log.stop('getLabelForSheet', [sheetId]);
  return ret;
}

function setTrackedForSheet(sheetId, tracked) {
  Log.start('setTrackedForSheet', [sheetId, tracked]);
  Preferences.init();
  Preferences.setTrackedForSheet(sheetId, tracked);
  Log.stop('setTrackedForSheet', [sheetId, tracked]);
}

function getTrackedForSheet(sheetId) {
  Log.start('getTrackedForSheet', [sheetId]);
  Preferences.init();
  var ret = Preferences.getTrackedForSheet(sheetId);
  Log.stop('getTrackedForSheet', [sheetId]);
  return ret;
}

function clearLabelForSheet(sheetId) {
  Log.start('clearLabelForSheet', [sheetId]);
  Preferences.init();
  Preferences.clearLabelForSheet(sheetId);
  Log.stop('clearLabelForSheet', [sheetId]);
}

function setAutoRefresh(autoRefresh) {
  Log.start('setAutoRefresh', [autoRefresh]);
  Preferences.init();
  Preferences.setAutoRefresh(autoRefresh);
  Log.stop('setAutoRefresh', [autoRefresh]);
}

function getAutoRefresh() {
  Log.start('getAutoRefresh', []);
  Preferences.init();
  var ret = Preferences.getAutoRefresh();
  Log.stop('getAutoRefresh', []);
  return ret;
}