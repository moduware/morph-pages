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
    self._trackMove(track);
  } else if (track.state == 'end' && self._swipeStarted) {
    self._trackEnd(track);
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
  self._setUpSwipePages();

  // TODO: add description on what this is doing
  self._animatePages(trackData.dx);

  //TODO: this._switchPageIfNecessary(trackData.dx) ??? This is the case when there is only two pages

  // Prevent regular touchmove event (disables vertical scroll) the other half which removes this is in the _trackEnd()
  //TODO: window.addEventListener('touchmove', this._preventTouchMove);
}