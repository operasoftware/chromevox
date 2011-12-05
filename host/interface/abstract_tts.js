// Copyright 2010 Google Inc.
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
 * @fileoverview Base class for Text-To-Speech-Engines.
 *
 * @author svetoslavganov@google.com (Svetoslav Ganov)
 */

goog.provide('cvox.AbstractTts');

/**
 * Creates a new instance.
 * @constructor
 */
cvox.AbstractTts = function() {
  this.ttsProperties = new Object();

  if (cvox.AbstractTts.pronunciationDictionaryRegexp == undefined) {
    // Create an expression that matches all words in the pronunciation
    // dictionary on word boundaries, ignoring case.
    var words = [];
    for (var word in cvox.AbstractTts.PRONUNCIATION_DICTIONARY) {
      words.push(word);
    }
    var expr = '\\b(' + words.join('|') + ')\\b';
    cvox.AbstractTts.pronunciationDictionaryRegexp = new RegExp(expr, 'ig');
  }

  if (cvox.AbstractTts.substitutionDictionaryRegexp == undefined) {
    // Create an expression that matches all words in the substitution
    // dictionary.
    var symbols = [];
    for (var symbol in cvox.AbstractTts.SUBSTITUTION_DICTIONARY) {
      symbols.push(symbol);
    }
    var expr = '(' + symbols.join('|') + ')';
    cvox.AbstractTts.substitutionDictionaryRegexp = new RegExp(expr, 'ig');
  }
};


/**
 * Default TTS properties for this TTS engine.
 * @type {Object}
 * @protected
 */
cvox.AbstractTts.prototype.ttsProperties;


/**
 * Min value for TTS properties. Note that these might be different
 * on different host platforms (like Chrome, Android, etc.).
 * @type {Object.<string, number>}
 **/
cvox.AbstractTts.prototype.propertyMin = {
  'rate': 0.0,
  'pitch': 0.0,
  'volume': 0.0
};

/**
 * Max value for TTS properties. Note that these might be different
 * on different host platforms (like Chrome, Android, etc.).
 * @type {Object.<string, number>}
 **/
cvox.AbstractTts.prototype.propertyMax = {
  'rate': 1.0,
  'pitch': 1.0,
  'volume': 1.0
};

/**
 * Step value for TTS properties. Note that these might be different
 * on different host platforms (like Chrome, Android, etc.).
 * @type {Object.<string, number>}
 **/
cvox.AbstractTts.prototype.propertyStep = {
  'rate': 0.1,
  'pitch': 0.1,
  'volume': 0.1
};


/**
 * Speaks the given string using the specified queueMode and properties.
 * @param {string} textString The string of text to be spoken.
 * @param {number=} queueMode The queue mode: cvox.AbstractTts.QUEUE_MODE_FLUSH
 *        for flush, cvox.AbstractTts.QUEUE_MODE_QUEUE for adding to queue.
 * @param {Object=} properties Speech properties to use for this utterance.
 */
cvox.AbstractTts.prototype.speak = function(textString, queueMode, properties) {
  if (window['console']) {
    var logStr = 'Speak';
    if (queueMode == cvox.AbstractTts.QUEUE_MODE_FLUSH) {
      logStr += ' (I)';
    } else {
      logStr += ' (Q)';
    }
    logStr += ' "' + textString + '"';
    window['console']['log'](logStr);
  }
};


/**
 * Returns true if the TTS is currently speaking.
 * @return {boolean} True if the TTS is speaking.
 */
cvox.AbstractTts.prototype.isSpeaking = function() {
  return false;
};


/**
 * Stops speech.
 */
cvox.AbstractTts.prototype.stop = function() {
  window['console']['log']('Stop');
};


/**
 * Retrieves the default TTS properties for this TTS engine.
 * @return {Object} Default TTS properties.
 */
cvox.AbstractTts.prototype.getDefaultTtsProperties = function() {
  return this.ttsProperties;
};


/**
 * Sets the default TTS properties for this TTS engine.
 * @param {Object} ttsProperties Default TTS properties.
 */
cvox.AbstractTts.prototype.setDefaultTtsProperties = function(ttsProperties) {
  this.ttsProperties = ttsProperties;
};


/**
 * Increases a TTS speech property.
 * @param {string} propertyName The name of the property to change.
 * @param {boolean} increase If true, increases the property value by one
 *     step size, otherwise decreases.
 */
