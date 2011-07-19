/**
 * @fileoverview Defines a global object. The initialization of this
 *   object happens in init.js.
 *
 * @author dmazzoni@google.com (Dominic Mazzoni)
 */

cvoxgoog.provide('cvox.ChromeVox');

/**
 * @constructor
 */
cvox.ChromeVox = function() {};

/**
 * @type {Object}
 */
cvox.ChromeVox.tts = null;
/**
 * @type {Object}
 */
cvox.ChromeVox.lens = null;
/**
 * @type {boolean}
 */
cvox.ChromeVox.isActive = true;
/**
 * @type {Object}
 */
cvox.ChromeVox.traverseContent = null;
/**
 * @type {Object}
 */
cvox.ChromeVox.selectionUtil = null;
/**
 * @type {Object}
 */
cvox.ChromeVox.earcons = null;
/**
 * @type {Object}
 */
cvox.ChromeVox.navigationManager = null;
/**
 * @type {boolean}
 */
cvox.ChromeVox.isStickyOn = false;
/**
 * @type {boolean}
 */
cvox.ChromeVox.isChromeOS = navigator.userAgent.indexOf('CrOS') != -1;
/**
 * @type {string}
 */
cvox.ChromeVox.stickyKeyStr = 'Cvox';
/**
 * @type {number}
 */
cvox.ChromeVox.stickyKeyCode = cvox.ChromeVox.isChromeOS ? 91 : 45; // Lwin/Ins
/**
 * @type {string}
 */
cvox.ChromeVox.modKeyStr = cvox.ChromeVox.isChromeOS ?
    'Cvox+Shift' : 'Ctrl+Alt';
/**
 * If any of these keys is pressed with the modifier key, we go in sequence mode
 * where the subsequent independent key downs (while modifier keys are down)
 * are a part of the same shortcut. This array is populated in
 * cvox.ChromeVoxKbHandler.loadKeyToFunctionsTable().
 * @const
 * @type {Object.<string, number>}
 */
cvox.ChromeVox.sequenceSwitchKeyCodes = {};
