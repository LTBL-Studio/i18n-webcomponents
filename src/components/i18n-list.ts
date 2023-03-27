import { getCurrentLocale } from "../utils";

export class I18nListElement extends HTMLElement {
    #mutrationObserver = new MutationObserver(this.updateContent.bind(this));

    #type: "conjunction" | "disjunction" | "unit" | undefined = undefined;

    #style: "long" | "short" | "narrow" | undefined = undefined;

    get listType() {
        return this.#type;
    }

    set listType(val) {
        this.#type = val;
        this.updateContent();
    }

    get listStyle() {
        return this.#style;
    }

    set listStyle(val) {
        this.#style = val;
        this.updateContent();
    }

    constructor() {
        super();
        this.updateContent = this.updateContent.bind(this);

        this.attachShadow({ mode: "open" });
    }

    connectedCallback() {
        this.#mutrationObserver.observe(this, {
            childList: true,
            subtree: false,
        });

        document.addEventListener("localechange", this.updateContent);

        this.updateContent();
    }

    disconnectedCallback() {
        this.#mutrationObserver.disconnect();
        document.removeEventListener("localechange", this.updateContent);
    }

    updateContent() {
        if (!this.shadowRoot) return;

        //@ts-ignore
        let intl = new Intl.ListFormat(getCurrentLocale().toString(), {
            style: this.listStyle,
            type: this.listType,
        });

        let children = Array.from(this.children);

        let textChildren = children.map((el) => el.textContent);
        let parts = intl.formatToParts(textChildren);
        let html = parts.reduce(
            (
                acc: { elementIndex: number, html: string },
                el: { type: string, value: string }
            ) => {
                if (el.type == "element") {
                    return {
                        elementIndex: acc.elementIndex + 1,
                        html: acc.html + `<slot name="element-${acc.elementIndex}"></slot>`,
                    };
                } else {
                    return { ...acc, html: acc.html + el.value };
                }
            },
            { elementIndex: 0, html: "" }
        ).html;

        children.forEach((el, i) => (el.slot = `element-${i}`));

        this.shadowRoot.innerHTML = html;
    }

    static get observedAttributes() {
        return ["list-type", "list-style"];
    }

    attributeChangedCallback(name: string, oldVal, newVal) {
        switch (name) {
            case "list-type":
                this.listType = newVal.trim();
                break;
            case "list-style":
                this.listStyle = newVal.trim();
                break;
        }
    }
}

customElements.define("i18n-list", I18nListElement);