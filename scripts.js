import { dom } from '@polymer/polymer/lib/legacy/polymer.dom.js';

var requestAnimationId;

/**
 * The entry point method for android animation using requestAnimationFrame
 * @param {*} self 
 * @param {*} currentPage - The current page to be animated
 * @param {*} nextPage - The next page to be animated
 * @param {String} direction - The direction of the animation
 */
export function androidAnimation(self, currentPage, nextPage, direction) {
  return new Promise((resolve, reject) => {
    self.animationInProgress = true;
    self._animationComplete = false;

    let props = {
      duration: 250,
      nextPageOffset: 56,
      start: -1,
      morphPages: self,
      currentPage: currentPage,
      nextPage: nextPage,
      // nextPageIndex: self._valueForItem(nextPage)
    };

    // Current page behind next page
    props.currentPage.style.zIndex = 1;
    props.nextPage.style.zIndex = 2;

    // Initial setup
    props.nextPage.style.opacity = 0;

    window.requestAnimationFrame((timestamp) => {
      if (direction == "forward") {
        forwardAndroidAnimationStep(props, () => {
          self.animationEnd(props);
          self.animationInProgress = false;
          self._animationComplete = true;
          resolve();
        }, timestamp);
      } else {
        backwardAndroidAnimationStep(props, () => {
          self.animationEnd(props);
          self.animationInProgress = false;
          self._animationComplete = true;
          resolve();
        }, timestamp);
      }
    });
  });
}

/**
 * Goes through the android animation by moving forward the requestAnimationFrame
 * @param {Object} props - contains data for passing states between functions
 * @param {*} endCallback - callback function
 * @param {double} timestamp - single argument from DOMHighResTimeStamp requestAnimationFrame
 */
function forwardAndroidAnimationStep(props, endCallback, timestamp) {
  if (props.start == -1) props.start = timestamp;
  
  let progress = timestamp - props.start;
  let opacity = progress / props.duration;
  props.nextPage.style.opacity = opacity;
  let offset;

  offset = props.nextPageOffset - ((progress / props.duration) * props.nextPageOffset);
  props.nextPage.style.transform = `translate3d(0, ${offset}px, 0)`;

  if(progress < props.duration) {
    window.requestAnimationFrame((timestamp) => forwardAndroidAnimationStep(props, endCallback, timestamp));
  } else {
    endCallback(props);
  }
}

/**
 * Goes through the android animation by moving backward the requestAnimationFrame
 * @param {Object} props - contains data for passing states between functions
 * @param {*} endCallback - callback function
 * @param {double} timestamp - single argument from DOMHighResTimeStamp requestAnimationFrame
 */
function backwardAndroidAnimationStep(props, endCallback, timestamp) {
  if (props.start == -1) props.start = timestamp;

  let progress = timestamp - props.start;
  let opacity = progress / props.duration;
  props.nextPage.style.opacity = opacity;

  let offset = ((progress / props.duration) * props.nextPageOffset);
  props.currentPage.style.transform = `translate3d(0, ${offset}px, 0)`;

  if (progress < props.duration) {
    window.requestAnimationFrame((timestamp) => {
      backwardAndroidAnimationStep(props, endCallback, timestamp)
    });
  } else {
    endCallback(props);
  }
}

/**
 * The entry point method for ios animation using requestAnimationFrame
 * @param {*} self 
 * @param {*} currentPage - The current page to be animated
 * @param {*} nextPage - The next page to be animated
 * @param {String} direction - The direction of the animation
 */
