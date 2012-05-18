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
 * @fileoverview Caret browsing content script initializer.
 *
 * @author dmazzoni@google.com (Dominic Mazzoni)
 */

goog.require('CaretBrowsing');

// Make sure th script only loads once.
if (!window['caretBrowsingLoaded']) {
  window['caretBrowsingLoaded'] = true;
  CaretBrowsing.init();
  chrome.extension.onRequest.addListener(CaretBrowsing.onExtensionMessage);
  chrome.extension.sendRequest({'init': true},
                               CaretBrowsing.onExtensionMessage);
}
