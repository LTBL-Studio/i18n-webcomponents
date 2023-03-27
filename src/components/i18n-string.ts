import { getCurrentLocale, lp } from "../utils";

// TODO Support external styling of i18n strings
// TODO Extract translations-related function to another module

let loadingPromise:Promise<void>|null = null;

/**
 * Locale file loaded from the server
 */
let locale:object|null = null;

/**
 * Load locale file
 */
export function loadLocale(url:string|null = null):Promise<void> {
  if (loadingPromise) return loadingPromise;

  let localeFileLocation:URL|null = null;

  if (url) {
    localeFileLocation = new URL(url, document.baseURI);
  } else {
    let linkEl = document.querySelector('link[rel="translations"]') as HTMLLinkElement|null;
    if (!linkEl)
      throw new Error(
        'No locale file url in link[rel="translations"]'
      );
    localeFileLocation = new URL(linkEl.href, linkEl.baseURI);
  }

  loadingPromise = (async () => {
    let localeFileReq = await fetch(localeFileLocation.toString());
    if (!localeFileReq.ok)
      throw new Error(
        `Error loading translations ${localeFileReq.status} ${localeFileReq.statusText}`
      );

    locale = await localeFileReq.json();
  })();

  loadingPromise.catch((e) => console.error("Failed to load translations", e));

  return loadingPromise;
}

export class I18nStringElement extends HTMLElement {
  #value:number|null = null;

  #key:string|null = null;

  #lastKey:string|null = null;

  #lastPluralRule:string|null = null;

  #lastLocaleCode:string | null = null;

  constructor() {
    super();

    this.checkUpdateContent = this.checkUpdateContent.bind(this);

    this.attachShadow({ mode: "open" });
  }

  async connectedCallback() {
    document.addEventListener("localechange", this.checkUpdateContent);
    await loadLocale();
    this.updateContent();
  }

  disconnectedCallback() {
    document.removeEventListener("localechange", this.checkUpdateContent);
  }

  computePluralRule() {
    if (this.value === undefined || this.value === null) {
      return null;
    }
    let intlPl = new Intl.PluralRules(getCurrentLocale().toString());
    return intlPl.select(this.value);
  }

  checkUpdateContent() {
    let pluralRule = this.computePluralRule();
    let key = this.key;
    let locale = getCurrentLocale();
    let localeCode = locale.baseName;

    if (
      this.#lastLocaleCode != localeCode ||
      this.#lastKey != key ||
      this.#lastPluralRule != pluralRule
    ) {
      this.updateContent(locale, pluralRule);
      this.#lastKey = key;
      this.#lastPluralRule = pluralRule;
      this.#lastLocaleCode = localeCode;
    }
  }

  updateContent(
    localeCode = getCurrentLocale(),
    pluralRule = this.computePluralRule()
  ) {
    if (!locale) {
      loadLocale();
      return;
    }

    if (!this.key || !this.shadowRoot) {
      return;
    }

    let i18nVal:object|string = lp(locale, this.key, localeCode);

    let str:string|undefined = undefined;

    if (typeof i18nVal == "string") {
      str = i18nVal;
    } else if (typeof i18nVal == "object") {
      if (pluralRule && typeof this.value == "number") {
        str = i18nVal[pluralRule] || i18nVal["other"];
      } else {
        str = i18nVal["other"];
      }
    }

    let html = "";

    if (str) {
      let nextIndex = 0;
      for (let token of str.matchAll(/\{([^}]*)\}/g)) {
        html += str.substring(nextIndex, token.index);

        let slotname:string|null = null;
        if (token[1]) {
          slotname = token[1];
        }
        html += `<slot ${slotname ? `name="${slotname}"` : ""}></slot>`;
        // @ts-ignore
        nextIndex = token.index + token[0].length;
      }
      html += str.substring(nextIndex);
    } else {
      html = this.createMissingStringHtml();
    }

    this.shadowRoot.innerHTML = html;
  }

  createMissingStringHtml() {
    let slots = Array.from(this.querySelectorAll(":scope > *")).reduce(
      (acc, el) => {
        let slotname = el.slot;
        let keyHtml = slotname
          ? `<code>${slotname}</code>`
          : "<em>default</em>";
        return {
          ...acc,
          [keyHtml]: `<slot ${slotname ? `name="${slotname}"` : ""}></slot>`,
        };
      },
      {}
    );

    let str = `missing("${this.key}"`;
    if (this.value !== null) {
      str += `,${this.value}`;
    }
    str += ") ";
    str += Object.entries(slots)
      .map(([key, value]) => `{${key}: "${value}"}`)
      .join(" ");

    return str;
  }

  get key() {
    return this.#key;
  }

  set key(val) {
    this.#key = val;
    this.checkUpdateContent();
  }

  get value() {
    return this.#value;
  }

  set value(val) {
    this.#value = val;
    this.checkUpdateContent();
  }

  static get observedAttributes() {
    return ["value", "key"];
  }

  /**
   * Called when an attribute change
   */
  attributeChangedCallback(name:string, oldVal:string|null, newVal:string|null) {
    switch (name) {
      case "value":
        this.value = newVal ? parseFloat(newVal) : null;
        break;
      case "key":
        this.key = newVal;
        break;
    }
  }
}

customElements.define("i18n-string", I18nStringElement);
