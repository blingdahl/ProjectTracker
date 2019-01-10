var GmailLabel = {};
GmailLabel.initialized = false;

GmailLabel.init = function() {
  if (GmailLabel.initialized) {
    return;
  }
  
  
  Preferences.init();
  Log.info('GmailLabel.init()');
  GmailLabel.initialized = true
  
  GmailLabel.getUserDefined = function(labelName, createIfNonexistent) {
    var label = GmailApp.getUserLabelByName(labelName);
    if (!label && createIfNonexistent) {
      label = GmailApp.createLabel(labelName);
    }
    return label;
  }
  
  GmailLabel.MAKE_P0 =  /* GmailApp.getUserLabelByName */ GmailLabel.getUserDefined('!Make P0', true);
  GmailLabel.MAKE_P1 =  /* GmailApp.getUserLabelByName */ GmailLabel.getUserDefined('!Make P1', true);
  GmailLabel.NO_TRACK = /* GmailApp.getUserLabelByName */ GmailLabel.getUserDefined('No-Track', true);
  
  GmailLabel.searchTerm = function(labelName) {
    return 'label:' + labelName.replace(' ', '-');
  };
  
  GmailLabel.searchQuery = function(labelName) {
    if (!labelName) {
      return null;
    }
    return GmailLabel.searchTerm(labelName) + ' -' + GmailLabel.searchTerm(GmailLabel.NO_TRACK.getName());
  }
  
  GmailLabel.getAllLabelNames = function() {
    var ret = [];
    var labels = GmailApp.getUserLabels(); 
    for (var i = 0; i < labels.length; i++) {
      var label = labels[i];
      ret.push(label.getName());
    }
    return ret;
  };
  
  GmailLabel.getSheetLabelNames = function() {
    var ret = [];
    Spreadsheet.getSpreadsheet().getNativeSheets().forEach(function(sheet) {
      var sheetId = sheet.getSheetId();
      var labelNameForSheet = Preferences.Properties.get(Preferences.Names.labelName(sheetId));
      if (labelNameForSheet) {
        ret.push(labelNameForSheet);
      }
    });
    ret.sort();
    return ret;
  };
  
  GmailLabel.hasLabel = function(thread, row, label, subject) {
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