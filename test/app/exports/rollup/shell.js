import { s, i, x } from './custom-svg-icon-b868d129.js';

/**
 * @extends HTMLElement
 */
((base = HTMLElement) => {
  globalThis.svgIconset = globalThis.svgIconset || {};

  customElements.define('custom-svg-iconset', class CustomSvgIconset extends base {
    #icons = {}
    constructor() {
      super();
      this.#icons = this.#createIconMap();
    }
    connectedCallback() {
      !this.name && this.setAttribute('name', 'icons');
      globalThis.svgIconset[this.name] = this;
      globalThis.dispatchEvent(new CustomEvent('svg-iconset-update'));
      globalThis.dispatchEvent(new CustomEvent('svg-iconset-added', {detail: this.name}));

      this.style.display = 'none';
    }
    /**
     * The name of the iconset
     * @default {string} icons
     */
    get name() {
      return this.getAttribute('name');
    }

    /**
     * The width of the viewBox
     * @default {Number} 24
     */
    get width() {
      return this.getAttribute('width') || 24
    }

    /**
     * The height of the viewBox
     * @default {Number} 24
     */
    get height() {
      return this.getAttribute('height') || 24
    }

    /* from https://github.com/PolymerElements/iron-iconset-svg */
    /**
     * Applies an icon to given element
     * @param {HTMLElement} element the element appending the icon to
     * @param {string} icon The name of the icon to show
     */
    applyIcon(element, icon) {
      element = element.shadowRoot || element;
      this.removeIcon(element);
      this.#cloneIcon(icon).then(icon => {
        element.insertBefore(icon, element.childNodes[0]);
        element._iconSetIcon = icon;
      });
    }
    /**
     * Remove an icon from the given element by undoing the changes effected
     * by `applyIcon`.
     *
     * @param {Element} element The element from which the icon is removed.
     */
    removeIcon(element) {
      // Remove old svg element
      element = element.shadowRoot || element;
      if (element._iconSetIcon) {
        element.removeChild(element._iconSetIcon);
        element._iconSetIcon = null;
      }
    }
    /**
     * Produce installable clone of the SVG element matching `id` in this
     * iconset, or `undefined` if there is no matching element.
     *
     * @return {Element} Returns an installable clone of the SVG element
     * matching `id`.
     * @private
     */
    #cloneIcon(id) {
      return new Promise((resolve, reject) => {
        try {
          let svgClone = this.#prepareSvgClone(this.#icons[id]);
          resolve(svgClone);
        } catch (error) {
          reject(error);
        }
      });
    }
    // TODO: Update icon-map on child changes
    /**
     * Create a map of child SVG elements by id.
     *
     * @return {!Object} Map of id's to SVG elements.
     * @private
     */
    #createIconMap() {
      const icons = {};
      for (const icon of Array.from(this.querySelectorAll('[id]'))) {
        icons[icon.id] = icon;
      }
      return icons;
    }
    /**
     * @private
     */
    #prepareSvgClone(sourceSvg) {
      if (sourceSvg) {
        var content = sourceSvg.cloneNode(true),
            svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'),
            viewBox = content.getAttribute('viewBox') || '0 0 ' + this.width + ' ' + this.height,
            cssText = 'pointer-events: none; display: block; width: 100%; height: 100%;';
        svg.setAttribute('viewBox', viewBox);
        svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
        svg.style.cssText = cssText;
        svg.appendChild(content).removeAttribute('id');
        return svg;
      }
      return null;
    }
  });
})();

window.Backed = window.Backed || {};
// binding does it's magic using the propertyStore ...
window.Backed.PropertyStore = window.Backed.PropertyStore || new Map();

