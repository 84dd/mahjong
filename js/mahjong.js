var MJ = function(){
	var _this = this;
	_this.isLoad = false;//是否从存储中加载游戏数据
	var $unknow = $("#unknow");
	var $know = $("#know");

	//游戏数据
	var gameData = {};

	//存储
	var setGameData = function(){
		localStorage.setItem("game", JSON.stringify(gameData));
	};

	//清空
	var clearGameData = function(){
		localStorage.setItem("game", "");
	};

	//获取
	var getGameData = function(){
		var tmp = localStorage.getItem("game");
		if(!!tmp) return $.parseJSON(tmp);
		return {
				//玩家：游戏数据，记录已知牌面，数据格式为{allkey:'',mahjong:{key:{index:index,num:num}}}
				west	: {}, //上家
				south	: {}, //本家，这里的牌并不是已经打出去的牌
				east	: {}, //下家
				north	: {}, //对家
				unknow	: {} //未出的牌游戏数据，记录牌面和个数，数据格式为{mahjong:num}，有变化的数据
			};
	};

	//设置玩家数据
	var setPlayerData = function(direction, data, count){
		gameData[direction] = gameData[direction] || {allkey:"",mahjong:{}};
		gameData[direction].allkey = gameData[direction].allkey || "";
		gameData[direction].mahjong = gameData[direction].mahjong || {};

		var mahjong = data.mahjong+"";
		var index = data.index;
		var tmp = gameData[direction].mahjong[mahjong] || {};
		var num = tmp.num || 0;
		data.num = num+count;
		gameData[direction].mahjong[mahjong] = data;
		if(count == -1){
			gameData[direction].allkey = gameData[direction].allkey.replace(mahjong,"");
		}else{
			gameData[direction].allkey += mahjong;
		}
		
		setGameData();
	};

	//通过方位和键值获取麻将代码
	var getMahjong = function(direction, option){
		var type = option.type || south;
		var index = option.index || 0;
		var key = "";
		if(/west|east/.test(direction)){
			key = _this.H[type];
		}else{
			key = _this.V[type];
		}
		return key.split("")[index];
	};

	//获取玩家打出的所有牌
	var getOutkey = function(){
		var allkey = "";
		allkey += gameData["west"].allkey||"";
		allkey += gameData["south"].allkey||"";
		allkey += gameData["east"].allkey||"";
		allkey += gameData["north"].allkey||"";
		var outkey = {};
		$.each(allkey.toLowerCase().split(""), function(){
			var num = outkey[this] || 0;
			outkey[this] = ++num;
		});
		return outkey;
	};

	//对某个玩家的牌进行排序，规则：万、条、饼、大字
	var sortMahjong = function($div){
		var tmp = {wangzi:{}, tiaozi:{}, bingzi:{}, dazi:{}, other:{}};
		$div.find(".mahjong").each(function(){
			var $this = $(this);
			var data = $this.data();
			var type = data.type || "other";
			var index = data.index;
			tmp[type] = tmp[type] || {};
			tmp[type][index] = tmp[type][index] || {};
			var num = tmp[type][index].num || 0;
			tmp[type][index].num = num+1;
			tmp[type][index].node = $this;
			tmp[type][index].data = data;
		});
		$div.empty();
		$.each(["wangzi","tiaozi","bingzi","dazi","other"], function(){
			$.each(tmp[this], function(){
				for(var i=0; i<this.num; i++){
					$div.append(this.node.clone().data(this.data));
				}
			});
		});
	};

	//竖牌
	_this.V = {
		wangzi : "qwertyuio", //一万到九万
		tiaozi : "asdfghjkl", //一条到九条
		bingzi : "zxcvbnm,.", //一饼到九饼
		dazi   : "12345679"   //东南西北白发中反
	};
	
	//横牌
	_this.H = {
		wangzi : "QWERTYUIO", //一万到九万
		tiaozi : "ASDFGHJKL", //一条到九条
		bingzi : "ZXCVBNM<>", //一饼到九饼
		dazi   : "!\"#$%&')"  //东南西北白发中反
	};

	//初始化桌面
	var createDesktop = function(){
		var model = $("#one-model").html();
		$.each([
		{data:_this.V.wangzi,type:"wangzi"},
		{data:_this.V.tiaozi,type:"tiaozi"},
		{data:_this.V.bingzi,type:"bingzi"},
		{data:_this.V.dazi,  type:"dazi"}
		], function(){
			var type = this.type;
			var data = this.data;
			$.each($("[data-type="+type+"]"), function(){
				var $div = $(this);
				$div.empty();
				var prefix = $div.data("prefix");

				$.each(data.split(""), function(i, mahjong){
					if(/9|\)/.test(this)) return;

					var $html = $(model);
					$html.attr({id:prefix+"-"+mahjong}).find(".mahjong").data({index:i, mahjong:mahjong, type:type});
					prefix!="know" && $html.find(".mahjong").html(mahjong);
					$div.append($html);
				});
			});
		});

		//已打出的牌
		$know.find(".one").addClass("gray");
		$know.find(".mahjong").html("&nbsp;");
		$know.find(".num").html(0);
		$know.find(".plus , .minus").remove();

		//打牌
		$unknow.find(".plus , .minus").filter(":not(.transparent)").click(countFun);
		$unknow.find(".plus , .minus").filter(".transparent").dblclick(countFun);

		//从存储中映射数据
		$.each(gameData.unknow, function(mahjong, num){
			var clickNum = 4 - num;
			var $this = $("#unknow-"+mahjong);
			for(var i=0; i<clickNum; i++){
				$this.find(".minus").filter(":not(.transparent)").click();
			}
		});
	};

	//加减牌
	var countFun = function(){
		var $one = $(this).parents(".one:eq(0)");
		var $mahjong = $one.find(".mahjong");
		var $num = $one.find(".num");
		var mahjong = $mahjong.data("mahjong");
		var num = $num.html()*1 + $(this).data("count")*1;
		num = num<0 ? 0 : num>4 ? 4 : num;
		

		//处理未出的牌
		$num.html(num);
		$mahjong.html(mahjong);
		if(num == 1){
			$one.addClass("red").removeClass("gray");
		}else if(num == 0){
			$one.addClass("gray").removeClass("red");
			$mahjong.html("&nbsp;");
		}else{
			$one.removeClass("gray red");
		}

		//处理已出的牌
		var konwNum = 4 - num;
		var $knowOne = $("#know-"+mahjong);
		$knowOne.find(".num").html(konwNum);
		$knowOne.find(".mahjong").html(mahjong);
		if(konwNum == 4){
			$knowOne.addClass("black").removeClass("gray");
		}else if(konwNum > 0){
			$knowOne.addClass("gray").removeClass("black");
		}else{
			$knowOne.find(".mahjong").html("&nbsp;");
		}

		//处理存储
		gameData.unknow[mahjong] = num;
		setGameData();
	};
	
	//给每家设置反牌
	var position = {
		west:{
			node:$(".west"),
			mahjong:")",
			placement:"right"
		},
		south:{
			node:$(".south"),
			mahjong:"9",
			placement:"top"
		},
		east:{
			node:$(".east"),
			mahjong:")",
			placement:"left"
		},
		north:{
			node:$(".north"),
			mahjong:"9",
			placement:"bottom"
		}
	};
	var createFan = function(direction){
		var thisData = position[direction];
		var $div = thisData.node;
		$div.empty();
		for(var i=0; i<13; i++){
			$div.append("<span class=mahjong>"+thisData.mahjong+"<span>");
		}

		//初始化玩家的牌面
		var index = 0;
		$.each(gameData[direction].mahjong || {}, function(i,data){
			for(var c=0; c<data.num; c++){
				$div.find(".mahjong:eq("+index+++")").html(getMahjong(direction,data)).data(data);
			}
		});
		sortMahjong($div);
	};

	//玩家打牌
	var play = function(){
		var $mahjong = $(this);
		var $div = $mahjong.parents("[data-direction]:eq(0)");
		var mahjong = $mahjong.data("mahjong");
		var direction = $div.data("direction");
		var thisData = position[direction];
		var placement = thisData.placement;

		//其他牌
		$(".player .mahjong").removeClass("hover").tooltip("destroy");
		$(".popover").remove();

		$mahjong.addClass("hover").tooltip({
			html:true,
			placement:placement,
			container:"body",
			trigger:"click",
			title:$("#play-model").html(),
			delay: 0
		}).tooltip("show");

		//tooltip后，获取元素
		var $play = $(".play");
		var $show = $play.find("[data-play=show]");
		var $hide = $play.find("[data-play=hide]");
		var $out  = $play.find("[data-play=out]");

		if(/9|\)/.test($mahjong.html())){
			$hide.hide();
			$play.find("#play-hide").hide();
		}else{
			$show.hide();
			$play.find("#play-show").hide();
		}


		//给玩家明牌
		$show.click(function(){
			var outkey = getOutkey();
			var $tmp = "";
			if(direction == "south"){
				$tmp = $("#unknow").clone(true);
				$tmp.find(".mahjong").each(function(){
					$(this).html($(this).data("mahjong"));
				});
			}else{
				$tmp = $("#know").clone(true);
			}
			$tmp.find(".opt").hide();
			$.each($tmp.find(".one"), function(){
				var $one = $(this);
				var num = $one.find(".num").html()*1;
				var mahjong = $one.attr("id").split("-")[1];
				var outnum = outkey[mahjong] || 0;
				if(direction == "south"){
					if(4 - outnum <= 0) $one.remove();
				}else{
					if(num - outnum <= 0) $one.remove();
				}
			});
			if($tmp.find(".one").length == 0){
				$tmp.append("<p>Oops!!没有可显示的牌啦</p>");
			}

			$tmp.find(".mahjong").click(function(){
				var $thisMahjong = $(this);
				var _data = $thisMahjong.data();
				var thisMahjong = getMahjong(direction,_data);
				$mahjong.html(thisMahjong).data(_data);
				$show.add($hide).toggle();
				$play.popover("destroy");
				$mahjong.removeClass("hover").tooltip("destroy");

				//存储玩家的牌
				setPlayerData(direction, _data, 1);

				//排序
				sortMahjong($div);
			});
			$play.popover({
				html:true,
				placement:placement,
				container:"body",
				trigger:"click",
				content:$tmp,
				delay:0
			});
		});

		//撤销玩家明牌
		$hide.click(function(){
			$show.add($hide).toggle();
			$mahjong.html(thisData.mahjong);
			$play.popover("destroy");
			$mahjong.removeClass("hover").tooltip("destroy");

			//存储玩家的牌
			setPlayerData(direction, $mahjong.data(), -1);
			$mahjong.data({index: 7,mahjong: thisData.mahjong});

			//排序
			sortMahjong($div);
		});

		//退出打牌模式
		$out.click(function(){
			$mahjong.removeClass("hover").tooltip("destroy");
			$(".popover").remove();
		});
	};
	$(".player").delegate(".mahjong", "mouseenter" , play);
	$(".player").delegate(".mahjong", "click" , play);

	//初始化一局
	this.init = function(isLoad){
		_this.isLoad = isLoad === true ? true : false;
		if( !_this.isLoad ) clearGameData();

		gameData = getGameData();

		createDesktop();
		createFan("west");//初始化上家west
		createFan("south");//初始化本家south
		createFan("east");//初始化下家east
		createFan("north");//初始化对家north
	};

	this.init(true);
};