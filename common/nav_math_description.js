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
 * @fileoverview A subclass of the navigation description container
 * specialising on math objects.
 *
 * @author sorge@google.com (Volker Sorge)
 */


goog.provide('cvox.NavMathDescription');

goog.require('cvox.NavDescription');


/**
 * Class specialising navigation descriptions for mathematics.
 * @param {{context: (undefined|string),
 *          text: (string),
 *          userValue: (undefined|string),
 *          annotation: (undefined|string),
 *          earcons: (undefined|Array.<number>),
 *          personality: (undefined|Object),
 *          type: (undefined|string),
 *          domain: (undefined|string),
 *          rule: (undefined|string),
 *          alternative: (undefined|string)}} kwargs The arguments for
 * the specialised math navigationdescription. See arguments of nav
 * description plus the following:
 * type The type of math object to be translated (e.g, symbol, function).
 * domain Domain for translation.
 * rule Speech rule.
 * alternative Alternative text that is spoken if no translation exists.
 * @constructor
 * @extends {cvox.NavDescription}
 */
cvox.NavMathDescription = function(kwargs) {
  goog.base(this, kwargs);

  var newPersonality = this.personality ? this.personality : {};
  var mathDescr = new Object();

  mathDescr['type'] = kwargs.type ? kwargs.type : '';
  mathDescr['domain'] = kwargs.domain ? kwargs.domain : '';
  mathDescr['rule'] = kwargs.rule ? kwargs.rule : '';
  mathDescr['alternative'] = kwargs.alternative ? kwargs.alternative : '';
  newPersonality['math'] = mathDescr;
  this.personality = newPersonality;
};
goog.inherits(cvox.NavMathDescription, cvox.NavDescription);
