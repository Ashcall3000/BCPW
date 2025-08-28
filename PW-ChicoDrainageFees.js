// ==UserScript==
// @name         PW-ChicoDrainage
// @namespace    http://tampermonkey.net/
// @version      0.0.1
// @description  Used for Accela to add Chico Drainage Calculations
// @author       Christopher Sullivan
// @match        https://butteco-test-av.accela.com/*
// @match        https://butteco-prod-av.accela.com/*
// @require      https://github.com/Ashcall3000/BCPW/raw/refs/heads/main/Searcher.js
// @require      https://github.com/Ashcall3000/BCPW/raw/refs/heads/main/CookieController.js
// @require      https://github.com/Ashcall3000/BCPW/raw/refs/heads/main/ThreadController.js
// @downloadURL  https://github.com/PW-CSullivan/PWScripts/raw/main/PW-ChicoDrainageFees.js
// @updateURL    https://github.com/PW-CSullivan/PWScripts/raw/main/PW-ChicoDrainageFees.js
// @grant        none
// ==/UserScript==
(function() {
    'use strict';
    
    var Threads = new ThreadController('ChicoDrainage');
    
    Threads.add('main', function() {
       if (inFrameCheck('outer')) {
            Threads.remove('main');
            return;
        }
        if (!exists('#FeeSched') || exists('#feeMyQuan')) {
            return;
        }
        if (exists('#FeeSched') && search('#FeeSched').value != 'DRN_IMP_CHICO') {
            return;
        }
        let feeItems = search('td.portlet-section-body', {text:'*Impact Fee - Drainage*', all:true});
        //feeItems.forEach(function(fee) {
            //fee.parentElement.style.display = 'none';
        //});
        let feeTable = search('#AccelaMainTable tbody');
        let tr = addTag(feeTable, 'tr', {
            eclass: 'AlignL portlet-section-body', 
            attr:'onclick', 
            value: "highlight('row1')"
        });
        let td = addTag(tr, 'td', {eclass:'AlignL portlet-section-body'});
        addTag(td, 'label', {text:'Impact Fee - Drainage - '});
        addDropdown(td, 
                    ['--Location--', 'Butte Creek', 'Comanche Creek', 'Little Chico Creek', 'Big Chico Creek', 'Lindo Channel', 'SUDA Ditch', 'Mud-Sycamore Creek', 'PV Ditch'], 
                    ['none', 'Butte', 'Comanche', 'Little', 'Big', 'Lindo', 'S.U.D.A.D', 'Sycamore', 'P.V.'], 
                    {id: 'feeMyLocation', eclass: 'portlet-form-field'}
                   ).addEventListener('change', changeFees);
        addDropdown(td,
                   ['--Type--', 'Single Family', 'Multiple Family', 'Commercial and Industrial'],
                   ['none', 'Single', 'Multiple', 'Commercial'],
                   {id: 'feeMyType', eclass: 'portlet-form-field'}
                   ).addEventListener('change', changeFees);
        addTag(tr, 'td', {id: 'feeMyCode', eclass: 'AlignL portlet-section-body', text: '--None--'});
        td = addTag(tr, 'td', {eclass: 'AlignL portlet-section-body'});
        let myInput = addTag(td, 'input', {id: 'feeMyQuan', eclass: 'portlet-form-input-field', attr: 'type', value: 'text', style: 'height: 19px;'});
        myInput.setAttribute('size', '12');
        myInput.setAttribute('maxlength', '16');
        myInput.setAttribute('placeholder', 'Square Feet');
        myInput.addEventListener('change', changeFeeAmount);
        td = addTag(tr, 'td', {eclass: 'AlignL portlet-section-body'});
        myInput = addTag(td, 'input', {id: 'feeMyAmount', eclass: 'portlet-form-input-field', attr: 'type', value: 'text', style: 'height: 19px;'});
        myInput.value = '$0';
        myInput.disabled = true;
        td = addTag(tr, 'td', {eclass: 'AlignL portlet-section-body'});
        addTag(td, 'input', {id: 'feeMyNotes', eclass: 'portlet-form-input-field', attr: 'type', value: 'text', style: 'height: 19px;'});
        addTag(tr, 'td', {eclass: 'AlignL portlet-section-body', text: 'FINAL'});
    });
    
    function inFrameCheck(frame) {
        let inFrame = (window.self !== window.top);
        if (frame == 'outer') {
            inFrame = (window.self === window.top);
        }
        return inFrame;
    }
    
    function changeFees() {
        let feeLoc = search('#feeMyLocation').value;
        let feeType = search('#feeMyType').value;
        clearInputs();
        if (feeLoc == 'none' || feeType == 'none') {
            return;
        }
        let textToFind = '*' + feeLoc + '*' + feeType + '*';
        let tr = search('td.portlet-section-body', {text:textToFind}).parentElement;
        let datas = search('td', {element:tr, all:true});
        search('#feeMyCode').textContent = datas[1].textContent;
        changeFeeAmount();
    }
    
    function clearInputs() {
        let feeItems = search('td.portlet-section-body', {text:'*Impact Fee - Drainage*', all:true});
        feeItems.forEach(function(fee) {
            let par = fee.parentElement;
            setField(
                search('input', {id:'*Quantity*', element:par}),
                'input', ''
            );
            setField(
                search('input', {id:'*feeNotes*', element:par}),
                'input', ''
            );
            search('#feeMyCode').textContent = '--None--';
        });
    }
    
    const feeFormTables = {
        ButteSingle: '8893',
        ButteMultiple: '13339',
        ButteCommercial: '14228',
        ComancheSingle: '9276',
        ComancheMultiple: '13914',
        ComancheCommercial: '14842',
        LittleSingle: '10107',
        LittleMultiple: '15160',
        LittleCommercial: '16171',
        BigSingle: '7535',
        BigMultiple: '11303',
        BigCommercial: '12056',
        LindoSingle: '9194',
        LindoMultiple: '13791',
        LindoCommercial: '14710',
        'S.U.D.A.DSingle': '8019',
        'S.U.D.A.DMultiple': '12029',
        'S.U.D.A.DCommercial': '12830',
        SycamoreSingle: '6978',
        SycamoreMultiple: '10468',
        SycamoreCommercial: '11165',
        'P.V.Single': '9890',
        'P.V.Multiple': '14834',
        'P.V.Commercial': '15823'
    };
    
    function changeFeeAmount() {
        clearInputs();
        let feeLoc = search('#feeMyLocation').value;
        let feeType = search('#feeMyType').value;
        if (feeLoc == 'none' || feeType == 'none') {
            return;
        }
        let textToFind = '*' + feeLoc + '*' + feeType + '*';
        let tr = search('td.portlet-section-body', {text:textToFind}).parentElement;
        let feeQuan = search('input', {element:tr, id:'*Quantity*'});
        let feeNotes = search('input', {element:tr, id:'*feeNotes*'});
        let feeAmount = ((feeFormTables[feeLoc + feeType] / 43560) * search('#feeMyQuan').value).toFixed(2);
        search('#feeMyAmount').value = '$' + feeAmount;
        setField(feeQuan, 'input', feeAmount);
        setField(feeNotes, 'input', search('#feeMyNotes').value);
    }
})();
