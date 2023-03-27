import { getCurrentLocale } from "../utils";

export class I18nDateElement extends HTMLTimeElement {

    #dateStyle: "full" | "long" | "medium" | "short" | undefined = undefined;

    #timeStyle: "full" | "long" | "medium" | "short" | undefined = undefined;

    get timeStyle() {
        return this.#timeStyle;
    }

    set timeStyle(val) {
        this.#timeStyle = val || undefined;
        this.updateContent();
    }

    get dateStyle() {
        return this.#dateStyle;
    }

    set dateStyle(val) {
        this.#dateStyle = val || undefined;
        this.updateContent();
    }

    constructor() {
        super();
        this.updateContent = this.updateContent.bind(this);
    }

    connectedCallback() {
        document.addEventListener("localechange", this.updateContent);

        this.updateContent();
    }

    disconnectedCallback() {
        document.removeEventListener("localechange", this.updateContent);
    }

    updateContent() {
        let formatter = new Intl.DateTimeFormat(getCurrentLocale().toString(), {
            dateStyle: this.dateStyle,
            timeStyle: this.timeStyle,
        });
        let date = new Date(this.dateTime);

        if (Number.isNaN(date.getTime())) {
            this.textContent = "";
            return;
        }

        this.textContent = formatter.format(date);
    }

    static get observedAttributes() {
        return ["datetime", "date-style", "time-style"];
    }

    attributeChangedCallback(name, oldVal, newVal) {
        switch (name) {
            case "datetime":
                this.updateContent();
                break;
            case "date-style":
                this.dateStyle = newVal;
                break;
            case "time-style":
                this.timeStyle = newVal;
                break;
        }
    }
}

customElements.define("i18n-date", I18nDateElement, { extends: "time" });