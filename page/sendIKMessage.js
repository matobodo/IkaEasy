﻿if (typeof zJS == "undefined") {
    zJS = {};
}

if (typeof zJS.Page == "undefined") {
    zJS.Page = {};
}
zJS.Page.sendIKMessage = {
	init : function() {
		$('#js_msgTextConfirm').bind('keydown.ctrl_return', function(){
			$('form#sendMessageBoxForm').submit();
		});
		if(localStorage['ikaiasy-msg-to-send'] != null && localStorage['ikaiasy-msg-to-send'] != ''){
			$('#js_msgTextConfirm').text(localStorage['ikaiasy-msg-to-send']);
			localStorage['ikaiasy-msg-to-send'] = '';
		}
	}
};