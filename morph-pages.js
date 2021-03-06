import { MorphElement } from '@moduware/morph-element/morph-element.js';
import '@polymer/iron-pages/iron-pages.js';
import '@polymer/polymer/lib/utils/render-status.js';
import { GestureEventListeners } from '@polymer/polymer/lib/mixins/gesture-event-listeners.js';
import { DomModule } from '@polymer/polymer/lib/elements/dom-module.js';
import { addListener } from '@polymer/polymer/lib/utils/gestures.js';

import { _animateOnIronSelect } from './change-selected/change-selected.js';
import { onTrack } from './ios/ios-swipeback';
// import './morph-location.js';

var $_documentContainer = document.createElement('template');

$_documentContainer.innerHTML = /*html*/`
<dom-module id="morph-pages">
  <template id="styles">
    <style>
      :host {
        --host-page-display: block;
        position: relative;
        display: var(--host-page-display);

        --animation-duration: 250ms;
      }

      :host > ::slotted(:not(slot)) {
        --host-slotted-page-diplay: block;
        display: var(--host-slotted-page-diplay) !important;
        position: absolute;
        top: 0; left: 0; right: 0; bottom: 0;
      }

      :host > ::slotted(:not(slot):not(.iron-selected)) {
        z-index: 0;
      }

      :host > ::slotted(:not(slot).iron-selected) {
        z-index: 1;
      }
    </style>

  </template>

  
</dom-module>
`;

document.head.appendChild($_documentContainer.content);

var subTemplate;
var IronPagesSuperClass = customElements.get('iron-pages');
var MixinBase = (superclass) => MorphElement(superclass);

/**
 * `morph-pages`
 * Pages element that morphs for current mobile OS
 *
 * @customElement
 * @polymer
 * @demo morph-pages/demo/index.html
 */
export class MorphPages extends GestureEventListeners( MixinBase(IronPagesSuperClass) ) {
  static get is() { return 'morph-pages'; }

  static get properties() {
    return {
      animationInProgress: {
        type: Boolean
      },

      /**
      *  Value used to decide if page get swipe or not
      */
      threshold: {
        type: Number,
        value: 0.4
      },

      /**
       * The CSS transition timing function applied.
       */
      transitionTimingFunction: {
        type: String,
        value: 'cubic-bezier(0.4, 0.0, 0.2, 1)'
      },

      /** Array of previous pages location hash or value */
      navigationHistory: {
        type: Array,
        value: () => []
      },

      /** Page animation direction setter that links wiht morph-location's last-navigation-direction */
      pageChangeAnimationDirection: {
        type: String,
        value: 'forward'
      },

      /** Page swipeback setter. when true there will be no swipeback on ios when swiping back on pages */
      noSwipeback: {
        type: Boolean,
        value: false
      },

      /** Page animation setter. when true there will be no animation when transitioning to pages */
      noAnimation: {
        type: Boolean,
        value: false
      }

    };
  }

  /**
   * This will return our template inherited from superclass <iron-pages> with our styles inserted
   */
  static get template() {
    if (!subTemplate) {
      // first clone our superclass <iron-pages> template
      let superClass = customElements.get('iron-pages');
      subTemplate = superClass.template.cloneNode(true);
      // here we will get the content of our <style> so we can insert them into the superclass <style>
      // note the added id="styles" in our template tag above
      const subStyle = DomModule.import('morph-pages', 'template#styles').content;
      // get the content of current style from superClass
      const superStyle = subTemplate.content.querySelector('style');
      // append our added style at the bottom of the current style to get higher priority
      superStyle.parentNode.appendChild(subStyle);
    }
    return subTemplate;
  }

  constructor() {
    super();
    this._currentPageElement = null;
    this._previousPageElement = null;
    addListener(this, 'track', e => this._handleTrackSwipe(e));
  }
  
  ready() {
    super.ready();
  }
  
  connectedCallback() {
    super.connectedCallback();
    // Set up events listener everytime selected is change and current selected is deselected 
    this.addEventListener('iron-select', this._onIronSelectItem);
    this.addEventListener('iron-deselect', this._onIronDeselectItem);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    // Removes events listener 
    this.removeEventListener('iron-select', this._onIronSelectItem);
    this.removeEventListener('iron-deselect', this._onIronDeselectItem);
  }

  /**
   * Used by android-animation.js and ios-animation.js to remove styles on current and previous pages
   */
  animationEnd(props) {
    props.nextPage.removeAttribute('style');
    props.currentPage.removeAttribute('style');
  }

  /**
   *  This method is called when event 'track' is fired. This event listener is set up in constructor
   */
  _handleTrackSwipe(event) {
    if (this.noSwipeback) {return;}

    this._startTracking(event);
  }

  _startTracking(event) {
    onTrack(this, event);
  }

  /**
   * Listens to 'iron-select' and calls animation unless not needed
   */
  _onIronSelectItem(event) {
    if (this.noAnimation) { return;}
    _animateOnIronSelect(this, event);
  }

  /**
   *  deselectItem listening to 'iron-deselect' event. Fires everytime selected is deselected
   */
  _onIronDeselectItem(event) {
    // Prevent bubbling of same event on child elements
    if (event.target !== this) {
      return;
    }
    // this assigns the index of currently deselected item to _lastIndex
    this._lastIndex = this.indexOf(event.detail.item);
  }

}

window.customElements.define(MorphPages.is, MorphPages);
