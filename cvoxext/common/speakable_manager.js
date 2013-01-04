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
 * @fileoverview SpeakableManager
 * Speakable manager is the core of the ChromeVox extensions framework.
 * It manages the reading of speakable by calling relevant functions to parse
 * a speakable and update the speech of each related DOM object by adding
 * cvox.NodeDescription attribute to them.

 * @author: cagriy@google.com (Cagri Yildirim)
 */


/** SpeakableManager object */
cvoxExt.SpeakableManager = {};
var SpeakableManager = cvoxExt.SpeakableManager;

/** @const subselector types to classify in node descriptions */
SpeakableManager.subselectorTypes = {
  CONTEXT: 'context',
  USER_VALUE: 'userValue',
  ANNOTATION: 'annotation',
  TEXT: 'text'
};

/**
 * map of speakable names to speakables
 * example: SpeakableManager.speakables ['thread'] => speakable representation
 * of a gPlus thread
 */
SpeakableManager.speakables = {};

/**
 * map of speakable to their key listeners
 */
SpeakableManager.speakableToKeyFunction = {};

/**
 * map of speakable selectors to speakable names
 * example: SpeakableManager['.lp.gx] => 'comment'
 */
SpeakableManager.classNameToSpeakable = {};

/**
 * map of speakable ID to speakable names
 * example: SpeakableManager['.lp.gx] => 'comment'
 */
SpeakableManager.idToSpeakable = {};

/**
 * adds object pointed by CSS selector to the speakables
 * useful for pages which have auto shortcuts that traverse
 * the page and with no manual need differentiate CSS selectors.
 * @param {string} selector selector(class name) of object.
 * @param {string} name speakable type.
 */
SpeakableManager.addClassName = function(selector, name) {
  SpeakableManager.classNameToSpeakable[selector] = name;
};

/**
 * adds object pointed by ID to the speakables
 * useful for pages which will use traverse manager provided by the
 * framework to provide keyboard scroll support
 * @param {string} selector selector( id) of object.
 * @param {string} name speakable type.
 */
SpeakableManager.addID = function(selector, name) {
  SpeakableManager.idToSpeakable[selector] = name;
};

/**
 * adds a constructed speakable object
 * the object could have been passed in as a CSS selector or
 * as a specific object, if a selector is not enough to differentiate
 * the object.
 * @param {cvoxExt.Speakable} speakable speakable representation of object.
 */
SpeakableManager.addSpeakable = function(speakable) {

  if (!SpeakableManager.speakables[speakable.name]) {
    var selectors = speakable.selector;
    for (var sel in selectors) {
      if (sel == 'query') {
        SpeakableManager.addClassName(selectors[sel], speakable.name);
      } else if (sel == 'className') {
        SpeakableManager.addClassName('.' + selectors[sel].replace(' ', '.'),
          speakable.name);
      } else if (sel == 'id') {
        SpeakableManager.addID(selectors[sel], speakable.name);
      }
    }
    SpeakableManager.speakables[speakable.name] = speakable;
  }
};

/** resets all speakables */
SpeakableManager.clearSpeakables = function() {
  SpeakableManager.speakables = {};
};


/**
 * finds the best fit speakable of a given target DOM element
 * tries to find a perfect match by
 * identifying the target element from an attribute 'speakable',
 * or from its ID. If these fail tries to find the most appropriate class name,
 * by matching all the class names of the speakable to the object (not all of
 * the class names of the object must be matched but all class names of a
 * possible speakable must be matched).
 *
 * @param {HTMLElement} target target DOM object.
 * @return {SpeakableManager.speakable} speakable of the class name.
 */
