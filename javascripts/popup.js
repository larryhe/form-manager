var tab_url;
// var chrome = {runtime: {}};
function sendMessage(obj, callback) {
    chrome.tabs.query({ 'active': true, 'currentWindow': true }, function (tab) {
        chrome.tabs.sendMessage(tab[0].id, obj, callback);
    });
}
// chrome.tabs.query({ 'active': true, 'currentWindow': true }, function (tab) {
//     tab_url = tab[0].url;
//     updateFormList(tab_url);
// });

function getFormList(url){
    var items = [];
    var path = url;
    var search = url.indexOf('?');
    if(search > -1) {
        path = path.substring(0, search);
    }
    for(var i=0; i<localStorage.length; i++){
        var key = localStorage.key(i);
        var item = localStorage.getItem(key);
        if(key.indexOf('__form_manager__') > -1){
            item = JSON.parse(item);
            if(item.url && item.url.indexOf(path) > -1) {
                items.push(item);
            }
        }
    }
    return items;
}

function renderFormList(url) {
    var table = $('#formList');
    var tbody = table.find('tbody');
    tbody.empty();
    var formList = getFormList(url);
    tbody.append(formList.map(renderRow));
}

function renderRow(item) {
    return `<tr data-key="${item.key}">
        <td class="inlineEdit name">${item.name}</td>
        ${
            item.form && item.form.map(function(field){
                return `<td class="inlineEdit" field=${field.id}>${field.value}</td>`
            })
        }
        <td class="action">
        <button type="button" class="btn btn-default btn-xs" title="Auto Fill">
        <i class="glyphicon glyphicon-circle-arrow-up" />
        </button>
        <button type="button" class="btn btn-default btn-xs" title="Delete">
        <i class="glyphicon glyphicon-trash" />
        </button>
        </td>
        </tr>`;
}

function addRow(item) {
    var tbody = $('#formList tbody');
    tbody.append(renderRow(item));
}

function removeRow(key) {
    var tbody = $('#formList tbody');
    tbody.find(`tr[data-key=${key}]`).remove();
}

function getRandomStorageId() {
    var key = Math.floor((Math.random() * 1000000000) + 1);
    if (localStorage.getItem(key)) {
        return Math.floor((Math.random() * 1000000000) + 1);
    }
    return `__form_manager__${key}`;
}

function getValue($td) {
    var value = '';
    if($td.is('.name')) {
        value = $td.text();
    }else{
        var key = $td.parents("tr").data('key');
        var item = JSON.parse(localStorage.getItem(key));
        var form = item.form;
        var field = form.filter(field => field.id === $td.attr('field'))[0];
        value = field.value;
    }
    return value;
}

function saveValue($input) {
    var value = $input.val();
    if(value){
        var $td = $input.parents('td');
        var key = $td.parents("tr").data('key');
        var item = JSON.parse(localStorage.getItem(key));
        if($td.is('.name')) {
            item.name = value;
        }else{
            var form = item.form;
            var field = form.filter(field => field.id === $td.attr('field'))[0];
            field.value = value;
        }
        localStorage.setItem(key, JSON.stringify(item));
        $td.html(value);
    }
}

$(function () {
    tab_url = "http://localhost:3000";
    renderFormList(tab_url);
    $("#addForm").click(function () {
        sendMessage({ "action": 'addForm' }, function readResponse(obj) {
            var error = $('#error');
            if (!obj || chrome.runtime.lastError || obj.error) {
                if (chrome.runtime.lastError) {
                    error.html('<h6>Error :( Something wrong with current tab. Try to reload it.</h6>');
                } else if (!obj) {
                    error.html('<h6>Error :( Null response from content script</h6>');
                } else if (obj.error) {
                    error.html('<h6>Error :\'( ' + obj.message + '</h6>');
                }
                error.show();
                return;
            } else {
                error.hide();
            }

            var key = getRandomStorageId();

            var entry = {
                key,
                url: tab_url,
                name: '',
                form: obj.payload,
            };
            localStorage.setItem(key, JSON.stringify(entry));
            addRow(entry);
        });
    });

    var formList = $('#formList');
    formList.on("click", '.action button', function (event) {
        var btn = $(this);
        var key = btn.parents("tr").data('key');
        tab_url = "http://localhost:3000";
        if(btn.find('.glyphicon-trash').length > 0){
            localStorage.removeItem(key);
            removeRow(key);
        }else{
            var setSettings = JSON.parse(localStorage.getItem(key));
            sendMessage({ action: 'fill', setSettings: setSettings }, function(response) {
                window.close();
            });
        }
    }).on("click", 'td.inlineEdit', function (event) {
        var td = $(this);
        if (td.find('input').length) {
            return;
        }
        var input = $('<input type="text" class="form-control" />');
        input.val(getValue(td));
        td.empty().append(input).find('input').focus().select();
    }).on("keyup", 'input.form-control', function (e) {
        var code = e.keyCode || e.which;
        if (code == 13) { //Enter keycode
            saveValue($(this));
        }
    }).on('blur', 'input.form-control', function(e){
        saveValue($(this));
    });
});