function iosAnimation(self, currentPage, nextPage, direction) {
  return new Promise((resolve, reject) => {
    self.animationInProgress = true;
    self._animationComplete = false;

    let props = {
      duration: 400,
      pageOffsetLeftMax: -20, // percent
      pageOffsetRightMax: 100, // percent
      start: -1,
      morphPages: self,
      currentPage: currentPage,
      nextPage: nextPage,
      shadowElement: createShadowElem(),
      overlayElement: createOverlayElement()
    };
    
    // Transitions for pages
    if(direction == 'forward') {
      setIosForwardAnimationInitialState(props);
    } else if(direction == 'backward') {
      setIosBackwardAnimationInitialState(props);
    }
    
    requestAnimationId = window.requestAnimationFrame((timestamp) => {
      if(direction == "forward") {
        forwardIosAnimationStep(props, () => {
          self.animationEnd(props);
          // remove shadow element from current or next page AND everything click forward or backward
          props.shadowElement.parentNode.removeChild(props.shadowElement);
          props.shadowElement = null;
          // remove overlay element from current or next page
          props.overlayElement.parentNode.removeChild(props.overlayElement);
          props.overlayElement = null;
          self.animationInProgress = false;
          self._animationComplete = true;
          resolve();
        }, timestamp);
      } else {
        backwardIosAnimationStep(props, () => {
          self.animationEnd(props);
          // remove shadow element from current or next page AND everything click forward or backward
          props.shadowElement.parentNode.removeChild(props.shadowElement);
          props.shadowElement = null;
          // remove overlay element from current or next page
          props.overlayElement.parentNode.removeChild(props.overlayElement);
          props.overlayElement = null;
          self.animationInProgress = false;
          self._animationComplete = true;
          resolve();
        }, timestamp);
      }
    });
  });
}

/**
 * Sets the state of current page and next page for forward animation
 * @param {Object} props - contains the data for passing states between functions
 */
function setIosForwardAnimationInitialState(props) {
  // create shadow element in next page, with opacity 0
  props.shadowElement.style.opacity = 0;
  // props.nextPage.insertAdjacentElement('afterend', wrapper);
  props.nextPage.insertAdjacentElement('afterbegin', props.shadowElement);
  
  // create overlay element for current page
  props.overlayElement.style.opacity = 0;
  props.overlayElement.style.transform = `translate3d(100%,0,0)`;
  props.currentPage.insertAdjacentElement('afterbegin', props.overlayElement);
  
  // Current page behind next page
  props.currentPage.style.zIndex = 1;
  props.nextPage.style.zIndex = 2;
  
  props.currentPage.style.transform = `translate3d(0,0,0)`;
  props.overlayElement.style.transform = `translate3d(0,0,0)`;
  props.nextPage.style.transform = `translate3d(${props.nextPageOffset}%,0,0)`;
}

/** 
 * Sets the state of current page and next page for forward animation 
 * @param {Object} props - contains the data for passing states between functions
 */
function setIosBackwardAnimationInitialState(props) {
  // create shadow element in current page, with opacity 1
  props.shadowElement.style.opacity = 1;
  // props.currentPage.insertAdjacentElement('afterend', wrapper);
  props.currentPage.insertAdjacentElement('afterbegin', props.shadowElement);
  
  // create overlay element for next page with opacity 1
  props.overlayElement.style.opacity = 1;
  props.nextPage.insertAdjacentElement('afterbegin', props.overlayElement);

  // Next page behind current page
  props.nextPage.style.zIndex = 1;
  props.currentPage.style.zIndex = 2;
  
  props.currentPage.style.transform = `translate3d(0,0,0)`;
  props.nextPage.style.transform = `translate3d(${props.pageOffsetLeftMax}%,0,0)`;
}

/** creates a shadow element during animation */
function createShadowElem() {
  let shadowElement = document.createElement('div');
  shadowElement.style.background = `linear-gradient(to right, rgba(0,0,0,0) 0%, rgba(0,0,0,0) 10%, rgba(0,0,0,0.01) 50%, rgba(0,0,0,0.2) 100%)`;
  shadowElement.style.position = `absolute`;
  shadowElement.style.top = `0`;
  shadowElement.style.width = `16px`;
  shadowElement.style.zIndex = `99999`;
  shadowElement.style.left = `-16px`;
  shadowElement.style.bottom = `0`;
  return shadowElement;
}

