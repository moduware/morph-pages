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
    self._trackStart(track);
  } else if (track.state == 'track' && self._swipeStarted) {
    self._trackMove(track);
  } else if (track.state == 'end' && self._swipeStarted) {
    self._trackEnd(track);
  }
}