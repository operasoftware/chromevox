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

goog.provide('cvox.MathSpeechRuleTest');

goog.require('cvox.AbstractTestCase');
goog.require('cvox.ChromeVoxTester');
goog.require('cvox.MathSpeechRule');


/**
 * @constructor
 * @extends {cvox.AbstractTestCase}
 */
cvox.MathSpeechRuleTest = function() { };
goog.inherits(cvox.MathSpeechRuleTest, cvox.AbstractTestCase);


/** Test objects for structural equality using JSON, otherwise use
 * normal equality.
 * @param {*} expected Expected value.
 * @param {*} actual The actual computed value.
 * @return {boolean}
 */
cvox.MathSpeechRuleTest.prototype.assertStructEquals =
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
cvox.MathSpeechRuleTest.prototype.testAttributes = function() {
  var comp = /** @type {cvox.MathSpeechRule.component} */ ({});
  cvox.MathSpeechRule.parseAttributes(
      '(ctxtfunc:element,separator:plus, volume:0.5)', comp);
  this.assertStructEquals(
      {'ctxtfunc': 'element',
       'separator': 'plus',
       'volume': '0.5'},
      comp);
  comp = /** @type {cvox.MathSpeechRule.component} */ ({});
  cvox.MathSpeechRule.parseAttributes(
      '(context:node,pitch:0.5,difference)', comp);
  this.assertStructEquals(
      {'context': 'node',
       'pitch': '0.5',
       'difference': 'true'},
      comp);
};


/** Test simple speech rule components.
 * @export
 */
cvox.MathSpeechRuleTest.prototype.testSimpleComponents = function() {
  this.assertStructEquals(
      {'type': cvox.MathSpeechRule.type.MULTI,
       'content': './*'},
      cvox.MathSpeechRule.parseComp('[m] ./*'));
  this.assertStructEquals(
      {'type': cvox.MathSpeechRule.type.NODE,
       'content': './*[1]'},
      cvox.MathSpeechRule.parseComp('[n] ./*[1]'));
  this.assertStructEquals(
      {'type': cvox.MathSpeechRule.type.PERSONALITY,
       'pause': '200'},
      cvox.MathSpeechRule.parseComp('[p] (pause:200)'));
  this.assertStructEquals(
      {'type': cvox.MathSpeechRule.type.STRING,
       'content': 'super'},
      cvox.MathSpeechRule.parseComp('[s] "super"'));
  this.assertStructEquals(
      {'type': cvox.MathSpeechRule.type.TEXT,
       'content': 'text()'},
      cvox.MathSpeechRule.parseComp('[t] text()'));
};


/** Test speech rule components with attributes.
 * @export
 */
cvox.MathSpeechRuleTest.prototype.testComplexComponents = function() {
  this.assertStructEquals(
      {'type': cvox.MathSpeechRule.type.MULTI,
       'content': './*',
       'ctxtfunc': 'element',
       'separator': 'plus',
       'volume': '0.5'},
      cvox.MathSpeechRule.parseComp(
          '[m] ./* (ctxtfunc:element,separator:plus, volume:0.5)'));
  this.assertStructEquals(
      {'type': cvox.MathSpeechRule.type.NODE,
       'content': './*[1]',
       'context': 'node',
       'pitch': '0.5'},
      cvox.MathSpeechRule.parseComp('[n] ./*[1] (context:node,pitch:0.5)'));
};


/** Test speech rules.
 * @export
 */
cvox.MathSpeechRuleTest.prototype.testRules = function() {
  this.assertStructEquals(
      [
        {'type': cvox.MathSpeechRule.type.STRING,
         'content': 'Square root of'},
        {'type': cvox.MathSpeechRule.type.NODE,
         'content': './*[1]',
         'rate': '0.2'},
        {'type': cvox.MathSpeechRule.type.PERSONALITY,
         'pause': '400'}
      ],
      cvox.MathSpeechRule.parseRule(
          '[s] "Square root of"; [n] ./*[1] (rate:0.2); [p] (pause:400)')
      );
  this.assertStructEquals(
      [
        {'type': cvox.MathSpeechRule.type.NODE,
         'content': './*[1]/*[1]/*[1]'},
        {'type': cvox.MathSpeechRule.type.STRING,
         'content': 'sub'},
        {'type': cvox.MathSpeechRule.type.NODE,
         'content': './*[1]/*[3]/*[1]',
         'pitch': '-0.35'},
        {'type': cvox.MathSpeechRule.type.PERSONALITY,
         'pause': '200'},
        {'type': cvox.MathSpeechRule.type.STRING,
         'content': 'super'},
        {'type': cvox.MathSpeechRule.type.NODE,
         'content': './*[1]/*[2]/*[1]',
         'pitch': '0.35'},
        {'type': cvox.MathSpeechRule.type.PERSONALITY,
         'pause': '300'}
      ],
      cvox.MathSpeechRule.parseRule(
          '[n] ./*[1]/*[1]/*[1]; [s] "sub"; [n] ./*[1]/*[3]/*[1] ' +
          '(pitch:-0.35) ;[p](pause:200); [s] "super";' +
          '[n] ./*[1]/*[2]/*[1] (pitch:0.35) ;  [p] (pause:300)   ')
      );
};


/** Test translation of speech rule attributes.
 * @export
 */
