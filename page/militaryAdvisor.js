if (typeof zJS == "undefined") {
    zJS = {};
}

if (typeof zJS.Page == "undefined") {
    zJS.Page = {};
}

zJS.Page.militaryAdvisor = {
    init : function() {
	var $js_MilitaryMovementsFleetMovementsTable=$('#js_MilitaryMovementsFleetMovementsTable');
        $js_MilitaryMovementsFleetMovementsTable.find('td').each(function(){
			$(this).css('padding', '4px 0px').removeClass('right');
		});
		
        // Отображение войск и флотов в военном советнике.
        $js_MilitaryMovementsFleetMovementsTable.find('tr:not(.ikaeasy_complete)').has('td').each(function(){
            var wrapper = $('<div class="ikaeasy_transport_main"></div>');

			if($('.unit_detail_icon', this)[0] != null){
				$('.unit_detail_icon', this).each(function(){
					$(wrapper).append($(this).addClass('ikaeasy_transport_unit'));
				});

				$('td', this).eq(3).empty().append(wrapper).attr('colspan', '2');
				$('td', this).eq(4).remove();
				$(this).addClass('ikaeasy_complete');
			}
        });
    },

    refresh : function() {
        this.init();
    }
};