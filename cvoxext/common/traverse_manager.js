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
 * @fileoverview TraverseManager
 * Traverse manager is the part of ChromeVox extensions framework to add support
 * for custom navigation with ChromeVox. This uses the tree created by the
 * speakables to create the custom navigation system. For websites that already
 * have navigation in them this is not enabled.

 * @author: cagriy@google.com (Cagri Yildirim)
 */

cvoxExt.TraverseManager = {};
var TraverseManager = cvoxExt.TraverseManager;

/**
 * the order which speakables are traversed.
 */
TraverseManager.orderedSpeakables = [];
/** key to switch to next speakable
 */
TraverseManager.coarseScrollNextKey = null;

/** key to switch to previous speakable
 */
TraverseManager.coarseScrollPrevKey = null;

/** key to switch to next element of
 * current speakable, switch to null
 * to disable
 */
TraverseManager.fineScrollNextKey = null;

/** key to switch to prev element of
 * current speakable, switch to null
 * to disable
 */
TraverseManager.fineScrollPrevKey = null;

/**
 * pointer to current speakable
 */
TraverseManager.currSpeakable = 0;

/**
 * index of element of current speakable
 */
TraverseManager.currElementOfSpeakable = 0;

/** disable keyboard shortcuts for extension managed traversal */
TraverseManager.disableManagedTraversal = function() {
  TraverseManager.fineScrollNextKey = null;
  TraverseManager.fineScrollPrevKey = null;
  TraverseManager.coarseScrollNextKey = null;
  TraverseManager.coarseScrollPrevKey = null;
};

/** enable default keyboard shortcuts for extension
   managed traversal */
TraverseManager.enableDefaultManagedTraversal = function() {
  TraverseManager.fineScrollNextKey = 'n';
  TraverseManager.fineScrollPrevKey = 'p';
  TraverseManager.coarseScrollNextKey = 'j';
  TraverseManager.coarseScrollPrevKey = 'k';
};

/** When using the n/p navigation enables scrolling by element. That means if
 * a selector selects an array of objects it will scroll by each element
 */
TraverseManager.enableElementFineScroll = function() {
  TraverseManager.fineScrollMode = 'scrollByElement';
};

/** Enables scrolling of child speakables. This means when user presses n/p
 the extension will focus on the child speakables of the current speakable
 as referenced in the parent speakable's formatter
 */
TraverseManager.enableChildSpeakableFineScroll = function() {
  TraverseManager.fineScrollMode = 'scrollByChildSpeakable';
};

/**
 * update the order of speakables according to which elements are visible
 */
TraverseManager.updateOrderedSpeakables = function() {
  TraverseManager.orderedSpeakables = [];
  for (var i in SpeakableManager.speakables) {
      SpeakableManager.speakables[i].visible = false;
    if (SpeakableManager.speakables[i].traversable) {
      TraverseManager.orderedSpeakables.push(SpeakableManager.speakables[i]);
    }
  }
  TraverseManager.orderedSpeakables = cvoxExt.Util.filterVisibleSpeakables(
     TraverseManager.orderedSpeakables);
  for (var i = 0, o; o = TraverseManager.orderedSpeakables[i]; i++) {
    var speakable = SpeakableManager.speakables[o.name];
    speakable.visible = true;
    speakable.index = i;
  }
};

/** focus on the first selected DOM element of a speakable object
 * for this to work, the speakable must either be selected by ID or a unique
 * class name
@param {cvoxExt.Speakable} speakable the relevant speakable.
*/
TraverseManager.focusSpeakable = function(speakable) {
  var newFocus = Util.getVisibleDomObjectsFromSelector(speakable)[0];

  if (newFocus) {


    var dummyNode = document.createElement('div');
    newFocus.parentNode.insertBefore(dummyNode, newFocus);
    SpeakableManager.updateSpeak(newFocus);

    dummyNode.setAttribute('cvoxnodedesc',
        newFocus.getAttribute('cvoxnodedesc'));
    newFocus.removeAttribute('cvoxnodedesc');
    //close the div in listener
    var onDummyBlur = function() {
      //remove this event listener

      dummyNode.removeEventListener('blur', arguments.callee, false);


      var removeChild = function() {
        if (dummyNode.parentNode) {
          dummyNode.parentNode.removeChild(dummyNode);
        }
      };
      setTimeout(removeChild, 50);

    }

    dummyNode.addEventListener('blur', onDummyBlur, true);

    dummyNode.setAttribute('tabindex', -1);
    cvoxExt.TraverseManager.skipFocusCheckThisTime = true;
    dummyNode.focus();

    TraverseManager.focusedElement = newFocus;
  }
};

/**
 * moves to the next speakable
 * @param {Number} next the index of speakable to move to.
 */
