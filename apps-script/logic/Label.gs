var Label = {};
Label.initialized = false;

Label.init = function() {
  if (Label.initialized) {
    return;
  }
  
  Log.info('Label.init()');
  
  Label.initialized = true
  
  Label.NO_TRACK_LABEL_NAME = 'No-Track';
  
  Label.getUserDefined = function(labelName, createIfNonexistent) {
    var label = GmailApp.getUserLabelByName(labelName);
    if (!label && createIfNonexistent) {
      label = GmailApp.createLabel(labelName);
    }
    return label;
  }
  
  Label.searchTerm = function(labelName) {
    return 'label:' + labelName.replace(' ', '-');
  };
  
  Label.searchQuery = function(labelName) {
    if (!labelName) {
      return null;
    }
    return Label.searchTerm(labelName) + ' -' + Label.searchTerm(Label.NO_TRACK_LABEL_NAME);
  }
  
  Label.getAllLabelNames = function() {
    var ret = [];
    var labels = GmailApp.getUserLabels(); 
    for (var i = 0; i < labels.length; i++) {
      var label = labels[i];
      ret.push(label.getName());
    }
    return ret;
  };
  
  Label.getSheetLabelNames = function() {
    var ret = [];
    Spreadsheet.getSpreadsheet().getNativeSheets().forEach(function(sheet) {
      var sheetId = sheet.getSheetId();
      var labelNameForSheet = Preferences.getLabelNameForSheet(sheetId);
      if (labelNameForSheet) {
        ret.push(labelNameForSheet);
      }
    });
    ret.sort();
    return ret;
  };
  
  Label.hasLabel = function(thread, row, label, subject) {
    var threadLabels = thread.getLabels();
    var hasLabel = false;
    threadLabels.forEach(function(threadLabel) {
      if (threadLabel.getName() === label.getName()) {
        hasLabel = true;
      }
    });
    return hasLabel;
  };
}

function getAllLabels() {
  Log.start('getAllLabels', []);
  Label.init();
  var ret = JSON.stringify(Label.getAllLabelNames());
  Log.stop('getAllLabels', []);
  return ret;
}

function setMaxThreadsForSheet(sheetId, maxThreads) {
  Log.start('setMaxThreadsForSheet', [sheetId, maxThreads]);
  Label.init();
  Label.setMaxThreadsForSheet(sheetId, maxThreads);
  Log.stop('setMaxThreadsForSheet', [sheetId, maxThreads]);
}

function clearMaxThreadsForSheet(sheetId) {
  Log.start('clearMaxThreadsForSheet', [sheetId]);
  Label.init();
  Label.clearMaxThreadsForSheet(sheetId);
  Log.stop('clearMaxThreadsForSheet', [sheetId]);
}

function getMaxThreadsForSheet(sheetId) {
  Log.start('getMaxThreadsForSheet', [sheetId]);
  Label.init();
  var ret = Label.getMaxThreadsForSheet(sheetId);
  Log.stop('getMaxThreadsForSheet', [sheetId]);
  return ret;
}