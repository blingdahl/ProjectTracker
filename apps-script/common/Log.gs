function log(level, s) {
  if (level >= Log.level) {
    Logger.log(Log.levelString(level), ':', s);
  }
}

function logMatrix(level, a) {
  for (var i = 0; i < values.length; i++) {
    log(Log.Level.INFO, 'i: ' + i);
    log(Log.Level.INFO, 'values(' + values[i].length + ' of them): ' + values[i]);
  }
}

var Log = {};

Log.Level = {};
Log.Level.FINEST = 0;
Log.Level.FINER = 1;
Log.Level.FINE = 2;
Log.Level.INFO = 3;
Log.Level.WARNING = 4;
Log.Level.ERROR = 5;

Log.levelString = function(level) {
  switch (level) {
    case Log.Level.FINEST: return 'FINEST';
    case Log.Level.FINER: return 'FINER';
    case Log.Level.FINE: return 'FINE';
    case Log.Level.INFO: return 'INFO';
    case Log.Level.WARNING: return 'WARNING';
    case Log.Level.ERROR: return 'ERROR';
  }
}

Log.level = Log.Level.INFO;
