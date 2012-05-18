/**
 * @fileoverview Provides global access to constants, such as device pixel
 *     ratio.
 *
 * @author sugarman@google.com (Noah Sugarman)
 */

goog.provide('androidvoxnav.constants');

/**
 * The number of device pixels per CSS pixel. A high number indicates a high
 * density screen.
 * @type {number}
 */
androidvoxnav.constants.devicePixelRatio;

/**
 * Initialize constants.
 */
androidvoxnav.constants.init = function() {
  androidvoxnav.constants.devicePixelRatio = window.devicePixelRatio;

  var isNativeBrowser = !!accessibility;
  if (isNativeBrowser) {
    // There's a bug in the native browser that makes event.screenX act the same
    // as event.clientX. To compensate for this we scale the device pixel ratio
    // to the current zoom level.
    // TODO: The device pixel ratio is based only on the initial zoom level and
    // doesn't change when the user zooms in or out.
    var scaleFactor = window.innerWidth / screen.width;
    androidvoxnav.constants.devicePixelRatio *= scaleFactor;
  }
};

/**
 * Initialize constants for the Galaxy Nexus. Useful for testing purposes.
 */
androidvoxnav.constants.initForGalaxyNexus = function() {
  androidvoxnav.constants.devicePixelRatio = 2;
};
