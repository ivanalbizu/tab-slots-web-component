class IgaTab extends HTMLElement {
  active = 0;
  resizeTimer;

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.render();

    this.activeTabBG = this.shadowRoot.querySelector(".js-active-tab-bg");
    this.slotsDOM();
  }

  get justify() {
    return this.getAttribute("justify") || "space-between";
  }

  static get observedAttributes() {
    return ["active"];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    switch (name) {
      case "active":
        this.active = newValue || 0;
        break;
    }
  }

  connectedCallback() {
    this.handlerEvents();
  }
  disconnectedCallback() {
    this.removeEvents();
  }

  slotsDOM() {
    const slots = this.shadowRoot.querySelectorAll("slot");
    slots.forEach((slot) => {
      slot.addEventListener("slotchange", (event) => {
        const slot = event.target;
        if (slot.name == "group-tabs") {
          this.tabs = [...slot.assignedNodes()[0].children];
          this.tabs.forEach((tab, i) => tab.setAttribute("tab", i));
          if (this.active >= this.tabs.length)
            alert("Has indicado un Tab activo que no existe");
        }

        if (slot.name == "group-panels") {
          this.panels = [...slot.assignedNodes()[0].children];
          this.setActiveTab();
        }
      });
    });
  }
  setAttrs() {
    this.setTabAttrs();
    this.setPanelAttrs();
  }
  setPanelAttrs() {
    this.panels.forEach((panel) => panel.setAttribute("active-panel", false));
    this.panels[this.active].setAttribute("active-panel", true);
  }
  setTabAttrs() {
    this.tabs.forEach((tab) => tab.setAttribute("aria-selected", false));
    this.tabs[this.active].setAttribute("aria-selected", true);
  }
  setActiveTab() {
    this.setAttrs();
    this.setAnimations();
  }
  setAnimations() {
    const [decorWidth, decorHeight, decorOffsetX, decorOffsetY] =
      this.findActiveTabParams();

    this.styleActiveTabBG(decorWidth, decorHeight, decorOffsetX, decorOffsetY);
  }
  findActiveTabParams() {
    const activeTab = this.tabs[this.active];

    const activeItemWidth = activeTab.offsetWidth;
    const activeItemHeight = activeTab.offsetHeight;

    const activeItemOffsetLeft = activeTab.offsetLeft;
    const activeItemOffsetTop = activeTab.offsetTop;

    return [
      activeItemWidth,
      activeItemHeight,
      activeItemOffsetLeft,
      activeItemOffsetTop,
    ];
  }
  styleActiveTabBG(decorWidth, decorHeight, decorOffsetX, decorOffsetY) {
    this.activeTabBG.style.width = `${decorWidth}px`;
    this.activeTabBG.style.height = `${decorHeight}px`;
    this.activeTabBG.style.transform = `translate(${decorOffsetX}px, ${decorOffsetY}px)`;
  }

  get style() {
    return `
      <style>
      :host {
        --trans-dur: 0.2s;
        --trans-del: 0.15s;
      }
      :host(.resize-animation-stopper) {
        --trans-dur: 0.01s;
        --trans-del: 0.01s;
      }
      :host *:where(:not(iframe, canvas, img, svg, video):not(svg *)) {
        all: unset;
        display: revert;
        box-sizing: border-box;
      }
      :host .tabs {
        font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
        line-height: 1.5;
        letter-spacing: 0.01rem;
        font-weight: 300;
        font-size: 1.1rem;

        width: min(98%, 600px);
        min-height: 300px;
        margin: auto;
        background-color: #fff;
        border-radius: 3px;
        padding: clamp(1rem, 2.5vw, 3rem);
        border: 1px solid #d8d8d8;
        filter: drop-shadow(0px 0px 5px rgba(0, 0, 0, 0.2));
      }
      :host .tabs__nav {
        position: relative;
      }

      ::slotted([slot="group-tabs"]) {
        display: grid;
        grid-auto-flow: column;
        place-items: center;
        justify-content: ${this.justify};
        gap: 10px;
        margin-block-end: 2rem;
        position: relative;
        z-index: 2;
      }

      :host p {
        margin-block-end: 1rem;
      }
      :host .js-active-tab-bg {
        position: absolute;
        top: 0;
        left: 0;
        height: 100%;
        transition: width var(--trans-dur) linear var(--trans-del), height var(--trans-dur) linear var(--trans-del),
          transform var(--trans-dur) ease-out var(--trans-del);
        background-color: var(--color-tab-active-background, #5A3A31);
        border-radius: 3px;
        z-index: 1;
      }
      ::slotted(.tabs__panels) {
        display: grid;
        grid-template-columns: 1fr;
        grid-template-rows: 1fr;
      }
      </style>
    `;
  }

  render() {
    this.shadowRoot.innerHTML = `
      ${this.style}
      <section class="tabs">
        <nav class="tabs__nav">
          <slot name="group-tabs"><mark style="all:initial;background-color: yellow;">slot="group-tabs"</mark> needed in your HTML</slot>
          <div class="js-active-tab-bg"></div>
        </nav>
        <slot name="group-panels"><mark style="all:initial;background-color: yellow;">slot="group-panels"</mark> needed in your HTML</slot>
      </section>
    `;
  }

  handlerEvents() {
    this.addEventListener("tab-clicked", this._clickedEvent.bind(this));
    window.addEventListener("resize", this._resizeEvent.bind(this));
    window.addEventListener("load", this._loadEvent.bind(this));
  }
  removeEvents() {
    this.removeEventListener("tab-clicked", this._clickedEvent.bind(this));
    window.removeEventListener("resize", this._resizeEvent.bind(this));
    window.removeEventListener("load", this._loadEvent.bind(this));
  }

  _clickedEvent(event) {
    this.active = event.detail.tab();
    this.setActiveTab();
  }
  _resizeEvent() {
    this.setAnimations();
    this.resizeAnimationStopper();
  }
  _loadEvent() {
    this.resizeAnimationStopper();
  }

  resizeAnimationStopper() {
    this.classList.add("resize-animation-stopper");
    clearTimeout(this.resizeTimer);
    this.resizeTimer = setTimeout(() => {
      this.classList.remove("resize-animation-stopper");
    }, 500);
  }
}

customElements.define("iga-tab", IgaTab);
