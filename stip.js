/*
 * 复杂tip组件
 * 2013-07-24 郑弋天
 * 适用于tip内容复杂需动态渲染的情况，简单tip请使用jtip
 *
 *说明：
 * 	$(selector).stip( ops ); //直接绑定
 * 	或
 * 	$.stip(target, ops); //代理模式
 *
 * 	$.stip.hide(); //关闭所有tip
 *
 *
 * [配置参数]
 * 	exCss : 额外追加的css样式
 * 	wraperCss : 重新指定外围样式
 * 	contentCss : 重新指定内容域样式
 * 	tplSelector : 指定页面已经存在的模板标识(id或类名)
 * 	tpl : 指定自定义的模板字符串，注意：tplSelector优先
 * 	loc : 提示位置，'b'位于目标下方[默认],'r'右侧
 *  enPos : 默认使用组件计算定位，否则使用tplSelector的样式信息或在showFn中自己定位。
 *  idFlag : 额外的id标记，默认为空，若不想与别的tip公用dom则可追加id标记
 * 	msg : 指定内容区显示的消息文本
 *  beforeShowFn : 由显示回调函数负责渲染内容区，若使用则msg无效
 * 	showFn : 显示且定位后的回调函数
 * 	hideFn : 隐藏时的回调函数
 * 	initFn : 初始化回调函数，只执行一次
 * 	width : 固定宽度
 * 	maxWidth : 最大宽度, 默认auto
 * 	ox : x轴偏移量
 * 	oy : y轴偏移量
 *	timeout : hover延迟时间
 * 	
 *	更新历史
 *		2013-08-24：增加适应屏幕功能，防止tip超出屏幕
 *		2014-05-08：增加timeout配置
 */