cvox.AbstractTts.prototype.increaseOrDecreaseProperty =
    function(propertyName, increase) {
  var min = this.propertyMin[propertyName];
  var max = this.propertyMax[propertyName];
  var step = this.propertyStep[propertyName];
  var current = this.ttsProperties[propertyName];
  current = increase ? current + step : current - step;
  this.ttsProperties[propertyName] = Math.max(Math.min(current, max), min);
};


/**
 * Merges the given properties with the default ones. Always returns a
 * new object, so that you can safely modify the result of mergeProperties
 * without worrying that you're modifying an object used elsewhere.
 * @param {Object=} properties The properties to merge with the default.
 * @return {Object} The merged properties.
 */
cvox.AbstractTts.prototype.mergeProperties = function(properties) {
  var mergedProperties = new Object();
  var p;
  if (this.ttsProperties) {
    for (p in this.ttsProperties) {
      mergedProperties[p] = this.ttsProperties[p];
    }
  }
  if (properties) {
    var tts = cvox.AbstractTts;
    if (typeof(properties[tts.VOLUME]) == 'number') {
      mergedProperties[tts.VOLUME] = properties[tts.VOLUME];
    }
    if (typeof(properties[tts.PITCH]) == 'number') {
      mergedProperties[tts.PITCH] = properties[tts.PITCH];
    }
    if (typeof(properties[tts.RATE]) == 'number') {
      mergedProperties[tts.RATE] = properties[tts.RATE];
    }

    var context = this;
    function mergeRelativeProperty(abs, rel) {
      if (typeof(properties[rel]) == 'number' &&
          typeof(mergedProperties[abs]) == 'number') {
        mergedProperties[abs] += properties[rel];
        var min = context.propertyMin[abs];
        var max = context.propertyMax[abs];
        if (mergedProperties[abs] > max) {
          mergedProperties[abs] = max;
        } else if (mergedProperties[abs] < min) {
          mergedProperties[abs] = min;
        }
      }
    }

    mergeRelativeProperty(tts.VOLUME, tts.RELATIVE_VOLUME);
    mergeRelativeProperty(tts.PITCH, tts.RELATIVE_PITCH);
    mergeRelativeProperty(tts.RATE, tts.RELATIVE_RATE);
  }

  return mergedProperties;
};


/**
 * Set a chromevis.ChromeVisLens to display any messages spoken via speak().
 * This is an abstract method, meant to be implemented by some subclasses
 * only.
 * @param {Object} lens The chromevis.ChromeVisLens object.
 */
cvox.AbstractTts.prototype.setLens = function(lens) {
};


/**
 * Static method to preprocess text to be spoken properly by a speech
 * engine.
 *
 * 1. Replace any single character with a description of that character.
 *
 * 2. Convert all-caps words to lowercase if they don't look like an
 *    acronym / abbreviation.
 *
 * @param {string} text A text string to be spoken.
 * @return {string} The text formatted in a way that will sound better by
 *     most speech engines.
 */
