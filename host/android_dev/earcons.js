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
 * @fileoverview Earcons library for the Android platform.
 *
 * @author svetoslavganov@google.com (Svetoslav Ganov)
 *
 * TODO(svetoslavganov): Implement. For now this is a place holder.
 */

goog.provide('cvox.AndroidEarcons');

goog.require('cvox.AbstractEarcons');
goog.require('cvox.HostFactory');

/**
 * @extends {cvox.AbstractEarcons}
 * @constructor
 */
cvox.AndroidEarcons = function() {
  cvox.AbstractEarcons.call(this);
};
goog.inherits(cvox.AndroidEarcons, cvox.AbstractEarcons);

cvox.HostFactory.earconsConstructor = cvox.AndroidEarcons;
