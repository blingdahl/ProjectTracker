var Preferences = {};
Preferences.initialized = false;

Preferences.init = function() {
  if (Preferences.initialized) {
    return;
  }
  
  log(Log.Level.INFO, 'Preferences.init()');
  
  Preferences.initialized = true;
  
  Preferences.labelProperty = function(sheetId) {
    return 'label:' + sheetId;
  }
  
  Preferences.setLabelForSheet = function(sheetId, labelName) {
    PropertiesService.getScriptProperties().setProperty(Preferences.labelProperty(sheetId), labelName);
  }
  
  Preferences.clearLabelForSheet = function(sheetId) {
    PropertiesService.getScriptProperties().deleteProperty(Preferences.labelProperty(sheetId));
  }
  
  Preferences.getLabelNameForSheet = function(sheetId) {
    return PropertiesService.getScriptProperties().getProperty(Preferences.labelProperty(sheetId));
  }
  
  Preferences.maxThreadsProperty = function(sheetId) {
    return 'maxThreads:' + sheetId;
  }
  
  Preferences.setMaxThreadsForSheet = function(sheetId, maxThreads) {
    logStart('setMaxThreadsForSheet', [sheetId, maxThreads]);
    PropertiesService.getScriptProperties().setProperty(Preferences.maxThreadsProperty(sheetId), maxThreads);
    logStop('setMaxThreadsForSheet', [sheetId, maxThreads]);
  }
  
  Preferences.clearMaxThreadsForSheet = function(sheetId) {
    PropertiesService.getScriptProperties().deleteProperty(Preferences.maxThreadsProperty(sheetId));
  }
  
  Preferences.getMaxThreadsForSheet = function(sheetId) {
    logStart('getMaxThreadsForSheet', [sheetId]);
    var ret = parseInt(PropertiesService.getScriptProperties().getProperty(Preferences.maxThreadsProperty(sheetId))) || Preferences.DEFAULT_MAX_THREADS;
    logStop('getMaxThreadsForSheet', [sheetId]);
    log(Log.Level.INFO, ret);
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
  
  Preferences.getPreferencesForSheet = function(sheetId) {
    logStart('getPreferencesForSheet', [sheetId]);
    Preferences.init();
    var ret = {'sheetId': sheetId,
               'sheetName': Spreadsheet.getNativeSheet(sheetId).getName(),
               'label': Preferences.getLabelNameForSheet(sheetId),
               'isTracked': Preferences.getTrackedForSheet(sheetId),
               'maxThreads': Preferences.getMaxThreadsForSheet(sheetId)};
    logStop('getPreferencesForSheet', [sheetId]);
    return ret;
  }
  
  Preferences.DEFAULT_MAX_THREADS = 50;
}
  
function labelProperty(sheetId) {
  logStart('labelProperty', [sheetId]);
  Preferences.init();
  var ret = Preferences.labelProperty(sheetId);
  logStop('labelProperty', [sheetId]);
  return ret;
}

function setLabelForSheet(sheetId, label, maxThreads) {
  logStart('labelProperty', [sheetId, label, maxThreads]);
  Preferences.init();
  Preferences.setLabelForSheet(sheetId, label);
  Preferences.setMaxThreadsForSheet(sheetId, maxThreads);
  logStop('labelProperty', [sheetId, label, maxThreads]);
}

function getLabelForSheet(sheetId) {
  logStart('getLabelForSheet', [sheetId]);
  Preferences.init();
  var ret = Preferences.getLabelForSheet(sheetId);
  logStop('getLabelForSheet', [sheetId]);
  return ret;
}

function setTrackedForSheet(sheetId, tracked) {
  logStart('Tracking', [sheetId, tracked]);
  Preferences.init();
  Preferences.setTrackedForSheet(sheetId, tracked);
  logStop('Tracking', [sheetId, tracked]);
}

function clearTrackedForSheet(sheetId) {
  logStart('clearTrackedForSheet', [sheetId]);
  Preferences.init();
  Preferences.clearTrackedForSheet(sheetId);
  logStop('clearTrackedForSheet', [sheetId]);
}

function getTrackedForSheet(sheetId) {
  logStart('getTrackedForSheet', [sheetId]);
  Preferences.init();
  var ret = Preferences.getTrackedForSheet(sheetId);
  logStop('getTrackedForSheet', [sheetId]);
  return ret;
}

function clearLabelForSheet(sheetId) {
  logStart('clearLabelForSheet', [sheetId]);
  Preferences.init();
  Preferences.clearLabelForSheet(sheetId);
  logStop('clearLabelForSheet', [sheetId]);
}