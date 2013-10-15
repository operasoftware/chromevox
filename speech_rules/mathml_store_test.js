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
 * @fileoverview Testcases for math node functions.
 * @author sorge@google.com (Volker Sorge)
 */

goog.provide('cvox.MathmlStoreTest');

goog.require('cvox.AbstractTestCase');
goog.require('cvox.ChromeVoxTester');
goog.require('cvox.MathStore');
goog.require('cvox.MathmlStore');


/**
 * @constructor
 * @extends {cvox.AbstractTestCase}
 */
cvox.MathmlStoreTest = function() {
  goog.base(this);
};
goog.inherits(cvox.MathmlStoreTest, cvox.AbstractTestCase);



/**
 * @override
 */
cvox.MathmlStoreTest.prototype.setUpTest = function() {
  this.rules = cvox.MathmlStore.getInstance();
  cvox.SpeechRuleEngine.getInstance().parameterize(this.rules);
  this.nodeCounter = 0;
};


/**
 * Tests if for a given html snippet the applicable rule is indeed the same
 * as the one provided.
 * @param {string} html Snippet of a MathML expression.
 * @param {string} ruleName Key of the rule that is expected to be applied.
 */
cvox.MathmlStoreTest.prototype.executeRuleTest = function(html, ruleName) {
  var mathMl = '<math id=' + this.nodeCounter + '>' + html + '</math>';
  this.appendHtml(mathMl);
  var node = document.getElementById((this.nodeCounter++).toString());
  var rule = this.rules.lookupRule(node.childNodes[0],
                                   {domain: 'default', style: 'default'});
  this.assertEquals(ruleName, rule.name);
};


/**
 * Test MathML rules for space elements.
 * @export
 */
cvox.MathmlStoreTest.prototype.testMathmlEmptyRules = function() {
  this.executeRuleTest('<mspace depth="40px"/>', 'mspace');
  this.executeRuleTest(
      '<mstyle displaystyle="true"><mn>1</mn><mstyle>', 'mstyle');
  this.executeRuleTest(
      '<mpadded height="+150px"><mn>1</mn></mpadded>', 'mpadded');
  this.executeRuleTest('<merror><mn>1</mn></merror>', 'merror');
  this.executeRuleTest('<mphantom><mn>1</mn></mphantom>', 'mphantom');
};


/**
 * Test MathML rules for simple token elements.
 * @export
 */
cvox.MathmlStoreTest.prototype.testMathmlTokenRules = function() {

  this.executeRuleTest('<mi>x</mi>', 'mi');
  this.executeRuleTest('<mn>1</mn>', 'mn');
  this.executeRuleTest('<mo>+</mo>', 'mo');
  this.executeRuleTest('<mtext>therefore we have</mtext>', 'mtext');
  this.executeRuleTest('<ms>therefore we have</ms>', 'ms');
};


/**
 * Test MathML rules for token elements involving font declarations.
 * @export
 */
cvox.MathmlStoreTest.prototype.testMathmlFontRules = function() {

  this.executeRuleTest('<mi mathvariant="normal">N</mi>', 'mi');
  this.executeRuleTest('<mi mathvariant="double-struck">N</mi>', 'mi-variant');

  this.executeRuleTest('<mn mathvariant="normal">1</mn>', 'mn');
  this.executeRuleTest('<mn mathvariant="fraktur">1</mn>', 'mi-variant');

  this.executeRuleTest('<mo mathvariant="normal">+</mo>', 'mo');
  this.executeRuleTest('<mo mathvariant="monospace">+</mo>', 'mo-variant');

  this.executeRuleTest(
      '<mtext mathvariant="normal">therefore we have</mtext>', 'mtext');
  this.executeRuleTest(
      '<mtext mathvariant="bold">therefore we have</mtext>', 'mtext-variant');
};


/**
 * Test MathML rules for script elements.
 * @export
 */
cvox.MathmlStoreTest.prototype.testMathmlScriptRules = function() {

  this.executeRuleTest('<msup><mi>R</mi><mi>n</mi></msup>', 'msup');
  this.executeRuleTest('<msub><mi>Z</mi><mi>n</mi></msub>', 'msub');
  this.executeRuleTest(
      '<msubsup><mi>Z</mi><mi>n</mi><mi>r</mi></msubsup>', 'msubsup');
  this.executeRuleTest(
      '<munder><mrow><mi>x</mi><mo>+</mo><mi>y</mi></mrow>' +
          '<mo>&#x23DF;</mo></munder>', 'munder');
  this.executeRuleTest(
      '<mover><mrow><mi>x</mi><mo>+</mo><mi>y</mi></mrow>' +
          '<mo>&#x23DE;</mo></mover>', 'mover');
  this.executeRuleTest(
      '<munderover><mo>&#x222B;</mo><mn>0</mn><mi>&#x221E;</mi></munderover>',
      'munderover');
};


/**
 * Test MathML rules for layout elements.
 * @export
 */
cvox.MathmlStoreTest.prototype.testMathmlLayoutRules = function() {

  this.executeRuleTest('<mrow><mi>x</mi><mo>+</mo><mi>y</mi></mrow>', 'mrow');
  this.executeRuleTest('<msqrt><mi>x</mi></msqrt>', 'msqrt');
  this.executeRuleTest('<mroot><mi>x</mi><mn>3</mn></mroot>', 'mroot');
  this.executeRuleTest('<mfrac><mn>1</mn><mi>n<mi></mfrac>', 'mfrac');
};


