import { LitElement, html, css } from 'lit-element';
import { getPlatform } from '@moduware/lit-utils';
//import { ifDefined } from 'lit-html/directives/if-defined.js';

/**
 * `morph-button`
 * Button that morphs for current mobile OS
 *
 * @customElement
 * @extends HTMLElement
 * @demo morph-button/demo/index.html
 */
class MorphPages extends LitElement {
  static get styles() {
    return [
      css`

      :host {
        display: block;
        position: relative;
        overflow: hidden;
      }

      ::slotted(.page) {
        position: absolute;
        top: 0; left: 0; bottom: 0; right: 0;
      }

      ::slotted(.page:not(.page--current)) {
        display: none;
      }

      /* if iOS assigning colors from iOS colors table */
      :host([platform="ios"]) {
      }

      /* if Android assigning colors from Android colors table */
      :host([platform="android"]) {
      }

      #shadow {
        position: absolute;
        top: 0; left: 0; right: 0; bottom: 0;
        pointer-events: none;
        z-index: 2;
      }

      #shadow::before {
        content: '';
        display: block;
        position: absolute;
        top: 0; left: -16px; bottom: 0;
        width: 16px;
        background: linear-gradient(to right, rgba(0,0,0,0) 0%, rgba(0,0,0,0) 10%, rgba(0,0,0,0.01) 50%, rgba(0,0,0,0.2) 100%);
      }

      #overlay {
        position: absolute;
        top: 0; left: 0; right: 0; bottom: 0;
        pointer-events: none;
        z-index: 1;
        background: rgba(0,0,0,0.1);
        opacity: 0;
      }

      `
    ];
  }

  render() {
    return html`
      <div class="container">
        <slot></slot>
        <div id="shadow"></div>
        <div id="overlay"></div>
      </div>
    `;
  }

  static get is() { return 'morph-pages'; }
  static get properties() {
    return {
      platform: {
        type: String,
        reflect: true
      },
      'current-page': {
        type: String
      },
      animation: {
        type: String
      }
    };
  }

  constructor() {
    super();
    this.animation = 'forward';
    this._animationIsRunning = false;
    this._fastforwardRequested = false;
    this._animationCompletionCallback = null;
  }

  /**
   * lit-element lifecycle called once before the first updated().
   */
  firstUpdated() {
    super.firstUpdated();
    this.$shadow = this.shadowRoot.getElementById('shadow');
    this.$overlay = this.shadowRoot.getElementById('overlay');
    // check first if platform assigned in html markup before using getPlatform to auto detect platform
    if(!this.hasAttribute('platform')) {
      this.platform = getPlatform();
    }
    //NOTE: add default value to flat, raised, rounded, active, disabled, color, filled, big
  }

  async updated(changedProperties) {
    // if(this.color) {
    //   this.colorAssigned(this.color);
    // }
    if(changedProperties.has('current-page')) {
      // check if animation is running
      if(this._animationIsRunning) {
        console.info('fast finger detected!');
        // fastforward the animation to the end
        await this.fastforwardCurrentAnimation();
      }
      const currentPageName = this['current-page'];
      let newPage = this.querySelector(`[name="${currentPageName}"]`);
      let oldPage = null;
      if(typeof changedProperties.get('current-page') != 'undefined') {
        oldPage = this.querySelector(`[name="${changedProperties.get('current-page')}"]`);
        //await this.oldPageAnimation(oldPage);
        newPage.classList.add('page--current');
        await this.pageChangeAnimation(oldPage, newPage);
        oldPage.classList.remove('page--current');

        // if old page existed applying animation to a new page
      } else {
        // if no old page then showing new page immidiately
        newPage.classList.add('page--current');
      }
    }
  }

  async fastforwardCurrentAnimation() {
    // notify current animation that fastforward is requested
    this._fastforwardRequested = true;
    // wait for animation complete event
    await this.waitForAnimationCompletion();
    // disable animation fastforward request
    this._fastforwardRequested = false;
  }

  waitForAnimationCompletion() {
    return new Promise((resolve, reject) => {
      if(this._animationCompletionCallback != null) throw 'Already listening!';
      this._animationCompletionCallback = () => {
        this._animationCompletionCallback = null;
        resolve();
      };
    });
  }

  pageChangeAnimation(oldPage, newPage) {
    if(this.animation == 'none') return;

    return new Promise((resolve, reject) => {
      var resolveHandler = () => {
        resolve();
        if(this._animationCompletionCallback != null) this._animationCompletionCallback();
      }

      requestAnimationFrame((timestamp) => {
        if(this.platform == 'ios' && this.animation == 'forward') {
          this.iosForwardAnimation(oldPage, newPage, 400, () => resolveHandler(), timestamp);

        } else if(this.platform == 'ios' && this.animation == 'backward') {
          this.iosBackwardAnimation(oldPage, newPage, 400, () => resolveHandler(), timestamp);

        } else if(this.platform == 'android' && this.animation == 'forward') {
          this.androidForwardAnimation(oldPage, newPage, 2500, () => resolveHandler(), timestamp);

        } else if(this.platform == 'android' && this.animation == 'backward') {
          this.androidBackwardAnimation(oldPage, newPage, 2500, () => resolveHandler(), timestamp);

        } else {
          console.warn('Unknown animation function requested!');
          resolve();
        }
      });
    });
  }