/** create a overlay element during animation */
function createOverlayElement() {
  let overlayElement = document.createElement('div');
  overlayElement.style.width = `100%`;
  overlayElement.style.zIndex = 1000;
  overlayElement.style.background = `rgba(0,0,0,0.1)`;
  overlayElement.style.position = `absolute`;
  overlayElement.style.top = `0`;
  overlayElement.style.bottom = `0`;
  return overlayElement;
}

/**
 * Goes through the ios animation by moving forward the requestAnimationFrame
 * @param {Object} props - contains data for passing states between functions
 * @param {*} endCallback - callback function
 * @param {double} timestamp - single argument from DOMHighResTimeStamp requestAnimationFrame
 */
function forwardIosAnimationStep(props, endCallback, timestamp) {
  if (props.start == -1) props.start = timestamp;
  const progress = timestamp - props.start;
  let timing = progress/props.duration;
  if(timing > 1) timing = 1;

  // change shadow opacity from 0 to 1
  let opacity = progress / props.duration;
  props.shadowElement.style.opacity = opacity;
  // change overlay opacity from 0 to 1
  props.overlayElement.style.opacity = opacity;

  const currentPageOffset = easeInOutQuad(timing) * props.pageOffsetLeftMax;
  const nextPageOffset = 100 - easeInOutQuad(timing) * props.pageOffsetRightMax;
  
  props.currentPage.style.transform = `translate3d(${currentPageOffset}%,0,0)`;
  props.nextPage.style.transform = `translate3d(${nextPageOffset}%,0,0)`;

  if(progress < props.duration) {
    requestAnimationId = window.requestAnimationFrame((timestamp) => forwardIosAnimationStep(props, endCallback, timestamp));
  } else {
    endCallback(props);
  }
}

/**
 *  animation math used by forwardIosAnimationStep and backwardIosAnimationStep
 */
function easeInOutQuad(t) {
  return t < .5 ? 2 * t * t : -1 + (4 - 2 * t) * t
}

/**
 * Goes through the ios animation by moving backward the requestAnimationFrame
 * @param {Object} props - contains data for passing states between functions
 * @param {*} endCallback - callback function
 * @param {double} timestamp - single argument from DOMHighResTimeStamp requestAnimationFrame
 */
function backwardIosAnimationStep(props, endCallback, timestamp) {
  if (props.start == -1) props.start = timestamp;
  const progress = timestamp - props.start;
  let timing = progress/props.duration;
  if(timing > 1) timing = 1;

  // change shadow opacity from 1 to 0
  let opacity = 1 - progress / props.duration;
  props.shadowElement.style.opacity = opacity;
  // change overlay opacity from 1 to 0
  props.overlayElement.style.opacity = opacity;

  const currentPageOffset = easeInOutQuad(timing) * props.pageOffsetRightMax;
  const nextPageOffset = props.pageOffsetLeftMax - easeInOutQuad(timing) * props.pageOffsetLeftMax;
  
  props.currentPage.style.transform = `translate3d(${currentPageOffset}%,0,0)`;
  props.nextPage.style.transform = `translate3d(${nextPageOffset}%,0,0)`;


  if(progress < props.duration) {
    requestAnimationId = window.requestAnimationFrame((timestamp) => backwardIosAnimationStep(props, endCallback, timestamp));
  } else {
    endCallback(props);
  }
}

/**
 * Listener callback handleTrack() detects track and uses trackStart, trackMove and trackEnd to manage swiping
 */
function _onTrack(self, event) {
  var track = event.detail;
  // this are checks if touch tracking needs to be cancelled
  if (track.dx < 0 || self.platform != 'ios') {
    return;
  }

  let props = {
    shadowElement: createShadowElem(),
    overlayElement: createOverlayElement()
  };

  // this is checking for track.state == equal and swipe is left to right
  if (track.state === 'start' && Math.abs(track.dy) < Math.abs(track.dx)) {
    self._swipeStarted = true;
    this._trackStart(self, track, props);
  } else if (track.state == 'track' && self._swipeStarted) {
    this._trackMove(self, track);
  } else if (track.state == 'end' && self._swipeStarted) {
    this._trackEnd(self, track);
  }
}

