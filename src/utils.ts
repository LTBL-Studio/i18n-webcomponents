/**
 * Get the current locale of the page
 */
export function getCurrentLocale(): Intl.Locale {
    let localeCode = ((document.querySelector("html") as HTMLElement).getAttribute("lang") ||
            document.body.getAttribute("lang")) ??
        "en";

    return new Intl.Locale(localeCode);
}

/**
 * Set a new locale for the page
 */
export function setCurrentLocale(locale: string|Intl.Locale) {
   
    if(typeof locale == "string"){
        locale = new Intl.Locale(locale)
    }

    (document.querySelector("html") as HTMLElement).lang = locale.toString();

    document.dispatchEvent(new Event("localechange"));
}

/**
 * Localized Property : get a property inside an object based on the `:[locale]` suffix of the property
 */
export function lp(sourceObj:Object, propertyName:string, locale = getCurrentLocale()):string {
    if (typeof locale == "string") {
        // @ts-ignore
        if (sourceObj[`${propertyName}:${locale}`]) {
            // @ts-ignore
            return sourceObj[`${propertyName}:${locale}`];
        }
    } else {
        // @ts-ignore
        if (sourceObj[`${propertyName}:${locale.language}`]) {
            // @ts-ignore
            return sourceObj[`${propertyName}:${locale.language}`];
        } else if (
            // @ts-ignore
            sourceObj[`${propertyName}:${locale.language}-${locale.region}`]
        ) {
            // @ts-ignore
            return sourceObj[`${propertyName}:${locale.language}-${locale.region}`];
        }
    }
    // @ts-ignore
    return sourceObj[`${propertyName}`];
}