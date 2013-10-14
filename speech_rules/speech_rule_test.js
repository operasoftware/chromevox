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
 * @fileoverview Testcases for math speech rules.
 * @author sorge@google.com (Volker Sorge)
 */

goog.provide('cvox.SpeechRuleTest');

goog.require('cvox.AbstractTestCase');
goog.require('cvox.ChromeVoxTester');


/**
 * @constructor
 * @extends {cvox.AbstractTestCase}
 */
cvox.SpeechRuleTest = function() { };
goog.inherits(cvox.SpeechRuleTest, cvox.AbstractTestCase);


/** Test objects for structural equality using JSON, otherwise use
 * normal equality.
 * @param {*} expected Expected value.
 * @param {*} actual The actual computed value.
 * @return {boolean}
 */
cvox.SpeechRuleTest.prototype.assertStructEquals =
    function(expected, actual) {
      if ((typeof(expected) == 'object' && typeof(actual) == 'object')) {
        return this.assertEquals(JSON.stringify(expected),
                                 JSON.stringify(actual));
      }
      this.assertEquals(expected, actual);
};


/** Test speech rule attributes.
 * @export
 */
cvox.SpeechRuleTest.prototype.testAttributes = function() {
  var comp = cvox.SpeechRule.Component.fromString('[n] ./');
  comp.addAttributes(
      '(ctxtfunc:element,separator:"plus", volume:0.5)');
  this.assertStructEquals(
      ['ctxtfunc:element',
       'separator:"plus"',
       'volume:0.5'],
      comp.getAttributes());
  comp = cvox.SpeechRule.Component.fromString('[n] ./');
  comp.addAttributes(
      '(context:"node",pitch:0.5,difference)');
  this.assertStructEquals(
      ['context:"node"',
       'pitch:0.5',
       'difference:true'],
      comp.getAttributes());
};


/** Test simple speech rule components.
 * @export
 */
cvox.SpeechRuleTest.prototype.testSimpleComponents = function() {
  this.assertStructEquals(
      {'type': cvox.SpeechRule.Type.MULTI,
       'content': './*'},
      cvox.SpeechRule.Component.fromString('[m] ./*'));
  this.assertStructEquals(
      {'type': cvox.SpeechRule.Type.NODE,
       'content': './*[1]'},
cvox.SpeechRule.Component.fromString('[n] ./*[1]'));
  this.assertStructEquals(
      {'type': cvox.SpeechRule.Type.PERSONALITY,
       'pause': '200'},
      cvox.SpeechRule.Component.fromString('[p] (pause:200)'));
  this.assertStructEquals(
      {'type': cvox.SpeechRule.Type.TEXT,
       'content': '"super"'},
      cvox.SpeechRule.Component.fromString('[t] "super"'));
  this.assertStructEquals(
      {'type': cvox.SpeechRule.Type.TEXT,
       'content': 'text()'},
      cvox.SpeechRule.Component.fromString('[t] text()'));
};


/** Test speech rule components with attributes.
 * @export
 */
cvox.SpeechRuleTest.prototype.testComplexComponents = function() {
  this.assertStructEquals(
      {'type': cvox.SpeechRule.Type.MULTI,
       'content': './*',
       'ctxtfunc': 'element',
       'separator': '"plus"',
       'volume': '0.5'},
      cvox.SpeechRule.Component.fromString(
          '[m] ./* (ctxtfunc:element,separator:"plus", volume:0.5)'));
  this.assertStructEquals(
      {'type': cvox.SpeechRule.Type.NODE,
       'content': './*[1]',
       'context': '"node"',
       'pitch': '0.5'},
      cvox.SpeechRule.Component.fromString(
          '[n] ./*[1] (context:"node",pitch:0.5)'));
};


/** Test speech rules.
 * @export
 */
cvox.SpeechRuleTest.prototype.testRules = function() {
  this.assertStructEquals(
      [
        {'type': cvox.SpeechRule.Type.TEXT,
         'content': '"Square root of"'},
        {'type': cvox.SpeechRule.Type.NODE,
         'content': './*[1]',
         'rate': '0.2'},
        {'type': cvox.SpeechRule.Type.PERSONALITY,
         'pause': '400'}
      ],
      cvox.SpeechRule.Action.fromString(
          '[t] "Square root of"; [n] ./*[1] (rate:0.2); [p] (pause:400)')
              .components
      );

  this.assertStructEquals(
      [
        {'type': cvox.SpeechRule.Type.NODE,
         'content': './*[1]/*[1]/*[1]'},
        {'type': cvox.SpeechRule.Type.TEXT,
         'content': '"sub"'},
        {'type': cvox.SpeechRule.Type.NODE,
         'content': './*[1]/*[3]/*[1]',
         'pitch': '-0.35'},
        {'type': cvox.SpeechRule.Type.PERSONALITY,
         'pause': '200'},
        {'type': cvox.SpeechRule.Type.TEXT,
         'content': '"super"'},
        {'type': cvox.SpeechRule.Type.NODE,
         'content': './*[1]/*[2]/*[1]',
         'pitch': '0.35'},
        {'type': cvox.SpeechRule.Type.PERSONALITY,
         'pause': '300'}
      ],
      cvox.SpeechRule.Action.fromString(
          '[n] ./*[1]/*[1]/*[1]; [t] "sub"; [n] ./*[1]/*[3]/*[1] ' +
          '(pitch:-0.35) ;[p](pause:200); [t] "super";' +
          '[n] ./*[1]/*[2]/*[1] (pitch:0.35) ;  [p] (pause:300)   ').components
      );
};


