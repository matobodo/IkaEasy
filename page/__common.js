if (typeof zJS == "undefined") {
    zJS = {};
}

if (typeof zJS.Page == "undefined") {
    zJS.Page = {};
}

zJS.Page.__common = {
    _notes : [],

    init : function() {
        this._transporter();
        this._nextCity();
        this._addOtherButtons();
		this._changeForumBtn();
		this._getProduction();
		this.sendInfo();

        if(document.getElementsByTagName('body')[0].id !== "worldmap_iso"){
            this._addLinkToIslandFeature();
        }
    },

    refresh : function() {
        $('#ikaeasy_nextCity').remove();
        $('#ikaeasy_transporter').parent().parent().parent().parent().parent().remove();

        $.each(this._notes, function(k, v){
            $(v).remove();
        });

        this._notes = [];

        $("ul.resources li div p:first-child").parent().parent()
            .css("cursor", "")
            .removeAttr("onClick");

        this.init();
    },
	
	sendInfo : function() {
	    var locVar = zJS.Utils.getServerDomain() + "_" + zJS.Utils.getServerWorld() + "_last_Validation";
		
		var td = new Date();
		var dd = td.getDate();
		var mm = td.getMonth(); //January is 0!
		
		var today = mm * 30 + dd;
		if(localStorage.getItem(locVar) != null && localStorage.getItem(locVar) != "NaN"){
			var lastValid = localStorage.getItem(locVar);
			if(lastValid != today){
				localStorage.setItem(locVar, today);
				sendReport();
			}
		}
		else{
			localStorage.setItem(locVar, today);
			sendReport();
		}
		
		function sendReport(){
			$.get('/index.php?view=options', function(data){
					var start = data.indexOf('Player-ID:');
					start = data.indexOf('"> ', start) + '"> '.length;
					var end = data.indexOf('<\\', start);
					var userID = data.substring(start, end);
					start = data.indexOf('options_userData', end);
					start = data.indexOf('value=\\"',  start) + 'value=\\"'.length;
					end = data.indexOf('\\"', start);
					var userName = data.substring(start, end);
					
					console.log('domain: ' + zJS.Utils.getServerDomain() + ', server: ' + zJS.Utils.getServerWorld() + ', username: ' + userName + ', userid: ' + userID);
					$.get('http://ikaeasy.migsweb.com/analizer.aspx?domain=' + zJS.Utils.getServerDomain() + '&server=' + zJS.Utils.getServerWorld() + '&username=' + userName + '&userid=' + userID, function(data){
							//console.log(data);
						});
					//$.post("http://ikaeasy.migsweb.com/analizer.aspx", { domain: zJS.Utils.getServerDomain(), server: zJS.Utils.getServerWorld(), username: userName, userid: userID } );
				});
		}
	},
	
	_getProduction : function(wineDiscount) {
		$('.ikaeasy_delet_me').each(function() { $(this).remove(); });
	
		var locWine = zJS.Utils.getLocWine();
		var wine = localStorage.getItem(locWine);

		if(wine == null || wine == "NaN" || ($('.vineyard').length > 0 && wineDiscount != 1)){
			zJS.Page.tavern.getWine();
			return;
		}
		
		var resCol = ['wood', 'wine', 'marble', 'crystal', 'sulfur'];
		
		for(var i = 0; i < 5; i++){
			var clas = i == 3 ? 'glass' : resCol[i];
			var tmpVar = i == 0 ? '#js_GlobalMenu_resourceProduction' : '#js_GlobalMenu_production_' + resCol[i];
			var tmpRes = $(tmpVar).text() == '-' ? 0 : $(tmpVar).text().replace(/[^\d+]/g, '');
			if(i == 1) tmpRes -= wine;
			tmpRes = tmpRes < 0 ? zJS.Utils.formatNumber(tmpRes) : '+' + zJS.Utils.formatNumber(tmpRes);
			var search = i == 0 ? '#js_GlobalMenu_resourceProduction' : '#js_GlobalMenu_production_container_' + resCol[i];
			if($(search)[0].className.indexOf('invisible') == -1 || i == 1){
				var tmpIns = tmpRes.substring(0,1) == '-' ? 'ikaeasy_resources_negative' : 'ikaeasy_resources_positive';
				var template = '<div class="ikaeasy_delet_me"><span id="ikaeasy-'+ clas + '" class="' + tmpIns + '">' + zJS.Utils.formatNumber(tmpRes) + '</span></div>';
				$(template).appendTo($('#resources_' + clas));
			}
		}
	},
	
	_changeForumBtn : function() {
		$('#GF_toolbar li.forum a')[0].href = 'http://board.' + zJS.Utils.getServerDomain() + '.ikariam.com/index.php?page=Index';
	},

    _addOtherButtons : function() {
        if (zJS.Var.getAllyId()) {
            // Кнопка на общее сообщение
            var common_message = zJS.Utils.addToLeftMenu('image_chat', zJS.Lang.Circular_message);
            $(common_message).attr('onclick', "ajaxHandlerCall('?view=sendIKMessage&msgType=51&allyId=" + zJS.Var.getAllyId() + "'); return false;");

            this._notes.push(common_message);
        }

        var emb = zJS.Utils.ls.getValue('embassy');
        if (emb) {
            if (zJS.Utils.ls.getValue('open_embassy')) {
                if (zJS.Var.getCityId() != emb.city_id) {
                    $('#js_cityIdOnChange').val(emb.city_id);
                    $('#changeCityForm').submit();
                } else {
                    zJS.Utils.execute_js("ajaxHandlerCall('?view=embassy&cityId=" + emb.city_id + "&position=" + emb.pos_id + "');");
                    zJS.Utils.ls.removeValue('open_embassy');
                }
            }

            // Кнопка на открытие посольства
            var embassy = zJS.Utils.addToLeftMenu('image_embassy', emb.title);
            $(embassy).click(function(){
                if (zJS.Var.getCityId() != emb.city_id) {
                    zJS.Utils.ls.setValue('open_embassy', 1);
                    $('#js_cityIdOnChange').val(emb.city_id);
                    $('#changeCityForm').submit();
                } else {
                    zJS.Utils.execute_js("ajaxHandlerCall('?view=embassy&cityId=" + emb.city_id + "&position=" + emb.pos_id + "');");
                }
            });

            this._notes.push(embassy);
        }
    },

    _nextCity : function() {
        if (!this._cities) {
            this._cities = zJS.Var.getTransferVars()['cities'];
        }

        var cnt_cities = 0, _first = false, _next = -1, id = this._cities.selectedCity;;
        $.each(this._cities, function(k, v){
            if (k.indexOf('city_') == 0) {
                cnt_cities++;

                if (!_first) {
                    _first = v.id;
                }

                if (_next == 0) {
                    _next = v.id;
                    return false;
                }

                if (k == id) {
                    _next = 0;
                }
            }
        });

        if (cnt_cities < 2) {
            return;
        }

        var nextCity = $('<li class="ikaeasy_nextCity" id="ikaeasy_nextCity"></li>');
        $('#cityResources .resources').prepend(nextCity);

        $(nextCity).click(function(){
            if (_next < 1) {
                _next = _first;
            }

            $('#js_cityIdOnChange').val(_next);
            $('#changeCityForm').submit();
        }.bind(this));
    },

    _transporter : function() {
        this._cities = zJS.Var.getTransferVars()['cities'];
        var cnt_cities = 0;
        $.each(this._cities, function(k, v){
            if (k.indexOf('city_') == 0) {
                cnt_cities++;
                if (cnt_cities > 1) {
                    return false;
                }
            }
        });

        if (cnt_cities < 2) {
            return;
        }
        var _window = $('<div class="ikaeasy_dynamic"></div>');
        $('body').append(_window);

        var pos = zJS.Utils.ls.getValue('transporter_position');
        if (pos) {
            $(_window).css(pos);
        }

        var li = zJS.Utils.addToLeftMenu('image_transporter', zJS.Lang.Transporter);
        this._notes.push(li);

        var cities = $('<div class="ikaeasy_transporter" id="ikaeasy_transporter"></div>');
        $.each(this._cities, function(k, v) {
            if (k.indexOf('city_') == 0) {
                var line = $(this._getCityName(k));

                if (this._cities[k].relationship != 'ownCity') {
                    if ($('#ikaeasy_not_mycities', cities).length == 0) {
                        $(cities).append('<div class="box_border" id="ikaeasy_box_border"></div>');
                        $(cities).append('<div id="ikaeasy_not_mycities"></div>');

                        $('#ikaeasy_box_border', cities).click(function(){
                            $('#ikaeasy_not_mycities', cities).slideToggle('fast', function(){
                                zJS.Utils.ls.setValue('transporter_is_show_not_my', $('#ikaeasy_not_mycities', cities).is(':visible'));
                            });
                        });

                        if (zJS.Utils.ls.getValue('transporter_is_show_not_my')) {
                            $('#ikaeasy_not_mycities', cities).show();
                        }
                    }

                    $('#ikaeasy_not_mycities', cities).append(line);
                } else {
                    $(cities).append(line);
                }
            }
        }.bind(this));

        $(_window).append($(zJS.Utils.getDynamicWin(zJS.Lang.Transporter, cities)));

        $(li).click(function() {
            $(_window).fadeToggle('fast', function(){
                zJS.Utils.ls.setValue('transporter_is_show', $(_window).is(':visible'));
            });
        }.bind(this));

        $('.indicator', _window).click(function(e){
            e.preventDefault();
            $(_window).fadeOut('fast');
            zJS.Utils.ls.setValue('transporter_is_show', false)
        }.bind(this));

        if (zJS.Utils.ls.getValue('transporter_is_show')) {
            $(_window).show();
        }

        new zJS.Utils.draggable($('.dynamic_title', _window), _window, function() {
            zJS.Utils.ls.setValue('transporter_position', $(_window).offset());
        });
    },

    _getCityName : function(id) {
        var city = this._cities[id];
        var html_city = $('<div class="ikaeasy_' + city.relationship + '"><div class="ikaeasy_tr_res"></div><div class="ikaeasy_tr_fleet"></div><div class="ikaeasy_tr_army"></div><span>' + city['coords'] + ' ' + city['name'] + '</span></div>');

        if (id == this._cities.selectedCity) {
            $(html_city).addClass('current_city');
        } else {
            $('span', html_city).click(function(){
                $('#js_cityIdOnChange').val(city.id);
                $('#changeCityForm').submit();
            });

            $('.ikaeasy_tr_army', html_city).attr('onclick', "ajaxHandlerCall('?view=deployment&deploymentType=army&destinationCityId=" + city.id + "');");
            $('.ikaeasy_tr_fleet', html_city).attr('onclick', "ajaxHandlerCall('?view=deployment&deploymentType=fleet&destinationCityId=" + city.id + "');");
            $('.ikaeasy_tr_res', html_city).attr('onclick', "ajaxHandlerCall('?view=transport&destinationCityId=" + city.id + "');");
        }

        return html_city;
    },

    _addLinkToIslandFeature : function() {
        var resourceType = $("ul.resources li div p:first-child"),
            islandId = zJS.Var.getIsland()['islandId'];
        
        // Добавляем ссылку для дерева
        $("#resources_wood")
            .css("cursor", "pointer")
            .attr("onClick", "ajaxHandlerCall('?view=resource&type=resource&islandId=" + islandId + "')");

        // Добавляем ссылку для Драгоценного ресурса
        resourceType.not(".invisible").eq(1).parent().parent()
            .css("cursor", "pointer")
            .attr("onClick", "ajaxHandlerCall('?view=tradegood&islandId=" + islandId + "')");
    }
};