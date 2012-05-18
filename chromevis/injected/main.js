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
 * @fileoverview The main ChromeVis event listener script. This script listens
 * for keyboard events and then sends them to the background page. This script
 * also handles any page-specific update requests from the background page. In
 * this context, page-specific events include showing/hiding the lens and
 * moving the selection around the page.
 * @author rshearer@google.com (Rachel Shearer)
 */

goog.provide('chromevis.ChromeVis');

goog.require('chromevis.ChromeVisReader');
goog.require('cvox.ExtensionBridge');
goog.require('cvox.FocusUtil');
goog.require('cvox.Lens');

var myChromeVisReader;
var lensShown;

/**
 * Handles keyboard events. Checks if the key event is being sent from a text
 * input field, in which case the event will be ignored by the extension. If
 * not, sends a message to the background page with the event keycode. The
 * background page will check the user-defined keyboard shortcuts and determine
 * the appropriate action.
 * @param {Event} evt The keyboard event.
 * @return {boolean} True to allow the default action.
 */
var keyHandler = function(evt) {
  console.log('keyHandler 1');

  // If focus is inside field that accepts text input, ignore key event
  var result = cvox.FocusUtil.isFocusInTextInputField();
  if (result) {
    console.log('keyHandler 2: "' + result + '"');
    return true;
  }

  // NOTE(deboer): KeyCode is not a Closure component, we must use strings
  // to access its properties.

  var k = window['KeyCode'];
  // The keycode library takes a keydown event and returns a string that
  // represents the keys that were pressed. But, it returns only uppercase
  // letters.
  var keyString = k['hot_key'](k['translate_event'](evt));

  console.log('keyHandler 3: ' + keyString);

  // We turn everything into lowercase and allow the user to specify
  // Shift+[Key] for uppercase characters
  if (keyString.length == 1) {
    // Single character
    keyString = keyString.toLowerCase();
  }

  // TODO: regexp this?
  else if (keyString.indexOf('+') != -1) {
    // This is a combination, the part after the + should be lowercase
    var splits = keyString.split('+');
    splits[1] = splits[1].toLowerCase();
    keyString = splits[0].concat('+', splits[1]);
  }

  // Because of keycode conflicts, the keycode library turns the:
  //  '-' character into '_',
  // the '`' character into '~',
  // and the '.' character into '>'
  // We change them back.
  keyString = keyString.replace('_', '-');
  keyString = keyString.replace('~', '`');
  keyString = keyString.replace('>', '.');

  console.log('keyHandler 4: sending ' + keyString);

  // Tell the background page what the keycode string is
  cvox.ExtensionBridge.send({'message': 'user action',
                             'values': keyString});

  return true;
};

/**
 * Handles mouseup events, which indicate that the user may have made a new
 * selection with the mouse. Signals that the text in the lens should be
 * updated.
 * @param {Event} evt The mouseup event.
 * @return {boolean} True to allow the default action.
 *
 */
var mouseUpHandler = function(evt) {

  if (evt.button == 0) {
    // Update the text in the lens to contain the new selected text.
    myChromeVisReader.getLens().updateText();
  }

  return true;
};

/**
 * Handles window resize events. In response, the position of the lens might
 * need to be changed.
 * @param {Event} evt The resize event.
 * @return {boolean} True to allow the default action.
 */
var resizeHandler = function(evt) {
  myChromeVisReader.getLens().updateResized();
  return true;
};

/**
 * Handles document scroll events. In response, the position of the lens might
 * need to be changed.
 * @param {Event} evt The scroll event.
 * @return {boolean} True to allow the default action.
 */
var scrollHandler = function(evt) {
  myChromeVisReader.getLens().updateScrolled();
  return true;
};

/**
 * Establishes a connection with the background page. Sets up the document and
 * window event listeners.
 */
function startListening() {

  myChromeVisReader = new chromevis.ChromeVisReader();

  lensShown = false;

  setupExtension2PageListener();

  document.addEventListener('keydown', keyHandler, true);
  document.addEventListener('mouseup', mouseUpHandler, true);

  window.addEventListener('resize', resizeHandler, true);
  document.addEventListener('scroll', scrollHandler, true);

  cvox.ExtensionBridge.send({'message': 'get settings'});
}

/**
 * Sets up the listener to handle commands from the background page.
 */
function setupExtension2PageListener() {
  cvox.ExtensionBridge.addMessageListener(function(message, port) {
    switch (message.command) {
    case 'show lens':
      if (lensShown) {
        lensShown = false;
        myChromeVisReader.getLens().showLens(false);
      } else {
        lensShown = true;
        myChromeVisReader.getLens().showLens(true);
      }
      break;

    case 'forward sentence':
      moveForward('sentence');
      break;

    case 'forward word':
      moveForward('word');
      break;

    case 'forward character':
      moveForward('character');
      break;

    case 'forward paragraph':
      moveForward('paragraph');
      break;

    case 'backward sentence':
      moveBackward('sentence');
      break;

    case 'backward word':
      moveBackward('word');
      break;

    case 'backward character':
      moveBackward('character');
      break;

    case 'backward paragraph':
      moveBackward('paragraph');
      break;
    }
  });
}

/**
 * Utility function to move the selection forward. If the selection has
 * reached the end of the page, signals a reset.
 * @param {string} granularity Specifies "sentence", "word", "character", or
 *     "paragraph" granularity.
 */
function moveForward(granularity) {
  var status = myChromeVisReader.nextElement(granularity);

  if (status == null) {
    console.log('resetting selection!');
    myChromeVisReader.reset();
  }

  myChromeVisReader.getLens().updateText();
}

/**
 * Utility function to move the selection backward. If the selection has
 * reached the beginning of the page, signals a reset.
 * @param {string} granularity Specifies "sentence", "word", "character", or
 *     "paragraph" granularity.
 */
function moveBackward(granularity) {
  var status = myChromeVisReader.prevElement(granularity);

  if (status == null) {
    console.log('resetting selection!');
    myChromeVisReader.reset();
  }

  myChromeVisReader.getLens().updateText();
}

/**
 * Whether or not we should load ChromeVis into this page.
 * @type {boolean}
 */
var shouldLoadChromeVis = true;

if ((document.location.toString().indexOf('https://mail.google.com') == 0) ||
    (document.location.toString().indexOf('http://mail.google.com') == 0)) {
  // GMail is a special case.  Because of the multiple iframes, it is important
  // to make sure that the content scripts are injected only into the
  // canvas frame, and not other frames.
  if (document.body.className != 'cP') {
    shouldLoadChromeVis = false;
  }
}

if (shouldLoadChromeVis) {
  window.setTimeout(startListening, 1000);
}
