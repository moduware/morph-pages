import { MorphElement } from 'morph-element/morph-element.js';
import '@polymer/iron-location/iron-location.js';

var IronLocationSuperClass = customElements.get('iron-location');
var that;

class MorphLocation extends MorphElement(IronLocationSuperClass) {
  static get is() { return 'morph-location'; }

  static get properties() { 
    return {
      lastNavigationDirection: {
        type: String,
        //value: null, // no default value, possible values: 'forward', 'backward'
        notify: true,
        reflectToAttribute: true
      }
    }; 
  }

  constructor() {
    super();
  }

  ready() {
    super.ready();
  }

  connectedCallback() {
    super.connectedCallback();
    that = this;
  }

  disconnectedCallback() {
    super.disconnectedCallback();

    window.removeEventListener('location-changed', this._locationChangeHandler);
    window.removeEventListener('popstate', this._statePopHandler);
  }
}

/**
 *  Detects between browser back and browser forward clicks
 */
var detectBackOrForward = function (onBack, onForward) {
  let locationHistory = [window.location.href];
  let historyLength = window.history.length;
  let historyPosition = 0;

  return function (replace) {
    replace = replace || false;
    var newLocation = window.location.href, newHistoryLength = window.history.length;

    if (replace) {
      locationHistory[historyPosition] = newLocation;
    } else if (locationHistory.length && historyLength == newHistoryLength) {
      var previousLocation = locationHistory[historyPosition - 1];
      if (previousLocation == newLocation) {
        historyPosition--;
        onBack();
      } else {
        historyPosition++;
        onForward();
      }
    } else {
      historyPosition++;
      locationHistory = locationHistory.slice(0, historyPosition);
      locationHistory.push(newLocation);
      historyLength = newHistoryLength;
      onForward();
    }
  }
};

/**
 * Call detectBackOrForward with two functions params
 */
var historyHandler = detectBackOrForward(_goBackward, _goForward);

/**
 * Sets lastNavigationDirection to backward
 */
function _goBackward() {
  that.set('lastNavigationDirection', 'backward');
}

/**
 * Sets lastNavigationDirection to forward
 */
function _goForward() {
  that.set('lastNavigationDirection', 'forward');
}

/**
 * Listen to popstate events
 */
window.addEventListener('popstate', (event) => {
  historyHandler();
});

/* reassigns history.replaceState */
const _historyReplaceState = history.replaceState;

/**
 * Calls historyHandler() everytime history.replaceState() is called
 */
history.replaceState = function (state) {
  //console.log(state);
  _historyReplaceState.call(this, ...arguments);
  historyHandler(true);
};

/* reassigns history.pushState */
const _historyPushState = history.pushState;

/**
 * Calls historyHandler() everytiime history.pushState() is called
 */
history.pushState = function (state) {
  _historyPushState.call(this, ...arguments);
  historyHandler();
};

window.customElements.define(MorphLocation.is, MorphLocation);
