class CookieController {
    // Constructor
    constructor(cookieName) {
        // Main Variables
        this.allCookiesNames = this._LoadCookie(cookieName);
        if (this.allCookiesNames == null)
            this.allCookiesNames = [];
        this.myName = cookieName;
        this.loadedCookie = [];
    }
    
    // Load Function
    // Private function that loads the JSON object and returns the value
    _LoadCookie(cname) {
        cname += "=";
        let decodedCookie = decodeURIComponent(document.cookie);
        let ca = decodedCookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            if (ca[i].includes(cname)) {
                let c = ca[i].trim();
                try {
                    let myData = JSON.parse(decodeURIComponent(c.substring(cname.length, c.length)).toString());
                    //console.log(myData);
                    if (myData.myCookieType == 'JSON') {
                        return myData;
                    } else if (myData.myCookieType == 'number') {
                        return Number(myData.myCookieData);
                    } else if (myData.myCookieType == 'boolean') {
                        return Boolean(myData.myCookieData);
                    } else if (myData.myCookieType == 'array') {
                        let myArray = [];
                        for (let x = 0; x < myData.myCookieData.length; x++) {
                            if (myData.myCookieDataType == 'number') {
                                myArray.push(Number(myData.myCookieData[x]));
                            } else if (myData.myCookieDataType == 'boolean') {
                                myArray.push(Boolean(myData.myCookieData[x]));
                            } else {
                                myArray.push(myData.myCookieData[x]);
                            }
                        }
                        return myArray;
                    } else {
                        return myData.myCookieData;
                    }
                } catch (e) {
                    console.log(e);
                    return null;
                }
            }
        }
        return null;
    }
    
    // Save Function
    // Private function that saves a JSON object as a cookie
    _SaveCookie(cname, cvalue, exdays=1) {
        let vType = typeof(cvalue);
        let data = {};
        if (vType == 'object') {
            if (Array.isArray(cvalue)) {
                // Is an Array
                data.myCookieType = 'array';
                data.myCookieData = cvalue;
                data.myCookieDataType = typeof(cvalue[0]);
            } else {
                // JSON Object
                data = cvalue;
                data.myCookieType = 'JSON';
            }
        } else {
            // Regular Cookie
            data.myCookieType = vType;
            data.myCookieData = cvalue;
        }
        const d = new Date();
        d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
        let expires = "expires=" + d.toUTCString();
        let encodedvalue = encodeURIComponent(JSON.stringify(data));
        document.cookie = cname + "=" + encodedvalue + ";" + expires + "; path=/";
    }
    
    // Check Function
    // Checks to see if cookies exists and returns true or false
    Check(cname, cvalue="") {
        this.allCookiesNames.forEach(function(cookName) {
            if (cname == cookName && cvalue == "")
                return true;
            else if (cname == cookName && this.Get(cname) == cvalue)
                return true;
        });
        return false;
    }
    
    // Check Include Function
    // Checks to see if the data includes a the given value
    CheckInclude(cname, cvalue) {
        if (this.Check(cname)) {
            let data = this.Get(cname);
            if (Array.isArray(data) || typeof(data) == 'string')
                return data.includes(cvalue);
        }
        return false;
    }
    
    // Add Function
    // Adds cookie to Cookie Name list if it doesn't exist.
    // Adds to loadedCookie as well.
    // Saves Cookie for future use. 
    Add(cname, cvalue, exdays=1) {
        if (!this.Check(cname)) {
            this.allCookiesNames.push(cname);
            this._SaveCookie(this.myName, this.allCookiesNames);
            this.loadedCookie[cname] = cvalue;
        }
        this._SaveCookie(cname, cvalue, exdays);
    }
    
    // Update Function
    // Updates data that already exists. If cookie doesn't exists returns false.
    Update(cname, cvalue, exdays=1) {
        if (this.Check(cname)) {
            this.loadedCookie[cname] = cvalue;
            this._SaveCookie(cname, cvalue, exdays);
            return true;
        }
        return false;
    }
    
    // Get Function
    // Grabs and returns the value of a cookie. 
    // If the cookie doesn't exist will return null.
    Get(cname) {
        if (this.Check(cname)) {
            if (cname in this.loadedCookie) {
                return this.loadedCookie[cname];
            } else {
                this.loadedCookie[cname] = this._LoadCookie(cname);
                return this.loadedCookie[cname];
            }
        }
        return null;
    }
    
    // Remove Function
    // Removes Cookie from the lists and loaded section.
    // Removes specific index from array
    Remove(cname, arrayIndex=-1) {
        if (this.Check(cname)) {
            if (arrayIndex == -1) {
                let index = this.allCookiesNames.indexOf(cname);
                if (index >= 0 && index < this.allCookiesNames.length) {
                    this.Add(cname, "", -1);
                    this.allCookiesNames = this.allCookiesNames.splice(index, 1);
                    this.loadedCookie = this.loadedCookie.splice(index, 1);
                }
            } else if (Array.isArray(this.loadedCookie[cname])) {
                if (arrayIndex >= 0 && arrayIndex < this.loadedCookie.length) {
                    this.Update(cname, this.loadedCookie[cname].splice(arrayIndex, 1));
                }
            }
        }
    }
    
    // RemoveAll Function
    // Removes all cookies from the list.
    RemoveAll() {
        this.allCookiesNames.forEach(function(cname) {
            this.Update(cname, "", -1);
        });
        this.Update(this.myName, "", -1);
        this.allCookiesNames = [];
        this.loadedCookie = [];
    }
}
