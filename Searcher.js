// ==UserScript==
// @name         Searcher
// @namespace    http://tampermonkey.net/
// @version      1.0.2
// @description  Facilitates Searches of the HTML Document
// @author       Ashcall3000
// @match        https://butteco-test-av.accela.com/*
// @grant        none
// ==/UserScript==

/**
 * Does an include check on given text using a given pattern.
 * Uses Regex so you can search 'H*llo' in 'Hello World' and it will
 * return true.
 * @param {string} text - String to be searched.
 * @param {string} pattern - Pattern / string to search for.
 * @return {bool} - Wether given text includes given pattern.
 */
const wildcardIncludes = (text, pattern) => {
    let escapedPattern = pattern.replace(/([.+?^=!:${}()|[\]/\\])/g, "\\$1");
    let regexPattern = escapedPattern.replace(/\*/g, ".*").replace(/\?/g, ".");
    let regex = new RegExp(regexPattern);
    return regex.test(text);
};

/**
 * Checks to see if the current url contains the given url text.
 * Can use wildcards.
 * @param {string} url - url text to search with.
 * @return {bool} - true if url text is contained in the current documents url.
 */
const checkURL = (url) => {
    return wildcardIncludes(document.location.href, url);
};

/**
 * Searhes the HTML Document to check if an element exists.
 * @param {string} css - css selector.
 * @param {object} [options] - Optional settings to filter the results.
 * @param {string | HTMLElement} [options.element] - The parent element to search within.
 * @param {string} [options.text] - Wildcard-enabled text to find within the elements.
 * @param {string} [options.attr] - The name of an attribute to check.
 * @param {string} [options.value] - Wildcard-enabled value for the attribute.
 * @param {boolean} [options.all] - Whether to return all matches or just the first.
 * @param {bool} - true if found.
 */
const exists = (css, options = {}) => {
    if (typeof css == 'string') {
        return search(css, options) ? true : false;
    } else if (css) {
        return true;
    }
    return false;
};

/**
 * Searches the HTML DOM for the css selector and you can use options to help narrow
 * down the options and returns that element.
 * @param {string} css - css selector.
 * @param {object} [options] - Optional settings to filter the results.
 * @param {string} [options.id] - Wildcard-enabled text to find id that matches element id.
 * @param {string} [options.eclass] - Wildcard-enabled text to find class that matches element class.
 * @param {string | HTMLElement} [options.element] - The parent element to search within.
 * @param {string} [options.text] - Wildcard-enabled text to find within the elements.
 * @param {string} [options.attr] - The name of an attribute to check.
 * @param {string} [options.value] - Wildcard-enabled value for the attribute.
 * @param {boolean} [options.all] - Whether to return all matches or just the first.
 * @returns {HTMLElement | HTMLElement[] | null} - A single element, an array of elements, or null.
 */
const search = (css, options = {}) => {
    const { id, eclass, text, attr, value, element, all } = options;
    
    let el = document;
    if (element) {
        if (typeof element == 'string') {
            el = document.querySelector(element);
            if (!el) {
                return null;
            }
        } else {
            if (!el) {
                return null;
            }
            el = element;
        }
    }
    
    let els = Array.from(el.querySelectorAll(css));
    // If text was provided.
    if (text) {
        els = els.filter(elem => wildcardIncludes(elem.innerText, text));
    }
    if (id) {
        els = els.filter(elem => wildcardIncludes(elem.id, id));
    }
    if (eclass) {
        els = els.filter(elem => wildcardIncludes(elem.className, '*' + eclass));
    }
    // If attribute and value was provided.
    if (attr && value) {
        els = els.filter(elem => {
            let attrValue = elem.getAttribute(attr);
            return attrValue !== null && wildcardIncludes(attrValue, value);
        });
    }
    // return results of filters.
    if (all) {
        return els.length > 0 ? els : null;
    }
    return els.length > 0 ? els[0] : null;
};

/**
 * Searches the HTML DOM for the css selector and you can use options to help narrow
 * down the options and returns that element. Then we remove that element from the HTML DOM.
 * @param {string} css - css selector.
 * @param {object} [options] - Optional settings to filter the results.
 * @param {string} [options.id] - Wildcard-enabled text to find id that matches element id.
 * @param {string} [options.eclass] - Wildcard-enabled text to find class that matches element class.
 * @param {string | HTMLElement} [options.element] - The parent element to search within.
 * @param {string} [options.text] - Wildcard-enabled text to find within the elements.
 * @param {string} [options.attr] - The name of an attribute to check.
 * @param {string} [options.value] - Wildcard-enabled value for the attribute.
 * @param {boolean} [options.all] - Whether to return all matches or just the first.
 * @returns {HTMLElement | HTMLElement[] | null} - A single element, an array of elements, or null.
 */
const remove = (css, options = {}) => {
    const { id, eclass, text, attr, value, element, all } = options;
    
    var els;
    if (typeof css == 'string') {
        els = search(css, options);
    } else {
        els = css;
    }
    if (Array.isArray(els)) {
        els.forEach(elem => elem.remove());
    } else if (els) {
        els.remove();
    }
};

