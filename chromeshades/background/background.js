// Copyright 2012 Google Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Script that runs on the background page.
 *
 * @author dmazzoni@google.com (Dominic Mazzoni)
 */

goog.provide('cvox.CacheItem');
goog.provide('cvox.ChromeShadesBackground');

goog.require('cvox.ExtensionBridge');
goog.require('cvox.ChromeShadesToggle');

/**
 * An item in the cache of skipped resource metadata.
 * @param {string} url The url of the resource.
 * @param {number} len The number of bytes of the resource.
 * @constructor
 */
cvox.CacheItem = function(url, len) {
  /**
   * The url of the resource.
   * @type {string}
   */
  this.url = url;

  /**
   * The number of bytes of the resource.
   * @type {number}
   */
  this.len = len;

  /**
   * The timestamp when this item was accessed. We expire everything
   * from the cache after CACHE_TIMEOUT_MS milliseconds.
   * @type {Date}
   */
  this.time = new Date();
};

/**
 * This object manages the global and persistent state for ChromeShades.
 * It listens for messages from the content scripts on pages and
 * interprets them.
 * @constructor
 */
cvox.ChromeShadesBackground = function() {
  /**
   * @type number
   */
  this.totalSkippedResources = 0;

  /**
   * @type number
   */
  this.totalSkippedBytes = 0;

  /**
   * @type {Object.<string, cvox.CacheItem>}
   */
  this.cache = {};

  var self = this;
  window.setInterval(function() {
    self.clearStaleItemsFromCache();
  }, cvox.ChromeShadesBackground.CACHE_TIMEOUT_MS);
};

/**
 * @const
 * @type {number}
 */
cvox.ChromeShadesBackground.CACHE_TIMEOUT_MS = 15 * 60 * 1000;

/**
 * Initialize the background page: set up TTS and bridge listeners.
 */
cvox.ChromeShadesBackground.prototype.init = function() {
  var self = this;
  cvox.ExtensionBridge.addMessageListener(function(message, port) {
    if (message['command'] == 'stylesheet_request') {
      self.handleStyleSheetRequest(message['hrefs'],
                                   message['firstTime'],
                                   port);
    } else if (message['command'] == 'skipped_resource_request') {
      self.handleSkippedResourceRequest(message['url'], port);
    }
  });
};

/**
 * Called when a content script sends us the urls of a bunch of stylesheets
 * to fetch (it can't access them due to cross-origin restrictions).
 * @param {Array.<string>} hrefs The urls to fetch.
 * @param {boolean} firstTime If this is initially loading a page; we just
 *     need to pass this value along to the response function.
 * @param {Port} port The port to the content script.
 */
cvox.ChromeShadesBackground.prototype.handleStyleSheetRequest =
    function(hrefs, firstTime, port) {
  var completedMap = {};
  completedMap.count = 0;
  for (var i = 0; i < hrefs.length; i++) {
    this.fetchStyleSheet(hrefs[i], completedMap, hrefs.length, firstTime, port);
  }
};

/**
 * Fetch one style sheet using an XMLHttpRequest. Store the received
 * data in a map, and when the last one is received (successfully or not),
 * call the method to return all of them to the content script.
 * @param {string} href The url to fetch.
 * @param {Object.<string, string>} completedMap The map from url to css data.
 * @param {number} hrefCount The total number of urls being fetched.
 * @param {boolean} firstTime If this is initially loading a page; we just
 *     need to pass this value along to the response function.
 * @param {Port} port The port to the content script.
 */
cvox.ChromeShadesBackground.prototype.fetchStyleSheet = function(
    href, completedMap, hrefCount, firstTime, port) {
  console.log('Fetching resource: ' + href);
  var self = this;
  var xhr = new XMLHttpRequest();
  xhr.open('GET', href);
  xhr.onreadystatechange = function() {
    if (xhr.readyState == 4) {
      if (xhr.status == 200) {
        completedMap[href] = xhr.responseText;
      }
      completedMap.count++;
      if (completedMap.count == hrefCount) {
        self.returnFetchedStyleSheets(completedMap, firstTime, port);
      }
    }
  };
  xhr.send();
};

/**
 * Send the received stylesheets to the content script so it can modify them
 * and add them back to the page.
 * @param {Object.<string, string>} completedMap The map from url to css data.
 * @param {boolean} firstTime If this is initially loading a page; we just
 *     need to pass this value along to the response function.
 * @param {Port} port The port to the content script.
 */
cvox.ChromeShadesBackground.prototype.returnFetchedStyleSheets = function(
    completedMap, firstTime, port) {
  var response = {
      'cmd': 'stylesheet_response',
      'stylesheets': completedMap,
      'firstTime': firstTime};
  port.postMessage(response);
};

/**
 * Called when the content script decides to skip loading a resource.
 * Execute a HEAD request on the resource to figure out how big it
 * would have been, then keep track of some stats using a cache so
 * that the same resource skipped multiple times in a row doesn't
 * count multiple times.
 * @param {string} url The url of the resource.
 * @param {Port} port The port to the content script.
 */
cvox.ChromeShadesBackground.prototype.handleSkippedResourceRequest = function(
    url, port) {
  console.log('Fetching metadata: ' + url);
  var cacheItem = this.cache[url];
  if (cacheItem) {
    this.handleSkippedResourceResponse(url, cacheItem.len, port, true);
    return;
  }

  var self = this;
  var xhr = new XMLHttpRequest;
  xhr.open('HEAD', url);
  xhr.onreadystatechange = function() {
    if (xhr.readyState == 4) {
      if (xhr.status == 200) {
        var len = parseInt(xhr.getResponseHeader('Content-Length'), 10);
        self.cache[url] = new cvox.CacheItem(url, len);
        self.totalSkippedResources += 1;
        if (len && len > 0) {
          self.totalSkippedBytes += len;
        }
        if (len > 0) {
          self.handleSkippedResourceResponse(url, len, port, false);
        }
      }
    }
  };
  xhr.send();
};

/**
 * Send the information about this skipped resource, and the overall skipped
 * resource stats, back to the content script.
 * @param {string} url The url of the resource.
 * @param {number} len The length of the resource, as gathered from the
 *     http HEAD request, in bytes.
 * @param {Port} port The port to the content script.
 * @param {boolean} cached True if we got this from our cache rather than
 *     from a fresh HEAD request.
 */
cvox.ChromeShadesBackground.prototype.handleSkippedResourceResponse = function(
    url, len, port, cached) {
  var response = {
    'cmd': 'skipped_resource_response',
    'url': url,
    'length': len,
    'cached': cached,
    'total_resources': this.totalSkippedResources,
    'total_bytes': this.totalSkippedBytes
  };
  port.postMessage(response);
};

/**
 * Called periodically to clear items from the cache of skipped resources.
 */
cvox.ChromeShadesBackground.prototype.clearStaleItemsFromCache = function() {
  var now = new Date();
  for (var url in this.cache) {
    if (now - this.cache[url].time >
        cvox.ChromeShadesBackground.CACHE_TIMEOUT_MS) {
      delete this.cache[url];
    }
  }
};
