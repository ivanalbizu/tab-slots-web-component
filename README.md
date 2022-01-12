# Tab Web component con Slots

He creado un componente web para seguir aprendiendo. Mi anterior entrada iba sobre un componente web para añadir tooltips https://ivanalbizu.eu/blog/webcomponent-tooltip-notification. En este caso he querido añadir un poco de más de complejidad e interacción

## Arrancar proyecto con ParcelJS

Sobre la raiz del proyecto, con ParcelJS instalado (Yo tengo instalada la versión 1.12.5)

```sh
parcel index.html
```

## HTML del WebComponent

He usado tres componentes para construirlo:

<ul class="list-bullets">
  <li>&lt;iga-tab&gt;: es la capa contenedora de todo</li>
  <li>&lt;iga-tab-item&gt;: son cada uno de los ítems del Tab</li>
  <li>&lt;iga-tab-panel&gt;: son las capas que tendrán el contenido de cada Tab</li>
</ul>

```html
<iga-tab active="0" justify="space-evenly">
  <div slot="group-tabs" role="tablist">
    <iga-tab-item>
      <span slot="item">This That</span>
    </iga-tab-item>
    <iga-tab-item>
      <span slot="item">That Those</span>
    </iga-tab-item>
    <iga-tab-item>
      <span slot="item">Last Tab</span>
    </iga-tab-item>
  </div>
  <main slot="group-panels" class="tabs__panels">
    <iga-tab-panel>
      <div slot="panel">
        <h1>This is panel 1</h1>
        <p>
          1 Lorem, ipsum dolor sit amet consectetur adipisicing elit. Quia
          deleniti quisquam similique a rerum.
        </p>
        <p>
          2 Lorem ipsum dolot maxime commodi, harum distinctio nulla quibusdam
          dolorum consequatur minus. Quibusdam, sit?
        </p>
      </div>
    </iga-tab-panel>
    <iga-tab-panel>
      <div slot="panel">
        <p>
          3 Lorem, ipsum dolor sit actetur adipisicing elit. Quia deleniti
          quisquam similique a rerum.
        </p>
        <p>
          4 Lorem ipsum dolor sit amet consectetur adipisicing elit. Sint maxime
          commodi, harum distinctio nulla quibusdam dolorum consequatur minus.
          Quibusdam, sit?
        </p>
      </div>
    </iga-tab-panel>
    <iga-tab-panel>
      <div slot="panel"></div>
    </iga-tab-panel>
  </main>
</iga-tab>
```

### Atributos HTML para personalización del Tab

La etiqueta principal admite dos atributos. Uno para la inicialización del Tab Activo <code>active="0"</code>, admite valores positivos desde el 0 hasta como máximo el número de Tabs que tengamos. El otro atributo <code>justify="space-evenly"</code> para especificar como queremos la distribución de los ítems del Tab. Admite todos los posibles valores CSS de <code>justify-content</code>, siendo por defecto: <code>justify-content: space-between;</code>

### Ítems del Tab

Se especifica mediante:

```html
<iga-tab-item>
  <span slot="item">This That</span>
</iga-tab-item>
```

Si no se añade el <code>&lt;span slot="item"&gt;</code> el texto que se muestra será "Default Tab"

### Contenidos de los Panels

Se especifica mediante:

```html
<iga-tab-panel>
  <div slot="panel">
    <p>Contenido párrafo</p>
  </div>
</iga-tab-panel>
```

Si no se añade el <code>&lt;div slot="panel"&gt;</code> se mostrará una especie de placeholder. Cualquier contenido debe ir dentro de esta etiqueta y acepta cualquier etiqueta HTML

## Código javascript del Tab WebComponent

De aquí en adelante iré haciendo referencia a el javascript del WebComponente, siguiente el orden de más sencillo a más "complejo":

<ol class="list-bullets">
  <li><code>IgaTabPanel</code>: componente Web encargado del pintado del contenido de cada Panel</li>
  <li><code>IgaTabItem</code>: componente Web encargado de pintar cada Tab seleccionable</li>
  <li><code>IgaTab</code>: componente Web padre que se encarga del pintado del Tab y toda su lógica</li>
</ol>

### Component Web para los Panels

Por probar cosas diferentes y así trastear, he decidido crear el <code>shadowDOM</code> en modo cerrado. Haciéndolo así, es necesario crear una referencia para poder acceder al mismo <code>this.shadow = this.attachShadow({ mode: "closed" });</code> cuando sea necesario

Sobre estilos no hablaré mucho. En este, y en los otros dos componentes, he usado un <code>getter</code> que devuelve una etiqueta &lt;style&gt; con todos los estilos del componente. La regla <code>:host {}</code> hace referencia a sí mismo y siguiendo la cascada normal de CSS

