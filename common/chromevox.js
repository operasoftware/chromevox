/**
 * @fileoverview Defines a global object. The initialization of this
 *   object happens in init.js.
 *
 * @author dmazzoni@google.com (Dominic Mazzoni)
 */

goog.provide('cvox.ChromeVox');

goog.require('cvox.AbstractMsgs');

// Constants
/**
 * Constant for verbosity setting (cvox.ChromeVox.verbosity).
 * @const
 * @type {number}
 */
cvox.VERBOSITY_VERBOSE = 0;
/**
 * Constant for verbosity setting (cvox.ChromeVox.verbosity).
 * @const
 * @type {number}
 */
cvox.VERBOSITY_BRIEF = 1;


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
 * @type {cvox.AbstractMsgs}
 */
cvox.ChromeVox.msgs = null;
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
 * Verbosity setting.
 * See: cvox.VERBOSITY_VERBOSE and cvox.VERBOSITY_BRIEF
 * @type {number}
 */
cvox.ChromeVox.verbosity = cvox.VERBOSITY_VERBOSE;
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
 * @type {Object.<string, number>}
 */
cvox.ChromeVox.sequenceSwitchKeyCodes = {};
/**
 * This function can be called before doing an operation that may trigger
 * focus events and other events that would normally be announced. This
 * tells the event manager that these events should be ignored, they're
 * a result of another command that's already announced them. This is
 * a temporary state that's automatically reverted after a few milliseconds,
 * there's no way to explicitly "un-mark".
 * @type {Function}
 */
cvox.ChromeVox.markInUserCommand = function() {};
