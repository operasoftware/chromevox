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
 * @fileoverview Dummy implementation of host.js for testing.
 *
 * @author dmazzoni@google.com (Dominic Mazzoni)
 */

goog.provide('cvox.TestHost');

goog.require('cvox.AbstractHost');
goog.require('cvox.HostFactory');

/**
 * @constructor
 * @extends {cvox.AbstractHost}
 */
cvox.TestHost = function() {
  cvox.AbstractHost.call(this);
};
goog.inherits(cvox.TestHost, cvox.AbstractHost);

cvox.HostFactory.hostConstructor = cvox.TestHost;
