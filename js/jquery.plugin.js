/**
 * created by lcs 2012-07-13 16:27:17
 * JQuery的 一些工具方法
 */

(function($){
	if(!$)return;
	
	//调试开关
	$.debug = true;
	 
	/**
	 * 信息打印
	 * @param e
	 */
	$.log = (function(){
		var f = function(){};
		if( window.console && window.console.debug ){
			f = function(){
				$.debug && window.console.debug.apply(window.console,arguments);
			};
		}else{/*
			var $de = $('<div debug="" style="display:none;position: fixed; _position: absolute; right: 0;    bottom: 0;    width: 300px;    height: 100px;    background: white;    border: 1px solid;    overflow: scroll;"></div>');
			var line = 0;
			f = function(e , de){
			    if( $de.parent().length == 0 )$de.appendTo("body");
			    if( e == "hide" )return $de.hide();
			    
			    $de.show().append(++line +  " : ").append(e).append("<br>").scrollTop(~(1<<31));
			};
		*/	
		}
		return  f;
	})();
	
	/**
	 * 刷新页面
	 * @param s		[可选] s秒后刷新页面
	 * @param url	[可选] 跳到指定的url
	 */
	$.refresh = function(s,url){
		if( $.type(s) == "string" ){url = s ; s = 0.1;}
		s = s  && s * 1000;
		s = s || 1;
		setTimeout(function(){ url? (window.location.href=url): window.location.reload();},s);
	};
	
	/**
	 * 阻止冒泡方法
	 */
	$.stopPropagation = function(e) {  
	    e = e || window.event;  
	    if(e.stopPropagation) { //W3C  
	        e.stopPropagation();  
	    } else {  
	        e.cancelBubble = true; //IE
	    }  
	}
	
	//重写jquery的$.ajax的函数
	$.myAjax = function(option){
		var _complete = option['complete'] ;
		option['complete'] = function( d1 ,d2 ){
			$.log([d1,d2,d1.responseText]);
			if(_complete)_complete(d1,d2 );
		};
		var _error = option['error'] ;
		option['error'] = function( d1 ,d2 ){
			if(_error)_error(d1,d2 );
		};
		
		option.url = option.url || "";
		option.url +=( option.url.indexOf("?")==-1 ?"?_" : "&_")+(new Date()*1+Math.random().toString().substring(2));
		return $.ajax(option);
			
	};
	//重写jquery的$.post函数
	$.post = function ( url , data , success , dataType ){
		if($.isFunction(data)){dataType=dataType||success;success = data;data=undefined;}
		return $.myAjax({
			  type: 'POST',
			  url: url,
			  data: data,
			  success: success,
			  dataType: dataType||'json'
		});
	};
	//重写上面的$.post函数，加上了localStorage功能
	$.postWithStorage = function ( url , data , success , storage , interval , dataType ){
		var fromLocal = false;
		if(!!localStorage){
			var apcTime = localStorage.getItem(storage+"Time")*1;
			var now = new Date().getTime();
			if(now - apcTime < interval){
				var localData = $.parseJSON(localStorage.getItem(storage));
				if(!!localData){
					fromLocal = true;
					success && success(localData);
				}
			}
		}
		if( !fromLocal ){
			$.post( url , data , function(data){
				success && success(data);
				if(!!localStorage){
					localStorage.setItem(storage+"Time", now);
					localStorage.setItem(storage, JSON.stringify(data));
				}
			} , dataType );
		}
	}
	
	//重写jquery的$.get函数
	$.get = function ( url , data , success , dataType ){
		if($.isFunction(data)){dataType=dataType||success;success = data;data=undefined;}
		return $.myAjax({
			  type: 'GET',
			  url: url,
			  data: data,
			  success: success,
			  dataType: dataType||'json'
		});
	};
	
	/**
	 * 格式化日期
	 * @param ms		时间戳(以毫秒为单位)，也可以是date类型数据
	 * @param format	[可选]时间格式,y:年 m:月 d:日 h:时 M:分 s:秒
	 * 					默认是"y-m-d h:M:s" =>2013-01-06 17:37:31
	 *
	 */
	$.formatDate = function(ms,format){
		var _d = $.type(ms)=="date"? ms : new Date(Math.floor(ms));
		var weekday = ["日", "一", "二", "三", "四", "五", "六"];
		
		format = format?format: "y-m-d h:M:s";
		var _add0 = function(n){return n < 10 ? "0"+n:n;};
		var _= {};
		_.y = _d.getFullYear();
		_.m = _add0(_d.getMonth()+1);
		_.d = _add0(_d.getDate());
		_.h = _add0(_d.getHours());
		_.M = _add0(_d.getMinutes());
		_.s = _add0(_d.getSeconds());
		_.w = "星期" + weekday[_d.getDay()];
		
		$.each(_,function(k,v){ format = format.replace(k,v); });
		return format;
	};
	
	/**
	 * 将String转为Date
	 * 时间格式为 y-m-d h:M:s(2013-10-12 09:29:46)
	 * @param str
	 */
	$.StrToDate = function(str){
		var date = false;
		str = $.trim(str||"");
		try{
			data = new Date(str);
		}catch (e) {}
		
		if( !date || !date.getTime() ){
			date = new Date();
			str = str.split(/\s/);
			str[0] = (str[0] || "").split(/\-/);
			str[1] = (str[1] || "").split(/:/);
			date.setFullYear(str[0][0] || 0, str[0][1]-1, str[0][2] || 0);
			date.setHours(str[1][0] || 0, str[1][1] || 0, str[1][2] || 0);
		}
		return date;
	};
	
	/**
	 * 将String转为星期几
	 * 时间格式为 y-m-d h:M:s(2013-10-12 09:29:46)
	 * @param str
	 */
	$.StrToWeekday = function(str){
		$.log(str);
		var date = $.StrToDate(str);
		$.log(date);
		var weekday = ["日", "一", "二", "三", "四", "五", "六"];
		return "星期" + weekday[date.getDay()];
	};
	
	/**
	 * 友好化日期
	 * @param ms	时间戳(以毫秒为单位)，也可以是date类型数据
	 * 				显示为与当前时间比较的时间间隔，如"15秒前"
	 */
	$.prettifyDate = function(ms){
		var _d = $.type(ms)=="date"? ms : new Date(Math.floor(ms));
		var _n = new Date( new Date() - (window.timeAsyn||0) );
		var _t = _n - _d;
		var text = "";
		if(_t < 10*1000){
			text = "刚刚";
		}else if(_t < 60*1000){
			text = $.formatDate(_t,"s秒前");
		}else if(_t < 60*60*1000){
			text = $.formatDate(_t,"M分钟前");
		}else if(_t < 6*60*60*1000){
			text = $.formatDate(_t-8*60*60*1000,"h小时前");
		}else if(_d > $.getZeroHour(_n, 0, 0)){
			text = $.formatDate(_d,"今天 h:M");
		}else if(_d > $.getZeroHour(_n, -1, 0)){
			text = $.formatDate(_d,"昨天 h:M");
		}else if(_d > $.getZeroHour(_n, -2, 0)){
			text = $.formatDate(_d,"前天 h:M");
		}else if(_d > $.getZeroHour(_n, null, 0)){
			text = $.formatDate(_d,"m月d日 h:M");
		}else if(_d > $.getZeroHour(_n, null, null)){
			text = $.formatDate(_d,"m月d日");
		}else{
			text = $.formatDate(_d,"y年m月d日");
		}
		return text;
	}
	
	$.getZeroHour = function(_n, day, month){
		var ms = new Date(_n);
		ms.setHours(0,0,0,0);
		if(day == null){
			ms.setUTCDate(0);
		}else if(day != 0){
			var _d = ms.getUTCDate() + day;
			ms.setUTCDate(_d);
		}
		if(month == null){
			ms.setUTCMonth(0);
		}else if(month != 0){
			var _M = ms.getUTCMonth() + month;
			ms.setUTCMonth(_M);
		}
		return ms;
	}
	
		
	/**
	 * 信息提示，要结合bootstrap使用
	 * @param message	信息内容
	 * @param id		[可选]标识Id
	 */
	$.alertMessage = (function(){
		var $alertMessage = $("<div class='alert' style='z-index: 1000;position: fixed;top: 0; right: 0;'><a class='close' data-dismiss='alert'>×</a></div>");
		
		return function(message , id){
			if( message == 'close' ){
				return $alertMessage.remove();
			}
			
			if( $alertMessage.parent().length == 0 ){
				$alertMessage.find("span").remove();
				$("body").append($alertMessage);
			}
			var $span = false;
			if( id ){
				$span = $alertMessage.find("span#"+id);
				$span = $span.length > 0 && $span;
			}
			
			if( !$span ){
				$span = $("<span "+ (id?"id='"+id+"'":"") +"></span>");
				$alertMessage.append($span);
			}
			$span.html(message+"<br>");
			
		};
	})(); 
	
	/**
	 * 信息弹出窗口
	 * @param opt 	1. 为string,打印信息
	 * 				2. 为object，参数如下
					  {
					  	title:	string 		[可选] 窗口标题
					  	message:string		打印的信息
					  	ok:		function	[可选] 确定事件回调函数
					  	close:	function	[可选] 关闭事件回调函数
					  	cancel:	function	[可选] 取消事件回调函数
					  	timeout:int			[可选] 设定自动关闭
					  }
	 *	@param fun	一般在第一个参数opt为string时用，此时为相对应的关闭事件回调函数
	 *	
	 *	example:
	 *		$.box("hello world");
	 *		$.box("hello world",function(){alert("closed");});
	 *		$.box({message:"hi~ ",title:"HI",ok:function(){alert("ok");}});
	 *	
	 *	说明：若没有引入bootstrap项目，弹出窗口为浏览器自带的
	 */
	$.browser = $.browser || {};
	$.box = (function(){		
		var	$box = $("<div class='modal' ><div class='modal-dialog' style='height: 0;'><div class='modal-content'><div class='modal-header' >box头部</div><div class='modal-body'>box内容</div><div class='modal-footer'>box底部</div></div></div></div>");
		
		var $back = $("<div class='modal-backdrop fade in'></div>");
		
		var $header = $box.find(".modal-header");
		var $body 	= $box.find(".modal-body");
		var $footer = $box.find(".modal-footer");
		
		$box.css({display:"none", overflow: "hidden", top: 200, "z-inde": 99999});
		$header.html("<a class='close animate' href=javascript: data-dismiss='modal' style=\"font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;\" >x</a><h3 style='font-size: 13px;font-family: 微软雅黑, 黑体, sans-serif;'>box标题</h3>");
		$footer.attr("style" , "padding: 12px 12px 12px;");
		$footer.html("<button class='btn btn-default' id=close >关闭</button><button class='btn btn-default' id=cancel >取消</button><button class='btn btn-success' id=ok >确定</button>");
		
		var $title  = $header.find("h3");
		var $ok 	= $footer.find("#ok");
		var $cancel = $footer.find("#cancel");
		var $close 	= $footer.find("#close");
		
		var ok, cancel, close;
		var con = document.compatMode == "CSS1Compat" ?  document.documentElement : document.body;
		
		var updateLocation = function(){
			var left = Math.floor( (con.clientWidth - $box.width() )*0.5 );
			$box.css({top: 240 , left: left < 0 ? 0 : left , position : "fixed" });
		};
		var show = function(){
			updateLocation();
			if( $box.parent().length == 0 ){
				$("body").append($box).append($back);
				$box.drag && $box.drag({handle:$box.find(".modal-header").css("cursor","move")}) && updateLocation();
				
				$("body").keyup(function(e){
					 e.keyCode == 27 && hide();
				});
			}
			
			//又是万恶的ie6
			!$.support.style && $("body").scrollTop(0);
			
			$box.css({top:0,opacity:0}).show().stop().animate({top:240,opacity:1});
			$back.show();
			
			return $box;
		};
		var hide = function(){
			close();cancel();
			$box.stop().animate({top:0,opacity:0},200,function(){$box.hide();});
			$back.hide();
			return $box;
		};
		
		$header.find(".close").click(hide);		
		$ok.click(function(){ var res = ok() !== false;		  close = cancel = function(){}; res && hide(); });
		$close.click(function(){ var res = close() !== false; close = cancel = function(){}; res && hide(); });
		$cancel.click(function(){ var res = cancel() !== false ;close = cancel = function(){};res && hide(); });
		
		var defaultOption = {
				title:"消息",
				width:600,
				okName:"确定",
				cancelName:"取消",
				closeName:"确定"
		};
		
		return function(opt,fun){
			if( opt == 'close' )return hide();
			$.type(opt) == "string" && (opt={message:opt,close:fun});
			
			opt = $.extend( $.extend( {} ,defaultOption  ) , opt );
			opt.message = opt.message || opt.html;
			
			close = opt.close || function(){};
			ok    = opt.ok    || function(){};
			cancel= opt.cancel|| function(){};
			
			if( opt.ok || opt.cancel ){
				$ok.show();
				$cancel.show();
				$close.hide();
			}else{
				$ok.hide();
				$cancel.hide();
				$close.show();
			}
			
			$ok.html( opt.okName );
			$cancel.html( opt.cancelName );
			$close.html( opt.closeName );
			
			$title.html(opt.title);
			$body.html(opt.message);
			$box.css("width" , opt.width );
			
			return show();
		};
	})();

	/**
	 * 背景遮罩
	 * @param [可选]	打印信息
	 */
	$.back =(function(){
		var html = '<div class=animate style="padding-top: 15%; color: #fff; font-size: 100px; text-align: center; width: 100%; height: 100%; position: fixed; top: 0; left: 0; background-color: rgb(0, 0, 0);opacity: 0.8;filter: alpha(opacity=80);display:none; "><span style=" margin-top: 50%;"></span></div>';
		var $html = $(html);
		return function(text){
			if( !text || text == 'close' ){
				return $html.hide();
			}
			!$html.parent().length && $("body").append($html);
			$html.show().find("span").html(text);
			return $html;
		};
	})();
	/**
	 * 异步提交当前节点里的所有 input、selest、textarea数据
	 * @param url 		发送请求地址
	 * @param callback  (可选)Function 发送成功时回调函数。
	 * @param type 		(可选)String  返回内容格式，xml, html, script, json, text, _default。
	 */
	$.fn.postData = function(url, data , callback , type) {
		if(typeof(data) == "function"){type = callback;callback = data ; data=!1;}
		
		if(this.check())
			return $.post(url , $(this).getPostData(data) , callback,(type == undefined ? 'json' : type));
	};

	$.fn.getPostData = function(data , formateType){
		var _postData = new $();
		this.each(function(){
			var _this = $(this);
			_postData = _postData.add(this.elements ? $.makeArray(this.elements) : _this.add(_this.find("input")).add(_this.find("select")).add(_this.find("textarea")));
		});
		formateType = formateType==undefined?true:formateType;
		return (data?$.param(data, formateType )+"&":"")+ $.param(_postData.serializeArray(),formateType);
	};
	
	/**
	 * 用于选取头像大小
	 * @param images "/head/1379317856441_348.jpg;/head/1379317856157_64.jpg;/head/1379317856143_50.jpg;/head/1379317856125_32.jpg"
	 * @param size "32" "50" "64"等
	 */
	$.getImageSize = function(images, size){
        if(size){
            var image = images;
            if(image){
                var splitImages = image.split(";");
                if(splitImages.length==1){
                    return image;
                }
                for(i in splitImages){
                    var items = splitImages[i].split("_");
                    if(items.length>1){
                        var temp = items[1];
                        if(temp.substring(0,temp.indexOf(".")) == size){
                            return splitImages[i];
                        }
                    }
                }
            }
        }
        return null;
	}
	
})(window.jQuery);




