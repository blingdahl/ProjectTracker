var Tracking = {};
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
  
  Tracking.Sheet = function(sheet) {
    super(sheet, Tracking.COLUMN_NAMES);
  }
  Tracking.Sheet.prototype = Object.create(Spreadsheet.Sheet.prototype);
  
  Tracking.Sheet.prototype.getRowsForPriority = function(priority) {
    var ret = [];
    this.getRows().forEach(function(row) {
      if (row.getValue(Tracking.COLUMN_NAMES.PRIORITY) === priority) {
        ret.push(row);
      }
    });
    return ret;
  }
  
  Tracking.Sheet.prototype.organize = function() {
    var rows = this.getRows();
    for (var i = 0; i < rows.length; i++) {
      var row = rows[i];
      row.setDataValidation(Tracking.COLUMN_NAMES.PRIORITY, Tracking.PRIORITIES);
    }
    this.sortBy(Tracking.COLUMN_NAMES.PRIORITY);
    log(Log.Level.INFO, 'Set up tracking');
  }
  
  Tracking.Sheet.forSheet = function(sheet) {
    if (!Tracking.sheetIdToSheet[sheet.getSheetId()]) {
      Tracking.sheetIdToSheet[sheet.getSheetId()] = new Tracking.Sheet(sheet);
    }
    return Tracking.sheetIdToSheet[sheet.getSheetId()];
  }
  
  Tracking.Sheet.forSheetId = function(sheetId) {
    var sheets = SpreadsheetApp.getActive().getSheets();
    log(Log.Level.INFO, 'forSheetId(' + sheetId + ')');
    for (var i = 0; i < sheets.length; i++) {
      var sheet = sheets[i];
      if (sheet.getSheetId() == sheetId) {
        return Tracking.Sheet.forSheet(sheet);
      }
    }
    throw new Error('Sheet not found for ' + sheetId);
  }
  
  Tracking.Sheet.getAll = function() {
    var sheets = SpreadsheetApp.getActive().getSheets();
    var ret = [];
    sheets.forEach(function(sheet) {
      if (sheet.getSheetName() == 'Overview') {
        log(Log.Level.INFO, 'Not including Overview');
        return;
      }
      var headerRow = sheet.getDataRange().offset(0, 0, 1);
      for (var columnOffset = 0; columnOffset < headerRow.getNumColumns(); columnOffset++) {
        var headerCell = headerRow.offset(0, columnOffset);
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

function organizeAllTracking() {
  Tracking.init();
  Tracking.Sheet.getAll().forEach(function (trackingSheet) { trackingSheet.organize(); });
}

function organizeTracking(sheetId) {
  Tracking.init();
  Tracking.Sheet.forSheetId(sheetId).organize();
}

function organizeTrackingOnCurrentSheet() {
  Tracking.init();
  organizeTracking(Spreadsheet.getActiveSheetId());
}