(function(window,$,undefined){
	'use strict';
	//主对象
	var Tip = function( type, dom, ops ){
			// 使用模式1:一个dom对应一个tip对象；2：多个dom对应一个tip对象
			this.mode = type; 
			//当前触发tip的目标对象(jQuery对象)
			this.$curTar = $(dom);
			//tip的对象(jQuery对象)
			this.$el = null;
			//处理配置对象
			this.conf = $.extend({}, Config, ops||{});
			//初始化
			this.init(dom);
		},
		tpl = '<div class="{wraperCss}"><i class="{arrowClass}"></i><div class="{contentCss}"></div></div>',
		slfIdCount = 0,
		$iframe = null,
		//默认配置
		Config = {
			exCss: '',
			enPos: true,
			wraperCss: 'u-pop',
			contentCss: 'u-pop-bd',
			tplSelector: null, 
			tpl: '',
			loc: 'b',
			idFlag: '',
			msg: '',
			maxWidth: 'auto',
			zIndex: 1000,
			ox: 0,
			oy: 0,
			initFn: null,
			beforeShowFn: null,
			showFn: null,
			hideFn: null,
			timeout: 200
		},
		cache = {}
	;
	//主对象原型
	Tip.prototype = {
		init: function(dom){
			// 创建tip
			this.$el = this.create();
			// 创建失败
			if(!this.$el) {
				return;
			}
			//初始化
			if(this.mode == 1){
				this.init1(dom);
			}else{
				this.init2(dom);
			}
			this.initEvent();
			this.initFn && this.initFn(this.$el);
		},
		//直接绑定模式的初始化（一个dom对应一个tip对象）
		init1 : function(dom){
			var com = this;
			$(dom).bind({
				mouseenter : function(e){ com.mouseenter(e, this); },
				mouseleave : function(e){ com.mouseleave(e, this); }
			});
		},
		//代理模式的初始化（多个dom对应一个tip对象）
		init2 : function(selector){
			var com = this;
			$(document).delegate(selector, "mouseenter", function(e){ com.mouseenter(e, this);})
					.delegate(selector, "mouseleave", function(e){ com.mouseleave(e, this); });
		},
		//初始化tip的事件
		initEvent: function(){
			var com = this;
			this.conf.enPos && this.$el.appendTo(document.body);
			this.$el.bind({
				mouseenter : function(){ com.$curTar[0].timer && window.clearTimeout(com.$curTar[0].timer); },
				mouseleave : function(){ com.$curTar[0].timer = window.setTimeout(function(){com.hide()}, com.conf.timeout); }
			});
		},
		//鼠标移上
		mouseenter : function(e, dom){
			var com = this;
			dom.timer && window.clearTimeout(dom.timer);
			dom.timer = window.setTimeout(function(){com.show(dom);}, com.conf.timeout);
		},
		//鼠标离开
		mouseleave : function(e, dom){
			var com = this;
			dom.timer && window.clearTimeout(dom.timer);
			dom.timer = window.setTimeout(function(){com.hide()}, com.conf.timeout);
		},
		//创建并返回tip
		create: function(){
			var $tip, id, $tar = this.$curTar;
			// 若使用直接绑定模式，则目标元素配置属性优先
			if(this.mode == 1){
				$tar.attr('tip') && (this.conf.tplSelector = $tar.attr('tip'));
				$tar.attr('enPos') && (this.conf.enPos = ($tar.attr('enPos') == 1)); 
			}
			if(this.conf.tplSelector){ //指定页面中已存在的tip
				id = 'stip-self-'+(slfIdCount++)+this.conf.idFlag;
				$tip = $(this.conf.tplSelector);
			}else if(this.conf.tpl){ //由自定义模板创建tip
				id = 'stip-self-'+(slfIdCount++)+this.conf.idFlag;
				$tip = $(this.conf.tpl);
			}else{ //创建默认tip
				id = 'stip-'+this.conf.loc+this.conf.idFlag;
				if(cache[id]){
					$tip = cache[id];
				}else{
					var arrowClass = (this.conf.loc == 'b'?'icon_arrow_t':'icon_arrow_l'),
					$tip = $(tpl.replace('{wraperCss}', this.conf.wraperCss)
						.replace('{contentCss}', this.conf.contentCss)
						.replace('{arrowClass}', arrowClass))
				}
			}
			if($tip && $tip[0]){
				if(!cache[id]) cache[id] = $tip.attr('id', id);
				return $tip.hide();
			}else{
				// 创建失败
				return false;
			}
			
		},
		//显示
		show : function( dom ){
			var $tar = $(dom), 
				$tip = this.$el,
				msg
			;
			this.$curTar = $tar;
			this.conf.enPos && this.position();
			if(this.conf.exCss) $tip.addClass(this.conf.exCss);
			if(this.conf.beforeShowFn){
				if(!this.conf.beforeShowFn.call(this, $tar, $tip)) return;
			}else{
				msg = this.conf.msg|| $tar.attr('msg') ||  $tar.attr('title');
				$('.'+this.conf.contentCss, $tip).html(msg);
			}
			if(this.conf.maxWidth != 'auto'){
				if($tar.outerWidth() > this.conf.maxWidth){
					$tip.width( this.conf.maxWidth );
				}
			}
			if(this.conf.width){
				$tip.width( this.conf.width );
			}
			$tip.show();
			this.conf.showFn && this.conf.showFn.call(this, $tar, $tip);
			this.conf.enPos && this.rePos();
			this.iframeBg();
		},
		//隐藏
		hide: function(){
			var dom;
			if(this.$curTar && this.$curTar[0]){
				dom = this.$curTar[0];
				this.conf.hideFn && this.conf.hideFn.call(this, this.$curTar, this.$el);
				dom.timer && window.clearTimeout(dom.timer);
				this.$el.hide();
				this.$curTar = null;
				$iframe && $iframe.hide();
			}
		},
		// 定位
		position: function(){
			var $tar = this.$curTar,
				$tip = this.$el,
				pos = $tar.offset(),
				left,
				top,
				conf = this.conf,
				size = {w: $tar.outerWidth(), h:$tar.outerHeight()}
			;
			$tip.hide();
			//初始化样式
			// $tip.css({''});
			// tip位置
			if(conf.loc == 'b'){
				left = pos.left + size.w/2 - 25 + conf.ox;
				top = pos.top + size.h + 10 + conf.oy;
			}else{
				left = pos.left + size.w + 10 + conf.ox;
				top = pos.top + size.h/2 - 25 + conf.oy;
			};
			$tip.css({
				left: left,
				top: top,
				zIndex: conf.zIndex,
				position: "absolute"
			});
		},
		// 适应屏幕，调整定位
		// 待完善，当前仅用于loc="b"的情况
		rePos: function(){
			var $tip = this.$el,
				$rrow,
				pos = $tip.offset(),
				bw = $('body').width(),
				ox = 0,
				conf = this.conf,
				size = {w: $tip.outerWidth(), h:$tip.outerHeight()}
			;
			if(conf.loc == 'b'){
				ox = size.w + pos.left - bw;
				$rrow = $('.icon_arrow_t', $tip);
				if(ox > 0){
					$tip.css('left', pos.left - ox);
					$rrow.css('left', 18 + ox);
				}else{
					$rrow.css('left', 18);
				}
			}
		},
		// 解决IE6下select，flash层级问题。若有异步请求则记得请求后再调用一次
		iframeBg: function(){
			if($.isIE6){
				var $tip = this.$el, pos = $tip.offset();
				if(!$iframe){//变量仅初始化一次
					$iframe = $('<iframe id="stip-iframe-bg" src="#" style="position:absolute"></iframe>').appendTo($('body'));
				}
				$iframe.css({
					width: $tip.outerWidth(),
					height: $tip.outerHeight(),
					zIndex: this.conf.zIndex-1,
					left: pos.left,
					top: pos.top	
				});
			}
		}
	};
	/*
	 * 对外接口
	 */
	$.fn.stip = function(ops){	
		return this.each(function(){
			new Tip(1, this, ops);
		});
	};
	$.stip = function(target, ops){ new Tip(2, target, ops); return this; };
	$.stip.hide = function(){ for(var k in cache){ cache[k].hide(); } $iframe && $iframe.hide(); };
	//调整窗口时隐藏所有tip
	$(window).resize(function(){$.stip.hide()});
})(window,jQuery);