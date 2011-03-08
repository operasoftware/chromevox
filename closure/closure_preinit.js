// Copyright 2010 Google Inc.
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
 * @fileoverview Code to execute before Closure's base.js.
 *
 * @author dmazzoni@google.com (Dominic Mazzoni)
 */

// Tell Closure to load JavaScript code from the extension root directory.
window.CLOSURE_BASE_PATH = chrome.extension.getURL('/closure/');

// Tell Closure not to load deps.js; it's included by manifest.json already.
window.CLOSURE_NO_DEPS = true;

// Tell Closure to use a loading mechanism designed for Chrome content
// scripts.
window.CHROME_CONTENT_SCRIPT = true;
