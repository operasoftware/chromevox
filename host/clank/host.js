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
 * @fileoverview Android-specific implementation of methods that differ
 * depending on the host platform.
 *
 * @author dmazzoni@google.com (Dominic Mazzoni)
 */

goog.provide('cvox.ClankHost');

goog.require('cvox.AndroidHost');
goog.require('cvox.AndroidVox');
goog.require('cvox.ApiImplementation');
goog.require('cvox.ChromeVoxEventWatcher');
goog.require('cvox.ChromeVoxKbHandler');
goog.require('cvox.HostFactory');

/**
 * @constructor
 * @extends {cvox.AndroidHost}
 */

cvox.ClankHost = function() {
  cvox.AndroidHost.call(this);
};
goog.inherits(cvox.ClankHost, cvox.AndroidHost);

cvox.HostFactory.hostConstructor = cvox.ClankHost;