/**
 * Will fire a given a event on element.
 * @param {HTMLElement} node - HTMLElement to fire event on.
 * @param {string} eType - The name of the event, e.g., 'click', 'change'.
 * @param {object} [options] - Optional settings for the event to be fired. 
 * @param {bool} [options.bubbles=true] - If the event bubbles through other events.
 * @param {bool} [options.cancelable=true] - If the event can be canceled. 
 */ 
const eventFire = (node, eType, options = {}) => {
    const { bubbles = true, cancelable = true } = options;
    
    if (node && !Array.isArray(node)) {
        let event = new Event(eType, options);
        node.dispatchEvent(event);
    }
};

/**
 * function that will  update a field by either giving it text of by checking the box.
 * The etype is a string param that should either be 'input' for a text field or 'click'
 * for a check box.
 * @param {HTMLElement} node - HTMLElement to fire event on.
 * @param {string} eType - event type to trigger.
 * @param {string | bool} eText - either text for the input field or bool for a check box or click.
 * @param {object} [options] - Optional settings for the event to be fired. 
 * @param {bool} [options.bubbles=true] - If the event bubbles through other events.
 * @param {bool} [options.cancelable=true] - If the event can be canceled. 
 */
const setField = (node, eType, eText, options = {}) => {
    const { bubbles = true, cancelable = true } = options;
    
    if (node && !Array.isArray(node)) {
        if (eType == 'input') {
            node.value = eText;
        } else if (eType == 'click') {
            node.checked = eText;
        }
        eventFire(node, eType, options);
    }
};

/**
 * function that will add html code to the DOM to the given element or css selector.
 * If css given is a string will search for the element and you can give options
 * to find the element you want to add HTML text to.
 * @param {HTMLElement} node - HTMLElement that html will be added to. 
 * @param {string} html_text - string of the HTML code you want to add to the DOM.
 */
const addHTML = (node, html_text) => {
    
    if (node && !Array.isArray(node)) {
        node.insertAdjacentHTML('beforeend', html_text);
    }
};

/**
 * function that will create and add a tag element into the HTML DOM. The node
 * must be an element object that the tag will be added to.
 * Location is the add type.
 * Location is 'append' will append element, 'prepend' will prepend the element.
 * 'before' is insertBefore, and 'after' is insertAfter.
 * @param {HTMLElement} node - Node the tag will be added to.
 * @param {string} tag - Tag to be created.
 * @param {object} [options] - Optional Settings.
 * @param {string} [options.id] - ID of new element.
 * @param {string} [options.eclass] - Class of new element.
 * @param {string} [options.text] - inner text of the new element.
 * @param {string} [options.style] - style of the new element.
 * @param {string} [options.location] - type of add location. 
 * @param {HTMLElement} [options.insertNode] - node for insert type.
 * @param {string} [options.attr] - attribute type to add to element.
 * @param {string} [options.value] - value of attribute.
 * @return {HTMLElement} - returns the new element created. 
 */
const addTag = (node, tag, options = {}) => {
    const { id, eclass, text, style, location, insertNode, attr, value } = options;
    
    if (node && !Array.isArray(node)) {
        let element = document.createElement(tag);
        if (id)
            element.setAttribute('id', id);
        if (eclass)
            element.setAttribute('class', eclass);
        if (text)
            element.innerText = text;
        if (style)
            element.setAttribute('style', style);
        if (attr && value) 
            element.setAttribute(attr, value);
        
        if (!location || location == 'append') {
            node.append(element);
        } else if (location == 'prepend') {
            node.prepend(element);
        } else if (insertNode && location == 'before') {
            node.insertBefore(element, node.childNodes[insertNode]);
        } else if (insertNode && location == 'after') {
            node.insertBefore(element, node.childNodes[insertNode].nextSibling);
        }
        return element;
    }
    return null;
};

/**
 * function that will create and add a select dropdown to the HTML DOM with
 * the given titles and values.
 * Location is the add type.
 * Location is 'append' will append element, 'prepend' will prepend the element.
 * 'before' is insertBefore, and 'after' is insertAfter.
 * @param {HTMLElement} node - Node the tag will be added to.
 * @param {string[]} titles - Titles of the options for the select.
 * @param {string[]} sValues - the values of the options for the select.
 * @param {object} [options] - Optional Settings.
 * @param {string} [options.id] - ID of new element.
 * @param {string} [options.eclass] - Class of new element.
 * @param {string} [options.text] - inner text of the new element.
 * @param {string} [options.style] - style of the new element.
 * @param {string} [options.location] - type of add location. 
 * @param {HTMLElement} [options.insertNode] - node for insert type.
 * @param {string} [options.attr] - attribute type to add to element.
 * @param {string} [options.value] - value of attribute.
 * @return {HTMLElement} - returns the new element created. 
 */