TraverseManager.coarseScroll = function(next) {

  TraverseManager.updateOrderedSpeakables();

  TraverseManager.currElementOfSpeakable = 0;
  if (TraverseManager.orderedSpeakables.length != 0) {
    TraverseManager.currSpeakable = next;
    if (TraverseManager.currSpeakable >=
        TraverseManager.orderedSpeakables.length) {
       TraverseManager.currSpeakable = 0;
    } else if (TraverseManager.currSpeakable < 0) {
      TraverseManager.currSpeakable =
        TraverseManager.orderedSpeakables.length - 1;
    }

    var coarseScroll =
        TraverseManager.orderedSpeakables[TraverseManager.currSpeakable];

    TraverseManager.focusSpeakable(coarseScroll);

  }
};

/** gets the next speakable object by speakable name
 * @param {string} type type string of speakable.
*/
TraverseManager.coarseScrollByType = function(type) {
  TraverseManager.coarseScroll(TraverseManager.
     orderedSpeakables.indexOf(TraverseManager.speakables[type]));
};

/** go to the next element in the current speakable
 * @param {number} next element's index.
 */
TraverseManager.fineScroll = function(next) {

  TraverseManager.currElementOfSpeakable = next;
  var currSpeakable =
      TraverseManager.orderedSpeakables[TraverseManager.currSpeakable];
  if (TraverseManager.fineScrollMode == 'scrollByChildSpeakable') {

    var childSpeakables = currSpeakable.getAllChildSpeakables();
    var childSpeakablesArr = [];
    for (sp in childSpeakables) {
      childSpeakablesArr.push(SpeakableManager.speakables[sp]);
    }
    if (TraverseManager.currElementOfSpeakable >= childSpeakablesArr.length) {
      TraverseManager.currElementOfSpeakable = 0;
    } else if (TraverseManager.currElementOfSpeakable < 0) {
      TraverseManager.currElementOfSpeakable = childSpeakablesArr.length - 1;
    }
    var newFocus = Util.getVisibleDomObjectsFromSelector(
      childSpeakablesArr[TraverseManager.currElementOfSpeakable],
        TraverseManager.focusedElement)[0];
  } else if (TraverseManager.fineScrollMode == 'scrollByElement') {
    for (var childSpeakableName in currSpeakable.getAllChildSpeakables()) {
      break;
    }
    var childSpeakable = SpeakableManager.speakables[childSpeakableName];
    //get the first child speakable to select the array of elements from.
    var elements = Util.getVisibleDomObjectsFromSelector(childSpeakable,
          Util.getVisibleDomObjectsFromSelector(currSpeakable)[0]);

    if (TraverseManager.currElementOfSpeakable >= elements.length) {
      TraverseManager.currElementOfSpeakable = 0;
    } else if (TraverseManager.currElementOfSpeakable < 0) {
      TraverseManager.currElementOfSpeakable = elements.length - 1;
    }

    newFocus = elements[TraverseManager.currElementOfSpeakable];
  }
  newFocus.setAttribute('tabindex', -1);
  newFocus.focus();

};


/** switches to the next speakable if the speakable key is pressed
 * implements addSpeakableKeyListener functionality
 * @param {event} evt DOM event.
 * @return {boolean} event suppressor.
 */
TraverseManager.keyHandler = function(evt) {

  TraverseManager.updateOrderedSpeakables();
  //TODO make a more robust check for inputtable elements
  if (document.activeElement.tagName == 'INPUT') {
    return true;
  }
  var orderedSpeakables = TraverseManager.orderedSpeakables;
  var currSpeakable = TraverseManager.currSpeakable;
  var speakableKeyToFunction = SpeakableManager.speakableToKeyFunction;
  if (!orderedSpeakables[currSpeakable]) {return;}
  var keyToFunction =
    speakableKeyToFunction[orderedSpeakables[currSpeakable].type];
  if (keyToFunction) {
    var func = keyToFunction[String.fromCharCode(evt.charCode)];
    if (func) {
      func();
      evt.stopPropagation();
      return false;
    }
  }

  if (TraverseManager.coarseScrollNextKey && evt.charCode ==
      TraverseManager.coarseScrollNextKey.charCodeAt(0)) {
    TraverseManager.coarseScroll(TraverseManager.currSpeakable + 1);
    evt.stopPropagation();
    return false;
  } else if (TraverseManager.coarseScrollPrevKey && evt.charCode ==
      TraverseManager.coarseScrollPrevKey.charCodeAt(0)) {
    TraverseManager.coarseScroll(TraverseManager.currSpeakable - 1);
    evt.stopPropagation();
    return false;
  } else if (TraverseManager.fineScrollNextKey && evt.charCode ==
      TraverseManager.fineScrollNextKey.charCodeAt(0)) {
    TraverseManager.fineScroll(
        TraverseManager.currElementOfSpeakable + 1);
    evt.stopPropagation();
    return false;
  } else if (TraverseManager.fineScrollPrevKey && evt.charCode ==
      TraverseManager.fineScrollPrevKey.charCodeAt(0)) {
    TraverseManager.fineScroll(
        TraverseManager.currElementOfSpeakable - 1);
    evt.stopPropagation();
    return false;
  }
  return true;
};
