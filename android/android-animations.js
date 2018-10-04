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
      if(direction == 'forward') {
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