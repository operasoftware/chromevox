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
 * @fileoverview Utilities for ChromeVox extensions
 * Some helpful utilities functions.
 * @author: cagriy@google.com (Cagri Yildirim)
 */

/** subnamespace */
cvoxExt.Util = {};
var Util = cvoxExt.Util;

/**
 * map of special keys to their keycodes
 * @const
 */
Util.KEY_CODES = {
  'bs' : 8,
  'tab' : 9,
  'return' : 13,
  'shift': 16,
  'ctrl': 17,
  'alt': 18,
  'home': 36,
  'up': 38,
  'left': 37,
  'right': 39,
  'down': 40
};

/**
 * @param {string} key key of shortcut.
 * @param {function} functionToImplement the function
     that will be run when key is pressed.
 */
Util.addKeyboardShortcut = function(key, functionToImplement)  {
  //TODO make sure keyboard shortcuts do not conflict with chromevox shortcuts
  var keyboardListener = function(evt) {
    //making sure that the element is not an input field
    if (!document.activeElement.form && (evt.charCode == keyCodes[key] ||
       key == String.fromCharCode(evt.charCode))) {
      functionToImplement();
    }
  };
  document.addEventListener('keypress', keyboardListener);
};

/**
 * @param {string} key key of shortcut.
 * @param {Object} obj object to click on shortcut
     that will be run when key is pressed.
 */
Util.addClickShortcut = function(key, obj) {
  var clickObj = function() {
    cvox.Api.click(cvoxExt.getVisibleDomObjectsFromSelector(obj)[0]);
  }
  Util.addKeyboardShortcut(key, clickObj);
};


/** filter visible speakables from speakables array in a target DOM element
 *
 * @param {Array<cvoxExt.Speakable>} speakables array.
 * @param {HTMLElement} opt_target target DOM Element.
 * @return {Array<cvoxExt.Speakable>} visible speakables array.
 */
Util.filterVisibleSpeakables = function(speakables, opt_target) {
  var isVisible = function(speakable) {
    var result = Util.getVisibleDomObjectsFromSelector(speakable, opt_target);
    if (result && result.length && result.length != 0) {
      return true;
    }
  }
  return speakables.filter(isVisible);
};


/** get objects from an array of selectors in a target DOM element
 *
 * @param {Array<Object>} selectors array.
 * @param {HTMLElement} opt_target target DOM Element.
 * @return {NodeList} visible objects list.
 */
Util.getVisibleDomObjectsFromSelectors = function(selectors, opt_target) {
  var out = [];
  for (var i = 0; i < selectors.length; ++i) {
    var objs = Util.getVisibleDomObjectsFromSelector(selectors[i], opt_target);

    out = out.concat(objs);
  }

  return out;
};

/**
 * a utilty function which gets only the visible DOM objects from
 * its selector. The selector has its properties pre-defined to make it
 * faster.
 * @param {Array<Object>} selector the DOM selector.
 * @param {HTMLElement} opt_target a target element such as div to
 * select the object from (optional).
 * @return {Object} the html elements of the selector.
 */
Util.getVisibleDomObjectsFromSelector = function(selector, opt_target) {

  var target = opt_target || document;

  if (selector instanceof cvoxExt.Speakable) {
    return Util.getVisibleDomObjectsFromSelector(selector.selector, opt_target);
  }
  if (selector.id) {
    return [target.getElementById(selector.id)];
  }
  if (selector.className) {
    var out = target.getElementsByClassName(selector.className);
  }
  if (selector.query) {
    out = (out || target).querySelectorAll(selector.query);
  }
  if (selector.tagName) {
    out = (out || target).getElementsByTagName(selector.tagName);
  }

  if (selector.attribute) {
    if (out) {
      out = out[0];
    }
    out = (out || target).getAttribute(selector.attribute);
  }
  if (!selector.id && !selector.className && !selector.query &&
        !selector.tagName && !selector.attribute) {
    console.log('no selector defined');
  }
  if (out) {
    if (out instanceof NodeList) {
      var newout = [];
      for (var o = 0; o < out.length; ++o) {
        if (Util.isObjectVisible(out[o])) {
          newout.push(out[o]);
        }
      }
    } else {
      console.log(out);
      return [out];
    }
  }
  return newout;
};

/**
 * iframe aware object visible check
 * @param {HTMLElement} obj object to check visibility for.
 * @return {boolean} if the object is visible.
 */
Util.isObjectVisible = function(obj) {
  if (!obj || !(obj instanceof HTMLElement)) { return false; }

  //get the css computed style from the window object resides in
  var css = obj.ownerDocument.defaultView.getComputedStyle(obj);
  if (css.visibility == 'hidden' || css.display == 'none') {
    return false;
  }
  //check parent node visibility
  if (obj.parentNode && obj.parentNode != obj.ownerDocument) {
    return Util.isObjectVisible(obj.parentNode);
  }
  return true;
};
