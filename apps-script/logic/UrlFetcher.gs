var UrlFetcher = {};
UrlFetcher.initialized = false;

UrlFetcher.init = function() {
  if (UrlFetcher.initialized) {
    return;
  }
  
  UrlFetcher.initialized = true;
  
  Log.info('UrlFetcher.init()');
  
  UrlFetcher.getTitleForUrl = function(url) {
    var docName = Docs.getName(url);
    if (docName) {
      return docName;
    }
    try {
      var content = UrlFetchApp.fetch(url).getContentText();
      var xmldoc = Xml.parse(content, true);
      return xmldoc.html.head.getElements("title")[0].getText().replace(/\s+/g, ' ');
    } catch (e) {
      Log.warning(e);
      return 'Link';
    }
  }
}
