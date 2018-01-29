/**
 * Listener callback handleTrack() detects track and uses trackStart, trackMove and trackEnd to manage swiping
 */
function _onTrack(self, event) {
  var track = event.detail;
  // this are checks if touch tracking needs to be cancelled
  if (track.dx < 0 || self.platform != 'ios') {
    return;
  }

  // this is checking for track.state == equal and swipe is left to right
  if (track.state === 'start' && Math.abs(track.dy) < Math.abs(track.dx)) {
    self._swipeStarted = true;
    this._trackStart(self, track);
  } else if (track.state == 'track' && self._swipeStarted) {
    this._trackMove(self, track);
  } else if (track.state == 'end' && self._swipeStarted) {
    this._trackEnd(self, track);
  }
}

/**
 *  Detects track.state = start. tracking is triggered by this method
 */
function _trackStart(self, trackData) {
  if (self.navigationHistory.length == 0) {
    self._swipeStarted = false;
    return;
  }

  // set up the pages to animate
  this._setUpSwipePages(self);

  // TODO: add description on what this is doing
  self._animatePages(trackData.dx);

  //TODO: this._switchPageIfNecessary(trackData.dx) ??? This is the case when there is only two pages

  // Prevent regular touchmove event (disables vertical scroll) the other half which removes this is in the _trackEnd()
  //TODO: window.addEventListener('touchmove', this._preventTouchMove);
}

/** 
 *  Gets all data event.details as long as track.state = 'track'. 
 */
function _trackMove(self, trackData) {
  //TODO: send data for animation progression
  self._animatePages(trackData.dx);
}

/**
 * This computes transition if pages to swipe or move back to current page. 
 */
function _trackEnd(self, trackData) {
  if (self._swipeStarted == false) {
    return;
  }

  // set up current and previous pages and set listener for 'transitionend'
  self._currentPageElement.style.transition = self._computeTransition(1);
  self._currentPageElement.addEventListener('transitionend', self._pageTransitionEndHandler);
  self._previousPageElement.style.transition = self._computeTransition(1);
  self._previousPageElement.addEventListener('transitionend', self._pageTransitionEndHandler);

  // The element is swipe away when swiping get passed the threshold
  self._completeSwipe = Math.abs(trackData.dx) > self._getOffsetWidth() * self.threshold;
  if (self._completeSwipe) {
    // update selected
    self._selectPage(self._leftCandidate);
    // trigger the animation in the right direction
    self._animatePages(self._getOffsetWidth());

    // update userSelected property so selectNext and selectPrevious works
    self.userSelected = self._valueToIndex(self.selected);
    // remove the last element of navigationHistory when swipe is complete
    self.navigationHistory.pop();
  } else {
    // swipe not long enough so go back to current page
    self._animatePages(0);
  }

  // enable regular touchmove event ( enables vertical scroll again)
  // window.removeEventListener('touchmove', this._preventTouchMove);
}

/**
 *  Sets selected page and previous page style ready for animation
 * @param {*} self 
 */
function _setUpSwipePages(self) {
  // reset the animated current and previous page
  self._currentPageElement = null;
  self._previousPageElement = null;
  // selected page
  this._initCurrentPage(self, self.selectedItem, 0);

  // gets the last element of navigationHistory and assigns to previous page
  var value = self.navigationHistory[self.navigationHistory.length - 1];
  var page = self._valueToItem(value);

  self._leftCandidate = page;
  self._leftCandidate.style.zIndex = 2;
  self.selectedItem.style.zIndex = 3;
  this._initPreviousPage(self, self._leftCandidate, -self._getOffsetWidth());
}

// initPage - set up page for animatioin
/**
 * Set up current page for animation
 * @param {*} self 
 * @param {*} page 
 * @param {*} left 
 */
function _initCurrentPage(self, page, left) {
  if (page == null) {
    return;
  }
  page.style.left = `${left}px`;
  page.style.transition = `none`;
  self.toggleClass('iron-swiping', true, page); // this should be added in css styles - left: -100% !important;

  self._currentPageElement = page;
}

/**
 * Set up previous page or last page for animation
 * @param {*} self 
 * @param {*} page 
 * @param {*} left 
 */
function _initPreviousPage(self, page, left) {
  if (page == null) {
    return;
  }
  page.style.left = `${left * 0.2}px`;
  page.style.transition = `none`;
  self.toggleClass('iron-swiping', true, page); // this should be added in css styles - left: -100% !important;

  self._previousPageElement = page;
}