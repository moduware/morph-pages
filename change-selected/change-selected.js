// onIronSelectItem
/**
 * 
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

  // check for complete swipe or complete animation from selectNext or selectPrevious 
  if (self._completeSwipe || self._animationComplete) {
    self._completeSwipe = false;
    self._animationComplete = false;
  } else {
    const targetItemIndex = self.indexOf(event.detail.item);
    const value = self._indexToValue(targetItemIndex);
    const page = self._valueToItem(value);
    goToLink(self, page);
  }
}

function goToLink(self, page) {
  const direction = self.pageChangeAnimationDirection;
  
  let lastItemValue = self._indexToValue(self._lastIndex);
  // saving our current page to history if coming from tab changes / animation direction forward
  if (direction == 'forward') {
    self.push('navigationHistory', lastItemValue);
  } else {
    self.pop('navigationHistory');
  }
  
  let animation;
  if (self.platform == 'android') {
    animation = androidAnimation(self, self._valueToItem(lastItemValue), page, direction);
  } else if (self.platform == 'ios') {
    animation = iosAnimation(self, self._valueToItem(lastItemValue), page, direction);
  }

  animation.then(() => this._animationCompleted(self, page));
}

function _animationCompleted(self, page) {
  _selectPage(self, page);
  self._animationComplete = false;
}

/**
 * Change this.selected to what is the current value of page
 */
function _selectPage(self, page, direction) {
  self.selected = self._valueForItem(page);
}


// NOTE: 
// window.onhashchange = function () {
//   console.log('hash changed triggered');
// };