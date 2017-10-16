$.fn.serializeForm = function () {
    var forms = $(this).find('input[type=text], input[type=password]');
    var form = {};
    forms.each(function(){
        var $el = $(this);
        var id = $el.attr('id') || $el.attr('name');
        form[id] = $el.attr('val') || $el.val();
    });
    return form;
};

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    switch (request.action) {
        case 'addForm':
            try {
                var payload = $('body').serializeForm();
                sendResponse({ payload });
            } catch(e) {
                sendResponse({ error: true, message: e.message });
            } 
            break;

        case 'fill':
            fillForm(request.form);
            sendResponse({});
            break;
    }
});

function fillForm(form) {
    $('body').deserialize(form);
    try {
        var submitButton = $('button[type=submit], input[type=submit]');
        if (submitButton.length) {
            submitButton.click();
        }
    } catch (e) {
        alert('Error in submit:' + e.message);
    }
}
