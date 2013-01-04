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
 * @fileoverview SpeakableParser
 * It parses the speakable formatters and binds the values to the
 * formatters and the typing of the speech string to create the node
 * description array.
 *
 * @author: cagriy@google.com (Cagri Yildirim)
 */

/** Speakable parser namespace */
cvoxExt.SpeakableParser = {};

SpeakableParser = cvoxExt.SpeakableParser;

/** @const speech categories */
SpeakableParser.speechTypes = {
  CONTEXT: 'ctxt',
  USER_VALUE: 'user',
  ANNOTATION: 'antt',
  TEXT: 'text'
};

/** @const default speech type */
SpeakableParser.DEFAULT_TYPE = '{' + SpeakableParser.speechTypes.TEXT + '}';

/** from the <range> part of the string get an object that has the
  * array of indexes that will be read by chromevox
  * @param {string} range string denoting range of indices.
  * @param {number} maxElems the size of array (max of indices).
  * @return {Object} the array of indices.
  */
SpeakableParser.getRange = function(range, maxElems) {

  range = new String(range).replace(/\s/g, ''); //remove whitespace;

  var rangeRegex = /((\d+)\-(\d+)\,?|(\d+)\,|^(\d+)\,|(\d+)$)/g;
  //match either x-y or x,y

  var indices = {};
  if (range == 'all') {
    for (var i = 0; i < maxElems; ++i) {
      indices[i] = i;
    }
    return indices;
  }

  /** add the number after comma to the index
     @param {Number} num index before the number.
  */
  var addNext = function(num) {
    if (num || num === 0) {
      indices[num] = {};
    }
  };

  /** add the range of numbers between a dash
    @param {Number} num1 start index.
    @param {Number} num2 end index.
  */
  var addRange = function(num1, num2) {
    var startRng = num1 | 0;
    var endRng = num2 | maxElems;

    for (var i = startRng; i < endRng; ++i) {
      indices[i] = {};
    }

  };

  var nextNumbers = rangeRegex.exec(range);
  while (nextNumbers) {
    if (nextNumbers[2] || nextNumbers[3]) {
      addRange(nextNumbers[2], nextNumbers[3]);
    } else {
      addNext(nextNumbers[4] | nextNumbers[5] | nextNumbers[6]);
    }
    nextNumbers = rangeRegex.exec(range);
  }
  return indices;
};


/** Makes a last pass on the tree by binding the variable elements to the
 * formatter and recursively replaces the variables by their speakable
 * formatters, (base case being a $self, in which case $self is replaced by the
 * value). This generates a speech string. Type information is not lost and will
 * be processed on the next step.
 * @param {Object} valuesAndFormatter the value and formatter pair to be
 * processed.
 * @return {string} the speech string formed by formatter bound with values.
 */
