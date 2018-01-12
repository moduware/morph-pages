function androidAnimationEnd(props) {
  props.nextPage.removeAttribute('style');
  props.currentPage.removeAttribute('style');
  props.morphPages.selected = props.nextPageIndex;
}