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
  let shadow = Polymer.dom(this.root).querySelector('#shadow');
  let overlay = Polymer.dom(this.root).querySelector('#overlay');
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
    let shadow = Polymer.dom(this.root).querySelector('#shadow');
    let overlay = Polymer.dom(this.root).querySelector('#overlay');
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
  let shadow = Polymer.dom(this.root).querySelector('#shadow');
  let overlay = Polymer.dom(this.root).querySelector('#overlay');
  if (shadow != null) shadow.parentNode.removeChild(shadow);
  if (overlay != null) overlay.parentNode.removeChild(overlay);
}