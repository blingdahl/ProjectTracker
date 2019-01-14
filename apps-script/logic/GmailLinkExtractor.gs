var GmailLinkExtractor = {};

GmailLinkExtractor.UrlPrefixMatcher = function() {
  this.prefixMap = {};
}

GmailLinkExtractor.UrlPrefixMatcher.prototype.add = function(prefix, linkText) {
  this.prefixMap[prefix] = linkText;
  return this;
}

GmailLinkExtractor.UrlPrefixMatcher.prototype.matchingLinkText = function(s) {
  var prefixes = Object.keys(this.prefixMap);
  for (var i = 0; i < prefixes.length; i++) {
    var prefix = prefixes[i];
    if (s.startsWith(prefix)) {
      return this.prefixMap[prefix];
    }
  }
}

GmailLinkExtractor.ExtractorStrategy = function() { }

GmailLinkExtractor.ExtractorStrategy.prototype.extract = function(thread) {
  var subject = GmailExtractor.extractSubject(thread);
  var body = GmailExtractor.extractBody(thread);
  return ((subject && this.extractFromSubject(subject)) ||
          (body && this.extractFromBody(body)));
}

GmailLinkExtractor.ExtractorStrategy.prototype.extractFromSubject = function(subject) {
  return null;
}

GmailLinkExtractor.ExtractorStrategy.prototype.extractFromBody = function(body) {
  return null;
}

GmailLinkExtractor.BugStrategy = function() { }

GmailLinkExtractor.BugStrategy.prototype = Object.create(GmailLinkExtractor.ExtractorStrategy.prototype);

GmailLinkExtractor.BugStrategy.prototype.extractFromSubject = function(subject) {
  var issueIndex = subject.indexOf('Issue ');
  if (issueIndex < 0) {
    return null;
  }
  var nextWordIndex = issueIndex + 'Issue '.length;
  var endOfNextWordIndex = subject.indexOf(':', nextWordIndex);
  if (endOfNextWordIndex < 0) {
    return null;
  }
  var bugId = subject.substring(nextWordIndex, endOfNextWordIndex);
  return Spreadsheet.hyperlinkFormula('http://b/' + bugId, 'b/' + bugId);
}

GmailLinkExtractor.UrlStrategy = function() {
  this.urlPrefixMatcher = new GmailLinkExtractor.UrlPrefixMatcher().
      add('http://track.spe.schoolmessenger.com/', 'School Messenger').
      add('https://www.fablevisionlearning.com/', 'FableVision').
      add('https://photos.app.goo.gl/', 'Photos').
      add('https://app.smartsheet.com/b/home', 'SmartSheet').
      add('https://drive.google.com/', 'Drive');
}

GmailLinkExtractor.UrlStrategy.prototype = Object.create(GmailLinkExtractor.ExtractorStrategy.prototype);

GmailLinkExtractor.UrlStrategy.prototype.extractFromBody = function(body) {
  var urls = body.match(/https?:\/\/[^ )"><]+/g);
  if (!urls) {
    return null;
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
  for (var i = 0; i < urls.length; i++) {
    var url = urls[i];
    var docType = Docs.getType(url);
    if (docType) {
      return Spreadsheet.hyperlinkFormula(url, docType);
    } else if (url.startsWith('http://go/')) {
      return Spreadsheet.hyperlinkFormula(url, url.replace('http://', ''));
    } else if (url.startsWith('https://goto.google.com/')) {
      return Spreadsheet.hyperlinkFormula(url, url.replace('https://goto.google.com/', 'go/'));
    } else {
      var linkText = this.urlPrefixMatcher.matchingLinkText(url);
      if (linkText) {
        return Spreadsheet.hyperlinkFormula(url, linkText);
      }
    }
  }
  return null;
}

GmailLinkExtractor.ShortLinkStrategy = function(shortlinkName) {
  this.shortlinkName = shortlinkName;
}

GmailLinkExtractor.ShortLinkStrategy.prototype = Object.create(GmailLinkExtractor.ExtractorStrategy.prototype);

GmailLinkExtractor.ShortLinkStrategy.prototype.extractFromBody = function(body) {
  var shortlinks = body.match(new RegExp('\\W' + this.shortlinkName + '\\/[^ )"><.\r\n]+', 'g'));
  if (!shortlinks) {
    return null;
  }
  for (var i = 0; i < shortlinks.length; i++) {
    shortlinks[i] = shortlinks[i].replace(/[ <>"\n\r]/g, '');
    if (shortlinks[i].charAt(0) === '/') {
      shortlinks[i] = shortlinks[i].substring(1, shortlinks[i].length);
    }
  }
  if (shortlinks.length === 0) {
    return null;
  }
  return Spreadsheet.hyperlinkFormula('http://' + shortlinks[0], shortlinks[0]);
}

GmailLinkExtractor.CombinedStrategy = function(delegateStrategies) {
  this.delegateStrategies = delegateStrategies;
}

GmailLinkExtractor.CombinedStrategy.prototype = Object.create(GmailLinkExtractor.ExtractorStrategy.prototype);

GmailLinkExtractor.CombinedStrategy.prototype.extract = function(thread) {
  for (var i = 0; i < this.delegateStrategies.length; i++) {
    var ret = this.delegateStrategies[i].extract(thread);
    if (ret) {
      return ret;
    }
  }
  return null;
}

GmailLinkExtractor.COMBINED_STRATEGY = new GmailLinkExtractor.CombinedStrategy([
  new GmailLinkExtractor.BugStrategy(),
  new GmailLinkExtractor.UrlStrategy(),
  new GmailLinkExtractor.ShortLinkStrategy('go'),
  new GmailLinkExtractor.ShortLinkStrategy('omg')
]);

GmailLinkExtractor.extractLinkFormula = function(thread) {
  return GmailLinkExtractor.COMBINED_STRATEGY.extract(thread);
}