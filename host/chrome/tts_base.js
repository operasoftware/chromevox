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
 * @fileoverview A base class for Tts living on Chrome platforms.
 *
 * @author sorge@google.com (Volker Sorge)
 */

goog.provide('cvox.ChromeTtsBase');

goog.require('cvox.AbstractTts');


/**
 * @constructor
 * @extends {cvox.AbstractTts}
 */
cvox.ChromeTtsBase = function() {
  goog.base(this);
  this.propertyDefault['pitch'] = 1;
  this.propertyMin['pitch'] = 0.2;
  this.propertyMax['pitch'] = 2.0;

  this.propertyDefault['rate'] = 1;
  this.propertyMin['rate'] = 0.2;
  this.propertyMax['rate'] = 5.0;

  this.propertyDefault['volume'] = 1;
  this.propertyMin['volume'] = 0.2;
  this.propertyMax['volume'] = 1.0;
};
goog.inherits(cvox.ChromeTtsBase, cvox.AbstractTts);
