// Copyright 2011 Google Inc.
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
 * @fileoverview Abstract interface to methods that differ depending on the
 * host platform.
 *
 * @author dmazzoni@google.com (Dominic Mazzoni)
 */

goog.provide('cvox.AbstractHost');

/**
 * @constructor
 */
cvox.AbstractHost = function() {
};

/**
 * Do all host-platform-specific initialization.
 */
cvox.AbstractHost.prototype.init = function() {
};

cvox.AbstractHost.prototype.reinit = function() {
};

cvox.AbstractHost.prototype.onPageLoad = function() {
};

cvox.AbstractHost.prototype.sendToBackgroundPage = function(message) {
};
