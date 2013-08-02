// Copyright 2013 Google Inc.
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
 * @fileoverview Defines the ChromeVox app.
 * @author deboer@google.com (James deBoer)
 */

window.CLOSURE_USE_EXT_MESSAGES = true;

goog.require('cvox.ChromeEarcons');
goog.require('cvox.ChromeHost');
goog.require('cvox.ChromeMathJax');
goog.require('cvox.ChromeMsgs');
goog.require('cvox.ChromeTts');
goog.require('cvox.ChromeBraille');
goog.require('cvox.ChromeVoxInit');

if (COMPILED) {
  // NOTE(deboer): This is called when this script is loaded, automatically
  // starting ChromeVox. If this isn't the compiled script, it will be
  // called in init_document.js.
  cvox.ChromeVox.initDocument();
}
