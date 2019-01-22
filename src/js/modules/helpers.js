/**
 * querySelector with optional context (defualt is document)
 */

const $1 = (selector, context = document) => context.querySelector(selector);

/**
 * querySelectorAll with optional context (defualt is document)
 */

const $ = (selector, context = document) => context.querySelectorAll(selector);

/**
 * Elenables share buttons by adding window location to href of each link.
 * @param {string} selector CSS selector string
 */
const enableShareButtons = selector => {
    let shareLinks = document.querySelectorAll('.'+selector);
    for (let i = 0; i < shareLinks.length; i++) {
        shareLinks[i].href =
            shareLinks[i].href + encodeURIComponent(window.location);
    }
}

export { $, $1, enableShareButtons}