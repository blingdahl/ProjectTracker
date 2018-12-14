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

Log.log = function(level, s) {
  if (level >= Log.level) {
    Logger.log(Log.levelString(level) + ':' + s);
  }
}

Log.finest = function(s) {
  Log.log(Log.Level.FINEST, s);
}

Log.finest = function(s) {
  Log.log(Log.Level.FINEST, s);
}

Log.fine = function(s) {
  Log.log(Log.Level.FINE, s);
}

Log.info = function(s) {
  Log.log(Log.Level.INFO, s);
}

Log.warning = function(s) {
  Log.log(Log.Level.WARNING, s);
}

Log.error = function(s) {
  Log.log(Log.Level.ERROR, s);
}

Log.matrix = function(level, a) {
  for (var i = 0; i < values.length; i++) {
    Log.info('i: ' + i);
    Log.info('values(' + values[i].length + ' of them): ' + values[i]);
  }
}

Log.start = function(name, args) {
  Log.info('Starting ' + name + '(' + args.join(',') + ')');
}

Log.stop = function(name, args) {
  Log.info('Finished ' + name + '(' + args.join(',') + ')');
}
