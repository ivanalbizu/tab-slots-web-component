class TooltipNotify extends HTMLElement {
  fill = "#141414";
  count = "0";
  bulletColor = "green";

  static get observedAttributes() {
    return ["fill", "count", "bullet-color"];
  }

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.render();
  }

  connectedCallback() {
    this.attachEvents();
  }

  disconnectedCallback() {
    this.detachEvents();
  }

  attributeChangedCallback(attr, oldValue, newValue) {
    if (oldValue === newValue) return;

    switch (attr) {
      case "fill":
        this.fill = newValue;
        break;
      case "count":
        this.count = newValue;
        break;
      case "bullet-color":
        this.bulletColor = newValue;
        break;
    }
    this.render();
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        *:where(:not(iframe, canvas, img, svg, video):not(svg *)) {
          all: initial;
          display: revert;
          box-sizing: border-box;
        }

        ol {
          counter-reset: list;
          list-style: none;
          margin-block-start: 0;
          margin-block-end: 0;
          margin-inline-start: 0;
          margin-inline-end: 0;
          padding-inline-start: 0;
          display: inline-grid;
          gap: clamp(12px, 2vw, 18px);
          box-shadow: 1px 1px 4px rgb(0 0 0 / 20%);
          padding: clamp(16px, 3vw, 26px);
          border-radius: 3px;
          background-color: #fff;
          min-width: min(400px, 80vw);
          position: absolute;
          z-index: 9;
          visibility: hidden;
        }
        @media(max-width: 639.98px) {
          ol {
            transform: translateY(43px);
            width: calc(100vw);
            left: 0;
            right: 0;
          }
        }
        @media(min-width: 640px) {
          ol {
            transform: translate(calc(-18px - 50%), 40px);
          }
        }
        ::slotted(li) {
          counter-increment: list;
          display: grid;
          grid-template-columns: 2.6em 1fr;
          align-items: center;
          font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
          font-size: 1rem;
          font-weight: 400;
        }
        ::slotted(li)::before {
          content: counter(list);
          background-color: ${this.bulletColor};
          font-family: sans-serif;
          color: #fff;
          font-size: 13px;
          text-align: center;
          border-radius: 50%;
          width: 2em;
          height: 2em;
          line-height: 2.1em;
          display: inline-block;
        }
        strong {
          font-weight: 600;
        }
        
        button {
          display: inline-flex;
          cursor: pointer;
        }
        ::slotted(li) {
          transform: translateX(-10px);
          opacity: 0;
          pointer-events: none;
        }
        .open {
          visibility: visible;
        }
        .open ::slotted(li) {
          transform: translateX(0);
          opacity: 1;
          transition: transform 0.4s ease-out, opacity 0.3s linear;
        }
        ${this.transitions()}
      </style>
    
      <button type="button">
        <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" viewBox="0 0 36 36" width="36" height="36">
          <path fill="${
            this.fill
          }" d="M18 2.1a16 16 0 1 0 16 16 16 16 0 0 0-16-16zm-.1 5.28a2 2 0 1 1-2 2 2 2 0 0 1 2-2zm3.6 21.25h-7a1.4 1.4 0 1 1 0-2.8h2.1v-9.2H15a1.4 1.4 0 1 1 0-2.8h4.4v12h2.1a1.4 1.4 0 1 1 0 2.8z" />
        </svg>
      </button>
      <ol count="{$this.count}">
        <slot></slot>
      </ol>
    `;
    this.transitions();
  }

  transitions() {
    let style = "";
    for (let index = 1; index <= this.count; index++) {
      style += `
        ::slotted(li:nth-child(${index})) {
          transition-delay: ${index * 0.1}s;
        }
      `;
    }
    return style;
  }

  handlerEvent() {
    this.shadowRoot.querySelector("ol").classList.toggle("open");
  }
  attachEvents() {
    this.shadowRoot
      .querySelector("button")
      .addEventListener("click", this.handlerEvent.bind(this));
  }
  detachEvents() {
    this.shadowRoot
      .querySelector("button")
      .removeEventListener("click", this.handlerEvent.bind(this));
  }
}

customElements.define("tooltip-notify", TooltipNotify);
