// ==UserScript==
// @name         Thread Controller
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  Creates and Controls Threads
// @author       Ashcall3000
// @require      https://raw.githubusercontent.com/Ashcall3000/BCPW/refs/heads/main/Searcher.js
// @match        https://butteco-test-av.accela.com/*
// @grant        none
// ==/UserScript==

class ThreadController {
    // Constructor
    constructor(threadName) {
        // Main Variables
        this.Cookies = new CookieController("Thread-" + threadName);
        this.myName = threadName;
        this.threadList = [];       // Threads
        this.threadNames = [];      // Names of Single Threads
        this.tableThread = null;    // Table Thread
        this.tableList = [];        // Table of Steps in a single thread
        this.tableNumber = 0;       // Table Number
        
        if (this.Cookies.Check(this._SingleName("threadNames"))) {
            this.threadNames = this.Cookies.Get(this._SingleName("threadNames"));
        }
        if (this.tableNumber == 0) {
            this.tableNumber = this.Cookies.Get(this._SingleName("tableNumber"));
        }
    }
    
    _SingleName(tname) {
        return this.myName + "-" + tname;
    }
    
    _UpdateCookies() {
        this.Cookies.Update(this._SingleName("threadNames"), this.threadNames);
        this.Cookies.Update(this._SingleName("tableNumber"), this.tableNumber);
    }
    
    _CheckTable() {
        if (this.tableNumber < this.tableList) {
            if (this.tableList[this.tableNumber]()) {
                this.tableNumber++;
            }
        }
    }
    
    // Add Thread 
    // Will add a thread to the list with a default of 1.5 seconds.
    // Will only add if thread doesn't exist. 
    AddThread(tname, tfunc, ttime=1500) {
        if (!this.threadNames.includes(tname)) {
            this.threadNames.push(tname);
            this.threadList.push(setInterval(function() {
                return tfunc();
            }, ttime));
            this._UpdateCookies();
        }
    }
    
    // Remove Thread
    // Will remove running thread by name
    RemoveThread(tname) {
        if (this.threadNames.includes(tname)) {
            let index = this.threadNames.indexOf(tname);
            this.threadNames = this.threadNames.splice(index, 1);
            clearInterval(this.threadList[index]);
        }
    }
    
    // Remove All Threads
    // Will loop through and clear all threads
    RemoveAllThreads() {
        this.threadNames = [];
        for (let i = 0; i < this.threadList.length; i++) {
            clearInterval(this.threadList[i]);
        }
        this.threadList = [];
        this._UpdateCookies();
    }
    
    // Add Table
    // Add Table 
    AddTable(tfunc) {
        if (this.tableThread == null) {
            this.tableThread = setInterval(function(){
                this._CheckTable();
            }, 1000);
        }
        this.tableList.push(tfunc);
    }
    
    // Clear All Tables
    // Clears all the tables
    ClearAllTables() {
        clearInterval(this.tableThread);
        this.tableThread = null;
        this.tableNumber = 0;
        this.tableList = [];
    }
}
