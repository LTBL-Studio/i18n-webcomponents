# i18n Webcomponents

A set of Webcomponents to handle translation and internationalization of web pages using only custom elements.

**Note** These webcomponents are currently work in progress and we still working on limitations

Included components :

* `i18n-list` create a list of elements linked by localized words
* `i18n-date` extends the `<time>` element with localized date formatting
* `i18n-string` uses an external JSON containing translations to display localized string

## Current limitations

Current state of components have some limitations

* in `i18n-string` page style isn't applyed to translation elements
* only a single `<link rel="translations">` per page is supported

## Examples

See [`stories`](./stories/) folder for examples