// TODO: Create & add global observer
var PropertyMixin = base => {
  return class PropertyMixin extends base {
    static get observedAttributes() {
      return Object.entries(this.properties).map(entry => {if (entry[1].reflect) {return entry[0]} else return null});
    }

    get properties() {
      return customElements.get(this.localName).properties;
    }

    constructor() {
      super();
      if (this.properties) {
        for (const entry of Object.entries(this.properties)) {
          entry[1];
          // allways define property even when renderer is not found.
          this.defineProperty(entry[0], entry[1]);
        }
      }
    }

    connectedCallback() {
      if (super.connectedCallback) super.connectedCallback();
      if (this.attributes)
        for (const attribute of this.attributes) {
          if (String(attribute.name).includes('on-')) {
            const fn = attribute.value;
            const name = attribute.name.replace('on-', '');
            this.addEventListener(String(name), event => {
              let target = event.path[0];
              while (!target.host) {
                target = target.parentNode;
              }
              if (target.host[fn]) {
                target.host[fn](event);
              }
            });
          }
      }
    }

    attributeChangedCallback(name, oldValue, newValue) {
      this[name] = newValue;
    }

    /**
     * @param {function} options.observer callback function returns {instance, property, value}
     * @param {boolean} options.reflect when true, reflects value to attribute
     * @param {function} options.render callback function for renderer (example: usage with lit-html, {render: render(html, shadowRoot)})
     */
    defineProperty(property = null, {strict = false, observer, reflect = false, renderer, value}) {
      Object.defineProperty(this, property, {
        set(value) {
          if (value === this[`___${property}`]) return;
          this[`___${property}`] = value;

          if (reflect) {
            if (value) this.setAttribute(property, String(value));
            else this.removeAttribute(property);
          }

          if (observer) {
            if (observer in this) this[observer]();
            else console.warn(`observer::${observer} undefined`);
          }

          if (renderer) {
            const obj = {};
            obj[property] = value;
            if (renderer in this) this.render(obj, this[renderer]);
            else console.warn(`renderer::${renderer} undefined`);
          }

        },
        get() {
          return this[`___${property}`];
        },
        configurable: strict ? false : true
      });
      // check if attribute is defined and update property with it's value
      // else fallback to it's default value (if any)
      const attr = this.getAttribute(property);
      this[property] = attr || this.hasAttribute(property) || value;
    }
  }
};

/**
 * @mixin Backed
 * @module utils
 * @export merge
 *
 * some-prop -> someProp
 *
 * @param {object} object The object to merge with
 * @param {object} source The object to merge
 * @return {object} merge result
 */
var merge = (object = {}, source = {}) => {
  // deep assign
  for (const key of Object.keys(object)) {
    if (source[key]) {
      Object.assign(object[key], source[key]);
    }
  }
  // assign the rest
  for (const key of Object.keys(source)) {
    if (!object[key]) {
      object[key] = source[key];
    }
  }
  return object;
};

