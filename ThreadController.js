// ==UserScript==
// @name         Thread Controller
// @namespace    http://tampermonkey.net/
// @version      2.0.1
// @description  Creates and Controls Threads
// @author       Ashcall3000
// @require      https://raw.githubusercontent.com/Ashcall3000/BCPW/refs/heads/main/Searcher.js
// @require      https://raw.githubusercontent.com/Ashcall3000/BCPW/refs/heads/main/CookieManager.js
// @match        https://butteco-test-av.accela.com/*
// @grant        none
// ==/UserScript==

class ThreadController {
    /**
     * Creates the thread controller with the given name
     * @param {string} threadName - Name of the Thread Controller
     */
    constructor(threadName) {
        if (!threadName)
            throw new Error("ThreadController requires a unique name.");
        
        // Main Variables
        this.cookieName = "ThreadController-" + threadName;
        this.Cookies = new CookieController(this.cookieName);
        this.myName = threadName;
        this.threadList = [];               // Threads
        this.threadNames = [];              // Names of Single Threads
        const state = this.Cookies.get(`${this.cookieName}-State`) || { currentStep: 0, active: false };
        this.tableThread = null;            // Table Thread
        this.tableList = [];                // Table of Steps in a single thread
        this.tableConditions = [];          // Conditions to run the table function
        this.tableClick = [];               // Array of elements to click when funtion is done
        this.tableStep = state.currentStep; // Table Number
        this.active = state.active;         // If the Table is running
    }
    
    /**
     * Private function that saves if the step thread is running and what step
     * it was running last. It saves this data to a cookie.
     */
    _saveState() {
        const state = {
            currentStep: this.tableStep,
            active: this.active
        };
        this.Cookies.add(`${this.cookieName}-State`, state, { days: 1});
    }
    
    /**
     * Private function that returns the name of this thread name added 
     * to the given name. Was originally used to make sure unique 
     * cookie names.
     * @param {string} tname - Thread Name.
     * @return {string} - Name of thread.
     */
    _singleName(tname) {
        return this.myName + "-" + tname;
    }
    
    /**
     * Private function that is used to run the step thread.
     */
    _run() {
        if (this.active && !this.has("TableStepThread")) {
            this.add("TableStepThread", function() {
                let index = this.tableStep;
                if (this.tableConditions[index]()) {
                    let nextStep = this.tableList[index]();
                    if (nextStep || nextStep == null) {
                        this.tableStep++;
                        this._saveState();
                        if (this.tableClick[index]) {
                            this.tableClick[index].click();
                        }
                    }
                }
            });
        }
    }
    
    /**
     * Adds a thread to the list with the given nam.
     * @param {string} tname - Thread name used to refrence it.
     * @param {function} tfunc = The function the thread is goint to run.
     * @param {number} ttime - The amount of miliseconds before the thread runs again.
     */
    add(tname, tfunc, ttime=1000) {
        if (!this.has(tname)) {
            this.threadNames.push(this._singleName(tname));
            this.threadList.push(setInterval(tfunc, ttime));
        }
    }
    
    /**
     * Adds a step to the stepThread to run. 
     * Condition is going to be the check to see if this step can be ran. Can
     * be a string, boolean, or function. If it is a string it will search for
     * an element to see if it exists.
     * @param {boolean | string | function} condition - the check to see if the step can run
     * @parm {function} tfunc - Function the step will run.
     * #param {Element | string} - The element to be clicked after the step is done.
     */
    addStep(condition, tfunc, elClick=false) {
        let startCondition = false;
        if (typeof(condition) == 'string') {
            startCondition = function() { return checkExist(condition); };
        } else if (typeof(condition) == 'boolean') {
            startCondition = function() { return condition; };
        } else {
            startCondition = condition;
        }
        
        if (typeof(elClick) == 'string') {
            elClick = find(elClick);
        }
        
        this.tableList.push(tfunc);
        this.tableConditions.push(startCondition);
        this.tableClick.push(elClick);
    }
    
    /**
     * Checks to see if the Thread name exists or not.
     * @param {string} tname - thread name.
     * @return {boolean} - Weather the thread name exists or not.
     */
    has(tname) {
        return this.threadNames.includes(this._singleName(tname));
    }
    
    /**
     * Removes and clears the thread if it exists in this controller.
     * @param {string} tname - Name of thread to remove.
     */
    remove(tname) {
        if (this.has(tname)) {
            let index = this.threadNames.findIndex(this._singleName(tname));
            this.threadNames = this.threadNames.splice(index, 1);
            clearInterval(this.threadList[index]);
            this.threadList = this.threadList.splice(index, 1);
        }
    }
    
    /**
     * Starts the Step Thread
     */
    start() {
        if (this.tableList.length > 0) {
            this.active = true;
            this.tableStep = 0;
            this._saveState();
            this._run();
        }
    }
    
    /**
     * Stops the step thread from running until started again.
     */
    stop() {
        this.active = false;
        this.remove("TableStepThread");
        this._saveState();
    }
    
    /**
     * Clears and resets the Steps
     */
    reset() {
        this.active = false;
        this.remove("TableStepThread");
        this.tableStep = 0;
        this._saveState();
    }
}
