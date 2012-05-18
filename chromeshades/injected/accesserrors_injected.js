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
 * @fileoverview Injects AccessErrors into the page as a content script.
 *
 * @author edsun@google.com (Edward Sun)
 */


goog.require('AccessErrors');

var ae = new AccessErrors();

function init() {
  chrome.extension.sendRequest({getFlag: 'accesserrors_on'}, function(
    response) {
    if (response.value == true) {
      ae.showErrors();
    }
  });

  chrome.extension.sendRequest({getFlag: 'silentcapture_on'}, function(
    response) {
    if (response.value == true) {
      console.log(ae.getErrors());
      var hostname = window.location.hostname;
      var hostparts = hostname.split('.');

      if ((hostparts[hostparts.length - 2].toLowerCase() == 'google' &&
           hostparts[hostparts.length - 1].toLowerCase() == 'com') ||
          (hostparts[hostparts.length - 2].toLowerCase() == 'googleplex' &&
           hostparts[hostparts.length - 1].toLowerCase() == 'com') ||
          (hostparts[hostparts.length - 2].toLowerCase() == 'youtube' &&
           hostparts[hostparts.length - 1].toLowerCase() == 'com') ||
          (hostparts[hostparts.length - 2].toLowerCase() == 'blogger' &&
           hostparts[hostparts.length - 1].toLowerCase() == 'com') ||
          (hostparts[hostparts.length - 2].toLowerCase() == 'blogspot' &&
           hostparts[hostparts.length - 1].toLowerCase() == 'com')) {
        chrome.extension.sendRequest({sendErrors: ae.getErrors()}, function(
          response) {
        });
      }
    }
  });
}

ae.checkAll();

init();
