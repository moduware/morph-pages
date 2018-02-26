/**
 * Animate pages when 'iron-select' fires
 * @param {*} self 
 * @param {*} event 
 */
function _animateOnIronSelect(self, event) {
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
    let lastItemValue = self._indexToValue(self._lastIndex);
    // saving our current page to history if coming from tab changes / animation direction forward
    _savingPagesHistory(self, lastItemValue);
    goToLink(self, page, lastItemValue);
  }
}

/**
 * Sets direction forward or backwards and also set the animation either android or ios
 * @param {*} self 
 * @param {Object} page - current page to animate
 */
function goToLink(self, page, lastItemValue) {
  let animation;
  if (self.platform == 'android') {
    animation = androidAnimation(self, self._valueToItem(lastItemValue), page, self.pageChangeAnimationDirection);
  } else if (self.platform == 'ios') {
    animation = iosAnimation(self, self._valueToItem(lastItemValue), page, self.pageChangeAnimationDirection);
  }

  animation.then(() => this._animationCompleted(self, page));
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
