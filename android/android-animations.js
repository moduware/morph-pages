function androidAnimation(self, currentPageIndex, nextPageIndex, direction) {
  return new Promise((resolve, reject) => {

    let props = {
      duration: 250,
      nextPageOffset: 56,
      start: -1,
      morphPages: self,
      currentPage: self.children[currentPageIndex],
      nextPage: self.children[nextPageIndex],
      nextPageIndex: nextPageIndex
    };

    // Current page behind next page
    props.currentPage.style.zIndex = 1;
    props.nextPage.style.zIndex = 2;

    // Initial setup
    props.nextPage.style.opacity = 0;

    window.requestAnimationFrame((timestamp) => {
      window[direction + 'AndroidAnimationStep'](props, () => {
        self.animationEnd(props);
        resolve();
      }, timestamp);
    });
  });
}

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