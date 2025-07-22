class CookieManager {
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
    static set(name, value, options = {}) {
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
     * Gets the value of a cookie by its name.
     * It automatically deserializes the JSON string back into its original type.
     * @param {string} name - The name of the cookie.
     * @returns {any | null} The cookie value, or null if not found.
     */
    static get(name) {
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
    static remove(name, options = {}) {
        // To delete a cookie, we set its expiration date to the past.
        this.set(name, '', { ...options, days: -1 });
    }

    /**
     * Checks if a cookie with the given name exists.
     * @param {string} name - The name of the cookie.
     * @returns {boolean} True if the cookie exists, false otherwise.
     */
    static has(name) {
        return this.get(name) !== null;
    }

    /**
     * Returns an array of all cookie names.
     * @returns {string[]} An array of cookie names.
     */
    static keys() {
        const keys = [];
        const ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            const cookiePair = ca[i].split('=');
            if (cookiePair.length > 0) {
                const key = cookiePair[0].trim();
                if (key) {
                    keys.push(key);
                }
            }
        }
        return keys;
    }
}
