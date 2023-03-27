import { getCurrentLocale } from "../utils";

export class I18nImageElement extends HTMLImageElement {

    #defaultSrc: string | null = null;
    #defaultAlt: string | null = null;

    get defaultSrc() {
        return this.#defaultSrc;
    }

    get defaultAlt() {
        return this.#defaultAlt;
    }

    constructor() {
        super();
        this.update = this.update.bind(this);
    }

    update() {
        let locale = getCurrentLocale();

        let attributeName = `src:${locale.language}`;

        if (this.hasAttribute(attributeName)) {
            this.src = this.getAttribute(attributeName) || "";
        } else if (this.defaultSrc) {
            this.src = this.defaultSrc;
        }

        let altAttributeName = `alt:${locale.language}`;

        if (this.hasAttribute(altAttributeName)) {
            this.alt = this.getAttribute(altAttributeName) || "";
        } else if (this.defaultAlt) {
            this.alt = this.defaultAlt;
        }
    }

    connectedCallback() {
        this.#defaultSrc = this.src || null;
        this.#defaultAlt = this.alt || null;

        document.addEventListener("localechange", this.update);
        this.update();
    }
}

customElements.define("i18n-img", I18nImageElement, { extends: "img" });