SpeakableManager.adaptSpeakableToObject = function(target) {
  if (target.getAttribute) {
    var name = target.getAttribute('speakable');
    if (name) {
      return SpeakableManager.speakables[name];
    }
  } else if (target.speakable) {
    return SpeakableManager.speakables[target.speakable];
  }
  if (target.id && target.id !== '') {
    var possibleSpeakableName =
        SpeakableManager.idToSpeakable[target.id];
    if (possibleSpeakableName) {
      return SpeakableManager.speakables[possibleSpeakableName];
    }
  }
  var targetClassName = target.className;

  if (targetClassName !== '') {
    //try class names, a speakable must have all its class names matched,
    //but not all class names of the element must be matched by the speakable
    var pieces = targetClassName.split(' ');
    var possibleSelector = '.' + pieces.join('.');
    var possibleName = SpeakableManager.classNameToSpeakable[possibleSelector];
    if (possibleName) {
      return SpeakableManager.speakables[possibleName];
    } else {
      var maxMatched = ''; //the most matched wins
      for (var selector in SpeakableManager.classNameToSpeakable) {

        var selectorPossible = true;
        var splitSelectors = selector.split('.').slice(1);

        for (var i = 0, o; o = splitSelectors[i]; i++) {
          if (pieces.indexOf(o) == -1) {
             selectorPossible = false;
             break;
          }
        }
        //exclude certain class names
        if (selector.split('.').length > 1) {
          var excRules = SpeakableManager.speakables[
              SpeakableManager.classNameToSpeakable[selector]].exclude;
          if (excRules) {
            for (var i = 0, o; o = excRules[i]; i++) {
              if (o.charAt(0) == '.') {
                o = o.slice(1);
                // strip the dot in start if needed
              }
              if (pieces.indexOf(o == 0)) {
                selectorPossible = false;
                var selectorExcluded = true;
                break;
              }
            }
          }
        }
        if (selectorPossible) {
          maxMatched = (maxMatched === '' && selector) ||
              maxMatched.split('.').length < selector.split('.').length ?
              selector : maxMatched;
        }
      }
    }
    if (maxMatched !== '') {
      SpeakableManager.classNameToSpeakable[possibleSelector] =
          SpeakableManager.classNameToSpeakable[maxMatched];
      return SpeakableManager.speakables[SpeakableManager.
          classNameToSpeakable[maxMatched]];
    }
  }
  return undefined; // could not identify the object from class name, tag name
   //or id
};

/**
 * updates speech nodes of elements that benefit from the
 * written extension by adapting target to a speakable and setting its
 * speech to the description generated by the speakable
 * @param {Object} target target DOM object.
 */
SpeakableManager.updateSpeak = function(target) {

  target.removeAttribute('cvoxnodedesc');
  var speakable = SpeakableManager.adaptSpeakableToObject(target);
  if (!speakable) {return; } //return if could not find appropriate speak
  var speechNodeDescs = SpeakableManager.generateSpeechNode(speakable, target);

  if (speechNodeDescs) {
    if (speakable.getFrame && speakable.getFrame()) {
      speakable.getFrame().contentWindow.cvox.Api.setSpeechForNode(
        target, speechNodeDescs);
    } else if (target.setAttribute) {
      cvox.Api.setSpeechForNode(target, speechNodeDescs);


    }
  }
};

/**
 * for a speakable matched with a DOM element, builds a tree of values by
 * getting the child speakable objects mentioned in the formatter of the
 * speakable and matching the formatter with the values taken from the DOM
 * element.
 *
 * @param {cvoxExt.Speakable} speakable the speakable object which the DOM
   Element is identified as related to.
   @param {HTMLElement} domObj the target DOM element that the values will be
   taken from.
 * @return {Object} a tree of values with its formatter.
 */

 //TODO refactor this tree into a meaningful data type
SpeakableManager.getAllValuesForSpeakable = function(speakable, domObj) {
  var getAllValuesRecursively = function(speakable, domObj) {

    var childSpeakables = speakable.getAllChildSpeakables();
    var values = {};
    for (speakableName in childSpeakables) {
      if (speakableName == 'self') {
        if (speakable.selector) {
          if (!speakable.selector.attribute) {
           values['self'] = domObj.textContent.replace(/\$/g, '\\$').replace(
                /[\s]{2,}/, ' ');
          } else {
            values['self'] = domObj;
          }
        } else {
          values['self'] = '';
        }
         //escape dollar sign and remove extra whitespace;
      } else {

        var currSpeakable = SpeakableManager.speakables[speakableName];
        var possibleSelector = currSpeakable.selector;
        if (possibleSelector) {

          var newValues = Util.getVisibleDomObjectsFromSelector(
              possibleSelector, domObj);

          var mappedArray = [];
          //no map function for NodeLists :(
          for (var i in newValues) {
            mappedArray.push(getAllValuesRecursively(currSpeakable,
                newValues[i]));
          }

          values[currSpeakable.name] = mappedArray;
        }
        else {

          values[currSpeakable.name] =
               getAllValuesRecursively(currSpeakable, domObj);
        }
      }
    }
    return values;
  };
  var values = {};
  values[speakable.name] = getAllValuesRecursively(speakable, domObj);

  return values;
};


