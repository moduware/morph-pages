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

  if (self._lastIndex == undefined) {
    return;
  }

  // on first load no animations
  if (self.onFirstLoad == true) {
    self.onFirstLoad = false;
    return;
  }

  // check for complete swipe or complete animation from selectNext or selectPrevious 
  if (self._completeSwipe || self._animationComplete) {
    self._completeSwipe = false;
    self._animationComplete = false;
    self.onFirstLoad = false;
  } else {
    const targetItemIndex = self.indexOf(event.detail.item);
    const value = self._indexToValue(targetItemIndex);
    const page = self._valueToItem(value);
    this.goToLink(self, page);
  }
}

function goToLink(self, page) {
  const direction = self.pageChangeAnimationDirection; //'forward';
  // saving our current page to history
  let lastItemValue = self._indexToValue(self._lastIndex);
  self.push('navigationHistory', lastItemValue);
  this.changePageByLink(self, page, direction);
}

function changePageByLink(self, page, direction) {
  let animation;
  let lastItemValue = self._indexToValue(self._lastIndex);
  if (self.platform == 'android') {
    animation = androidAnimation(self, self._valueToItem(lastItemValue), page, direction);
  } else if (self.platform == 'ios') {
    animation = iosAnimation(self, self._valueToItem(lastItemValue), page, direction);
  }

  animation.then(() => this._animationCompleted(self, page));
}

function _animationCompleted(self, page) {
  self._selectPage(page);
  self._animationComplete = false;
  // update userSelected property so selectNext and selectPrevious works
  self.userSelected = self._valueToIndex(self.selected);
}