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
 * @fileoverview ChromeVox tests page.
 *
 * @author clchen@google.com (Charles L. Chen)
 */

goog.require('cvox.AutoRunner');
goog.require('cvox.ChromeBraille');
goog.require('cvox.ChromeEarcons');
goog.require('cvox.ChromeHost');
goog.require('cvox.ChromeMsgs');
goog.require('cvox.ChromeTts');
goog.require('cvox.ChromeVox');
goog.require('cvox.InitGlobals');
goog.require('cvox.EventWatcherTest');
goog.require('cvox.NavigationManagerTest');
goog.require('cvox.ExtensionBridge');
goog.require('cvox.HostFactory');

document.addEventListener('DOMContentLoaded', function() {
  cvox.InitGlobals.initGlobals();
  var runner = new cvox.AutoRunner();
  runner.runTestCase(new cvox.EventWatcherTest());
  runner.runTestCase(new cvox.NavigationManagerTest());
}, false);