cvox.AbstractTts.preprocess = function(text) {
  // Substitute all symbols in the substitution dictionary. This is pretty
  // efficient because we use a single regexp that matches all symbols
  // simultaneously.
  text = text.replace(
      cvox.AbstractTts.substitutionDictionaryRegexp,
      function(symbol) {
        return ' ' + cvox.AbstractTts.SUBSTITUTION_DICTIONARY[symbol] + ' ';
      });

  // Handle single characters that we want to make sure we pronounce.
  if (text.length == 1) {
    switch (text) {
    case ' ': return 'space';
    case '`': return 'backtick';
    case '~': return 'tilde';
    case '!': return 'exclamation point';
    case '@': return 'at';
    case '#': return 'pound';
    case '$': return 'dollar';
    case '%': return 'percent';
    case '^': return 'caret';
    case '&': return 'ampersand';
    case '*': return 'asterisk';
    case '(': return 'open paren';
    case ')': return 'close paren';
    case '-': return 'hyphen';
    case '_': return 'underscore';
    case '=': return 'equals';
    case '+': return 'plus';
    case '[': return 'left bracket';
    case ']': return 'right bracket';
    case '{': return 'left brace';
    case '}': return 'right brace';
    case '|': return 'pipe';
    case ';': return 'semicolon';
    case ':': return 'colon';
    case ',': return 'comma';
    case '.': return 'period';
    case '<': return 'less than';
    case '>': return 'greater than';
    case '/': return 'slash';
    case '?': return 'question mark';
    case '"': return 'quote';
    case '\'': return 'single quote';
    case '\t': return 'tab';
    case '\r': return 'return';
    case '\n': return 'new line';
    case '\\': return 'backslash';
    default: return text.toUpperCase() + '.';
    }
  }

  // Substitute all words in the pronunciation dictionary. This is pretty
  // efficient because we use a single regexp that matches all words
  // simultaneously, and it calls a function with each match, which we can
  // use to look up the replacement in our dictionary.
  text = text.replace(
      cvox.AbstractTts.pronunciationDictionaryRegexp,
      function(word) {
        return cvox.AbstractTts.PRONUNCIATION_DICTIONARY[word.toLowerCase()];
      });

  // Special case for google+, where the punctuation must be pronounced.
  text = text.replace(/google\+/ig, 'google-plus');

  // Convert all-caps words to lowercase if they don't look like acronyms,
  // otherwise add a space before all-caps words so that all-caps words in
  // the middle of camelCase will be separated.
  var allCapsWords = text.match(/([A-Z]+)/g);
  if (allCapsWords) {
    for (var word, i = 0; word = allCapsWords[i]; i++) {
      var replacement;
      // If a word contains vowels and is more than 3 letters long,
      // it is probably a real word and not just an abbreviation.
      // Convert it to lower case and speak it normally.
      if ((word.length > 3) && word.match(/([AEIOUY])/g)) {
        replacement = word.toLowerCase();
      } else {
        // This regex will space out any camelCased/all CAPS words
        // so they sound better when spoken by TTS engines.
        replacement = word.replace(/([A-Z])/g, ' $1');
      }
      text = text.replace(word, replacement);
    }
  }

  //  Remove all whitespace from the beginning and end, and collapse all
  // inner strings of whitespace to a single space.
  text = text.replace(/\s+/g, ' ').replace(/^\s+|\s+$/g, '');

  if (text.length > 0)
    return text;
  else
    return 'blank';
};


/**
 * Static method to preprocess text to be spoken properly by a speech
 * engine.
 *
 * Same as above, but also allows the caller to receive information about how
 * to speak the processed string.
 *
 * @param {string} text A text string to be spoken.
 * @param {Object= } properties Out parameter populated with how to speak the
 *     string.
 * @return {string} The text formatted in a way that will sound better by
 *     most speech engines.
 */
cvox.AbstractTts.preprocessWithProperties = function(text, properties) {
  if (text.length == 1 && text >= 'A' && text <= 'Z') {
    for (var prop in cvox.AbstractTts.PERSONALITY_CAPITAL)
      properties[prop] = cvox.AbstractTts.PERSONALITY_CAPITAL[prop];
  }
  return cvox.AbstractTts.preprocess(text);
};


/** TTS rate property. @type {string} */
cvox.AbstractTts.RATE = 'rate';
/** TTS pitch property. @type {string} */
cvox.AbstractTts.PITCH = 'pitch';
/** TTS volume property. @type {string} */
cvox.AbstractTts.VOLUME = 'volume';

/** TTS relative rate property. @type {string} */
cvox.AbstractTts.RELATIVE_RATE = 'relativeRate';
/** TTS relative pitch property. @type {string} */
cvox.AbstractTts.RELATIVE_PITCH = 'relativePitch';
/** TTS relative volume property. @type {string} */
cvox.AbstractTts.RELATIVE_VOLUME = 'relativeVolume';

/** TTS color property (for the lens display). @type {string} */
cvox.AbstractTts.COLOR = 'color';
/** TTS CSS font-weight property (for the lens display). @type {string} */
cvox.AbstractTts.FONT_WEIGHT = 'fontWeight';


/**
 * TTS personality for annotations - text spoken by ChromeVox that
 * doesn't come from the web page or user interface.
 * @type {Object}
 */
cvox.AbstractTts.PERSONALITY_ANNOTATION = {
  'relativePitch': -0.1,
  // TODO:(rshearer) Added this color change for I/O presentation.
  'color': 'yellow'
};


/**
 * TTS personality for an aside - text in parentheses.
 * @type {Object}
 */
cvox.AbstractTts.PERSONALITY_ASIDE = {
  'relativePitch': -0.1,
  'color': '#669'
};


