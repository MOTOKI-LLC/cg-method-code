(function () {
    'use strict';
    var csInterface = new CSInterface();
    function init() {
        $("#btn_test").click(function () {
            csInterface.evalScript('makeGroup()');
        });
    }
    init();
}());
