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
 * @author edsun@google.com (Edward Sun)
 */

goog.provide('cvox.ChromeShadesToggle');

var chromeshades_on;
var accesserrors_on;
var silentcapture_on;

if (localStorage['chromeshades_on'] == 'true' ||
   localStorage['chromeshades_on'] == 'false') {
  chromeshades_on = (localStorage['chromeshades_on'] == true);
} else {
  chromeshades_on = false;
  localStorage['chromeshades_on'] = chromeshades_on;
}

if (localStorage['accesserrors_on'] == 'true' ||
   localStorage['accesserrors_on'] == 'false') {
  accesserrors_on = (localStorage['accesserrors_on'] == true);
} else {
  accesserrors_on = false;
  localStorage['accesserrors_on'] = accesserrors_on;
}

if (localStorage['silentcapture_on'] == 'true' ||
   localStorage['silentcapture_on'] == 'false') {
  silentcapture_on = (localStorage['silentcapture_on'] == true);
} else {
  silentcapture_on = true;
  localStorage['silentcapture_on'] = silentcapture_on;
}

/** onToggleRequest is triggered when a toggle request is received.
 * @param {Object} request caught by listener.
 * @param {MessageSender} sender of the request.
 * @param {function()} callback function after request is processed.
 */
function onToggleRequest(request, sender, callback) {
  //  alert('toggling\n' + request.toggle + ' = ' + request.value);
  if (request.toggle === 'chromeshades_on' ||
     request.toggle === 'accesserrors_on' ||
     request.toggle === 'silentcapture_on') {
    eval(request.toggle + ' = ' + request.value);
    localStorage[request.toggle] = request.value;
    if (request.reload == true) {
      chrome.tabs.executeScript(null, {code: 'window.location.reload()'},
      function() {
   //     alert(request.toggle + ' = ' + request.value + ' now');
      });
    }
  }
}

/** sendFlag is triggered when a getFlag is received.
 * @param {Object} request caught by listener.
 * @param {MessageSender} sender of the request.
 * @param {function(Object)} sendResponse function after request is processed.
 */
function sendFlag(request, sender, sendResponse) {
  if (request.getFlag) {
    sendResponse({value: eval(request.getFlag)});
  }
}

/** sendErrors sends accessibility errors to the accesserrors AppEngine App.
 * @param {Object} request caught by listener.
 * @param {MessageSender} sender of the request.
 * @param {function(Object)} sendResponse function after request is processed.
 */

function sendErrors(request, sender, sendResponse) {
  if (request.sendErrors) {
    var errors = request.sendErrors;
    for (var i = 0; i < errors.length; i++) {
      console.log('Uploading ' + errors[i]['err_code'] +
                  ' from ' + errors[i]['url']);
      var http = new XMLHttpRequest();
      var params = 'err_code=' + encodeURIComponent(errors[i]['err_code']) +
          '&err_type=' + encodeURIComponent(errors[i]['err_type']) +
          '&url=' + encodeURIComponent(errors[i]['url']) +
          '&hostname=' + encodeURIComponent(errors[i]['hostname']) +
          '&tag_name=' + encodeURIComponent(errors[i]['tag_name']) +
          '&readable_path=' + encodeURIComponent(errors[i]['readable_path']) +
          '&query_selector_text=' + encodeURIComponent(
                                      errors[i]['query_selector_text']) +
          '&outer_html=' + encodeURIComponent(errors[i]['outer_html']) +
          '&msg=' + encodeURIComponent(errors[i]['msg']);

      http.open('POST', 'https://accesserrors.googleplex.com/PutError', true);
      http.setRequestHeader('Content-Type',
                            'application/x-www-form-urlencoded');
      http.send(params);
    }
  }
}

/** injectStuff injects CSS/JavaScript based on the toggle settings
 */
function injectStuff() {
  var cssFiles = new Array();
  var jsFiles = new Array();

  if (accesserrors_on == true || silentcapture_on == true) {
    jsFiles = ['/chromeshades/injected/accesserrors_binary.js', // compiled
               '/closure/closure_preinit.js',  // uncompiled
               '/closure/base.js',
               '/deps.js',
               '/chromeshades/injected/accesserrors_injected.js'];
  }

  if (chromeshades_on == true) {
    cssFiles = ['/chromeshades/chromeshades.css'];
    jsFiles = ['/chromeshades/injected/binary.js',  // compiled
               '/closure/closure_preinit.js',  // uncompiled
               '/closure/base.js',
               '/deps.js',
               '/chromeshades/injected/loader.js'];
  }

  for (var i = 0; i < cssFiles.length; i++) {
    chrome.tabs.insertCSS(null, {file: cssFiles[i], allFrames: true});
  }

  for (var j = 0; j < jsFiles.length; j++) {
    chrome.tabs.executeScript(null, {file: jsFiles[j], allFrames: true});
  }
}

chrome.extension.onRequest.addListener(onToggleRequest);
chrome.extension.onRequest.addListener(sendFlag);
chrome.extension.onRequest.addListener(sendErrors);
chrome.tabs.onUpdated.addListener(injectStuff);

var rand_seconds = Math.floor(Math.random() * 46) + 15;

setInterval(injectStuff, rand_seconds * 1000);
