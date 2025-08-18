// ==UserScript==
// @name         PW-AccelaTrakitLink
// @namespace    http://tampermonkey.net/
// @version      0.0.1
// @description  Used to add a button on summary page to open the corresponding Trakit page.
// @author       Christopher Sullivan
// @match        https://butteco-test-av.accela.com/*
// @match        https://butteco-prod-av.accela.com/*
// @require      https://github.com/Ashcall3000/BCPW/raw/refs/heads/main/Searcher.js
// @require      https://github.com/Ashcall3000/BCPW/raw/refs/heads/main/ThreadController.js
// @require      https://github.com/Ashcall3000/BCPW/raw/refs/heads/main/CookieController.js
// @downloadURL  https://github.com/Ashcall3000/BCPW/raw/refs/heads/main/PW-AccelaTrakitLink.js
// @updateURL    https://github.com/Ashcall3000/BCPW/raw/refs/heads/main/PW-AccelaTrakitLink.js
// @grant        none
// ==/UserScript==
(function() {
    'use strict';
    
    var Threads = new ThreadController('TrakitLink');
    
    Threads.add('inner-window', function() {
        if (exists('#iframe-page-container')) {
            Threads.remove('inner-window');
            return;
        }
        if (exists('#menu_bar_') && exists('#capTabSummary') && !exists('#trakit-button')) {
            // find Permit number
            let tr = search('tr', {element: '#menu_Bar'});
            let td = addTag(tr, 'td', {style: 'padding-left:5px;padding-right:5px;'});
            let table = addTag(td, 'table');
            table.setAttribute('border', '0');
            table.setAttribute('cellspacing', '0');
            table.setAttribute('cellpadding', '0');
            let tbody = addTag(table, 'tbody');
            tr = addTag(tbody, 'tr');
            td = addTag(tr, 'td');
            let aHref = addTag(td, 'a', {
                id: 'trakit-button', 
                style: 'text-decoration: none; cursor: pointer;'
            });
            addTag(aHref, 'input', {
                style: 'width: 0px; height: 0px; border: none;',
                attr: 'tabindex',
                value: '-1'
            }).setAttribute('type', 'image');
            let buttonImg = addTag(aHref, 'div', {
                id: 'img_trakit-button', 
                eclass: 'menu-left-normal-button', 
                style: 'width: auto;',
            });
            let buttonDiv = addTag(buttonImg, 'div', {
                id: 'trakit-button2',
                eclass: 'menu-right-normal-button',
                style: 'width: auto;'
            });
            let buttonInnerDiv = addTag(buttonDiv, 'div', {
                id: 'trakit-button3',
                eclass: 'menu-middle-normal-button',
                style: 'width: auto;'
            });
            addTag(buttonInnerDiv, 'font', {
                eclass: 'portlet-menu-item',
                text: 'Trakit',
                attr: 'aria-label',
                value: 'Trakit'
            });
            buttonImg.addEventListener('mouseover', function() {
                addClass(this, 'menu-left-hover-button');
                addClass(search('#trakit-button2'), 'menu-right-hover-button');
                addClass(search('#trakit-button3'), 'menu-middle-hover-button');
            });
            buttonImg.addEventListener('mouseout', function() {
                removeClass(this, 'menu-left-hover-button');
                removeClass(search('#trakit-button2'), 'menu-right-hover-button');
                removeClass(search('#trakit-button3'), 'menu-middle-hover-button');
            });
            aHref.addEventListener('click', function() {
                let url = search('#capTabSummary').getAttribute('action');
                let start = url.indexOf('butteco') + 8;
                let permit = url.substring(start);
                let num = permit.replace(/\D/g, '');
                let prefix = permit.replace(num, '');
                let link = 'http://trakit/TRAKiT/permitTRAK.aspx?cmd=PERMITNO&permit_no=';
                link += prefix.toUpperCase() + num.substring(0, 2) + '-' + num.substring(2);
                console.log("LINK: " + link);
                console.log("START: " + start);
                console.log("PERMIT: " + permit);
                console.log("URL: " + url);
                console.log("NUM: " + num);
                console.log("PREFIX: " + prefix);
                window.open(link, '_blank');
            });
        }
    });
})();