//输入验证
/**
 *	html:
	<form>
	<input id=test check-trigger="blur focus change" check-len="1-20" check-reg="\\d+" check-type="num" check-message="wrong" check-ok="ok" />
	<input check-type=email check-message="not a eamai" />
	<textarea check-trigger=blur check-len=1 check-ok="ok" />
	</form>
 *	check-trigger 	: 事件，多个事件用空格隔开
 *	check-len		: 输入长度，格式可为:"n"(或"n-m")，分别表示输入长度大于等于n(或大于等于n且小于等于m)
 *	check-type		: 数据输入类型：可为email、num等;
 *	check-reg		: 数据校验正则
 *	check-message	: 校验错误时打印的信息
 *	check-ok		: 校验正确时打印的信息
 *	check-target	: jquery selector,指定信息打印的地方
 *	
 *	手动调用：var res = $("#test").check();	
 *			  res = $("form").check(); 		//校验form表单下的所有数据
 *	check方法返回boolean类型数据
 */

(function($){
	if(!$)return;

	//计算string长度，汉字长度为2
	var strLen = function(str){
		str = str || "";
		return str.length + (str.match(/[^\x00-\xff]/g)||[]).length;
	};

	var checkType = {
			officePhone : /^0\d{2,3}(-)?[1-9]\d{6,7}$/,
			mobilePhone : /^1[3|4|5|8]\d{9}$/,
			email		: /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i,
			num			: /(^[1-9]\d*$)|(^0+[1-9]+\d*$)/,
			realNum		: /^\d+(\.\d+)?$/,
			url			: /^((https?|ftp):\/\/)?(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i
	};
	var _checkRange = function($input,range){
		if( !range )return true;
		var result = false;
		var num = $input.val()*1;
		range = range.split("~");
		if( $.isNumeric( range[0] ) ){
			result = num >= range[0];
			if( result && $.isNumeric( range[1] ) ){
				result = num <= range[1];
			}
		}else if($.isNumeric( range[1] ) ){
			result = num <= range[1];
		}
		return result;
	};
	$.fn.checkResult = function( check ,message){
		var _input = $(this);
		var html = false;
		var checkMessge = _input.parent(".inp").length == 0 ? _input : _input.parent(".inp");
		var checkClass = _input.parents(".control-group:eq(0)");
		var target = $(_input.attr("check-target"));
		
		checkClass =  checkClass.length == 0 ? _input.parent(".inp"):checkClass;
		checkClass =  checkClass.length == 0 ? _input:checkClass;
		
		checkMessge.nextAll("[check-result]").remove();
		target.empty();
		
		if( check == undefined ){
			return checkClass.removeClass("error success");
		}else if(check){
			checkClass.removeClass("error").addClass("success");
			message = message||_input.attr("check-ok");
		}
		else{
			checkClass.addClass("error").removeClass("success");
			message =  message||_input.attr("check-message");			
		}
		
		if( message ){
			html = $(message);
			html = html[0]?html:$("<span class='help-inline'>"+message+"</span>");
		}
		
		
		if(html){
			html.attr("check-result","");
			if( target.length > 0 ){
				target.html(html);
			}
			else{
				var _class = checkMessge.attr("class");
				if( _class && _class.indexOf("inp") != -1 ){
					while( checkMessge.next().length == 1 ){ checkMessge = checkMessge.next(); }
				}
				checkMessge.after(html);
			}
		}
		return this;
		
	};
	$.fn.check = function( callBack ){
		callBack = callBack || function(){};
		
		var $this = $(this);
		var $inputs = $this.filter("input,textarea").add($this.find("input,textarea"));		
		var result = true ;
		$inputs.each(function(index,input){
			var $input = $(input);
			var checkType = $input.attr("check-type");
			var checkReg  = $input.attr("check-reg");
			var checkRange = $input.attr("check-range");
			var check = true ;
			
			if(checkReg) check = check &&  $input.checkRegexp(new RegExp(checkReg));
			if(checkType)check = check && $input.checkRegexp(checkType);			
			if(checkRange)check = check && _checkRange($input,checkRange);			
			check = check && $input.checkLength();			
			
			callBack( $input ,check  ) != false && $input.checkResult(check);
			result = result && check;
		});
		
		return result ;
	};
	
	$.fn.checkLength = function(min,max){
		var result = true ;
		for( var _i = 0 ; _i < this.length ; _i++) {
			var _input = $(this[_i]);
			var checkLen = _input.attr("check-len");
			var val = (_input.val() || "");
			val = "".trim?val.trim():val;
			var len = strLen(val);
			var tmp = true;
			if(checkLen){
				checkLen = checkLen.split("-");
				min = min || Math.floor(checkLen[0]);
				max = max || Math.floor(checkLen[1]);
				
			}
			tmp = ( !$.isNumeric(min) || len >= min  )&&( !$.isNumeric(max) || len <= max ); 
			
			result = result && tmp;
		}
		return result;
	};
	
	$.fn.checkRegexp = function(type){ 
		if(this.length == 0 )return true;
		
		var reg = checkType[type] || type ;
		if( $.type(reg) != "regexp" ){
			return false ;
		}
		
		var b = true ;
		for( var i = 0 ; i < this.length ; i=i+1 ){
			var a = reg.test($(this[i]).val());
			b = b && a ;
		}
		return b ;
		
	};
	
	$.fn.bindCheckEvent = function(cb){
		$(this).find("[check-trigger]").each(function(){
			var $this = $(this);
			var trigger = $this.attr("check-trigger");
			$this.off( trigger );
			$this.on( trigger,function(){ $this.check(cb);});
		});
	};
	$(function(){
		$(document).delegate("[check-trigger]","click focus mouseover",function(){
			var $this = $(this);
			var trigger = $this.attr("check-trigger");
			$this.off( trigger );
			$this.on( trigger,function(){ $this.check();});
			$this.attr("check-trigger-delegated",trigger);
			$this.removeAttr("check-trigger");
		});
		
		$(document).delegate("[check-len],[check-type],[check-reg]","focus",function(){ $(this).checkResult() });
		$(document).delegate("[check-len],[check-type],[check-reg]","blur",function(){ $(this).check( function( $input , res ){ if( $input.val()=="" && !res )return false; } ); })
	});
})(window.jQuery);


//上传文件
;(function($){
	if(!$)return;
	
	if( window.FormData && window.XMLHttpRequest && new window.XMLHttpRequest().upload && $("<input type=file>")[0].files ){
		/*********************************************/
		//新时代的文件异步上传
		
		/**
		 * @param url 上传文件url
		 * @param data 		[可选] 提交的数据
		 * @param callback 	[可选] 上传完成后的回调函数
		 * @param progress 	[可选] 进度
		 * @param type		[可选] 返回数据类型
		 */
		$.fn.uploadFile = function(url , data , cb , progress, type){
			if( $.type(data) == 'function' ){
				type = progress;
				progress = cb;
				cb = data;
				data = {};
			}
			if( $.type(progress) != 'function' ){
				var t = type;
				type = progress;
				progress = t;
			}
			if( $.type(progress) != 'function' ){
				progress = function(){};
			}
			
			type = type || 'json';

			var formData = new FormData();
			var xhr = new XMLHttpRequest();
			this.filter(":file").add(this.find(":file")).each(function(){
				formData.append(this.name,this.files[0]);
			});

			$.each(data,function(k,v){
				formData.append(k,v);
			});

			xhr.upload.addEventListener("progress",function(e){
				progress(e.loaded/e.total , e);
			},false);

			xhr.addEventListener("load",function(e){
				if( !cb )return;
				var data = xhr.response;
				if( type == 'json' ){
					try{data = $.parseJSON(data);}catch (e) {}
				}else if( type == 'xml' ){
					try{data = $.parseXML(data);}catch (e) {}
				}else if( type == 'html' ){
					try{data = $.parseHTML(data);}catch (e) {}
				}
				cb(data,e);
			},false);
			
			this.abortUpload = function(){
				xhr.abort();
			};
			
			xhr.addEventListener("error",function(e){},false);			
			xhr.open("POST", url);  
	        xhr.send(formData);
	        
	        return this;
		};
		
		return;
	}
	
	/*********************************************/
	//古代的伪异步上传
	var getId = function(){return "_"+(new Date().getTime())+(Math.random()+"").substring(2);};
	var _style = "position:absolute;top:-10000px;left:-10000pxpx;opacity:0;.filter:alpha(opacity=0)";
	var createIframe = function(id){
		return $frame = $("<iframe style='"+_style+"' id='"+id+"' name='"+id+"' src='javascript:;'></iframe>");
	};
	var createForm = function(id , $inputFile , data){
		var $form = $("<form method='POST' enctype='multipart/form-data' id='"+id+"' style='"+_style+";margin-right: 300px;' ><input type=submit /></form>");
	
		$inputFile.each(function(){
			var $this = $(this);
			 $this.before($this.data("clone"));
			 $form.append($this);
		});
		$.each(data||{},function(k,v){
			$form.append($("<input type=hidden >").attr({name:k,value:v}));
		});
		
		return $form;
	};
	
	/**
	 * @param url 上传文件url
	 * @param data 		[可选] 提交的数据
	 * @param callback 	[可选] 上传完成后的回调函数
	 * @param progress 	[可选] 伪进度
	 * @param type		[可选] 返回数据类型
	 */
	$.fn.uploadFile = function(url , data , callback , progress, type){
		var $this = $(this);
		if( $.type(data) == 'function' ){
			type = progress;
			progress = callback;
			callback = data;
			data = {};
		}
		if( $.type(progress) != 'function' ){
			var t = type;
			type = progress;
			progress = t;
		}
		if( $.type(progress) != 'function' ){
			progress = function(){};
		}
		
		callback = callback||function(){};
		type = type||'json';
		
		var $files = this.filter(":file").each(function(){
			var $this = $(this);
			var $clone = $this.clone().attr("disabled",true);
			$clone.data("this",$this);
			$this.data("clone",$clone);
		});
		
		var id = getId();
		var iframeId = "_iframe"+id;
		var formId = "_form"+id;
		var $iframe = createIframe(iframeId);
		var $form = createForm(formId, $files , data);
		var timeId = 0;
		$form.attr({action:url,target:iframeId});
		
		$("body").append($iframe);
		$("body").append($form);
		
		$iframe.on("load",function(e){
			var data = $(this).contents().find('body').html();
			
			if( type == 'json' )try{data =  $.parseJSON(data);}catch (e) {}
			if( type == 'xml' )try{data =  $.parseXML(data);}catch (e) {}
			
			$files.each(function(){
				var $this = $(this);
				$this.data("clone").before($this);
				$this.data("clone").remove();
			});
			
			setTimeout(function(){
				$iframe.remove();
				$form.remove();
			},300);
			$this.abortUpload = function(){};
			clearInterval(timeId);
			progress(1);
			callback(data);
		});
		
		//伪进度
		var per = 0;
		timeId = setInterval(function(){
			per += Math.random()*0.05;
			per < 1 ? progress(per) : clearInterval(timeId);
		}, 90);
		
		$form.submit();
		
		$this.abortUpload = function(){
			$files.each(function(){
				var $this = $(this);
				$this.data("clone").before($this);
				$this.data("clone").remove();
			});
			$iframe.remove();
			$form.remove();
		};
		
		return $this;
	};	
	
})(window.jQuery);

//cookie 的相关操作
(function($){ 
	if(!$)return;
	
	$.cookie = {
		get:function(key){
			var c = document.cookie+";";
			var _start = c.indexOf(key+"=");
			var _end = _start==-1?-1:c.indexOf(";",_start);
			return escape(c.substring(_start,_end).split("=")[1]);
		},
		set:function(key,value,option){
			option = option || {};
			option.path = option.path ||  $.sc.frontPath;
			var tmp = "";
			$.each(option , function(k,v){
				tmp += ";"+k+"="+v;
			});
			document.cookie=key+"="+escape(value)+tmp;
			return document.cookie;
		}
	};
	
})(window.jQuery);

//拖动、放大、旋转
(function($){
	if(!$)return;
	$.fn.drag = function(option){
	if( $.type(option) == 'string' )option = {handle:$(option)};
	option = option||{};
	var _drags = this;
	var _z_index = 1 ;
	this.length > 1 && (option.handle = false);
	for( var i = this.length -1 ; i >= 0 ; i-- )
	(function(_this){
		var _lock = false , _oldX , _oldy;
		var _thisOffset = _this.offset();
		var _parentOffset = _this.offsetParent().offset();
		var _handle = option.handle?$(option.handle):_this;
		var _left = _thisOffset.left-_parentOffset.left;
		var _top = _thisOffset.top-_parentOffset.top;
		_this.css({position:'absolute' , left: _left , top: _top});
		
		_handle.mousedown(function(e){
			_lock=true;
			_oldX = false;
			_oldY = false;
			//var _this = $(this);
			var tmp = _this.css('z-index');
			var p = _this.position();
			_left = p.left;
			_top  = p.top;
			$.isNumeric(tmp) && tmp > _z_index && ( _z_index = Math.floor(tmp));
			_this.css('z-index',_z_index++);
			return false;
		})
		.mouseup(function(e){_lock=false;})
		.mouseover(function(e){_lockd=false;})
		.mousemove(function(e){
			if(!_lock)return e;
			
			_left += _oldX==false?0:(e.clientX-_oldX);
			_top  += _oldY==false?0:(e.clientY-_oldY);
			_this.css({left:_left,top:_top});
			
			_oldX = e.clientX;
			_oldY = e.clientY;
			return false;
		});
		$("body").mousemove(function(e){
			if(!_lock)return e;
			
			_left += _oldX==false?0:(e.clientX-_oldX);
			_top  += _oldY==false?0:(e.clientY-_oldY);
			_this.css({left:_left,top:_top});
			
			_oldX = e.clientX;
			_oldY = e.clientY;
			return false;
		}).mouseup(function(e){_lock=false;});
		
	})($(this[i]));
	return _drags;
	
}

$.fn.zoom = function(){
	var fn = function( e ){
		e = e.originalEvent||{};
		var s = e.wheelDelta || e.detail ;//e['wheelDelta']!= undefined ?e['wheelDelta']:-e['detail'];
		var eventX =  e.offsetX || e.layerX ;
		var eventY =  e.offsetY || e.layerY ;
		
		var oldPosition = $(this).position();
		
		var oldHeight = $(this).height() ;
		var oldWidth  = $(this).width() ;
		if( s > 0 ) // 上
		{
			s = 1.1 ;
		}
		else	//下
		{
			s = 0.9 ;
		}
	
		$(this).height(oldHeight * s);
		$(this).width( oldWidth  * s);
		$(this).css("top" , (oldPosition.top + eventY*(1-s)) + "px");
		$(this).css("left" , (oldPosition.left+ eventX*(1-s)) + "px");
		
		return false ;
		
	} ; 
	
	this.bind("DOMMouseScroll" , fn );
	this.bind("mousewheel" , fn );
	return this;
};

$.fn.rotate = function(deg){
	deg = deg*1 || 0;
	var css = {};
	if( $.browser.msie){
		css.filter= "progid:DXImageTransform.Microsoft.BasicImage(Rotation="+(Math.floor((deg/90)))%4+")" ;
	}
	if( $.browser.opera ){
		css['-o-transform']="rotate("+deg+"deg)";
	}
	if( $.browser.mozilla  ){
		css['-moz-transform']="rotate("+deg+"deg)";

	}
	if( $.browser.safari || $.browser.webkit){
		css['-webkit-transform']="rotate("+deg+"deg)";
	}
	this.css(css);
	this.attr("rotate",deg);
	return this;
};

})(window.jQuery);


//设置&获取表单的值
(function($){
	if( !$ || $.fn.setData )return;
	
	$.fn.setData = function(data,key){
		var _this = $(this);
		$.each(data ||{}, function(name,value){
			try{
				name = "name='" + ( key ? key+"."+name : name ) + "'";
				_this.find("input["+name+"]:not([type=radio],[type=checkbox]),textarea["+name+"],select["+name+"]").val(value);
				
				_this.find("input["+name+"][type=radio][value="+value+"]").attr("checked",true);
				_this.find("input["+name+"][type=checkbox][value="+value+"]").attr("checked",true);
			}catch (e){}
		});
		return _this;
	};
	
	$.fn.getData = function(){
		var data = {};
		this.find("[name]:not([type=radio],[type=checkbox])").each(function(){
			var _this = $(this);
			data[_this.attr("name")] = _this.val();
		});
		this.find("[name][type=radio]:checked,[name][type=checkbox]:checked").each(function(){
			var _this = $(this);
			data[_this.attr("name")] = _this.val();
		});
		return data;
	};
})(window.jQuery);

//设置html
(function($){
	if( !$ )return;
	$.fn.setHtml = function(data){
		var $this = this;
		$.each( data , function(k,v){
			$this.find("[html-"+k+"]").html(v);
		});
		return $this;
	};
	
	$.fn.setTitle = function(data){
		var $this = this;
		$.each( data , function(k,v){
			$this.find("[html-"+k+"]").prop({title:v});
		});
		return $this;
	};
})(window.jQuery);

/**
 * 以粘贴或拖拽的形式获取图片
 */
(function($){
	$.fn.getImage = function(cb){
		var $this = this;
		if( !window.FileReader )return this;
		
		$this.getFile(function(file){
			var reader = new FileReader();
			reader.readAsDataURL(file);
			reader.onload =function(e){
				/^data:image.+/.test(reader.result) && cb && cb.call && cb.call($this,reader.result,file);
			};
		});
		return $this;
	};

	$.fn.getFile = function(cb){
		if(!$.isFunction(cb))return this;

		var $this = $(this);
		$this.on("paste",function(e){
			if( e.originalEvent.clipboardData && e.originalEvent.clipboardData.items && e.originalEvent.clipboardData.items[0] ){
				var file = e.originalEvent.clipboardData.items[0].getAsFile();
				cb.call($this,file , [file]);
			}
			return e;
		}).on("dragenter",function(e){
			$this.addClass("drag");
		}).on("dragleave",function(e){
			$this.removeClass("drag");
		}).on("drop",function(e){
			$this.removeClass("drag");
			var file = e.originalEvent.dataTransfer && e.originalEvent.dataTransfer.files && e.originalEvent.dataTransfer.files[0];
			cb.call($this,e.originalEvent.dataTransfer.files[0] , e.originalEvent.dataTransfer.files);
			e.preventDefault();
		}).filter(":file").change(function(){
			if( this.files && this.files.length > 0 ){
				cb.call($this,this.files[0],this.files);
			}
		});
		return this;
	};
})(window.jQuery);

(function($){
	if(!$)return;
	//对一个date picker插件
	$.fn.datePicker = function(opt){
		opt = opt ||{};
		opt.onpicked = opt.onpicked || opt.ok ;
		this.each(function(){
			WdatePicker($.extend({el:this},opt));
		});
		return this;
	};
})(window.jQuery);