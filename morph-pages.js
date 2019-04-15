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

  updated(changedProperties) {
    // if(this.color) {
    //   this.colorAssigned(this.color);
    // }
  }

  connectedCallback() {
    super.connectedCallback();
  }
}

window.customElements.define(MorphPages.is, MorphPages);