/**
 *  Detects track.state = start. tracking is triggered by this method
 */
function _trackStart(self, trackData, props) {
  if (self.navigationHistory.length == 0) {
    self._swipeStarted = false;
    return;
  }
  // set up the pages to animate
  this._setUpSwipePages(self, props);
  // Translate current page and previous page using trackDate.dx
  _animatePages(self, trackData.dx);

  // Prevent regular touchmove event (disables vertical scroll) the other half which removes this is in the _trackEnd()
  window.addEventListener('touchmove', this._preventTouchMove);
}

/** 
 *  Gets all data event.details as long as track.state = 'track'. 
 */
function _trackMove(self, trackData) {
  let shadow = dom(this.root).querySelector('#shadow');
  let overlay = dom(this.root).querySelector('#overlay');
  let opacity = 1 - trackData.dx / 360;
  
  if (shadow != null) shadow.style.opacity = opacity;
  if (overlay != null) overlay.style.opacity = opacity;

  // Translate current page and previous page using trackDate.dx
  _animatePages(self, trackData.dx);
}

/**
 * This computes transition if pages to swipe or move back to current page. 
 */
function _trackEnd(self, trackData) {
  if (self._swipeStarted == false) {
    return;
  }

  // set up current and previous pages and set listener for 'transitionend'
  self._currentPageElement.style.transition = this._computeTransition(self, 1);
  self._currentPageElement.addEventListener('transitionend', _pageTransitionEndHandler);
  self._previousPageElement.style.transition = this._computeTransition(self, 1);
  self._previousPageElement.addEventListener('transitionend', _pageTransitionEndHandler);

  // The element is swipe away when swiping get passed the threshold
  self._completeSwipe = Math.abs(trackData.dx) > this._getOffsetWidth(self) * self.threshold;
  if (self._completeSwipe) {
    // trigger the animation in the right direction
    _animatePages(self, this._getOffsetWidth(self));
    let shadow = dom(this.root).querySelector('#shadow');
    let overlay = dom(this.root).querySelector('#overlay');
    if (shadow != null) shadow.style.opacity = 0;
    if (overlay != null) overlay.style.opacity = 0;
    // remove the last element of navigationHistory when swipe is complete
    self.navigationHistory.pop();
    // changing current item by going back in history
    history.back();
  } else {
    // swipe not long enough so go back to current page
    _animatePages(self, 0);
  }

  // enable regular touchmove event ( enables vertical scroll again)
  window.removeEventListener('touchmove', this._preventTouchMove);
}

/**
 * translate current page and previous page
 */
function _animatePages(self, x) {
  self.translate3d(x + 'px', '0px', '0px', self._currentPageElement);
  self.translate3d(`${x * 0.2}` + 'px', '0px', '0px', self._previousPageElement);
}

function _preventTouchMove (event) {
  return event && event.preventDefault();
}

/**
 *  Sets selected page and previous page style ready for animation
 * @param {*} self 
 */
function _setUpSwipePages(self, props) {
  // reset the animated current and previous page
  self._currentPageElement = null;
  self._previousPageElement = null;
  
  // selected page
  this._initCurrentPage(self, self.selectedItem, 0, props);

  // gets the last element of navigationHistory and assigns to previous page
  var value = self.navigationHistory[self.navigationHistory.length - 1];
  var page = self._valueToItem(value);

  self._leftCandidate = page;
  self._leftCandidate.style.zIndex = 2;
  self.selectedItem.style.zIndex = 3;
  this._initPreviousPage(self, self._leftCandidate, -this._getOffsetWidth(self), props);
}

// initPage - set up page for animatioin
/**
 * Set up current page for animation
 * @param {*} self 
 * @param {*} page 
 * @param {*} left 
 */
