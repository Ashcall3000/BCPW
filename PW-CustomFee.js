// ==UserScript==
// @name         PW-CustomFee
// @namespace    http://tampermonkey.net/
// @version      0.0.5
// @description  Used for Accela to show Fee Unit costs per quantity amount
// @author       Christopher Sullivan
// @match        https://butteco-test-av.accela.com/*
// @match        https://butteco-prod-av.accela.com/*
// @require      https://github.com/Ashcall3000/BCPW/raw/refs/heads/main/Searcher.js
// @require      https://github.com/Ashcall3000/BCPW/raw/refs/heads/main/ThreadController.js
// @require      https://github.com/Ashcall3000/BCPW/raw/refs/heads/main/CookieController.js
// @downloadURL  https://github.com/Ashcall3000/BCPW/raw/refs/heads/main/PW-CustomFee.js
// @updateURL    https://github.com/Ashcall3000/BCPW/raw/refs/heads/main/PW-CustomFee.js
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    
    var Threads = new ThreadController("CustomFees");
    
    Threads.add('inner-window', function() {
        let inner = exists('#iframe-page-container');
        if (inner) {
            Threads.remove('inner-window');
            return;
        }
        if (exists('input', {attr:'name', value:'*FormulaName*'}) && !exists('input', {id:'fee-*'})) {
            let feeRows = search('tr', {element:'#AccelaMainTable', id:'row*', all:true});
            for (let i = 0; i < feeRows.length; i++) {
                let inputValue = search('input', {attr:'name', value:'*FormulaName,' + i + ')'}).value;
                if (inputValue.length < 10) {
                    let td = search('td', {element:feeRows[i], all:true})[3];
                    let input = addTag(td, 'input', {
                        id: 'fee-' + i,
                        eclass: 'portlet-form-input-field',
                        attr: 'title',
                        value: 'FeeCost',
                        style: 'height: 19px; width: 6em; background-color:#f5f6f5'
                    });
                    addAttribute(input, 'type', 'text');
                    //input.addEventListener('change', EventChange);
                    input.value = '$' + inputValue;
                    input.disabled = true;
                }
            }
        }
    });
    
    function EventChange() {
        let feeCosts = search('input', {id:'fee-*', all:true});
        for (let i = 0; i < feeCosts.length; i++) {
            if (feeCosts[i].value != '') {
                let num = feeCosts[i].getAttribute('id').substring(4);
                search('input', {attr:'name', value:'*FormulaName,' + num + ')'}).value = feeCosts[i].value;
            }
        }
    }
})();
