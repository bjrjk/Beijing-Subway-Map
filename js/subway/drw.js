var drwSw = {
	currLines: {},
	w: $(window).width(),
	h: $(window).height(),
	t_top: 0, //地图全屏-450
	t_left: 0,
	leftArrow: 37,
	upArrow: 38,
	rightArrow: 39,
	downArrow: 40,
	font_size: 12,
	firefox_fly: ["1190 767", "1196 767", "1227 767", "1233 764", "1237 760", "1244 752", "1249 741", "1258 727", "1268 710", "1280 689", "1284 682", "1542 580", "1542 580", "1582 564", "1585 561", "1589 557", "1594 550", "1598 543", "1601 534", "1603 527", "1604 519", "1604 515", "1604 519","1603 527","1601 534","1598 543","1594 550","1589 557", "1580 558", "1571 557", "1566 555", "1562 552", "1559 549", "1556 545", "1551 540", "1557 512", "1551 540","1542 580"],
	initDraw: function(drwData) {
		var self = this;
		self.t_left = 0;
		self.t_top = 0;
		var w = $(window).width();
		var h = $(window).height();
		var screenX = parseInt(w / 2);
		// screenX = screenX + (screenX - 1024)/2;
		var screenY = parseInt(h / 2 + 55);
		var originX = parseInt(drwData.offset.split(',')[0]);
		var originY = parseInt(drwData.offset.split(',')[1]);
		var moveX = originX - screenX;
		var moveY = originY - screenY;
		self.t_left -= moveX;
		self.t_top -= moveY;
		self.drwSwBox(drwData);
	},
	draw: function(drwData) {
		this.currLines = {};
		this.initDraw(drwData);
		try {
			_gaq.push(['_setCustomVar',
				2,
				'subway',
				'count-svg',
				1
			]);
			_gaq.push(['_trackPageview']);
		} catch (e) {}
	},
	objCount: function() {

	},
	drwSwBox: function(drwData) {
		var self = this;
		var w = $(window).width();
		var h = $(window).height();
		var subway_svg = d3.select("#subway")
			.append("svg:svg")
			.attr("width", w)
			.attr("height", h - 5) //for firefox(-5)
		.attr("id", "subway-svg")
			.attr("viewBox", "0 0 " + w + " " + h)
			.append("svg:g")
			.attr("id", "subway-box")
			.append("svg:g")
			.attr("id", "svg-g")
			.attr("transform", "translate(" + self.t_left + "," + self.t_top + ") scale(1)")
			.attr("wh", self.t_left + "," + self.t_top)
			.attr("pointer-events", "auto");
		var defs = subway_svg.append('svg:defs');
		defs.append('svg:pattern')
			.attr('id', 'transfer-img')
			.attr('width', '18')
			.attr('height', '18')
			.append('svg:image')
			.attr('xlink:href', './img/subway/transfer.png')
			.attr('x', 0)
			.attr('y', 0)
			.attr('width', 18)
			.attr('height', 18);
		self.deletInProgress(drwData);
	},
	deletInProgress: function(drwData) {
		var self = this;
		for (var i = 0; i < drwData.lines.length; i++) {
			if (drwData.lines[i].su != "3") {
				self.currLines[drwData.lines[i].ls] = drwData.lines[i];
			}
		}
		self.lineSort(self.currLines);
		self.drwSwLines(drwData);
		self.addCaption(self.currLines);
	},
	lineSort: function(lines){
		var self = this;
		self.sortline = [];
		for (id in self.currLines) {
			var index = self.currLines[id].x;
			var line_id = self.currLines[id].ls;
			self.sortline[index] = line_id;
		}
	},
	addCaption: function(drwData) {
		var self = this;
		for(var i = 1;i < self.sortline.length; i++){
			var line_name_a = self.currLines[self.sortline[i]].la;
			var name_a,name_l,line_tip_html;
			if(line_name_a != ''){
				name_a = line_name_a;
				name_l = line_name_a.length * 12;
				line_tip_html = '<div class="line_sub_name" style="display:none"><div class="sub_name_arrow"></div><div class="sub_name_txt" style="*width:' + name_l + 'px" >' + name_a + '</div></div>';
			}else{
				line_tip_html = '';
			}
			var line_btn = $(".line-caption-list")
				.append('<a href="javascript:void(0)" class="line-caption" id=' + "btn-" + self.sortline[i] + '>' + self.currLines[self.sortline[i]].ln + line_tip_html +'</a>');
		}
	},
	drwG: function(type) {
		var self = this;
		var svg_g = d3.select("#svg-g")
			.append("svg:g")
			.attr("id", "g-" + type);
	},
	objectToArray: function(obj) {
		var array = [],
			obj = obj || {};
		for (var i in obj) {
			array.push(obj[i]);
		}
		return array;
	},
	drwSwLines: function(drwData) {
		var self = this;
		var isFF = !!window.sidebar;
		var lineFunction_line = d3.svg.line()
			.x(function(d) {
				return parseInt(d.split(" ")[0]);
			})
			.y(function(d) {
				return parseInt(d.split(" ")[1]);
			})
			.interpolate("linear");
		var subway_line = d3.select("#svg-g")
			.append("svg:g")
			.attr("id", "g-line");
		// var lines = self.objectToArray(drwData.lines);
		for (id in self.currLines) {
			var dataset_line_arr;
			if(isFF && id == '110005'){
				dataset_line_arr = self.firefox_fly;
			}else{
				dataset_line_arr = self.currLines[id].c;
			}
			subway_line
				.append("path")
				.attr("id", "line-" + self.currLines[id].ls)
				.attr("name", self.currLines[id].ln)
				.attr("stroke", "#" + self.currLines[id].cl)
				.attr("d", lineFunction_line(dataset_line_arr));
		}
		// for(var i = 0;i < self.currLines.length; i++){//回头试试不加for循环是不是也行
		// 	var dataset_line_arr = self.currLines[i].coords;
		// 	subway_line
		//      .append("path")
		//      .attr("id","line-" + self.currLines[i].line_sid)
		//      .attr("name", self.currLines[i].line_sname)
		//      .attr("stroke","#" + self.currLines[i].color)
		//      .attr("d", lineFunction_line(dataset_line_arr));
		// };
		self.drwSwStations(drwData);
	},
	drwSwStations: function(drwData) {
		var self = this;
		var subway_station_g = d3.select("#svg-g")
			.append("svg:g")
			.attr("id", "g-station");
			
		for (var i = 0; i < drwData.stations.length; i++) {
			var subway_station = d3.select("#g-station")
				.append("circle")
				.attr("cx", parseInt(drwData.stations[i].p.split(" ")[0]))
				.attr("cy", parseInt(drwData.stations[i].p.split(" ")[1]))
				.attr("id", drwData.stations[i].r.split("|")[0] + "-" + drwData.stations[i].si)
				.attr("name", drwData.stations[i].n)
				.attr("r", function() {
					if (drwData.stations[i].t == "0") {
						return 3;
					} else {
						return 9;
					}
				})
				.attr("fill", function() {
					if (drwData.stations[i].t == "0") {
						return "#FFF";
					} else {
						return "url(#transfer-img)";
					}
				})
				.attr("stroke-width", function() {
					if (drwData.stations[i].t == "0") {
						return 1;
					} else {
						return 0;
					}
				})
				.attr("stroke", "#000")
				.append("svg:title")
				.text(drwData.stations[i].name);
		}
		self.drwSwStationsName(drwData, 12, 20); //缩小为0.5，第二个参数为24
	},
	drwSwStationsName: function(drwData, fontSize, h) {
		var self = this;
		var data = drwData.stations || drwData;
		if(!($("#g-station-name").length > 0)){
			var subway_station_name_g = d3.select("#svg-g")
				.append("svg:g")
				.attr("id", "g-station-name");
		}
		var subway_station_name_g = d3.select("#g-station-name")
			.append("svg:g")
			.attr("id", "g-name");
		for (var i = 0; i < data.length; i++) {
			var subway_station_name = d3.select("#g-name")
				.append("text")
				.text(data[i].n)
				.style("font-size", fontSize + "px")
				.attr("id", "name-" + data[i].si)
				.attr("name", data[i].n)
				.attr("text-anchor", function() {
					var direct = data[i].lg;
					if (direct == "0" || direct == "4") {
						return "middle";
					} else if (direct == "5" || direct == "6" || direct == "7") {
						return "left";
					}
				})
				.attr("x", function() {
					var direct = data[i].lg;
					if (direct == "0" || direct == "4") {
						return parseInt(data[i].p.split(" ")[0]);
					} else if (direct == "5" || direct == "6" || direct == "7") {
						return parseInt(data[i].p.split(" ")[0]) - data[i].n.length * fontSize - 10;
					} else if (direct == "1" || direct == "2" || direct == "3") {
						return parseInt(data[i].p.split(" ")[0]) + 10;
					}
				})
				.attr("y", function() {
					var direct = data[i].lg;
					if (direct == "2" || direct == "6") {
						return parseInt(data[i].p.split(" ")[1]) + 5;
					} else if (direct == "0" || direct == "1" || direct == "7") {
						return parseInt(data[i].p.split(" ")[1]) - 10;
					} else if (direct == "3" || direct == "4" || direct == "5") {
						return parseInt(data[i].p.split(" ")[1]) + h; //缩小为最小级别是为30，其他为20
					}
				});
		}

	},
	deletSvgElemt: function(svgElemt) {
		var svgElement = $("#g-" + svgElemt);
		if (svgElement) {
			svgElement.remove();
		} else {
			return;
		}
	},
	filterData: function(drwData) {
		var self = this;
		var filterDta = [];
		/*
		 *每隔两个站点取一个站点，压入数组，其中遇到换乘站也取出并压入数组
		 */
		for (var i = 0; i < drwData.stations.length; i++) {
			if (i % 3 == 0 || drwData.stations[i].t == "1") {
				filterDta.push(drwData.stations[i]);
			}
		}
		return filterDta;
	},
	deletSpecialNode: function(cityCode, drwData) {
		var self = this;
		var specialNode = [];
		var filterDta = self.filterData(drwData);
		for (var i = 0; i < filterDta.length; i++) {
			for (var j = 0; j < self.zmOut[cityCode].length; j++) {
				if (filterDta[i].si == self.zmOut[cityCode][j]) {
					break;
				}
			}
			if (j == self.zmOut[cityCode].length) {
				specialNode.push(filterDta[i]);
			}
		}
		return specialNode;
	},
	reDrwname: function(cityCode, drwData, fontSize, h) {
		var self = this;
		self.deletSvgElemt("name");
		self.drwSwStationsName(drwData, fontSize, h);
	},
	drwSelectLine: function(lineId, scale, fontSize, h) {
		var self = this;
		var cityCode = $("#subway").attr("citycode");
		var selectLine = SW.cache.lines[lineId];
		var isFF = !!window.sidebar;
		var lineFunction_line = d3.svg.line()
			.x(function(d) {
				return parseInt(d.split(" ")[0]);
			})
			.y(function(d) {
				return parseInt(d.split(" ")[1]);
			})
			.interpolate("linear");
		var select_g = d3.select("#line-select-box")
			.append("svg:g")
			.attr("id", "g-line-select");
		var dataset_line_arr;
		if(isFF && lineId == '110005'){
			dataset_line_arr = self.firefox_fly;
		}else{
			dataset_line_arr = selectLine.c;
		}
		var select_line = d3.select("#g-line-select")
			.append("path")
			.attr("id", "lineselect-" + selectLine.ls)
			.attr("name", selectLine.ln)
			.attr("stroke", "#" + selectLine.cl)
			.attr("d", lineFunction_line(dataset_line_arr));
		for (var i = 0; i < selectLine.st.length; i++) {
			if(selectLine.st[i].su == '1'){
				var select_station = d3.select("#g-line-select")
					.append("circle")
					.attr("cx", parseInt(selectLine.st[i].p.split(" ")[0]))
					.attr("cy", parseInt(selectLine.st[i].p.split(" ")[1]))
					.attr("id", selectLine.st[i].r.split("|")[0] + "-" + selectLine.st[i].si)
					.attr("name", selectLine.st[i].n)
					.attr("r", function() {
						if (selectLine.st[i].t == "0") {
							return 3;
						} else {
							return 9;
						}
					})
					.attr("fill", function() {
						if (selectLine.st[i].t == "0") {
							return "#FFF";
						} else {
							return "url(#transfer-img)";
						}
					})
					.attr("stroke-width", function() {
						if (selectLine.st[i].t == "0") {
							return 1;
						} else {
							return 0;
						}
					})
					.attr("stroke", "#000");
			}
		}
		self.reDrwZoomName(lineId, scale, fontSize, h);
	},
	reDrwZoomName: function(lineId, scale, fontSize, h) {
		var self = this;
		// var lineId = $("#line-select-box").attr("line_id");
		var cityCode = $("#subway").attr("citycode");
		var selectLine = SW.cache.lines[lineId];
		var selectdata;
		if (scale == "0.5") {
			selectdata = SW.cache.cities[cityCode].zolines[lineId];
		} else {
			selectdata = selectLine.st;
		}
		for (var i = 0; i < selectdata.length; i++) {
			if(selectdata[i].su == '1'){
				var subway_station_name = d3.select("#g-line-select")
				.append("text")
				.text(selectdata[i].n)
				.style("font-size", fontSize + "px")
				.attr("text-anchor", function() {
					var direct = selectdata[i].lg;
					if (direct == "0" || direct == "4") {
						return "middle";
					} else if (direct == "5" || direct == "6" || direct == "7") {
						return "left";
					}
				})
				.attr("x", function() {
					var direct = selectdata[i].lg;
					if (direct == "0" || direct == "4") {
						return parseInt(selectdata[i].p.split(" ")[0]);
					} else if (direct == "5" || direct == "6" || direct == "7") {
						return parseInt(selectdata[i].p.split(" ")[0]) - selectdata[i].n.length * fontSize - 10;
					} else if (direct == "1" || direct == "2" || direct == "3") {
						return parseInt(selectdata[i].p.split(" ")[0]) + 10;
					}
				})
				.attr("y", function() {
					var direct = selectdata[i].lg;
					if (direct == "2" || direct == "6") {
						return parseInt(selectdata[i].p.split(" ")[1]) + 5;
					} else if (direct == "0" || direct == "1" || direct == "7") {
						return parseInt(selectdata[i].p.split(" ")[1]) - 10;
					} else if (direct == "3" || direct == "4" || direct == "5") {
						return parseInt(selectdata[i].p.split(" ")[1]) + h;
					}
				})
			}
		}
	}
}