var LinkExtractor = {};

function PrefixMatcher() {
  this.prefixMap = {};
}

PrefixMatcher.prototype.add = function(prefix, linkText) {
  this.prefixMap[prefix] = linkText;
  return this;
}

PrefixMatcher.prototype.matchingLinkText = function(s) {
  var prefixes = Object.keys(this.prefixMap);
  for (var i = 0; i < prefixes.length; i++) {
    var prefix = prefixes[i];
    if (s.startsWith(prefix)) {
      return this.prefixMap[prefix];
    }
  }
}

LinkExtractor.PREFIX_MATCHER = new PrefixMatcher().
    add('http://track.spe.schoolmessenger.com/', 'School Messenger').
    add('https://www.fablevisionlearning.com/', 'FableVision').
    add('https://photos.app.goo.gl/', 'Photos').
    add('https://app.smartsheet.com/b/home', 'SmartSheet').
    add('https://drive.google.com/', 'Drive');

LinkExtractor.extractBugId = function(subject) {
  var issueIndex = subject.indexOf('Issue ');
  if (issueIndex < 0) {
    return null;
  }
  var nextWordIndex = issueIndex + 'Issue '.length;
  var endOfNextWordIndex = subject.indexOf(':', nextWordIndex);
  if (endOfNextWordIndex < 0) {
    return null;
  }
  return subject.substring(nextWordIndex, endOfNextWordIndex);
}

LinkExtractor.extractUrls = function(content) {
  var urls = content.match(/https?:\/\/[^ )"><]+/g);
  if (!urls) {
    return [];
  }
  for (var i = 0; i < urls.length; i++) {
    if (urls[i].startsWith('https://www.google.com/url?hl=en&q=')) {
      urls[i] = urls[i].replace('https://www.google.com/url?hl=en&q=');
      var sourceIndex = urls[i].indexOf('&source=');
      if (sourceIndex >= 0) {
        urls[i] = urls[i].substring(0, sourceIndex);
      }
    }
  }
  return urls;
}

LinkExtractor.extractShortLinks = function(content, shortlinkName) {
  var shortlinks = content.match(new RegExp('\\W' + shortlinkName + '\\/[^ )"><.\r\n]+', 'g'));
  if (!shortlinks) {
    return [];
  }
  for (var i = 0; i < shortlinks.length; i++) {
    shortlinks[i] = shortlinks[i].replace(/[ <>"\n\r]/g, '');
    if (shortlinks[i].charAt(0) === '/') {
      shortlinks[i] = shortlinks[i].substring(1, shortlinks[i].length);
    }
  }
  return shortlinks;
}

LinkExtractor.extractLinkFormula = function(thread) {
  var message = thread.getFirstMessageSubject();
  if (!message) {
    return null;
  }
  var bugId = LinkExtractor.extractBugId(message);
  if (bugId) {
    return Spreadsheet.hyperlinkFormula('http://b/' + bugId, 'b/' + bugId);
  }
  var messages = thread.getMessages();
  if (messages.length === 0) {
    return null;
  }
  var urls = LinkExtractor.extractUrls(messages[0].getBody());
  if (!urls || urls.length === 0) {
    return null;
  }
  Log.fine(urls);
  for (var i = 0; i < urls.length; i++) {
    var url = urls[i];
    if (url.startsWith('https://docs.')) {
      if (url.includes('/document')) {
        return Spreadsheet.hyperlinkFormula(url, 'Doc')
      } else if (url.includes('/spreadsheet')) {
        return Spreadsheet.hyperlinkFormula(url, 'Sheet')
      } else {
        return Spreadsheet.hyperlinkFormula(url, 'Link')
      }
    } else if (url.startsWith('http://go/')) {
      return Spreadsheet.hyperlinkFormula(url, url.replace('http://', ''));
    } else if (url.startsWith('https://goto.google.com/')) {
      return Spreadsheet.hyperlinkFormula(url, url.replace('https://goto.google.com/', 'go/'));
    } else {
      var linkText = LinkExtractor.PREFIX_MATCHER.matchingLinkText(url);
      if (linkText) {
        return Spreadsheet.hyperlinkFormula(url, linkText);
      }
    }
  }
  var goLinks = LinkExtractor.extractShortLinks(messages[0].getBody(), 'go');
  if (goLinks.length > 0) {
    return Spreadsheet.hyperlinkFormula('http://' + goLinks[0], goLinks[0]);
  }
  var omgLinks = LinkExtractor.extractShortLinks(messages[0].getBody(), 'omg');
  if (omgLinks.length > 0) {
    return Spreadsheet.hyperlinkFormula('http://' + omgLinks[0], omgLinks[0]);
  }
  return null;
}
