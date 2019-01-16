var Docs = {};

Docs.DOC = 'Doc';
Docs.SHEET = 'Sheet';
Docs.PRESENTATION = 'Presentation';
Docs.GENERIC = 'Drive File';

Docs.getType = function(url) {
  if (url.startsWith('https://docs.')) {
    if (url.includes('/document')) {
      return Docs.DOC;
    } else if (url.includes('/spreadsheet')) {
      return Docs.SHEET;
    } else if (url.includes('/presentation')) {
      return Docs.PRESENTATION;
    } else {
      return Docs.GENERIC;
    }
  }
  return null;
}

Docs.getId = function(url) {
  return url.match(/[-\w]{25,}/);
}

Docs.getName = function(url) {
  var type = Docs.getType(url);
  Log.info(type);
  if (type === Docs.DOC) {
    return DocumentApp.openByUrl(url).getName();
  }
  if (type === Docs.SHEET) {
    return SpreadsheetApp.openByUrl(url).getName();
  }
  if (type === Docs.PRESENTATION) {
    return SlidesApp.openByUrl(url).getName();
  }
  if (type === Docs.GENERIC) {
    var id = Docs.getId(url);
    if (id) {
      return DriveApp.getFileById().getName();
    }
  }
  return null;
}