var SelectMixin = base => {
  return class SelectMixin extends PropertyMixin(base) {

    static get properties() {
      return merge(super.properties, {
        selected: {
          value: 0,
          observer: '__selectedObserver__'
        }
      });
    }

    constructor() {
      super();
    }

    get slotted() {
      return this.shadowRoot ? this.shadowRoot.querySelector('slot') : this;
    }

    get _assignedNodes() {
      const nodes = 'assignedNodes' in this.slotted ? this.slotted.assignedNodes() : this.children;
      const arr = [];
      for (var i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        if (node.nodeType === 1) arr.push(node);
      }
      return arr;
    }

    /**
    * @return {String}
    */
    get attrForSelected() {
      return this.getAttribute('attr-for-selected') || 'name';
    }

    set attrForSelected(value) {
      this.setAttribute('attr-for-selected', value);
    }

    attributeChangedCallback(name, oldValue, newValue) {
      if (oldValue !== newValue) {
        // check if value is number
        if (!isNaN(newValue)) {
          newValue = Number(newValue);
        }
        this[name] = newValue;
      }
    }

    /**
     * @param {string|number|HTMLElement} selected
     */
    select(selected) {
      if (selected) this.selected = selected;
      // TODO: fix selectedobservers
      if (this.multi) this.__selectedObserver__();
    }

    next(string) {
      const index = this.getIndexFor(this.currentSelected);
      if (index !== -1 && index >= 0 && this._assignedNodes.length > index &&
          (index + 1) <= this._assignedNodes.length - 1) {
        this.selected = this._assignedNodes[index + 1];
      }
    }

    previous() {
      const index = this.getIndexFor(this.currentSelected);
      if (index !== -1 && index >= 0 && this._assignedNodes.length > index &&
          (index - 1) >= 0) {
        this.selected = this._assignedNodes[index - 1];
      }
    }

    getIndexFor(element) {
      if (element && element instanceof HTMLElement === false)
        return console.error(`${element} is not an instanceof HTMLElement`);

      return this._assignedNodes.indexOf(element || this.selected);
    }

    _updateSelected(selected) {
      selected.classList.add('custom-selected');
      if (this.currentSelected && this.currentSelected !== selected) {
        this.currentSelected.classList.remove('custom-selected');
      }
      this.currentSelected = selected;
    }

    /**
     * @param {string|number|HTMLElement} change.value
     */
    __selectedObserver__(value) {
      const type = typeof this.selected;
      if (Array.isArray(this.selected)) {
        for (const child of this._assignedNodes) {
          if (child.nodeType === 1) {
            if (this.selected.indexOf(child.getAttribute(this.attrForSelected)) !== -1) {
              child.classList.add('custom-selected');
            } else {
              child.classList.remove('custom-selected');
            }
          }
        }
        return;
      } else if (type === 'object') return this._updateSelected(this.selected);
      else if (type === 'string') {
        for (const child of this._assignedNodes) {
          if (child.nodeType === 1) {
            if (child.getAttribute(this.attrForSelected) === this.selected) {
              return this._updateSelected(child);
            }
          }
        }
      } else {
        // set selected by index
        const child = this._assignedNodes[this.selected];
        if (child && child.nodeType === 1) this._updateSelected(child);
        // remove selected even when nothing found, better to return nothing
      }
    }
  }
};

/**
 * @extends HTMLElement
 */
