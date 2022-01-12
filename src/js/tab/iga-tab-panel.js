class IgaTabPanel extends HTMLElement {
  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: "closed" });
  }

  connectedCallback() {
    this.render();
  }

  get style() {
    return `
      <style>
      :host {
        grid-column: 1/-1;
        grid-row: 1/-1;

        opacity: 0;
        visibility: hidden;
        transform: scale(0.6);
        transition: all var(--trans-dur) linear var(--trans-del);
      }
      :host([active-panel="true"]) {
        opacity: 1;
        visibility: visible;
        transform: scale(1);
        transition: all var(--trans-dur) linear var(--trans-del);
      }
      </style>
    `;
  }

  render() {
    this.shadow.innerHTML = `
      ${this.style}
      <article class="tabs__panel">
        <slot name="panel">Default Panel Content</slot>
      </article>
    `;
  }
}

customElements.define("iga-tab-panel", IgaTabPanel);
