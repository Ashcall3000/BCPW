// ==UserScript==
// @name         PW-CustomReport
// @namespace    http://tampermonkey.net/
// @version      0.0.1
// @description  Used for Accela to get a custom report for invoice
// @author       Christopher Sullivan
// @match        https://butteco-test-av.accela.com/*
// @match        https://butteco-prod-av.accela.com/*
// @require      https://github.com/Ashcall3000/BCPW/raw/refs/heads/main/Searcher.js
// @require      https://github.com/Ashcall3000/BCPW/raw/refs/heads/main/ThreadController.js
// @require      https://github.com/Ashcall3000/BCPW/raw/refs/heads/main/CookieController.js
// @downloadURL  https://github.com/Ashcall3000/BCPW/raw/refs/heads/main/PW-CustomReport.js
// @updateURL    https://github.com/Ashcall3000/BCPW/raw/refs/heads/main/PW-CustomReport.js
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    
    var Threads = new ThreadController("CustomReports");
    var Cookies = new CookieController("CustomReports");
    
    Threads.add("inner-frame", function() {
        // Make sure to only run on the inside iframe
        if (exists("#iframe-page-container") || !exists('body.angular-frame')) 
            Threads.remove("inner-frame");
        
        // Add Custom report Pull Up
        if (exists('a#pay') && !exists('div#custom-report-added')) {
            //AddLog('Added Custom Report');
            let reportUrl = 'https://butteco-prod-av.accela.com/portlets/reports/reportShow.do?mode=show&reportId=7788&module=PublicWorks&ID=&portletID=20011&formName=paymentListActionForm&objectName=&rowIndex=undefined&pageNo=&pageSize=10';
            let invoices = search('a', {element:'#InvoicesTableId', all:true});
            invoices.forEach(function(inv) {
                inv.addEventListener('click', function() {
                    Cookies.add('invoice-number', this.textContent.trim());
                    window.open(reportUrl, '_blank');
                    Cookies.add('custom-report-run', true);
                });
            });
            addTag(search('div'), 'div', {id:'custom-report-added'});
        }
    });
    
    Threads.add('custom-report', function() {
        if (!Cookies.get('custom-report-run')) {
            Threads.remove('custom-report');
            return;
        }
        setField(search('input', {attr:'name', value:'*receiptnbr)'}), 'input', Cookies.get('invoice-number'));
        search('a#acsubmit').click();
        Cookies.reset();
        Threads.remove('custom-report');
    });
})();
