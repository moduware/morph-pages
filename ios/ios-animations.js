var requestAnimationId;

/**
 * The entry point method for ios animation using requestAnimationFrame
 * @param {*} self 
 * @param {*} currentPage - The current page to be animated
 * @param {*} nextPage - The next page to be animated
 * @param {String} direction - The direction of the animation
 */
export function iosAnimation(self, currentPage, nextPage, direction) {
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
export function createShadowElem() {
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
export function createOverlayElement() {
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