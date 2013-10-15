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
 * @fileoverview Testcases for the math shifter.
 * @author sorge@google.com (Volker Sorge)
 */

goog.provide('cvox.MathShifterTest');

goog.require('cvox.AbstractTestCase');
goog.require('cvox.ChromeVoxTester');
goog.require('cvox.CursorSelection');
goog.require('cvox.DescriptionUtil');


/**
 * @constructor
 * @extends {cvox.AbstractTestCase}
 */
cvox.MathShifterTest = function() { };
goog.inherits(cvox.MathShifterTest, cvox.AbstractTestCase);


// TODO (sorge) Currently we do not test for personality of the
// NavMathDescriptions. More elaborate tests should be added once
// we have finalised the defaults for all rules.
/**
 * Simulates speaking the node (only text, no annotations!).
 * @param {Node} node The node to be described.
 * @return {!string} The resulting string.
 */
cvox.MathShifterTest.prototype.getNodeDescription = function(node) {
  if (node) {
    var descs = cvox.DescriptionUtil.getMathDescription(node);
    var descs_str = descs.map(function(desc) {return desc.text;});
    return descs_str.filter(function(str) {return str;}).join(' ');
  }
  return '';
};


/** Test MathML text.
 * @export
 */
cvox.MathShifterTest.prototype.testMathmlMtext = function() {
  this.appendHtml(
      '<div><math xmlns="http://www.w3.org/1998/Math/MathML" id="m0">' +
      '<mtext>Quod erat demonstrandum</mtext>' +
      '</math></div>');
  var node = document.getElementById('m0');
  this.assertEquals('Quod erat demonstrandum', this.getNodeDescription(node));
};


/** Test MathML individual.
 * @export
 */
cvox.MathShifterTest.prototype.testMathmlMi = function() {
  this.appendHtml(
      '<div><math xmlns="http://www.w3.org/1998/Math/MathML" id="m1">' +
      '<mi>x</mi>' +
      '</math></div>');
  var node = document.getElementById('m1');
  this.assertEquals('x', this.getNodeDescription(node));
};


/** Test MathML numeral.
 * @export
 */
cvox.MathShifterTest.prototype.testMathmlMn = function() {
  this.appendHtml(
      '<div><math xmlns="http://www.w3.org/1998/Math/MathML" id="m2">' +
      '<mn>123</mn>' +
      '</math></div>');
  var node = document.getElementById('m2');
  this.assertEquals('123', this.getNodeDescription(node));
};


/** Test MathML operator
 * @export
 */
cvox.MathShifterTest.prototype.testMathmlMo = function() {
  this.appendHtml(
      '<div><math xmlns="http://www.w3.org/1998/Math/MathML" id="m3">' +
      '<mo>+</mo>' +
      '</math></div>');
  var node = document.getElementById('m3');
  this.assertEquals('+', this.getNodeDescription(node));
};


/** Test MathML superscript.
 * @export
 */
cvox.MathShifterTest.prototype.testMathmlMsup = function() {
  this.appendHtml(
      '<div><math xmlns="http://www.w3.org/1998/Math/MathML" id="m4">' +
      '<msup><mi>x</mi><mn>4</mn></msup>' +
      '</math></div>');
  var node = document.getElementById('m4');
  this.assertEquals('x super 4', this.getNodeDescription(node));
};


/** Test MathML subscript.
 * @export
 */
cvox.MathShifterTest.prototype.testMathmlMsub = function() {
  this.appendHtml(
      '<div><math xmlns="http://www.w3.org/1998/Math/MathML" id="m5">' +
      '<msub><mi>x</mi><mn>3</mn></msub>' +
      '</math></div>');
  var node = document.getElementById('m5');
  this.assertEquals('x sub 3', this.getNodeDescription(node));
};


/** Test MathML subsupscript.
 * @export
 */
cvox.MathShifterTest.prototype.testMathmlMsubsup = function() {
  this.appendHtml(
      '<div><math xmlns="http://www.w3.org/1998/Math/MathML" id="m6">' +
      '<msubsup><mi>x</mi><mn>3</mn><mn>4</mn></msubsup>' +
      '</math></div>');
  var node = document.getElementById('m6');
  this.assertEquals('x sub 3 super 4', this.getNodeDescription(node));
};
