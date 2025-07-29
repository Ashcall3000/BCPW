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
        this.cookies = [];
        this._load();
    }
    
    /**
     * Loads the list of Cookies that this controller is 
     * responsible for.
     */
    _load() {
        this.cookies = this._get(this.cookieName + "-List");
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
    static _set(name, value, options = {}) {
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
}
