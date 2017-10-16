(function ($) {
    function triggerEvent(elem, eventName) {
        var evt = document.createEvent("HTMLEvents");
        evt.initEvent(eventName, true, true);
        elem.dispatchEvent(evt);
    }

    $.fn.extend({
        deserialize: function (form) {
            var $self = $(this);
            $self.find(":input").not('button, input[type=image], input[type=submit], input[type=hidden], input[type=button]')
                .each(function (index) {
                    var $el = $(this);
                    var id = $el.attr("id") || $el.attr("name");
                    if (!id){
                        return true;
                    }	
                    if ($el.prop('disabled') === true) {
                        return true;
                    }
                    if ($el.is('input')) {
                        $el.val(form[id] || '');
                        var node = $el.get(0);
                        triggerEvent(node, 'input');
                        triggerEvent(node, 'blur');
                        return true;
                    }
                });
            return $self;
        }
    });
}(jQuery));
