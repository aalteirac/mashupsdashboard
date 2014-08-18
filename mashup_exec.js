var first = 0;
var loadedObj=false;
var currentReg = "";
var qlik;
var config = {
	host : "localhost",
	//host : window.location.hostname,
	prefix : "/",
	port : window.location.port,
	isSecure : window.location.protocol === "https:"
};
require.config({
	baseUrl : (config.isSecure ? "https://" : "http://") + config.host + ":" + config.port + config.prefix + "resources"
});
require(["js/qlikview"], function(qlikview) {
	qlik=qlikview;
	jQuery.fn.center = function () {
    this.css("position","absolute");
    this.css("top", Math.max(0, (($(window).height() - $(this).outerHeight()) / 2) + 
                                                $(window).scrollTop()) + "px");
    this.css("left", Math.max(0, (($(window).width() - $(this).outerWidth()) / 2) + 
                                                $(window).scrollLeft()) + "px");
    return this;
}
	qlikview.setOnError(function(error) {
		alert(error.message);
	});
	qlikview.getAppList(function(reply) {
		require(["jquery", "jqueryui"], function($) {
			$.each(reply, function(key, value) {
				if (value.qDocName === "executive dashboard mashup.qvf") {
					var app = qlikview.openApp(value.qDocName, config);
					app.unlockAll;
					app.clearAll();
					app.createList({
						"qDef" : {
							"qFieldDefs" : ["Region"]
						},
						"qInitialDataFetch" : [{
							qTop : 0,
							qLeft : 0,
							qHeight : 20,
							qWidth : 1
						}]
					}, function(reply) {
						var qObject = reply.qListObject;
						var selCount = qObject.qDimensionInfo.qStateCounts.qSelected;
						$("#regFrame ul").remove();
						$("#regFrame").append("<ul></ul>");
						var val = "";
						$.each(qObject.qDataPages[0].qMatrix, function() {
							var item = this[0];
							var selT = "";
							if (item.qState == "S") {
								currentReg = item.qText
								val = item.qText;
								selT = " class=\"chosenOne\"";
							}
							$("#regFrame ul").append("<li" + selT + "><span>" + item.qText + "</span></li>");
						});
						$(".chosenOne").prev().find("span").css("border-bottom", "1px solid transparent");
						$("#regFrame ul li").click(function() {
							app.field("Region").selectMatch($(this).find("span").text(), false);
						});
						if ((reply.qListObject.qDimensionInfo.qStateCounts.qSelected > 0) && (first === 0)) {
							$("#selectReg").hide();
							$("#world").animate({
								opacity : 0
							}, 500, function() {
								$("#world").hide();
								$("#regionBox").animate({

									top : "37px",
									left : "510px"
								}, 1500, function() {
									$("#chosenReg").show();
									$("#chosenReg").animate({
										opacity : 1,
										top : $(".chosenOne").position().top + 40 + "px"
									}, 500, function() {
										var pict=val==""?"map":val;
										$("#chosenMap").css("background-image", "url('" + pict + ".png')");
										$("#chosenMap").show();
										$("#chosenMap").animate({
											opacity : 1
										}, 500, function() {
											$("#vizFrame").show();
											$("#vizFrame").animate({
												height : $("#chartHolder").height() + "px"
											}, 1000);
											app.getObject(document.getElementById("firstPie"), "gtnWjT");
											app.getObject(document.getElementById("firstBar"), "BvXjPs");
											app.getObject(document.getElementById("firstLine"), "aVuFCCY");
										})
									});

								});
							});
							$('.ch1').on('click', app.clearAll);
							$('.clearBtn').on('click', 
								appClear
							);
							function appClear(){
								app.clearAll();
								$("#chartHolder2").animate({
										opacity:0
									},1000, function(){
										$("#chartHolder2").hide();
									});
									
									$("#chartHolder").show();
									$("#chartHolder").animate({
										opacity:1
									},1000,function(){
										
									});
								
							}
							$('.cancel').on('click', app.back);
							$(".cancel").click(function(){
								$("#overlay").hide()
							})
							
							$(".send").click(function(){
								$("#overlay").hide()
							})
							$("#regionBox").css("box-shadow", "none");
							$("#regionBox").css("border-top", "0px");
							$("#home").animate({
								opacity : 0
							}, 500, function() {
							});
							$("#regBack").animate({
								opacity : 0
							}, 1500, function() {
							});
							first++;
						} else {
							var ttop=$(".chosenOne").length>0?$(".chosenOne").position().top:0;
							$("#chosenReg").animate({
								opacity : 1,
								top : ttop + 40 + "px"
							}, 250)
							$("#chosenMap").animate({
								opacity : 0
							}, 250, function() {
								var pict=val==""?"map":val;
								$("#chosenMap").css("background-image", "url('" + pict + ".png')");
								$("#chosenMap").animate({
									opacity : 1
								}, 250);
							})
						}
					});
					app.createList({
						"qDef" : {
							"qFieldDefs" : ["AccountDesc"]
						},
						"qInitialDataFetch" : [{
							qTop : 0,
							qLeft : 0,
							qHeight : 20,
							qWidth : 1
						}]
					}, function(reply) {
						var qObject = reply.qListObject;
						var selCount = qObject.qDimensionInfo.qStateCounts.qSelected;
						if(selCount === 1){
							$("#contactPerson").css("background-image","url('con_on.png')").css("cursor","pointer");
							$("#contactPerson").click(function(){
								var contacts = ["John Williamson","David Moss","Richard Roma","Shelley Levene","Larry Spannel"]
								$("#overlay").show();
								$("#overlay").center();
								$("#overlay .name").text(contacts[Math.floor(Math.random() * 5)]);
								$("#overlay .details").text("Account Manager, " + currentReg);
								$(".message").remove();
								$("#overlay .header").after('<textarea rows="4" cols="50" class="message" placeholder="Type your message..."></textarea>');
								app.createCube({
									qDimensions : [{
										qDef : {
											qFieldDefs : ["AccountGroupDesc"]
										}
									}, {
										qDef : {
											qFieldDefs : ["AccountDesc"]
										}
									}],
									qMeasures : [{
										qDef : {
											qDef : "if(GetSelectedCount([Fiscal Year])<>1,  	Sum({<[Fiscal Year]={$(=max([Fiscal Year])-1)} >} ExpenseActual)/1000, 	Sum({<[Fiscal Year]={$(=vYear-1)}>} ExpenseActual)/1000)",
											qNumFormat: {
												qType:"F",
												qnDec:2
											}
										}
										
									},{
										qDef : {
											qDef : "Sum(ExpenseBudget)/1000",
											qNumFormat: {
												qType:"F",
												qnDec:2
											}
										}
									},{
										qDef : {
											qDef : "if(GetSelectedCount([Fiscal Year])<>1,  	Sum({<[Fiscal Year]={$(=max([Fiscal Year]))} >} ExpenseActual)/1000, 	Sum({<[Fiscal Year]={$(vYear)}>} ExpenseActual)/1000)",
											qNumFormat: {
												qType:"F",
												qnDec:2
											}
										}
									}],
									qInitialDataFetch : [{
										qTop : 0,
										qLeft : 0,
										qHeight : 20,
										qWidth : 5
									}]
								}, function(reply) {
									var heading = ["Account Group Desc","Account Desc","Expense 2012","Budget","Expenses 2013"];
									var dataGrab = "\n--------------------------------------------------\n";
									$.each(reply.qHyperCube.qDataPages[0].qMatrix[0],function(index,value){
										var tabVal = this.qText;
										if(index > 1){tabVal = "$" + tabVal;}
										dataGrab += heading[index] + ": " + tabVal + "\n";
									});
									$(".message").text(dataGrab);
								});
							});
						}else{
							$("#contactPerson").css("background-image","url('con_off.png')");
						}
					});
					app.createList({
						"qDef" : {
							"qFieldDefs" : ["AccountGroupDesc"]
						},
						"qInitialDataFetch" : [{
							qTop : 0,
							qLeft : 0,
							qHeight : 20,
							qWidth : 1
						}]
					}, function(reply) {
						var qObject = reply.qListObject;
						var selCount = qObject.qDimensionInfo.qStateCounts.qSelected;
						if (first != 0) {
							if($(".buttons").css("display") != "none"){
								$(".icon-tick").mousedown(function(){
									$("#chartHolder").animate({
										opacity:0
									},1000, function(){
										$("#chartHolder").hide();
									});
									
									$("#chartHolder2").show();
									$("#chartHolder2").animate({
										opacity:1
									},1000,function(){
										if(!loadedObj){
											app.getObject(document.getElementById("secondPie"), "gtnWjT");
											app.getObject(document.getElementById("trendLine"), "aVuFCCY");
											app.getObject(document.getElementById("ccTable"), "ZpBLSs");
											loadedObj=true;
										}
										qlik.resize();
									});
								});
							}
						}
					});
				}
			});
		});
	}, config);
}); 