const addDropdown = (node, titles, sValues, options={}) => {
    const { id, eclass, text, style, location, insertNode, attr, value } = options;
    
    if (node && !Array.isArray(node) && 
        Array.isArray(titles) && Array.isArray(sValues) &&
        titles.length == sValues.length) {
        let eSelect = addTag(node, 'select', options);
        for (let i = 0; i < sValues.length; i++) {
            let opt = addTag(eSelect, 'option', {attr: 'value', value: sValues[i], text:titles[i]});
        }
        return eSelect;
    }
    return null;
};

/**
 * function that adds a table at a specific location then returns
 * the Table rows that were created.
 * @param {HTMLElement} node - HTMLElement to create table in.
 * @param {Number} rows - How many Rows are in the table.
 * @param {Number} columns = How many columns in the table.
 * @param [object] - Options settings for Table.
 * @param {string} [options.id] - ID of new element.
 * @param {string} [options.eclass] - Class of new element.
 * @param {string} [options.text] - inner text of the new element.
 * @param {string} [options.style] - style of the new element.
 * @param {string} [options.location] - type of add location. 
 * @param {HTMLElement} [options.insertNode] - node for insert type.
 * @param {string} [options.attr] - attribute type to add to element.
 * @param {string} [options.value] - value of attribute.
 */
const addTable = (node, rows, columns, options={}) => {
    const { id, eclass, text, style, location, insertNode, attr, value, etype, efunc } = options;
    
    if (node && !Array.isArray(node) && 
       Number.isInteger(rows) && Number.isInteger(columns)) {
        
        let trs = [];
        let table = addTag(node, 'table', options);
        for (let y = 0; y < rows; y++) {
            trs.push([]);
            let tempTr = addTag(table, 'tr');
            for (let x = 0; x < columns; x++) {
                trs[y].push(addTag(tempTr, 'td'));
            }
        }
        return trs;
    }
};

/**
 * function that will add an attribute to the given element(s).
 * @param {HTMLElement | HTMLElement[]} nodes - HTMLElement(s) that attribute will be added to.
 * @param {string} attribute - attribute name to add.
 * @param {string} value - Value of the new attribute.
 */
const addAttribute = (nodes, attr, value) => {
    if (nodes) {
        if (Array.isArray(nodes)) {
            nodes.forEach(function(n) {
                if (n.getAttribute(attr)) {
                    n.setAttribute(attr, n.getAttribute(attr) + ' ' + value);
                } else {
                    n.setAttribute(attr, value);
                }
            });
        } else {
            nodes.setAttribute(attr, value);
        }
    }
};

/**
 * function that will replace an attributes value of to the given element(s).
 * Uses the replace function to find the oldValue string and replace it with newValue string.
 * @param {HTMLElement | HTMLElement[]} nodes - HTMLElement(s) that attribute will be replaced to.
 * @param {string} eAttribute - attribute name to add.
 * @param {string} oldValue - Wildcard-enabled Value that needs to be replaced. 
 * @param {string} newValue - Value of the new attribute.
 */
const replaceAttribute = (nodes, attr, oldValue, newValue) => {
    if (nodes) {
        if (Array.isArray(nodes)) {
            nodes.forEach(n => n.setAttribute(attr, n.getAttribute(attr).replace(oldValue, newValue)));
        } else {
            nodes.setAttribute(attr, nodes.getAttribute(attr).replace(oldValue, newValue));
        }
    }
};

/**
 * function that adds a class to a given HTML Element.
 * @param {HTMLElement | HTMLElement[]} nodes - HTMLElement(s) that attribute will be added to.
 * @param {string} value - class name to add.
 */
const addClass = (nodes, value) => {
    if (nodes) {
        if (Array.isArray(nodes)) {
            nodes.forEach(function(n) {
                if (!n.className.includes(value)) {
                    if (n.classList.length > 0) {
                        n.className += ' ' + value;
                    } else {
                        n.className = value;
                    }
                }
            });
        } else {
            if (!nodes.className.includes(value)) {
                if (nodes.classList.length > 0) {
                    nodes.className += ' ' + value;
                } else {
                    nodes.className = value;
                }
            }
        }
    }
};

/**
 * function the replaces a given class with a new one.
 * @param {HTMLElement | HTMLElement[]} nodes - HTMLElement(s) that class will be replaced to.
 * @param {string} oldValue - class name to be replaced. 
 * @param {string} newValue - new class name.
 */
const replaceClass = (nodes, oldValue, newValue) => {
    if (nodes) {
        if (Array.isArray(nodes)) {
            nodes.forEach(function(n) {
                if (n.className.includes(oldValue)) {
                    n.className = n.className.replaceAll(oldValue, newValue);
                }
            });
        } else {
            if (nodes.className.includes(oldValue)) {
                nodes.className = nodes.className.replaceAll(oldValue, newValue);
            }
        }
    }
};

/**
 * function the removes a given class from HTML Element.
 * @param {HTMLElement | HTMLElement[]} nodes - HTMLElement(s) that class will be replaced to.
 * @param {string} value - class name to be removed.
 */
const removeClass = (nodes, value) => {
    replaceClass(nodes, value, '');
};
