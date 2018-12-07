let Overview = {};
Overview.initialized = false;
  
Overview.COLUMN_NAMES = {'NOTES': 'Notes',
                         'ITEM': 'Item',
                         'STATUS': 'Status',
                         'PRIORITY': 'Priority',
                         'SHEET': 'Sheet'};


Overview.init = function() {
  if (Overview.initialized) {
    return;
  }
  
  Spreadsheet.init();
  Tracking.init();
  log(Log.Level.INFO, 'Overview.init()');

  Overview.initialized = true;
  
  Overview.Sheet = class Sheet extends Spreadsheet.Sheet {
    constructor(sheet) {
      super(sheet, Overview.COLUMN_NAMES);
    }
    
    addRowFromTrackingRow(sheetFormula, trackingRow) {
      let overviewRow = this.addRow();
      function copyFromTrackingRow(trackingColumnName, overviewColumnName) {
        overviewRow.setValue(overviewColumnName, trackingRow.getValue(trackingColumnName));
      };
      copyFromTrackingRow(Tracking.COLUMN_NAMES.PRIORITY, Overview.COLUMN_NAMES.PRIORITY);
      copyFromTrackingRow(Tracking.COLUMN_NAMES.ITEM, Overview.COLUMN_NAMES.ITEM);
      copyFromTrackingRow(Tracking.COLUMN_NAMES.STATUS, Overview.COLUMN_NAMES.STATUS);
      copyFromTrackingRow(Tracking.COLUMN_NAMES.NOTES, Overview.COLUMN_NAMES.NOTES);
      overviewRow.setFormula(Overview.COLUMN_NAMES.SHEET, sheetFormula);
    }
    
    addRowsFromTrackingSheet(trackingSheet, priority) {
      trackingSheet.getRowsForPriority(priority).forEach(function(trackingRow) {
        let sheetFormula = Spreadsheet.hyperlinkFormula(trackingSheet.getUrl(), trackingSheet.getSheetName());
        this.addRowFromTrackingRow(sheetFormula, trackingRow);
      }.bind(this));
    }
    
    static get() {
      let sheet = SpreadsheetApp.getActive().getSheetByName('Overview');
      if (sheet) {
        return new Overview.Sheet(sheet);
      }
      throw new Error('Sheet not found');
    }
  }
  
  Overview.update = function() {
    log(Log.Level.INFO, 'Overview.update()');
    let overviewSheet = Overview.Sheet.get();
    overviewSheet.clearData();
    let trackingSheets = Tracking.Sheet.getAll();
    trackingSheets.forEach(function(trackingSheet) {
      if (trackingSheet.getSheetId() === overviewSheet.getSheetId()) {
        return;
      }
      log(Log.Level.INFO, 'Adding P0 from ' + trackingSheet.getSheetName());
      overviewSheet.addRowsFromTrackingSheet(trackingSheet, 'P0');
    });
    trackingSheets.forEach(function(trackingSheet) {
      if (trackingSheet.getSheetId() === overviewSheet.getSheetId()) {
        return;
      }
      log(Log.Level.INFO, 'Adding P1 from ' + trackingSheet.getSheetName());
      overviewSheet.addRowsFromTrackingSheet(trackingSheet, 'P1');
    });
    log(Log.Level.INFO, 'Updated overview');
  }
}

function updateOverview() {
  log(Log.Level.INFO, 'updateOverview');
  Overview.init();
  Overview.update();
}