/** Test translation of speech rule attributes.
 * @export
 */
cvox.SpeechRuleTest.prototype.testAttributesString = function() {
  this.assertStructEquals(
      ['context:"node"', 'pitch:0.5'],
      cvox.SpeechRule.Component.fromString(
          '[n] ./ (context:"node", pitch:0.5)').getAttributes());

  this.assertStructEquals(
      ['ctxtfunc:element', 'separator:"plus"', 'volume:0.5'],
      cvox.SpeechRule.Component.fromString(
          '[t] "irrelevant" (ctxtfunc:element,' +
              'separator:"plus",' +
                  'volume:0.5)').getAttributes());
};


/** Test translation of simple speech rule components.
 * @export
 */
cvox.SpeechRuleTest.prototype.testSimpleComponentsString = function() {
  this.assertStructEquals(
      '[m] ./*',
      cvox.SpeechRule.Component.fromString('[m] ./*').toString());

  this.assertStructEquals(
      '[n] ./*[1]',
      cvox.SpeechRule.Component.fromString('[n] ./*[1]').toString());

  this.assertStructEquals(
      '[p] (pause:200)',
      cvox.SpeechRule.Component.fromString('[p] (pause:200)').toString());

  this.assertStructEquals(
      '[t] "super"',
      cvox.SpeechRule.Component.fromString('[t] "super"').toString());

  this.assertStructEquals(
      '[t] text()',
      cvox.SpeechRule.Component.fromString('[t] text()').toString());
};


/** Test translation of speech rule components with attributes.
 * @export
 */
cvox.SpeechRuleTest.prototype.testComplexComponentsString = function() {
var comp1 = '[m] ./* (ctxtfunc:element, separator:"plus", volume:0.5)';
  this.assertStructEquals(comp1,
      cvox.SpeechRule.Component.fromString(comp1).toString());

  var comp2 = '[n] ./*[1] (context:"node", pitch:0.5)';
  this.assertStructEquals(comp2,
      cvox.SpeechRule.Component.fromString(comp2).toString());
};


/** Test translation of speech rules.
 * @export
 */
cvox.SpeechRuleTest.prototype.testRulesString = function() {
var rule1 = '[t] "Square root of"; [n] ./*[1] (rate:0.2); [p] (pause:400)';
  this.assertStructEquals(rule1,
      cvox.SpeechRule.Action.fromString(rule1).toString());

  var rule2 =
      '[n] ./*[1]/*[1]/*[1]; [t] "sub"; [n] ./*[1]/*[3]/*[1] ' +
      '(pitch:-0.35); [p] (pause:200); [t] "super";' +
      ' [n] ./*[1]/*[2]/*[1] (pitch:0.35); [p] (pause:300)';
  this.assertStructEquals(rule2,
      cvox.SpeechRule.Action.fromString(rule2).toString());
};


/** Tests for double quoted string syntax.
 * @export
 */
cvox.SpeechRuleTest.prototype.testSeparatorsInStrings = function() {
  var rule1 = '[t] "matrix; 3 by 3"; [n] ./*[1]';
  this.assertStructEquals(
      rule1, cvox.SpeechRule.Action.fromString(rule1).toString());

  var rule2 = '[t] "matrix; 3;""by 3"; [n] ./*[1]';
  this.assertStructEquals(
      rule2, cvox.SpeechRule.Action.fromString(rule2).toString());

  var rule3 = '[t] "matrix; by 3"; [n] ./*[1] ' +
              '(context:"where, who; why, when", separator:@separator)';
  var sprule3 = cvox.SpeechRule.Action.fromString(rule3);
  this.assertStructEquals(rule3, sprule3.toString());
  this.assertEquals('[t] "matrix; by 3"', sprule3.components[0].toString());
  this.assertEquals('"where, who; why, when"',
                    sprule3.components[1]['context']);
};
