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
      }

      ::slotted(.page) {
        position: absolute;
        top: 0; left: 0; bottom: 0; right: 0;
      }

      ::slotted(:not(.page--current)) {
        display: none;
      }

      /* if iOS assigning colors from iOS colors table */
      :host([platform="ios"]) {
      }

      /* if Android assigning colors from Android colors table */
      :host([platform="android"]) {
      }

      `
    ];
  }

  render() {
    return html`
      <div class="container">
        <slot></slot>
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
      }
    };
  }

  constructor() {
    super();
    //this.color = 'blue';
  }

  /**
   * lit-element lifecycle called once before the first updated().
   */
  firstUpdated() {
    super.firstUpdated();
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
      const currentPageName = this['current-page'];
      let newPage = this.querySelector(`[name=${currentPageName}]`);
      let oldPage = null;
      if(typeof changedProperties.get('current-page') != 'undefined') {
        oldPage = this.querySelector(`[name=${changedProperties.get('current-page')}]`);
        await this.oldPageAnimation(oldPage);
        oldPage.classList.remove('page--current');

        // if old page existed applying animation to a new page
        newPage.classList.add('page--current');
        await this.newPageAnimation(newPage);
      } else {
        // if no old page then showing new page immidiately
        newPage.classList.add('page--current');
      }
    }
  }

  oldPageAnimation(node) {
    return new Promise((resolve, reject) => {
      requestAnimationFrame((timestamp) => {
        this.fadeOutAnimation(node, 1000, () => resolve(), timestamp);
      });
    });
  }

  newPageAnimation(node) {
    node.style.opacity = 0;
    return new Promise((resolve, reject) => {
      requestAnimationFrame((timestamp) => {
        this.fadeInAnimation(node, 1000, () => resolve(), timestamp);
      });
    });
  }

  fadeOutAnimation(node, duration, endCallback, currentTimestamp, startTimestamp = null) {
    if(startTimestamp == null) startTimestamp = currentTimestamp;

    const progress = currentTimestamp - startTimestamp;
    const opacity = 1 - progress / duration;

    node.style.opacity = opacity;

    if(progress < duration) {
      requestAnimationFrame((timestamp) => {
        this.fadeOutAnimation(node, duration, endCallback, timestamp, startTimestamp);
      });
    } else {
      node.removeAttribute('style');
      endCallback();
    }
  }

  fadeInAnimation(node, duration, endCallback, currentTimestamp, startTimestamp = null) {
    if(startTimestamp == null) startTimestamp = currentTimestamp;

    const progress = currentTimestamp - startTimestamp;
    const opacity = progress / duration;

    node.style.opacity = opacity;

    if(progress < duration) {
      requestAnimationFrame((timestamp) => {
        this.fadeInAnimation(node, duration, endCallback, timestamp, startTimestamp);
      });
    } else {
      node.removeAttribute('style');
      endCallback();
    }
  }


  connectedCallback() {
    super.connectedCallback();
  }
}

window.customElements.define(MorphPages.is, MorphPages);