El contenido se añade mediante el método <code>render()</code>, que no es más que llamar a <code>this.shadow.innerHTML = ``</code> para meter dentro etiquetas HTML

```javascript
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
```

### Component Web para cada ítem selector de Tab

Este tiene algo más de contenido que el anterior, no en vano, tiene que hacer los paneles visibles

No comentaré sobre el CSS y el HTML

```javascript
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
```

En el constructor de la clase creamos el <code>shadowDOM</code> abierto y añadimos el HTML y CSS con el método <code>render()</code> y el getter <code>style</code>

Desde este componente necesitamos mandar al componente padre cual es el Tab que el usuario ha seleccionado. La forma que he optado para esto ha sido crear un nuevo evento <code>"tab-clicked"</code>

Las opciones que usamos son:

<ol class="list-bullets">
  <li><code>bubbles: true</code>: para que se propague hacía arriba y así poder usarlo en el componente padre</li>
  <li><code>detail: { tab: () => this.tab },</code>*: para enviarle al padre cual fue el elemento clickeado</li>
</ol>

La referencia al atributo <code>tab</code> todavía no exista, sea crear y asigna valor en el componente padre, que es cuando se conocerá cuantos Tabs tendrá. También se podría crear manualmente en la vista HTML, pero quise dejar más limpio el HTML, y además, trastear lo más posible

```javascript
_clickedEvent() {
  this.dispatchEvent(
    new CustomEvent("tab-clicked", {
      bubbles: true,
      detail: { tab: () => this.tab },
    })
  );
}
```

Este evento se envía cuando se hace click sobre algún Tab, este evento se registra dentro de la implementación de <code>connectedCallback()</code>

```javascript
connectedCallback() {
  this.addEventListener("click", this._clickedEvent.bind(this));
}
```

Y lo destruímos el evento cuando el componente se elimina

```javascript
disconnectedCallback() {
  this.removeEventListener("click", this._clickedEvent.bind(this));
}
```

Como he comentado antes, usamos atributos para poder diferenciar los diferente Tabs. Como estos atributos cambiarán necesitamos especificarlo en este componente

```javascript
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
```

## Component Web padre del Tab

Por seguir con la idea del componente anterior. En este componente necesitamos conocer que elemento Tab ha clickeado el usuario

### Conocer Tab clikeado en componente padre

Añadimos (y eliminamos) listener para el evento <code>"tab-clicked"</code> que nos mandará el número ordinal del componente hijo y que guaramos en una propiedad

Está troceado en varios métodos para poder usar según interese

```javascript
connectedCallback() {
  this.handlerEvents();
}
handlerEvents() {
  this.addEventListener("tab-clicked", this._clickedEvent.bind(this));
  //
}
removeEvents() {
  this.removeEventListener("tab-clicked", this._clickedEvent.bind(this));
  //
}
_clickedEvent(event) {
  this.active = event.detail.tab();
  //
}
```

### Establecer un Tab activo

Este componente permite la definción del Tab activo mediante la asignación directa como atributo, que por defecto estableco a 0 <code>active = 0;</code>

### Contenidos de los Tabs

Para que el componente web tenga sentido, lo normal es que al insertar el componente el usuario pueda definirlo a su gusto, con la cantidad de Tabs que necesite así textos del menú y los panels. Para esto usamos los <code>slots</code>

Para esto he creado un método que recorra los <code>slots</code> e inicialice los atributos en el HTML, que es llamado dentro del constructor

```javascript
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
```

Tenemos un listener del evento <code>"slotchange"</code> que detectará que el usuario puso contenido dentro de slots. Los dos slots que nos interesa escuchar son el grupo de <code>"group-tabs"</code> y <code>"group-panels"</code>. Guardaremos en dos arrays los Tabs y los Paneles

En este punto asignamos también los atributos <code>tab</code> con valores ordinales para poder indetificarlos

Una vez construido el array de panels, llamamos al método <code>setActiveTab()</code> que irá llamando a otros métodos para pocer activar los Tabs junto a sus animaciones, estos son:

```javascript
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
```

Dijimos que la elección del Tab activo podría ser definido al usar el componente. Para esto, tenemos que implementar el método <code>attributeChangedCallback(...)</code>, escuchando la propiedad "active"

```javascript
attributeChangedCallback(name, oldValue, newValue) {
  switch (name) {
    case "active":
      this.active = newValue || 0;
      break;
  }
}
```

Para poder escucharlo usamos el método estático <code>observedAttributes()</code>, en el devolvemos un array que contenga la propiedad que queramos escuchar

```javascript
static get observedAttributes() {
  return ["active"];
}
```

## Codepen del Tab Webcomponent

En este PEN puede verse el <a href="https://codepen.io/ivan_albizu/pen/abLQJxv" target="_blank" rel="noopener">WebComponente funcionando</a>
