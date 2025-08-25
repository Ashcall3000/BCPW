// ==UserScript==
// @name         Thread Controller
// @namespace    http://tampermonkey.net/
// @version      2.1.4
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
        this.threads = {
            list: [],                       // Intveral ID's
            names: [],                      // Thread names
            funcs: [],                      // Thread Functions
            awake: []                       // Awake status
        };
        this.steps = {
            thread: null,                   // The Set Interval for the steps
            funcs: [],                      // Thread Functions
            current: 0,                     // Current step running
            active: false,                  // Steps active or not
            amount: 0                       // Amount of steps
        };
        this._loadState();
        // Create Thread that will start up the step process if it was 
        // active or not.
        if (this.steps.active) {
            this._stepThreadStarter = setInterval(function() {
                if (this.steps.amount > this.steps.current) {
                    this.startSteps();
                    clearInterval(this._stepThreadStarter);
                }
            }, 500);
        }
    }
    
    /**
     * Private function that saves if the step thread is running and what step
     * it was running last. It saves this data to a cookie.
     */
    _saveState() {        
        const state = {
            threadNames: this.threads.names,
            threadAwake: this.threads.awake,
            stepCurrent: this.steps.current,
            stepActive: this.steps.active
        };
        this.Cookies.add(`${this.cookieName}-State`, state, { days: 1});
    }
    
    _loadState() {
        const state = this.Cookies.get(`${this.cookieName}-State`) || { 
            threadNames: [], threadAwake: [], stepCurrent: 0, stepActive: false };
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
    _runSteps() {
        if (!this.steps.thread) {
            this.steps.active = true;
            this.steps.thread = setInterval(function() {
                let index = this.steps.current;
                if (this.steps.amount > index && this.steps.funcs[index]()) {
                    this.steps.current++;
                }
                if (this.steps.amount <= this.steps.current) {
                    this.resetSteps();
                }
            }, 500);
        }
    }
    
    /**
     * Finds and returns the index of of a given thread name.
     * @param {string} tname - thread name.
     * @return {number} - index of thread name.
     */
    _findIndex(tname) {
        return this.threads.names.indexOf(this._singleName(tname));
    }
    
    /**
     * Manualy runs the function from a specific thread.
     * If the function doesn't return anything will return null.
     * @param {string} - Thread name.
     * @return {unknown} - What ever the function returns.
     */
    manualRun(tname) {
        if (this.has(tname)) {
            return this.threads.funcs[this._findIndex(tname)]();
        }
        return null;
    }
    
    /**
     * Adds a thread to the list with the given name.
     * @param {string} tname - Thread name used to refrence it.
     * @param {function} tfunc = The function the thread is goint to run.
     * @param {boolean} awake - If the thread should start away or is awake.
     * @param {number} ttime - The amount of miliseconds before the thread runs again.
     */
    add(tname, tfunc, awake=true, ttime=1000) {
        if (!this.has(tname)) {
            this.threads.names.push(this._singleName(tname));
            this.threads.funcs.push(tfunc);
            this.threads.awake.push(awake);
            if (awake) {
                this.threads.list.push(setInterval(tfunc, ttime));
            }
            this._saveState();
        }
    }
    
    /**
     * Checks to see if the Thread name exists or not.
     * @param {string} tname - thread name.
     * @return {boolean} - Weather the thread name exists or not.
     */
    has(tname) {
        return this.threads.names.includes(this._singleName(tname));
    }
    
    /**
     * Removes and clears the thread if it exists in this controller.
     * @param {string} tname - Name of thread to remove.
     */
    remove(tname) {
        if (this.has(tname)) {
            let index = this._findIndex(tname);
            this.threads.names.splice(index, 1);
            this.threads.funcs.splice(index, 1);
            this.threads.awake.splice(index, 1);
            clearInterval(this.threads.list[index]);
            this.threads.list.splice(index, 1);
            this._saveState();
        }
    }
    
    /**
     * Puts a Thread to sleep. It will clear the interval and then
     * you will have to use the wake function to create the interval
     * again.
     * @param {string} - tname - thread name.
     */
    sleep(tname) {
        if (this.has(tname)) {
            let index = this._findIndex(this._singleName(tname));
            clearInterval(this.threads.list[index]);
            this.threads.awake[index] = false;
            this._saveState();
        }
    }
    
    /** 
     * Wakes up / re creates the interval for a thread.
     * @param {string} tname - Thread name to wake up.
     */
    awake(tname) {
        if (this.has(tname)) {
            let index = this._findIndex(this._singleName(tname));
            if (this.threads.awake[index]) {
                clearInterval(this.threads.list[index]);
                this.threads.awake[index] = false;
            }
            this._saveState();
        }
    }
    
    /**
     * Steps is a utility that stores a list of functions you define.
     * That will those functions in the order that they were added 
     * and not before. These functions are stores and ran in a single thread.
     * This function MUST return TRUE for it to continue to the next function.
     * @parm {function} tfunc - Function the step will run.
     */
    addStep(tfunc) {
        this.steps.funcs.push(tfunc);
        this.steps.amount++;
        this._saveState();
    }
    
    /**
     * Clears the thread for the steps interval.
     * You will have to call startSteps() to have steps run again.
     */
    sleepSteps() {
        clearInterval(this.steps.thread);
        this.steps.active = false;
        this._saveState();
    }
    
    /**
     * Starts the Step Thread
     */
    startSteps() {
        if (this.steps.amount > 0) {
            this._runSteps();
            this._saveState();
        }
    }
    
    /**
     * Resets the Steps
     */
    resetSteps() {
        clearInterval(this.steps.thread);
        this.steps.active = false;
        this.steps.current = 0;
        this._saveState();
    }
}
