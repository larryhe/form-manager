function getFormList(){
    var items = [];
    for(var i=0; i<localStorage.length; i++){
        var key = localStorage.key(i);
        var item = localStorage.getItem(key);
        if(key.indexOf('__form_manager__') > -1){
            items.push(JSON.parse(item));
        }
    }
    return items;
}

