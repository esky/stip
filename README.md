stip
====

基于jQuery的tip组件
/*
 * 复杂tip组件
 * 2013-07-24 esky
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