/**
 * Test MathML specialist rules for square, cube, etc.
 * @export
 */
cvox.MathmlStoreTest.prototype.testMathmlSpecializationRules = function() {

  this.executeRuleTest('<msup><mi>Z</mi><mn>2</mn></msup>', 'square');
  this.executeRuleTest(
      '<msup><mi>Z</mi><mrow><mn>2</mn></mrow></msup>', 'square');

  this.executeRuleTest('<msup><mi>Z</mi><mn>3</mn></msup>', 'cube');
  this.executeRuleTest(
      '<msup><mi>Z</mi><mrow><mn>3</mn></mrow></msup>', 'cube');

  this.executeRuleTest(
      '<msubsup><mi>Z</mi><mi>n</mi><mn>2</mn></msubsup>', 'square-sub');
  this.executeRuleTest(
      '<msubsup><mi>Z</mi><mi>n</mi><mrow><mn>2</mn></mrow></msubsup>',
      'square-sub');

  this.executeRuleTest(
      '<msubsup><mi>Z</mi><mi>n</mi><mn>3</mn></msubsup>', 'cube-sub');
  this.executeRuleTest(
      '<msubsup><mi>Z</mi><mi>n</mi><mrow><mn>3</mn></mrow></msubsup>',
      'cube-sub');

};


/**
 * Test MathML rules involving mfenced expressions.
 * @export
 */
cvox.MathmlStoreTest.prototype.testMathmlMfencedRules = function() {

  this.executeRuleTest(
  '<mfenced open="{" close="}" separators=";"><mi>a</mi><mi>b</mi>' +
      '<mi>c</mi><mi>d</mi><mi>e</mi></mfenced>', 'mfenced-single');
  this.executeRuleTest(
  '<mfenced open="{" close="}" separators=" "><mi>a</mi><mi>b</mi>' +
      '<mi>c</mi><mi>d</mi><mi>e</mi></mfenced>', 'mfenced-empty');
  this.executeRuleTest('<mfenced open="{" close="}"><mi>a</mi><mi>b</mi>' +
      '<mi>c</mi><mi>d</mi><mi>e</mi></mfenced>', 'mfenced-comma');
  this.executeRuleTest(
  '<mfenced open="{" close="}" separators=";;,"><mi>a</mi><mi>b</mi>' +
      '<mi>c</mi><mi>d</mi><mi>e</mi></mfenced>', 'mfenced-multi');
};


/**
 * Test MathML rules involving matrix expressions.
 * @export
 */
cvox.MathmlStoreTest.prototype.testMathmlMtableRules = function() {

  this.executeRuleTest(
      '<mtable><mtr><mtd><mi>A</mi></mtd><mtd><mi>B</mi></mtd></mtr>' +
      '<mtr><mtd><mi>C</mi></mtd><mtd><mi>D</mi></mtd></mtr>', 'mtable');
  this.executeRuleTest(
      '<mtr><mtd><mi>A</mi></mtd><mtd><mi>B</mi></mtd></mtr>', 'mtr');
  this.executeRuleTest('<mtd><mi>A</mi></mtd>', 'mtd');
};


/**
 * Test MathML rules involving mmultiscripts expressions.
 * @export
 */
cvox.MathmlStoreTest.prototype.testMathmlMultiscriptRules = function() {

  this.executeRuleTest(
      '<mmultiscripts><mi>A</mi><mn>1</mn><mn>2</mn>' +
          '<mprescripts/><mn>3</mn><mn>4</mn>', 'mmultiscripts-4');

  this.executeRuleTest(
      '<mmultiscripts><mi>A</mi><none/><mn>2</mn>' +
          '<mprescripts/><mn>3</mn><mn>4</mn>', 'mmultiscripts-3-1');
  this.executeRuleTest(
      '<mmultiscripts><mi>A</mi><mn>1</mn><none/>' +
          '<mprescripts/><mn>3</mn><mn>4</mn>', 'mmultiscripts-3-2');
  this.executeRuleTest(
      '<mmultiscripts><mi>A</mi><mn>1</mn><mn>2</mn>' +
          '<mprescripts/><none/><mn>4</mn>', 'mmultiscripts-3-3');
  this.executeRuleTest(
      '<mmultiscripts><mi>A</mi><mn>1</mn><mn>2</mn>' +
          '<mprescripts/><mn>3</mn><none/>', 'mmultiscripts-3-4');

  this.executeRuleTest(
      '<mmultiscripts><mi>A</mi><none/><none/>' +
          '<mprescripts/><mn>3</mn><mn>4</mn>', 'mmultiscripts-2-1');

  this.executeRuleTest(
      '<mmultiscripts><mi>A</mi><none/><none/>' +
          '<mprescripts/><none/><mn>4</mn>', 'mmultiscripts-1-1');
  this.executeRuleTest(
      '<mmultiscripts><mi>A</mi><none/><none/>' +
          '<mprescripts/><mn>3</mn><none/>', 'mmultiscripts-1-2');
};
