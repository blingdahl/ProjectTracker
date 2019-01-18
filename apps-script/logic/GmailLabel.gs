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
  GmailLabel.MAKE_P2 =  /* GmailApp.getUserLabelByName */ GmailLabel.getUserDefined('!Make P2', true);
  GmailLabel.MAKE_P3 =  /* GmailApp.getUserLabelByName */ GmailLabel.getUserDefined('!Make P3', true);
  GmailLabel.MAKE_P4 =  /* GmailApp.getUserLabelByName */ GmailLabel.getUserDefined('!Make P4', true);
  GmailLabel.MAKE_PRIORITY_LABEL_MAP = {'P0': GmailLabel.MAKE_P0, 'P1': GmailLabel.MAKE_P1, 'P2': GmailLabel.MAKE_P2, 'P3': GmailLabel.MAKE_P3, 'P4': GmailLabel.MAKE_P4};

  GmailLabel.P0 =  /* GmailApp.getUserLabelByName */ GmailLabel.getUserDefined('P0', true);
  GmailLabel.P1 =  /* GmailApp.getUserLabelByName */ GmailLabel.getUserDefined('P1', true);
  GmailLabel.P2 =  /* GmailApp.getUserLabelByName */ GmailLabel.getUserDefined('P2', true);
  GmailLabel.P3 =  /* GmailApp.getUserLabelByName */ GmailLabel.getUserDefined('P3', true);
  GmailLabel.P4 =  /* GmailApp.getUserLabelByName */ GmailLabel.getUserDefined('P4', true);
  GmailLabel.PRIORITY_LABEL_MAP = {'P0': GmailLabel.P0, 'P1': GmailLabel.P1, 'P2': GmailLabel.P2, 'P3': GmailLabel.P3, 'P4': GmailLabel.P4};
  GmailLabel.PRIORITY_LABELS = [GmailLabel.P0, GmailLabel.P1, GmailLabel.P2, GmailLabel.P3, GmailLabel.P4];
  
  GmailLabel.COMPLETED =  /* GmailApp.getUserLabelByName */ GmailLabel.getUserDefined('Completed', true);
  GmailLabel.OBSOLETE =  /* GmailApp.getUserLabelByName */ GmailLabel.getUserDefined('Obsolete', true);
  GmailLabel.IN_PROGRESS =  /* GmailApp.getUserLabelByName */ GmailLabel.getUserDefined('In Progress', true);
  GmailLabel.ON_DECK =  /* GmailApp.getUserLabelByName */ GmailLabel.getUserDefined('On Deck', true);
  GmailLabel.FOLLOWING =  /* GmailApp.getUserLabelByName */ GmailLabel.getUserDefined('Following', true);
  GmailLabel.WAITING =  /* GmailApp.getUserLabelByName */ GmailLabel.getUserDefined('Waiting', true);
  GmailLabel.BACKBURNER =  /* GmailApp.getUserLabelByName */ GmailLabel.getUserDefined('Backburner', true);
  GmailLabel.STATUS_LABELS = [GmailLabel.COMPLETED,
                              GmailLabel.OBSOLETE,
                              GmailLabel.IN_PROGRESS,
                              GmailLabel.ON_DECK,
                              GmailLabel.FOLLOWING,
                              GmailLabel.WAITING,
                              GmailLabel.BACKBURNER];
  GmailLabel.STATUS_LABEL_MAP = {'Completed': GmailLabel.COMPLETED,
                                 'Obsolete': GmailLabel.OBSOLETE,
                                 'In Progress': GmailLabel.IN_PROGRESS,
                                 'On Deck': GmailLabel.ON_DECK,
                                 'Following': GmailLabel.FOLLOWING,
                                 'Waiting': GmailLabel.WAITING,
                                 'Backburner': GmailLabel.BACKBURNER};
  
  GmailLabel.MARK_COMPLETED =  /* GmailApp.getUserLabelByName */ GmailLabel.getUserDefined('!Mark Completed', true);
  GmailLabel.MARK_OBSOLETE =  /* GmailApp.getUserLabelByName */ GmailLabel.getUserDefined('!Mark Obsolete', true);
  GmailLabel.MARK_IN_PROGRESS =  /* GmailApp.getUserLabelByName */ GmailLabel.getUserDefined('!Mark In Progress', true);
  GmailLabel.MARK_ON_DECK =  /* GmailApp.getUserLabelByName */ GmailLabel.getUserDefined('!Mark On Deck', true);
  GmailLabel.MARK_FOLLOWING =  /* GmailApp.getUserLabelByName */ GmailLabel.getUserDefined('!Mark Following', true);
  GmailLabel.MARK_WAITING =  /* GmailApp.getUserLabelByName */ GmailLabel.getUserDefined('!Mark Waiting', true);
  GmailLabel.MARK_BACKBURNER =  /* GmailApp.getUserLabelByName */ GmailLabel.getUserDefined('!Mark Backburner', true);
  GmailLabel.REMOVE_STATUS =  /* GmailApp.getUserLabelByName */ GmailLabel.getUserDefined('!Remove Status', true);
  GmailLabel.MARK_STATUS_LABEL_MAP = {'Completed': GmailLabel.MARK_COMPLETED,
                                      'Obsolete': GmailLabel.MARK_OBSOLETE,
                                      'In Progress': GmailLabel.MARK_IN_PROGRESS,
                                      'On Deck': GmailLabel.MARK_ON_DECK,
                                      'Following': GmailLabel.MARK_FOLLOWING,
                                      'Waiting': GmailLabel.MARK_WAITING,
                                      'Backburner': GmailLabel.MARK_BACKBURNER,
                                      '': GmailLabel.REMOVE_STATUS};

  GmailLabel.NO_TRACK = /* GmailApp.getUserLabelByName */ GmailLabel.getUserDefined('No-Track', true);
  
  GmailLabel.searchTerm = function(labelName) {
    return 'label:' + labelName.replace(' ', '-');
  };
  
  GmailLabel.notSearchTerm = function(labelName) {
    return '-' + GmailLabel.searchTerm(labelName);
  };
  
  GmailLabel.searchQuery = function(labelName) {
    if (!labelName) {
      return null;
    }
    return [GmailLabel.searchTerm(labelName),
            GmailLabel.notSearchTerm(GmailLabel.NO_TRACK.getName()),
            GmailLabel.notSearchTerm(GmailLabel.COMPLETED.getName()),
            GmailLabel.notSearchTerm(GmailLabel.OBSOLETE.getName())].join(' ');
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
  
  GmailLabel.hasLabel = function(thread, label) {
    var threadLabels = thread.getLabels();
    var hasLabel = false;
    threadLabels.forEach(function(threadLabel) {
      if (threadLabel.getName() === label.getName()) {
        hasLabel = true;
      }
    });
    return hasLabel;
  };
  
  GmailLabel.addLabel = function(thread, label) {
    if (GmailLabel.hasLabel(thread, label)) {
      return false;
    }
    thread.addLabel(label);
    return true;
  };
  
  GmailLabel.removeLabel = function(thread, label) {
    if (!GmailLabel.hasLabel(thread, label)) {
      return false;
    }
    thread.removeLabel(label);
    return true;
  };
  
  GmailLabel.setLabel = function(thread, label, isSet) {
    if (isSet) {
      return GmailLabel.addLabel(thread, label);
    } else {
      return GmailLabel.removeLabel(thread, label);
    }
  };
  
  GmailLabel.setActiveLabel = function(thread, activeLabel, allLabels) {
    for (var i = 0; i < allLabels.length; i++) {
      var currLabel = allLabels[i];
      GmailLabel.setLabel(thread, currLabel, activeLabel && currLabel.getName() === activeLabel.getName());
    }
  };
}