class CustomPages extends SelectMixin(HTMLElement) {
  constructor() {
    super();
    this.slotchange = this.slotchange.bind(this);
    this.attachShadow({mode: 'open'});
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          flex: 1;
          position: relative;
          --primary-background-color: #ECEFF1;
          overflow: hidden;
        }
        ::slotted(*) {
          display: flex;
          position: absolute;
          opacity: 0;
          pointer-events: none;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          transition: transform ease-out 160ms, opacity ease-out 60ms;
          /*transform: scale(0.5);*/
          transform-origin: left;
        }
        ::slotted(.animate-up) {
          transform: translateY(-120%);
        }
        ::slotted(.animate-down) {
          transform: translateY(120%);
        }
        ::slotted(.custom-selected) {
          opacity: 1;
          pointer-events: auto;
          transform: translateY(0);
          transition: transform ease-in 160ms, opacity ease-in 320ms;
          max-height: 100%;
          max-width: 100%;
        }
      </style>
      <!-- TODO: scale animation, ace doesn't resize that well ... -->
      <div class="wrapper">
        <slot></slot>
      </div>
    `;
  }

  connectedCallback() {
    super.connectedCallback();
    this.shadowRoot.querySelector('slot').addEventListener('slotchange', this.slotchange);
  }

  isEvenNumber(number) {
    return Boolean(number % 2 === 0)
  }

  /**
   * set animation class when slot changes
   */
  slotchange() {
    let call = 0;
    for (const child of this.slotted.assignedNodes()) {
      if (child && child.nodeType === 1) {
        child.style.zIndex = 99 - call;
        if (this.isEvenNumber(call++)) {
          child.classList.add('animate-down');
        } else {
          child.classList.add('animate-up');
        }
        this.dispatchEvent(new CustomEvent('child-change', {detail: child}));
      }
    }
  }
}customElements.define('custom-pages', CustomPages);

const bang = string => `#!/${string}`;

const debang = string => string.split('#!/')[1];

customElements.define('made-with-love', class MadeWithLove extends s {
  constructor() {
    super();
  }

  static styles = i`
    :host {
      align-items: center;
      box-sizing: border-box;
      padding: 12px;
      display: flex;
      flex-direction: row;
      height: 40px;
      width: 100%;
      background-color: var(--paper-blue-grey-900, #263238);
      color: #FFF;
      text-overflow: ellipsis;
      white-space: nowrap;
      overflow: hidden;
    }
    custom-svg-icon {
      background: #fff;
      border-radius: 50%;
      box-sizing: content-box;
      padding: 4px;
      --svg-icon-size: 16px;
      --svg-icon-color: red;
    }

    strong.left {
      padding-right: 6px;
    }

    strong.right {
      padding: 0 6px;
    }

    a {
      text-decoration: none;
      color: #00bcd4;
    }
    p {
      margin: 0;
      overflow: hidden;
      width: 100%;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  `

  render(){
    return x`
    <p>
      <strong class="left">made with</strong>
      <custom-svg-icon icon="favorite"></custom-svg-icon>
      <strong class="right">by</strong>
      <a href="https://github.com/vandeurenglenn">Vandeuren Glenn</a>
    </p>
    
    `
  }
});

customElements.define('copyright-element', class CopyrightElement extends s {
  static properties = {
    author: { type: String },
    year: { type: String },
    codeLicense: { type: String },
    contentLicense: { type: String }
  }

  constructor() {
    super();
  }

  connectedCallback() {
    super.connectedCallback();

    this.year = this.year || 2023;
    this.codeLicense = this.codeLicense || 'CC-BY-NC-SA-4.0';
    this.contentLicense = this.contentLicense || 'CC-BY-4.0';
  }

  static styles = i`
    :host {
      display: flex;
      flex-direction: row;
      align-items: center;
      padding: 8px 16px;
      box-sizing: border-box;
      font-size: 12px;
      text-overflow: ellipsis;
      white-space: nowrap;
      overflow: hidden;
    }

    p {
      margin: 0;
      overflow: hidden;
      width: 100%;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    @media(min-width: 860) {
      p {
        width: 100%;
      }
    }
  `

  render(){
    return x`
      
    <p>
      &#169; ${this.year} ${this.author}. Code licensed under the ${this.codeLicense} License.
      Except as otherwise noted,
      Documentation & media are licensed under the ${this.contentLicense} License.
    </p>

    `
  }
});

customElements.define('app-shell', class AppShell extends s {
    constructor() {
        super();
        onhashchange = this.#onhashchange.bind(this);
        if (!location.hash)
            location.hash = bang('todo');
        else
            this.#onhashchange();
    }
    get #pages() {
        return this.renderRoot.querySelector('custom-pages');
    }
    async #select(selected) {
        if (!customElements.get(`${selected}-view`))
            await import(`./${selected}.js`);
        this.#pages.select(selected);
    }
    #onhashchange() {
        const selected = debang(location.hash);
        this.#select(selected);
    }
    static styles = i `
    :host {
      display: flex;
      flex-direction: column;
      height: 100%;
      width: 100%;
      color: #555;
    }

    custom-pages {
      height: 100%;
    }

    h1, h2 {
      text-transform: uppercase;
    }

    header {
      display: flex;
      flex-direction: column;
      align-items: center;
      box-sizing: border-box;
      padding: 12px 24px;
      border-bottom: 1px solid #eee;
    }

    header .container {
      max-width: 480px;
      width: 100%;
    }
  `;
    render() {
        return x `
    <header>
      <span class="container">
        <h1>
          Things
        </h1>
        <h2>todo</h2>
      </span>
    </header>
    
    <custom-pages>
      <todo-view></todo-view>
    </custom-pages>

    <made-with-love></made-with-love>
    <copyright-element author="Vandeuren Glenn"></copyright-element>
    `;
    }
});