  iosForwardAnimation(oldPage, newPage, duration, endCallback, currentTimestamp, startTimestamp = null) {
    const PAGE_OFFSET_LEFT_MAX = -20; // percent
    const PAGE_OFFSET_RIGHT_MAX = 100; // percent
    if(startTimestamp == null) {
      this._animationIsRunning = true;
      startTimestamp = currentTimestamp;
      this.$shadow.style.right = 0;
      newPage.style.zIndex = 2;
    }

    let progress = currentTimestamp - startTimestamp;
    if(this._fastforwardRequested) {
      progress = duration; // 100%
    }
    let timing = progress / duration;
    if(timing > 1) timing = 1;
    const opacity = progress / duration;

    // update shadow & overlay element here
    this.$shadow.style.opacity = opacity;
    this.$overlay.style.opacity = opacity;

    const oldPageOffset = this.easeInOutQuad(timing) * PAGE_OFFSET_LEFT_MAX;
    const newPageOffset = 100 - this.easeInOutQuad(timing) * PAGE_OFFSET_RIGHT_MAX;

    oldPage.style.transform = `translate3d(${oldPageOffset}%,0,0)`;
    newPage.style.transform = `translate3d(${newPageOffset}%,0,0)`;
    this.$shadow.style.transform = `translate3d(${newPageOffset}%,0,0)`;

    if(progress < duration) {
      requestAnimationFrame((timestamp) => {
        this.iosForwardAnimation(oldPage, newPage, duration, endCallback, timestamp, startTimestamp);
      });
    } else {
      oldPage.removeAttribute('style');
      newPage.removeAttribute('style');
      this.$shadow.removeAttribute('style');
      this.$overlay.removeAttribute('style');
      this._animationIsRunning = false;
      endCallback();
    }
  }

  iosBackwardAnimation(oldPage, newPage, duration, endCallback, currentTimestamp, startTimestamp = null) {
    const PAGE_OFFSET_LEFT_MAX = -20; // percent
    const PAGE_OFFSET_RIGHT_MAX = 100; // percent
    if(startTimestamp == null) {
      this._animationIsRunning = true;
      startTimestamp = currentTimestamp;
      this.$shadow.style.right = 0;
      oldPage.style.zIndex = 2;
    }

    let progress = currentTimestamp - startTimestamp;
    if(this._fastforwardRequested) {
      progress = duration; // 100%
    }
    let timing = progress / duration;
    if(timing > 1) timing = 1;
    const opacity = 1 - progress / duration;

    // update shadow & overlay element here
    this.$shadow.style.opacity = opacity;
    this.$overlay.style.opacity = opacity;

    const oldPageOffset = this.easeInOutQuad(timing) * PAGE_OFFSET_RIGHT_MAX;
    const newPageOffset = PAGE_OFFSET_LEFT_MAX - this.easeInOutQuad(timing) * PAGE_OFFSET_LEFT_MAX;

    oldPage.style.transform = `translate3d(${oldPageOffset}%,0,0)`;
    newPage.style.transform = `translate3d(${newPageOffset}%,0,0)`;
    this.$shadow.style.transform = `translate3d(${oldPageOffset}%,0,0)`;

    if(progress < duration) {
      requestAnimationFrame((timestamp) => {
        this.iosBackwardAnimation(oldPage, newPage, duration, endCallback, timestamp, startTimestamp);
      });
    } else {
      oldPage.removeAttribute('style');
      newPage.removeAttribute('style');
      this.$shadow.removeAttribute('style');
      this.$overlay.removeAttribute('style');
      this._animationIsRunning = false;
      endCallback();
    }

  }

  /**
   *  animation math used by forwardIosAnimationStep and backwardIosAnimationStep
   */
  easeInOutQuad(t) {
    return t < .5 ? 2 * t * t : -1 + (4 - 2 * t) * t
  }

  androidForwardAnimation(oldPage, newPage, duration, endCallback, currentTimestamp, startTimestamp = null) {
    const INITIAL_OFFSET = 56;
    // initial setup
    if(startTimestamp == null) {
      this._animationIsRunning = true;
      startTimestamp = currentTimestamp;
      newPage.style.zIndex = 1;
    }
    let progress = currentTimestamp - startTimestamp;
    if(this._fastforwardRequested) {
      progress = duration; // 100%
    }
    const opacity = progress / duration;

    newPage.style.opacity = opacity;

    const offset = INITIAL_OFFSET - ((progress / duration) * INITIAL_OFFSET);
    newPage.style.transform = `translate3d(0, ${offset}px, 0)`;

    if(progress < duration) {
      requestAnimationFrame((timestamp) => {
        this.androidForwardAnimation(oldPage, newPage, duration, endCallback, timestamp, startTimestamp);
      });
    } else {
      newPage.removeAttribute('style');
      this._animationIsRunning = false;
      endCallback();
    }
  }

  androidBackwardAnimation(oldPage, newPage, duration, endCallback, currentTimestamp, startTimestamp = null) {
    const END_OFFSET = 56;
    if(startTimestamp == null) {
      this._animationIsRunning = true;
      startTimestamp = currentTimestamp;
      oldPage.style.zIndex = 1;
    }
    let progress = currentTimestamp - startTimestamp;
    if(this._fastforwardRequested) {
      progress = duration; // 100%
    }
    const opacity = 1 - progress / duration;

    oldPage.style.opacity = opacity;

    const offset = ((progress / duration) * END_OFFSET);
    oldPage.style.transform = `translate3d(0, ${offset}px, 0)`;

    if(progress < duration) {
      requestAnimationFrame((timestamp) => {
        this.androidBackwardAnimation(oldPage, newPage, duration, endCallback, timestamp, startTimestamp);
      });
    } else {
      oldPage.removeAttribute('style');
      newPage.removeAttribute('style');
      this._animationIsRunning = false;
      endCallback();
    }
  }

  connectedCallback() {
    super.connectedCallback();
  }
}

window.customElements.define(MorphPages.is, MorphPages);
