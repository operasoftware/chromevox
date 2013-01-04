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
 * each speakable has a type string, a CSS class selector to
 * identify the object, an associative array of objs for its subelements,
 * and a boolean to tell whether the type is going to be read.
 * @constructor
 * @this {cvoxExt.Speakable}
 * @param {string} name name of the speakable.
 * @param {string} formatters formatters is the description of the way
   chromevox should read a given object. a formatter obeys a certain syntax:
   each expression is either a:
   -constant string: string that will be read as is. i.e. "name of book:"
   -$variable: a speakable which will be dynamically replaced by its content.
   i.e. "$bookName" the variable may also have optionally a <range>, which
   will determine which elements are going to be read if multiple elements
   fit the speakable object, such as in a table. "$bookName<3-5,7> reads
   3,4,5 and 7th book names.
   -$self: a special variable which reads the text content of the node
   the speakable is associated with.
   -{type of speech}: type of speech is {text} | {annt} | {user} | {ctxt}
   is used to identify in the speech description to create tonne in speech.
   an example formatter: book = "{Text} name of book: {ctxt}$bookName,
   {text} author: {ctxt} $author, content: {ctxt} $paragraphs<0-3>".
   This formatter for the book will read the book name and possibly first
   4 paragraphs as preview. Each of $bookName, $author, $paragraphs assume
   that there is a speakable object associated with it, they need a formatter
   and they need to be distinguishable by a selector. Their formatters will
   most probably be simply $self.

 * @param {string} selector a unique property of the object which will
   distinguish it in the context of another speakable. this selector should
   generally be a css class name or an ID, but if necessary and enough it
   could be a tagName or a name.

 * @param {Array<String>} opt_options an optional array of extra information
   the supported options are:
   enableTraverse: the speakable object is traversable by j/k scrolling
   supported in the speakable manager.

 * @param {Function} opt_preprocess a customization function. If this function
 is not defined the by default the tree of values and formatter is not modified.

     function signature:

     param valuesAndFormatter: the tree of values and formatter, where the root
     is the values of owner speakable.

     The structure of tree is like this:

     valuesAndFormatter.values -> values of the owner speakable, is an
     table of its existing child speakables and if available the text content of
     selected DOM element



     for example let this be owned by Speakable A which has the formatter:=
     '$B is $C $self'.

     and let B's formatter:= '$D $self'

     Then the structure of tree passed in to preprocess an element related to A
     would be:


     valuesAndFormatter.formatter -> formatter of the owner speakable
     valuesAndFormatter.values.B-> array of values and formatter of B
     valuesAndFormatter.values.C-> array of values and formatter of C
     valuesAndFormatter.values.self -> text content of node
     valuesAndFormatter.values.B[0] -> values and formatter of first element
     selected by B.

     valuesAndFormatter.values.B[0].formatter -> formatter of B
     valuesAndFormatter.values.B[0].values -> values and formatter of children
     of B
     valuesAndFormatter.values.B[0].values.self -> text content of node selected
     by B.
     valuesAndFormatter.values.B[0].values.D -> array of values and formatter of
     D

     and so on..

     param {String} speakable name where the original focus comes from. useful
     for defining speech when acting as a child speakable.
     param {HTMLElement} part of DOM element selected by the owner speakable
     return the modified values object and bundle it with the appropriate
     formatter.
     preprocess = function (valuesAndFormatter, focusedFrom, target) {}


     Note: This function will also be called for the child speakable if defined.
     This is useful to modify the precision of speech based on at what level the
     focus is.
*/




cvoxExt.Speakable = function(name,
                             formatters,
                             selector,
                             opt_options,
                             opt_preprocess) {
  this.name = name;
  this.formatters = formatters;
  this.selector = selector;
  this.processOptions(opt_options);
  if (opt_preprocess) {
    this.preprocess = opt_preprocess;
  }
  else {
    this.preprocess = function(values, focusedFrom, target) {
      var formatterAndValues = {
        formatter: this.formatters[0],
        values: values
      };
      return formatterAndValues;
    } //default read all values according to first formatter
  }
};

/** enable internal j/k scrolling traverse for the speakable
  * @this {cvoxExt.Speakable}
  */
cvoxExt.Speakable.prototype.enableTraverse = function() {
  this.traversable = true;
  //set tab index for object
  var speakable = this;

};

/** process the options array
  * @this {cvoxExt.Speakable}
  * @param {Array<String>} options options array.
  */
cvoxExt.Speakable.prototype.processOptions = function(options) {
  for (optInd in options) {
    var func = this[options[optInd]];
    if (func) {
      eval('this.' + options[optInd] + '();');
    }
  }
};

/** get all child speakables by processing the formatter
 * @this {cvoxExt.Speakable}
 * @return {Array<cvoxExt.Speakable>} array of child speakables.
*/
cvoxExt.Speakable.prototype.getAllChildSpeakables = function() {
  var speakables = {};

  for (var i in this.formatters) {

    var formatter = this.formatters[i];
    var speakableInd = formatter.indexOf('$');
    while (speakableInd != -1) {
      speakableInd = formatter.indexOf('$');
      formatter = formatter.slice(speakableInd + 1);
      var noncharRegex = /[^a-zA-z]/;
      var nextNonchar = noncharRegex.exec(formatter);
      if (!nextNonchar) {
        var foundSubselector = formatter;
      } else {
        var endInd = nextNonchar.index;
        foundSubselector = formatter.slice(0, endInd);
      }
      speakables[foundSubselector] = {};
    }
  }
  return speakables;
};
