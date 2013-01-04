// Copyright 2012 Google Inc
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
 * @fileoverview Chromevox extension for Google Calculator.
 * @author cagriy@google.com (Cagri K. Yildirim)
 */

var calculatorvox = {};

/** replace symbols with text ChromeVox can read
 * @param {string} speechString the string to replace.
 * @return {string} string without math symbols. */
calculatorvox.speakSymbols = function(speechString) {
  speechString = speechString.replace(/√/g, ' square root ').replace(/\(/g,
    ' open parenthesis ').replace(/\)/g, ' close parenthesis ').replace(/\!/g,
    ' factorial ').replace(/π/g, 'pi').replace(/ln/g, 'l n');
  return speechString;
};

/** speakable formatters */
calculatorvox.extension = {
  calculator: {
    formatter: ['calculator activated'],
    selector: {
      className: 'cwmd'
    },
    options: ['enableTraverse']
  },
  button: {
    formatter: ['$self'],
    selector: {
      className: 'cwbts'
    },
    preprocess: function(values, focusedFrom, target) {

      values.self = calculatorvox.speakSymbols(values.self);

      var valuesAndFormatter = {
        formatter: calculatorvox.speakables.button.formatter[0],
        values: values
      };

      return valuesAndFormatter;
    }
  }

};

var getCalculatorBox = function() {
  return document.getElementById('cwos');
};

var getButtons = function() {
  return Util.getVisibleDomObjectsFromSelector({className: 'cwbd'});
};

/** calculator button on click */
var calcButtonsOnClick = function() {

  var calculatorBox = getCalculatorBox().textContent;

  cvox.Api.speak(calculatorvox.speakSymbols(calculatorBox), true);
};

/** detect if the calculator exists and set on click listeners for each
calculator buttons
*/
calculatorvox.detectCalculator = function() {
  var calculatorBox = getCalculatorBox();
  if (calculatorBox && !calculatorvox.detectedCalculator && window.cvox) {

    TraverseManager.focusSpeakable(SpeakableManager.speakables['calculator']);
    calculatorvox.detectedCalculator = true;
    var buttons = getButtons();

    for (var b in buttons) {
      buttons[b].setAttribute('onclick', 'calcButtonsOnClick()');
      cvox.Api.setSpeechForNode(buttons[b], [new cvox.NodeDescription('',
        calculatorvox.speakSymbols(buttons[b].textContent), '', '')]);
    }
  }
};

/** init function for calculatorvox to register onLoad listener */
calculatorvox.init = function() {
  document.addEventListener('load', calculatorvox.detectCalculator, true);
};

cvoxExt.loadExtension(calculatorvox.extension, calculatorvox.init);