SpeakableParser.bindValuesToFormatter = function(valuesAndFormatter) {

  var startInd = 0;
  var speakableRegex = /([^\\]\$|^\$)(\w+)(\s*\<([\d\-\,\s]+)\>)?/g;
  //get $speakableName<range>

  var typeRegex = /\{(\w+)\}/g; //get {Type}
  var formatter = valuesAndFormatter.string;
  var nextSpeakable = speakableRegex.exec(formatter);
  var currType = valuesAndFormatter.type || 'text';
  var newType = typeRegex.exec(formatter);

  while (nextSpeakable) {

    var foundSubselector = nextSpeakable[2];

    var lastType;
    //get the last type and copy it to the end of the recursively generated
    //strings so that the type of the parent node is still valid after the
    //child node is being read
    while (newType && (typeRegex.lastIndex < speakableRegex.lastIndex)) {
      currType = newType[1];
      newType = typeRegex.exec(formatter);
    }
    if (nextSpeakable[4]) {
      var range = nextSpeakable[4];
    } else {
      range = 'all';
    }
    //if the node is an array use the <range> construct to filter the
    //appropriate elements in the array and recursively bind values to formatter
    if (valuesAndFormatter.values[foundSubselector] instanceof Array) {

      var indices = cvoxExt.SpeakableParser.getRange(
          range, valuesAndFormatter.values[foundSubselector].length);

      var returnStr = '';

      for (var i in indices) {
        if (!valuesAndFormatter.values[foundSubselector][i]) {
          continue;
        }
        returnStr +=
            SpeakableParser.bindValuesToFormatter({
              values: valuesAndFormatter.values[foundSubselector][i].values,
              string: valuesAndFormatter.values[foundSubselector][i].formatter,
              type: currType
            });
      }
      formatter = formatter.replace(
        sprintf('\$%s%s', nextSpeakable[2], (nextSpeakable[3] || '')),
        sprintf(' %s{%s}', returnStr, currType));
      speakableRegex.lastIndex = 0;
    }
    //if the formatter has $self, replace it with the value
    else if (foundSubselector == 'self') {
      var selfVal = valuesAndFormatter.values[foundSubselector];
      if (selfVal !== undefined || selfVal !== '') {
        formatter = formatter.replace('$self',
          sprintf(' %s', selfVal));
      }
      else {
        return '';
      }
    } else {
      //otherwise recursively replace the string with the child speakables
      //until they are replaced with values
      if (!valuesAndFormatter.values[foundSubselector]) {
        debugger;
      }
      formatter = formatter.replace(
          sprintf('$%s%s', nextSpeakable[2], (nextSpeakable[3] || '')),
          sprintf('%s{%s}',
            SpeakableParser.bindValuesToFormatter({
            values: valuesAndFormatter.values[foundSubselector].values,
            string: valuesAndFormatter.values[foundSubselector].formatter,
            type: currType
          }), currType)
      );


    }
    nextSpeakable = speakableRegex.exec(formatter);

  }
  return formatter;
};

/** formats the types for a given speech string by parsing the {Type} construct
 * and creates the node description array of the object
 * possible types are {text}, {ctxt}, {antt} and {user}
 * @param {string} speechString the speech string with type information.
 * @return {Array<cvox.nodeDescription>} the complete node description array
 * containing the description to be read by ChromeVox.
 */
SpeakableParser.parseTyping = function(speechString) {

  //default to {Text}
  speechString = SpeakableParser.DEFAULT_TYPE + speechString;



  var typeRegex = /\{\w*\}/;
  var currType = typeRegex.exec(speechString);
  var newType = typeRegex.exec(speechString);
  var nodeDescs = [];
  while (currType) {

    while (newType && (newType[0] == currType[0])) {
      speechString = speechString.slice(0, newType.index) +
          speechString.slice(newType.index + newType[0].length);
      //remove repeating intermediate speechTypes
      newType = typeRegex.exec(speechString);
    }
    if (newType) {
      var endInd = newType.index;
    } else {
      endInd = speechString.length;
    }
    //add available string if type has changed
    var addString = speechString.slice(currType.lastIndex + currType[0].length,
        endInd).replace(/[^\S\n]{2,}/g, ' ');
        //get rid of more than one spaces but not newline

    if (addString.replace(/\s/g, '') !== '') {
      var nodeDesc;

      switch (currType[0].replace(/[\{\}]/g, '').toLowerCase()) {
        case SpeakableParser.speechTypes.CONTEXT:
          nodeDesc = new cvox.NodeDescription(addString, '', '', '');
          break;
        case SpeakableParser.speechTypes.USER_VALUE:
          nodeDesc = new cvox.NodeDescription('', addString, '', '');
          break;
        case SpeakableParser.speechTypes.TEXT:
          nodeDesc = new cvox.NodeDescription('', '', addString, '');
          break;
        case SpeakableParser.speechTypes.ANNOTATION:
          nodeDesc = new cvox.NodeDescription('', '' , '', addString);
          break;
      }

      nodeDescs.push(nodeDesc);
    }
    if (!newType) {
      break;
    }
    currType = newType;
    speechString = speechString.slice(currType.index);
    newType = typeRegex.exec(speechString);
  }

  return nodeDescs;
};

