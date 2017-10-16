$.fn.serializeForm = function () {
    var forms = $(this).find('input[type=text], input[type=password]');
    return forms.map(function(){
        var $el = $(this);
        return {
            id: $el.attr('id') || $el.attr('name'),
            value: $el.attr('val') || $el.val()
        }
    });
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
            fillForm(request.setSettings);
            sendResponse({});
            break;
    }
});

function fillForm(setSettings) {
    $('body').deserialize(JSON.parse(setSettings.content));

    if (setSettings.autoSubmit) {
        try {
            var submitButton = $(setSettings.submitQuery);
            if (submitButton.length) {
                submitButton.click();
            } else {
                alert('Submit button query returned no results');
            }
        } catch (e) {
            alert('Error in submit query:' + e.message);
        }
    }
}
