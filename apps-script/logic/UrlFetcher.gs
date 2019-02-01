var UrlFetcher = {};
UrlFetcher.initialized = false;

UrlFetcher.init = function() {
  if (UrlFetcher.initialized) {
    return;
  }
  
  UrlFetcher.initialized = true;
  
  Log.info('UrlFetcher.init()');
  
  UrlFetcher.replacePrefix = function(url, replacementPrefix, prefixes) {
    for (var i = 0; i < prefixes.length; i++) {
      var prefix = prefixes[i];
      if (url.startsWith(prefix)) {
        return replacementPrefix + url.substring(prefix.length);
      }
    }
    return null;
  }
  
  UrlFetcher.extractGoLinkName = function(url) {
    return UrlFetcher.replacePrefix(url, 'go/', ['go/', 'http://go/', 'https://goto.google.com/']);
  }
  
  UrlFetcher.extractBugLinkName = function(url) {
    return UrlFetcher.replacePrefix(url, 'b/', ['b/', 'http://b/', 'https://b.corp.google.com/issues/']);
  }
  
  UrlFetcher.getTitleForUrl = function(url) {
    var linkName = UrlFetcher.extractGoLinkName(url) || UrlFetcher.extractBugLinkName(url);
    if (linkName) {
      return linkName;
    }
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