cvox.MathSpeechRuleTest.prototype.testAttributesString = function() {
  this.assertStructEquals(
      ['context:node', 'pitch:0.5'],
      cvox.MathSpeechRule.stringifyAttrib(
          /** @type {cvox.MathSpeechRule.component} */
          ({'context': 'node',
            'pitch': '0.5'}))
      );
  this.assertStructEquals(
      ['ctxtfunc:element', 'separator:plus', 'volume:0.5'],
      cvox.MathSpeechRule.stringifyAttrib(
          /** @type {cvox.MathSpeechRule.component} */
          ({'type': cvox.MathSpeechRule.type.STRING,
            'content': 'irrelevant',
            'ctxtfunc': 'element',
            'separator': 'plus',
            'volume': '0.5'}))
      );
};


/** Test translation of simple speech rule components.
 * @export
 */
cvox.MathSpeechRuleTest.prototype.testSimpleComponentsString = function() {
  this.assertStructEquals(
      '[m] ./*',
      cvox.MathSpeechRule.stringifyComp(
          /** @type {cvox.MathSpeechRule.component} */
          ({'type': cvox.MathSpeechRule.type.MULTI,
           'content': './*'})));
  this.assertStructEquals(
      '[n] ./*[1]',
      cvox.MathSpeechRule.stringifyComp(
          /** @type {cvox.MathSpeechRule.component} */
          ({'type': cvox.MathSpeechRule.type.NODE,
           'content': './*[1]'})));
  this.assertStructEquals(
      '[p] (pause:200)',
      cvox.MathSpeechRule.stringifyComp(
          /** @type {cvox.MathSpeechRule.component} */
          ({'type': cvox.MathSpeechRule.type.PERSONALITY,
           'pause': '200'})));
  this.assertStructEquals(
      '[s] "super"',
      cvox.MathSpeechRule.stringifyComp(
          /** @type {cvox.MathSpeechRule.component} */
          ({'type': cvox.MathSpeechRule.type.STRING,
           'content': 'super'})));
  this.assertStructEquals(
      '[t] text()',
      cvox.MathSpeechRule.stringifyComp(
          /** @type {cvox.MathSpeechRule.component} */
          ({'type': cvox.MathSpeechRule.type.TEXT,
           'content': 'text()'})));
};


/** Test translation of speech rule components with attributes.
 * @export
 */
cvox.MathSpeechRuleTest.prototype.testComplexComponentsString = function() {
  this.assertStructEquals(
      '[m] ./* (ctxtfunc:element, separator:plus, volume:0.5)',
      cvox.MathSpeechRule.stringifyComp(
           /** @type {cvox.MathSpeechRule.component} */
          ({'type': cvox.MathSpeechRule.type.MULTI,
            'content': './*',
            'ctxtfunc': 'element',
            'separator': 'plus',
            'volume': '0.5'})));
  this.assertStructEquals(
      '[n] ./*[1] (context:node, pitch:0.5)',
      cvox.MathSpeechRule.stringifyComp(
          /** @type {cvox.MathSpeechRule.component} */
          ({'type': cvox.MathSpeechRule.type.NODE,
            'content': './*[1]',
            'context': 'node',
            'pitch': '0.5'})));
};


/**
 * Coercion of object list to a speech rule.
 * @param {Array.<Object>} list Objects representing rule components.
 * @return {!cvox.MathSpeechRule.rule} The new rule.
 */
cvox.MathSpeechRuleTest.toRule = function(list) {
  var rule = /** @type {!cvox.MathSpeechRule.rule} */([]);
  list.forEach(function(x) {rule.push(
      /** @type {!cvox.MathSpeechRule.component} */(x));});
  return rule;
};


/** Test translation of speech rules.
 * @export
 */
cvox.MathSpeechRuleTest.prototype.testRulesString = function() {
  this.assertStructEquals(
      '[s] "Square root of"; [n] ./*[1] (rate:0.2); [p] (pause:400)',
      cvox.MathSpeechRule.stringifyRule(
          cvox.MathSpeechRuleTest.toRule(
              [
                {'type': cvox.MathSpeechRule.type.STRING,
                 'content': 'Square root of'},
                {'type': cvox.MathSpeechRule.type.NODE,
                 'content': './*[1]',
                 'rate': '0.2'},
                {'type': cvox.MathSpeechRule.type.PERSONALITY,
                 'pause': '400'}
              ])));
  this.assertStructEquals(
      '[n] ./*[1]/*[1]/*[1]; [s] "sub"; [n] ./*[1]/*[3]/*[1] ' +
      '(pitch:-0.35); [p] (pause:200); [s] "super";' +
      ' [n] ./*[1]/*[2]/*[1] (pitch:0.35); [p] (pause:300)',
      cvox.MathSpeechRule.stringifyRule(
          cvox.MathSpeechRuleTest.toRule(
              [
                {'type': cvox.MathSpeechRule.type.NODE,
                 'content': './*[1]/*[1]/*[1]'},
                {'type': cvox.MathSpeechRule.type.STRING,
                 'content': 'sub'},
                {'type': cvox.MathSpeechRule.type.NODE,
                 'content': './*[1]/*[3]/*[1]',
                 'pitch': '-0.35'},
                {'type': cvox.MathSpeechRule.type.PERSONALITY,
                 'pause': '200'},
                {'type': cvox.MathSpeechRule.type.STRING,
                 'content': 'super'},
                {'type': cvox.MathSpeechRule.type.NODE,
                 'content': './*[1]/*[2]/*[1]',
                 'pitch': '0.35'},
                {'type': cvox.MathSpeechRule.type.PERSONALITY,
                 'pause': '300'}
                ])));
};
