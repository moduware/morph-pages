import { iosAnimation } from '../ios/ios-animations.js';
import { androidAnimation } from '../android/android-animations.js';

/**
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

  if(animation) {
    animation.then(() => _animationCompleted(self, page));
  }
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
