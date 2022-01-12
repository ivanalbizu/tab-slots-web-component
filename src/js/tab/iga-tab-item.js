class IgaTabItem extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.render();
  }

  static get observedAttributes() {
    return ["tab"];
  }
  attributeChangedCallback(name, oldValue, newValue) {
    switch (name) {
      case "tab":
        this.tab = newValue || 0;
        break;
    }
  }
  connectedCallback() {
    this.addEventListener("click", this._clickedEvent.bind(this));
  }
  disconnectedCallback() {
    this.removeEventListener("click", this._clickedEvent.bind(this));
  }

  get style() {
    return `
      <style>
      :host button {
        all: unset;
        display: revert;
        box-sizing: border-box;
        width: 100%;
        cursor: pointer;
        padding: 10px 15px;
        color: var(--color-tab-active-foreground, #414141);
        border-radius: 3px;
        outline: 1px solid transparent;
        outline-offset: -3px;
        transition: color var(--trans-dur, .2s) linear var(--trans-del, .2s), outline var(--trans-dur, .2s) linear var(--trans-del, .2s);
      }
      :host button:hover,
      :host button:focus-within {
        outline: 2px solid var(--color-tab-active-background, #5A3A31);
      }
      :host([aria-selected="true"]) {
        pointer-events: none;
      }
      :host([aria-selected="true"]) button {
        cursor: default;
      }
      </style>
    `;
  }
  render() {
    this.shadowRoot.innerHTML = `
      ${this.style}
      <button type="button"><slot name="item">Default Tab</slot></button>
    `;
  }

  _clickedEvent() {
    this.dispatchEvent(
      new CustomEvent("tab-clicked", {
        bubbles: true,
        detail: { tab: () => this.tab },
      })
    );
  }
}

customElements.define("iga-tab-item", IgaTabItem);