/**
 * Takes in the value tree generated by the getAllValues and selects
 * the correct formatter for each value and filters the values by calling the
 * callback functions supplied by the extension. This is useful for any custom
 * reading of the speakable object with multiple formatters
 * @param {cvoxExt.Speakable} speakable Speakable associated with the current
 * node of the tree.
 * @param {Object} values all values associated with the DOM Element.
 * @param {Element} target the target element.
 * @param {string} focusedFrom the speakable name focused from.
 * @return {Object} a tree of values and their associated formatter, or
 * a done flag saying the entire element will not be formatted.
 */
SpeakableManager.setAppropriateFormatterForEachValue = function(speakable,
                                                                 values,
                                                                 target,
                                                                 focusedFrom) {


  var newValues = {};

  //For each object in values, detect if it has a self property, in which case
  //call the call back function provided by the extension which will select the
  //correct formatter for that speakable. If the object is an array, in which
  //case call recursively the function for each element of array.
  //Otherwise, the value is a single speakable therefore recursively update the
  //tree with the selected formatters

  for (var speakableInd in values) {

    var value = values[speakableInd];

    if (speakableInd == 'self') {

      if (values[speakableInd] !== '') {

        newValues[speakableInd] = values[speakableInd];
      }
    } else if (value instanceof Array) {

      newValues[speakableInd] = [];
      var assocSpeakable = SpeakableManager.speakables[speakableInd];

      if (assocSpeakable.selector) {
        var newTarget = Util.getVisibleDomObjectsFromSelector(assocSpeakable,
            target);
      }
      newTarget = newTarget || target;
      for (var i = 0, iend = value.length; i < iend; ++i) {
        var newValue = assocSpeakable.preprocess(value[i], focusedFrom,
          newTarget[i]);
        if (newValue.done) {return {done: true};}
        newValues[speakableInd].push(
          { values: SpeakableManager.setAppropriateFormatterForEachValue(
                assocSpeakable, newValue.values, newTarget[i], focusedFrom),
            formatter: newValue.formatter });
      }

    } else {
        var assocSpeakable = SpeakableManager.speakables[speakableInd];

        var newValue = assocSpeakable.preprocess(value, focusedFrom,
            target);
        if (newValue == undefined || newValue.done) {return {done: true};}
        newValues[speakableInd] = {};
        newValues[speakableInd].values =
            SpeakableManager.setAppropriateFormatterForEachValue(
                assocSpeakable, newValue.values, target, focusedFrom);
        newValues[speakableInd].formatter = newValue.formatter;
    }
  }

  return newValues;
};

/**
 * creates the node description of a DOM object by looking at the
 * associated speakable's formatter.
 * @param {cvoxExt.Speakable} speakable the associated DOM object.
 * @param {Object} domObj DOM object.
 * @this {cvoxExt.Speakable}
 * @return {Array<cvox.NodeDescription>} array of
       node description of the DOM object.
 */
SpeakableManager.generateSpeechNode = function(speakable, domObj) {

  var objectValues = SpeakableManager.getAllValuesForSpeakable(
      speakable, domObj);

  var valueFormatterPair = SpeakableManager.setAppropriateFormatterForEachValue(
      speakable, objectValues, domObj, speakable.name);

  if (!valueFormatterPair || valueFormatterPair.done) { return; }

  var lastInd = 0;
  var ind = 0;
  var finalString = '';
  var lastChar = '';

  var curr = {
    values: valueFormatterPair[speakable.name].values,
    string: valueFormatterPair[speakable.name].formatter

  };

  var speechString = SpeakableParser.bindValuesToFormatter(curr);

  var nodeDescs = SpeakableParser.parseTyping(speechString);

  return nodeDescs;
};

/**
 * adds a keyboard shortcut which only works when a given speakable object
 * is focused.
 * @param {speakableManager.speakable} speakable the speakable
    with which the shortcut is associated.
 * @param {string} key key of shortcut.
 * @param {function} functionToImplement to be run on keypress.
 */
SpeakableManager.addSpeakableKeyListener = function(speakable, key,
     functionToImplement) {
  //make sure keyboard shortcuts do not conflict with chromevox shortcuts
  if (!SpeakableManager.speakableToKeyFunction[speakable.name]) {
    SpeakableManager.speakableToKeyFunction[speakable.name] = new Object();
  }
  SpeakableManager.speakableToKeyFunction[speakable.name][key] =
      functionToImplement;
};