function _initCurrentPage(self, page, left, props) {
  if (page == null) {
    return;
  }
  page.style.left = `${left}px`;
  page.style.transition = `none`;

  self._currentPageElement = page;
  // create shadow element in current page, with opacity 1
  props.shadowElement.style.opacity = 1;
  props.shadowElement.setAttribute('id', 'shadow');
  self._currentPageElement.insertAdjacentElement('afterbegin', props.shadowElement);
}

/**
 * Set up previous page or last page for animation
 * @param {*} self 
 * @param {*} page 
 * @param {*} left 
 */
function _initPreviousPage(self, page, left, props) {
  if (page == null) {
    return;
  }
  page.style.left = `${left * 0.2}px`;
  page.style.transition = `none`;

  self._previousPageElement = page;
  // create overlay element for next page with opacity 1
  props.overlayElement.style.opacity = 1;
  props.overlayElement.setAttribute('id', 'overlay');
  self._previousPageElement.insertAdjacentElement('afterbegin', props.overlayElement);
}

/**
 * where transition is computed
 */
function _computeTransition(self, factor) {
  var duration = factor * 400; // let iosDuration = 400;
  return `transform ${duration}ms ${self.transitionTimingFunction}`; // change ${duration} to ${iosDuration}
}

/**
 * Gets the offsetWidth
 */
function _getOffsetWidth(self) {
  self._offsetWidth = self.offsetWidth;
  return self._offsetWidth;
}

function _pageTransitionEndHandler(event) {
  this.removeAttribute('style');
  let shadow = dom(this.root).querySelector('#shadow');
  let overlay = dom(this.root).querySelector('#overlay');
  if (shadow != null) shadow.parentNode.removeChild(shadow);
  if (overlay != null) overlay.parentNode.removeChild(overlay);
}/**
 * Animate pages when 'iron-select' fires
 * @param {*} self 
 * @param {*} event 
 */
export function _animateOnIronSelect(self, event) {
  let lastItemValue = self._indexToValue(self._lastIndex);
  
  // prevent bubbling of same event to child. 
  if (event.target !== self) {
    return;
  }

  // This variable _lastIndex is set from _onIronDeselectItem() which callback to event that listen to 'iron-deselect'
  // This prevents this _animateOnIronSelect from running on first load
  if (self._lastIndex == undefined) {
    return;
  }

  // check for complete swipe or complete animation
  if (self._completeSwipe || self._animationComplete) {
    self._completeSwipe = false;
    self._animationComplete = false;
  } else {
    const targetItemIndex = self.indexOf(event.detail.item);
    const value = self._indexToValue(targetItemIndex);
    const page = self._valueToItem(value);
    // saving our current page to history if coming from tab changes / animation direction forward
    _savingPagesHistory(self, lastItemValue);
    if (!self.noAnimation) animatePageByPlatform(self, page, lastItemValue);
  }
}

/**
 * Sets direction forward or backwards and also set the animation either android or ios
 * @param {*} self 
 * @param {Object} page - current page to animate
 */
function animatePageByPlatform(self, page, lastItemValue) {
  let animation;
  if (self.platform == 'android') {
    animation = androidAnimation(self, self._valueToItem(lastItemValue), page, self.pageChangeAnimationDirection);
  } else if (self.platform == 'ios') {
    animation = iosAnimation(self, self._valueToItem(lastItemValue), page, self.pageChangeAnimationDirection);
  }

  animation.then(() => _animationCompleted(self, page));
}

/**
 * Selects the animation direction either 'forward' or 'backward'
 * @param {*} self
 */
function _savingPagesHistory(self, lastItemValue) {
  const direction = self.pageChangeAnimationDirection;
  if (direction == 'forward') {
    self.push('navigationHistory', lastItemValue);
  } else {
    self.pop('navigationHistory');
  }
}

function _animationCompleted(self, page) {
  _selectPage(self, page);
  self._animationComplete = false;
}

/**
 * Change this.selected to what is the current value of page
 */
function _selectPage(self, page) {
  self.selected = self._valueForItem(page);
}
