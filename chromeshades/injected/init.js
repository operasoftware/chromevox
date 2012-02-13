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
 * @fileoverview Initializes the injected content script.
 *
 * @author dmazzoni@google.com (Dominic Mazzoni)
 */

goog.require('cvox.BaseModifier');
goog.require('cvox.ExtensionBridge');
goog.require('cvox.ShadesModifier');

/**
 * @constructor
 */
cvox.ChromeShades = function() {
};

/**
 * Initializes cvox.ChromeShades.
 */
cvox.ChromeShades.init = function() {
  cvox.ExtensionBridge.setupBackgroundPort();
  cvox.ChromeShades.modifier = new cvox.ShadesModifier();

  cvox.ExtensionBridge.addMessageListener(function(message) {
    if (message['cmd'] == 'stylesheet_response') {
      cvox.ChromeShades.modifier.handleStyleSheetResponse(message);
    } else if (message['cmd'] == 'skipped_resource_response') {
      cvox.ChromeShades.modifier.handleSkippedResourceResponse(message);
    }
  });

  if (document.readyState == 'complete' ||
      document.readyState == 'interactive') {
    cvox.ChromeShades.modifier.enable();
  } else {
    document.addEventListener('DOMContentLoaded', function() {
      window.setTimeout(function() {
        cvox.ChromeShades.modifier.enable();
      }, 0);
      return false;
    }, false);
  }

  document.addEventListener('beforeload', function(e) {
    if (e.target.constructor == HTMLImageElement ||
        e.target.constructor == HTMLEmbedElement ||
        e.target.constructor == HTMLObjectElement) {
      cvox.ChromeShades.trackSkippedResource(e.url);
      e.preventDefault();
    }

    if (e.target.constructor == HTMLInputElement &&
        e.target.type == 'image') {
      cvox.ChromeShades.trackSkippedResource(e.url);
      e.preventDefault();
    }

    var tokens = e.url.split('.');
    if (tokens && tokens.length > 1) {
      var ext = tokens[tokens.length - 1].toLowerCase();
      if (ext == 'gif' || ext == 'jpg' || ext == 'jpeg' || ext == 'png') {
        cvox.ChromeShades.trackSkippedResource(e.url);
        e.preventDefault();
      }
    }

    return false;
  }, true);
};

/**
 * Send a message to the background page so we can keep track of
 * resources that weren't loaded.
 * @param {string} url The url of the resource that was skipped.
 */
cvox.ChromeShades.trackSkippedResource = function(url) {
  var skippedResourceRequest = {
    'command': 'skipped_resource_request',
    'url': url
  };
  cvox.ExtensionBridge.send(skippedResourceRequest);
};

cvox.ChromeShades.init();
