let Tracking = {};
Tracking.initialized = false;
  
Tracking.COLUMN_NAMES = {'NOTES': 'Notes',
                         'ITEM': 'Item',
                         'SCRIPT_NOTES': 'Script Notes',
                         'STATUS': 'Status',
                         'PRIORITY': 'Priority'};


Tracking.PRIORITIES = ['P0', 'P1', 'P2', 'P3', 'P4', 'Following', 'Backburner'];

Tracking.init = function() {
  if (Tracking.initialized) {
    return;
  }
  
  Spreadsheet.init();
  log(Log.Level.INFO, 'Tracking.init()');

  Tracking.initialized = true;
  
  Tracking.sheetIdToSheet = {};
  
  Tracking.Sheet = class Sheet extends Spreadsheet.Sheet {
    constructor(sheet) {
      super(sheet, Tracking.COLUMN_NAMES);
    }
    
    getRowsForPriority(priority) {
      let ret = [];
      this.getRows().forEach(function(row) {
        if (row.getValue(Tracking.COLUMN_NAMES.PRIORITY) === priority) {
          ret.push(row);
        }
      });
      return ret;
    }
  
    organize() {
      let rows = this.getRows();
      for (let i = 0; i < rows.length; i++) {
        let row = rows[i];
        row.setDataValidation(Tracking.COLUMN_NAMES.PRIORITY, Tracking.PRIORITIES);
      }
      this.sortBy(Tracking.COLUMN_NAMES.PRIORITY);
      log(Log.Level.INFO, 'Set up tracking');
    }
    
    static forSheet(sheet) {
      if (!Tracking.sheetIdToSheet[sheet.getSheetId()]) {
        Tracking.sheetIdToSheet[sheet.getSheetId()] = new Tracking.Sheet(sheet);
      }
      return Tracking.sheetIdToSheet[sheet.getSheetId()];
    }
    
    static forSheetId(sheetId) {
      let sheets = SpreadsheetApp.getActive().getSheets();
      log(Log.Level.INFO, 'forSheetId(' + sheetId + ')');
      for (let i = 0; i < sheets.length; i++) {
        let sheet = sheets[i];
        if (sheet.getSheetId() == sheetId) {
          return Tracking.Sheet.forSheet(sheet);
        }
      }
      throw new Error('Sheet not found for ' + sheetId);
    }
    
    static getAll() {
      let sheets = SpreadsheetApp.getActive().getSheets();
      let ret = [];
      sheets.forEach(function(sheet) {
        if (sheet.getSheetName() == 'Overview') {
          log(Log.Level.INFO, 'Not including Overview');
          return;
        }
        let headerRow = sheet.getDataRange().offset(0, 0, 1);
        for (let columnOffset = 0; columnOffset < headerRow.getNumColumns(); columnOffset++) {
          let headerCell = headerRow.offset(0, columnOffset);
          if (headerCell.getValue() === Tracking.COLUMN_NAMES.PRIORITY) {
            log(Log.Level.INFO, 'Tracking sheet: ' + sheet.getSheetName());
            ret.push(Tracking.Sheet.forSheet(sheet));
            break;
          }
        }
      });
      return ret;
    }
  }
}
  
function organizeAllTracking() {
  Tracking.init();
  Tracking.Sheet.getAll().forEach(trackingSheet => trackingSheet.organize());
}
  
function organizeTracking(sheetId) {
  Tracking.init();
  Tracking.Sheet.forSheetId(sheetId).organize();
}

function organizeTrackingOnCurrentSheet() {
  Tracking.init();
  organizeTracking(Spreadsheet.getActiveSheetId());
}