/**
 * TTS personality for capital letters.
 * @type {Object}
 */
cvox.AbstractTts.PERSONALITY_CAPITAL = {
  'relativePitch': 0.6
};


/**
 * TTS personality for quoted text.
 * @type {Object}
 */
cvox.AbstractTts.PERSONALITY_QUOTE = {
  'relativePitch': 0.1,
  'color': '#b6b',
  'fontWeight': 'bold'
};


/**
 * TTS personality for strong or bold text.
 * @type {Object}
 */
cvox.AbstractTts.PERSONALITY_STRONG = {
  'relativePitch': 0.1,
  'color': '#b66',
  'fontWeight': 'bold'
};


/**
 * TTS personality for emphasis or italicized text.
 * @type {Object}
 */
cvox.AbstractTts.PERSONALITY_EMPHASIS = {
  'relativeVolume': 0.1,
  'relativeRate': -0.1,
  'color': '#6bb',
  'fontWeight': 'bold'
};


/**
 * Flag indicating if the TTS is being debugged.
 * @type {boolean}
 */
cvox.AbstractTts.DEBUG = true;


/**
 * Speech queue mode that interrupts the current utterance.
 * @type {number}
 */
cvox.AbstractTts.QUEUE_MODE_FLUSH = 0;


/**
 * Speech queue mode that does not interrupt the current utterance.
 * @type {number}
 */
cvox.AbstractTts.QUEUE_MODE_QUEUE = 1;


/**
 * Pronunciation dictionary. Each key must be lowercase, its replacement
 * should be spelled out the way most TTS engines will pronounce it
 * correctly. This particular dictionary only handles letters and numbers,
 * no symbols.
 * @type {Object.<string, string>}
 */
cvox.AbstractTts.PRONUNCIATION_DICTIONARY = {
  'bcc': 'B C C',
  'cc': 'C C',
  'chromevox': 'chrome-vox',
  'cr48': 'C R 48',
  'ctrl': 'control',
  'gmail': 'gee mail',
  'gtalk': 'gee talk',
  'http': 'H T T P',
  'igoogle': 'eye google',
  'username': 'user-name',
  'www': 'W W W',
  'youtube': 'you tube'
};


/**
 * Substitution dictionary. These symbols or patterns are ALWAYS substituted
 * whenever they occur, so this should be reserved only for unicode characters
 * and characters that never have any different meaning in context.
 *
 * For example, do not include '$' here because $2 should be read as
 * "two dollars".
 * @type {Object.<string, string>}
 */
cvox.AbstractTts.SUBSTITUTION_DICTIONARY = {
  '://': 'colon slash slash',
  '\u2190': 'left arrow',
  '\u2191': 'up arrow',
  '\u2192': 'right arrow',
  '\u2193': 'down arrow',
  '\u21d0': 'left double arrow',
  '\u21d1': 'up double arrow',
  '\u21d2': 'right double  arrow',
  '\u21d3': 'down double arrow',
  '\u21e6': 'left arrow',
  '\u21e7': 'up arrow',
  '\u21e8': 'right arrow',
  '\u21e9': 'down arrow',
  '\u2303': 'control',
  '\u2318': 'command',
  '\u2325': 'option',
  '\u25b2': 'up triangle',
  '\u25b3': 'up triangle',
  '\u25b4': 'up triangle',
  '\u25b5': 'up triangle',
  '\u25b6': 'right triangle',
  '\u25b7': 'right triangle',
  '\u25b8': 'right triangle',
  '\u25b9': 'right triangle',
  '\u25ba': 'right pointer',
  '\u25bb': 'right pointer',
  '\u25bc': 'down triangle',
  '\u25bd': 'down triangle',
  '\u25be': 'down triangle',
  '\u25bf': 'down triangle',
  '\u25c0': 'left triangle',
  '\u25c1': 'left triangle',
  '\u25c2': 'left triangle',
  '\u25c3': 'left triangle',
  '\u25c4': 'left pointer',
  '\u25c5': 'left pointer',
  '\uf8ff': 'apple'
};


/**
 * Pronunciation dictionary regexp.
 * @type {RegExp};
 */
cvox.AbstractTts.pronunciationDictionaryRegexp;


/**
 * Substitution dictionary regexp.
 * @type {RegExp};
 */
cvox.AbstractTts.substitutionDictionaryRegexp;
