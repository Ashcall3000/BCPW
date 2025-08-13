// ==UserScript==
// @name         Cookie Controller
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  Creates and Controls Cookies
// @author       Ashcall3000
// @match        https://butteco-test-av.accela.com/*
// @grant        none
// ==/UserScript==
class CookieController {
    /**
     * Creates a cookie manager to handle just the cookies
     * it's made. 
     * @param {string} controllerName - Name of this cookie controller
     */
    constructor(controllerName) {
        if (!controllerName)
            throw new Error("CookieController require a unique name.");
        
        this.cookieName = "CookieController-" + controllerName;
        this._load();
        if (this.cookies == null)
            this.cookies = [];
    }
    
    /**
     * Loads the list of Cookies that this controller is 
     * responsible for.
     */
    _load() {
        this.cookies = this.get(this.cookieName + "-List");
    }
    
    /**
     * Saves the list of cookie names that this controller
     * is responsible for.
     */
    _save() {
        this._set(this.cookieName + "-List", this.cookies);
    }
    
    /**
     * Sets a cookie with a given name and value.
     * The value can be any type that can be serialized by JSON.stringify.
     * @param {string} name - The name of the cookie.
     * @param {any} value - The value of the cookie.
     * @param {object} [options] - Optional settings.
     * @param {number} [options.days=7] - Expiration in days.
     * @param {string} [options.path='/'] - The path for the cookie.
     * @param {string} [options.domain] - The domain for the cookie.
     * @param {boolean} [options.secure] - Secure flag.
     */
    _set(name, value, options = {}) {
        const { days = 7, path = '/', domain, secure } = options;

        let expires = '';
        if (days) {
            const date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = `; expires=${date.toUTCString()}`;
        }

        const encodedValue = encodeURIComponent(JSON.stringify(value));
        
        let cookieString = `${name}=${encodedValue}${expires}; path=${path}`;
        if (domain) {
            cookieString += `; domain=${domain}`;
        }
        if (secure) {
            cookieString += `; secure`;
        }

        document.cookie = cookieString;
    }
    
    /**
     * Adds a cookie with a given name and value.
     * The value can be any type that can be serialized by JSON.stringify.
     * @param {string} name - The name of the cookie.
     * @param {any} value - The value of the cookie.
     * @param {object} [options] - Optional settings.
     * @param {number} [options.days=7] - Expiration in days.
     * @param {string} [options.path='/'] - The path for the cookie.
     * @param {string} [options.domain] - The domain for the cookie.
     * @param {boolean} [options.secure] - Secure flag.
     */
    add(name, value, options = {}) {
        if (!this.cookies.includes(name)) {
            this.cookies.push(name);
            this._save();
        }
        this._set(name, value, options);
    }
    
    /**
     * Modifies an existing cookie with the given value.
     * operator can be +=, -=, *=, /= and does that operation between
     * the current cookie data and the given value.
     * @param {string} name - The name of the cookie
     * @param {string} operator - operator to use on the cookie.
     * @param {any} value - the value you wish to modify the cookie with.
     * @param {object} [options] - Optional settings.
     * @param {number} [options.days=7] - Expiration in days.
     * @param {string} [options.path='/'] - The path for the cookie.
     * @param {string} [options.domain] - The domain for the cookie.
     * @param {boolean} [options.secure] - Secure flag.
     */
    modify(name, operator, value, options = {}) {
        if (this.cookies.includes(name)) {
            let data = this.get(name);
            if (operator == '+=') {
                data += value;
            } else if (operator == '-=') {
                data -= value;
            } else if (operator == '*=') {
                data *= value;
            } else if (operator == '/=') {
                data /= value;
            }
            this._set(name, data, options);
            return data;
        } else {
            if (operator == '+=') {
                this.add(name, value, options);
            } else if (operator == '-=') {
                this.add(name, -value, options);
            }
        }
        return false;
    }

    /**
     * Gets the value of a cookie by its name.
     * It automatically deserializes the JSON string back into its original type.
     * @param {string} name - The name of the cookie.
     * @returns {any | null} The cookie value, or null if not found.
     */
    get(name) {
        const nameEQ = name + "=";
        const ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') {
                c = c.substring(1, c.length);
            }
            if (c.indexOf(nameEQ) === 0) {
                const value = c.substring(nameEQ.length, c.length);
                try {
                    return JSON.parse(decodeURIComponent(value));
                } catch (e) {
                    // If parsing fails, return the raw value
                    return decodeURIComponent(value);
                }
            }
        }
        return null;
    }

    /**
     * Removes a cookie by its name.
     * @param {string} name - The name of the cookie to remove.
     * @param {object} [options] - Optional settings matching the original cookie path/domain.
     * @param {string} [options.path='/'] - The path for the cookie.
     * @param {string} [options.domain] - The domain for the cookie.
     */
    remove(name, options = {}) {
        if (this.cookies.includes(name)) {
            // To delete a cookie, we set its expiration date to the past.
            this._set(name, '', { ...options, days: -1 });
            let index = this.cookies.findIndex(name);
            this.cookies.splice(index, 1);
            this._save();
        }
    }
    
    /**
     * Resets and clears all cookies
     */
    reset() {
        for (let i = 0; i < this.cookies.length; i++) {
            this._set(this.cookies[i], '', { ...options, days: -1 });
        }
        this.cookies = [];
        this._save();
    }

    /**
     * Checks if a cookie with the given name exists.
     * @param {string} name - The name of the cookie.
     * @returns {boolean} True if the cookie exists, false otherwise.
     */
    has(name) {
        return this.cookies.includes(name);
    }

    /**
     * Returns an array of all cookie names.
     * @returns {string[]} An array of cookie names.
     */
    keys() {
        return this.cookies;
    }
    
    /**
     * Returns a string version of the JSON Object cookie.
     * If the param is blank will return all cookies as a string.
     * @param {string} name - name of cookie. DEFAULT: ''
     * @return {string} string version of cookie/s
     */
    stringify(name='') {
        let text = '';
        if (name != '' && this.has(name)) {
            return name + ' = ' + this.get(name).toString();
        }
        for (let i = 0; i < this.cookies.length; i++) {
            text += this.cookies[i] + ' = ' + this.get(this.cookies[i]).toString() + '\n';
        }
        return text;
    }
}
