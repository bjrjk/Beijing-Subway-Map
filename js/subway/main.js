var tip = {
    isHighlight: false,
    isInfoShow: false,
    stationsInfo: SW.cache.stationsInfo,
    stations: SW.cache.stations,
    lines: SW.cache.lines,

    init: function () {
        this.bindEvent();
    },
    mousePos: function (e) {
        var x, y;
        var e = e || window.event;
        return {
            x: e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft,
            y: e.clientY + document.body.scrollTop + document.documentElement.scrollTop
        };
    },
    bindEvent: function () {
        var self = this;
        var font_size = 12;
        var mousewheel = navigator.userAgent.indexOf("Firefox") > 0 ? "DOMMouseScroll" : "mousewheel";
        var subway_svg_out = document.getElementById('subway-svg');
        var viewBoxValues_before, viewBoxValues_after;
        $("#subway-content").on("mouseover", "path", function (e) {
            var mouse = self.mousePos(e);
            var line_name = $(this).attr("name");
            var line_id = $(this).attr("id").split("-")[1];
            $('#line-name-tip').html(line_name).css({
                "background": "#" + self.lines[line_id].cl
                // "width": font_size * line_name.length
            });
            $('.line-name-arrow').css({
                // 'border-top':'6px solid #'+ self.lines[line_id].color,
                // 'left': font_size * line_name.length / 2 + 3
            });
            var left = parseInt($("#tip-window").outerWidth() / 2);
            $("#tip-window").css({
                "display": "block",
                "top": (parseInt(mouse.y) - 40) + "px",
                "left": (parseInt(mouse.x) - left) + 'px'
            });
        }).on("mouseout", function () {
            // $("#tip-window").css("background","#FFF");
            $("#tip-window").css("display", "none");
        });

        $("#subway-content").on("mousewheel", function () {
            $("#infowindow-content").remove();
            tip.isInfoShow = false;
        });

        $(".zoom-btn").on("click", function () {
            $("#infowindow-content").remove();
        });

        $("#subway-content").on("click", "circle", function (e) {
            //设置站点的id和名称及关联线路id
            var select_ref_line_id = $(this).attr("id").split("-")[0];
            var select_station_id = $(this).attr("id").split("-")[1];
            var select_station_name = $(this).attr("name");

            //若是高亮，则去除高亮
            if (!tip.isHighlight) {
                $("#bg").remove();
            }
            $("#infowindow-content").remove();
            //生成infowindow
            self.createInfowin();

            //设置默认状态
            $("#tab-time").click();
            $(".info-time").css("display", "block");
            $(".info-exit").css("display", "none");
            //写首发时间数据
            self.laodinfo(select_ref_line_id, select_station_id);
            //写周边数据
            // self.laodAroundinfo(select_station_id);

            //设置infowindow的位置，保证生成infowindow后获取宽高信息
            var svg_g = $("#svg-g");
            // var transform_temp = svg_g.attr("transform").split(" ")[0].split("(")[1];
            // var transform = transform_temp.substring(0, transform_temp.length - 1).split(",");
            // var scale_temp = svg_g.attr("transform").split(" ")[1].split("(")[1];
            // var scale = scale_temp.substring(0, scale_temp.length - 1);
            var transform_arr = svg_g.attr("transform").match(/(-?\d+(\.\d+)?)/g);
            var translate_x = Number(transform_arr[0]);
            var translate_y = Number(transform_arr[1]);
            var scale = transform_arr[2];
            var mouse = self.mousePos(e);
            var info_win = $(".info-window");
            var window_height = info_win.outerHeight();
            var window_width = info_win.outerWidth();
            var circle_offset = $(this).offset();
            var circle_id = $(this).attr('id');
            var circle_width = document.getElementById(circle_id).getBBox().width;

            var subway_svg = document.getElementById('subway-svg');
            var viewBox = subway_svg.getAttribute('viewBox').split(" ");
            var screen_w = document.documentElement.clientWidth;

            // var infowin_x = (circle_offset.left + circle_width*scale/2 - window_width / 2 - translate_x + parseInt(viewBox[0]));
            var infowin_x = (circle_offset.left + circle_width * scale / 2 - window_width / 2);
            // var infowin_y = (circle_offset.top - window_height - translate_y + parseInt(viewBox[1]));
            var infowin_y = (circle_offset.top - window_height);
            // var sw_infowin = d3.select("#infowindow-content");
            var sw_infowin = $('#infowindow-content');
            // sw_infowin.css("width", window_width)
            //     .css("height", window_height + 17)
            //     // .attr("x", infowin_x - (screen_w - 1024)/2)
            //     .css("left", infowin_x)//地图是否全屏.attr("x", infowin_x)
            //     .css("top", infowin_y - 15);
            sw_infowin.css({
                width: window_width + 'px',
                height: (window_height + 17) + 'px',
                left: infowin_x + 'px',
                top: (infowin_y - 15) + 'px'
            })
            //刷新在这儿
            // $("#infowindow-content").attr("transform", "scale(2)").attr("transform", "scale("+1/scale+")");
            //移动-infowindow不被遮挡
            var infowin_offset = sw_infowin.offset();
            var infow_up = infowin_offset.top - 110; //常数根据设计稿改变
            // var infow_left = infowin_offset.left - (screen_w - 1024)/2;
            var infow_left = infowin_offset.left;
            // var infow_right = window_width + infowin_offset.left - screen_w + (screen_w - 1024)/2;
            var infow_right = window_width + infowin_offset.left - screen_w;
            var move_up, move_left;
            if (infow_up < 0) { //上
                move_up = infow_up - 50;
                viewBox[1] = parseFloat(viewBox[1]) + move_up;
                sw_infowin.css("top", (infowin_y - 15 - move_up) + 'px');
            }
            if (infow_left < 0) { //左
                move_left = infow_left - 50;
                viewBox[0] = parseFloat(viewBox[0]) + move_left;
                sw_infowin.css("left", (infowin_x - move_left) + 'px');
            }
            if (infow_right > 0) { //右
                move_left = infow_right + 50;
                viewBox[0] = parseFloat(viewBox[0]) + move_left;
                sw_infowin.css("left", (infowin_x - move_left) + 'px');
            }
            subway_svg.setAttribute('viewBox', viewBox.join(" "));

            //刷新在这儿
            // $("#infowindow-content").css('display','none').css('display','block');
            // $("#infowindow-content").attr("transform", "scale(2)").attr("transform", "scale("+1/scale+")");
            tip.isInfoShow = true;
        });

        $(".line-caption-list").on("mouseover", ".line-caption", function () {
            var caption_id = $(this).attr("id");
            var line_id = caption_id.split("-")[1];
            $(this).css("background", "#" + self.lines[line_id].cl);
            var sub_name = $(this).find('.line_sub_name');
            var sub_name_width = sub_name.width();
            var name_width = $(this).width();
            var name_offset_left = $(this).offset().left;
            $(this).find('.sub_name_arrow').css('left', sub_name_width / 2 - 5 + 'px')
            sub_name.css({
                'left': name_offset_left + name_width / 2 - sub_name_width / 2 + 10 + 'px',
                'display': 'block'
            });
        }).on("mouseout", ".line-caption", function () {
            if (!$(this).hasClass("select")) {
                $(this).css("background", "none");
            }
            $(this).find('.line_sub_name').css('display', 'none');
        });

        $("#query-btn").click(function () {
            d3.select("#svg-g").selectAll("text").attr("stroke","");
            var fromStationName = $("#fromStation").val();
            var toStationName = $("#toStation").val();
            console.log("Query Path from " + fromStationName + " to " + toStationName + ".");
            SSSP.query(fromStationName, toStationName);
        });

        $("#clear-btn").click(function () {
            d3.select("#svg-g").selectAll("text").attr("stroke","");
            $("#query-info").text("");
            $("#fromStation").val("");
            $("#toStation").val("");
        });

        $(".line-caption-list").on("click", ".line-caption", function () {
            tip.isHighlight = false;
            if (tip.isHighlight) {
                return;
            } else {
                $("#bg,#line-select-box,#infowindow-content").remove();
                tip.isInfoShow = false;
            }
            var line_id = $(this).attr("id").split("-")[1];
            //背景模糊
            var line_bg = d3.select("#svg-g")
                .append("svg:rect")
                .attr("id", "bg")
                .attr("width", 100000)
                .attr("height", 100000)
                .attr("x", "-20000")
                .attr("y", "-20000")
                .attr("fill", "#fff")
                .attr("opacity", 0.9);
            //高亮容器
            var line_heightlight = d3.select("#svg-g")
                .append("svg:g")
                .attr("id", "line-select-box")
                .attr("line_id", line_id);

            var btn_line_id = $(this).attr("id");
            var line_selected_id = "line-" + btn_line_id.split("-")[1];
            var line_select = $("#g-line").children("#" + line_selected_id);
            var line_heightlight_box = $("#line-select-box");
            var line_id = btn_line_id.split("-")[1];
            $(".line-caption").removeClass("select");
            $(".line-caption").css("background", "none");
            $(this).addClass("select");
            $(this).css("background", "#" + self.lines[line_id].cl);
            // line_heightlight_box.append(line_select.clone(true));
            tip.isHighlight = true;
            var svg_g = $("#svg-g");
            // var translate_temp = svg_g.attr("transform").split(" ")[0].split("(")[1];
            // var translate = translate_temp.substr(0,translate_temp.length-1).split(",");
            // var scale_temp = svg_g.attr("transform").split(" ")[1].split("(")[1];
            // var scale = scale_temp.substring(0, scale_temp.length - 1);
            var transform_arr = svg_g.attr("transform").match(/(-?\d+(\.\d+)?)/g);
            var translate_x = Number(transform_arr[0]);
            var translate_y = Number(transform_arr[1]);
            var scale = transform_arr[2];

            if (scale == "0.5") {
                drwSw.drwSelectLine(line_id, scale, 24, 26);
            } else {
                drwSw.drwSelectLine(line_id, scale, 12, 20);
            }
            //移动
            var select_box_offset = $("#line-select-box").offset();
            var select_box_h = document.getElementById("line-select-box").getBBox().height;
            var select_box_w = document.getElementById("line-select-box").getBBox().width;
            var screen_w = document.documentElement.clientWidth;
            var screen_h = document.documentElement.clientHeight;
            var move_x, move_y;
            var translate_x, translate_y;
            var subway_svg_out = document.getElementById('subway-svg');
            var viewBox = subway_svg_out.getAttribute('viewBox');
            var viewBoxValues = viewBox.split(' ');


            if (scale == "1") {
                // return;
            } else if (scale == "2") {
                select_box_h = select_box_h * 2;
                select_box_w = select_box_w * 2;
            } else if (scale == "0.5") {
                select_box_h = select_box_h / 2;
                select_box_w = select_box_w / 2;
            }
            move_x = select_box_offset.left + select_box_w / 2 - screen_w / 2;
            move_y = select_box_offset.top + select_box_h / 2 - screen_h / 2;
            translate_x = translate_x - move_x;
            translate_y = translate_y - move_y;
            svg_g.attr("wh", translate_x / scale + "," + translate_y / scale);
            svg_g.attr("transform", "translate(" + translate_x + "," + translate_y + ") scale(" + scale + ")");
        });

        $("#subway-content").on("mousedown", "#bg", function () {

            var subway_svg_out = document.getElementById('subway-svg');
            if (!tip.isHighlight) {
                return;
            } else {
                viewBoxValues_before = subway_svg_out.getAttribute('viewBox').split(' ');
            }
        }).on("mouseup", "#bg", function () {
            var subway_svg_out = document.getElementById('subway-svg');
            if (!tip.isHighlight) {
                return;
            } else {
                viewBoxValues_after = subway_svg_out.getAttribute('viewBox').split(' ');
                if (viewBoxValues_after[0] == viewBoxValues_before[0] && viewBoxValues_after[1] == viewBoxValues_before[1]) {
                    var select_line_id = $("#line-select-box").attr("line_id")
                    $("#btn-" + select_line_id).removeClass("select").css("background", "none");
                    $("#bg,#line-select-box").remove();
                    tip.isHighlight = false;
                } else {
                    return;
                }
            }
        });
        $("#subway-content").on("click", ".close_info_btn", function () {
            $("#infowindow-content").remove();
            $(".info-detail-content").css("height", "auto");
            tip.isInfoShow = false;
        });
        $("#subway-content").on("click", ".info-tab-item", function () {
            if ($(this).hasClass("selected")) {
                return;
            } else {
                var select_item_id = $(this).attr("id");
                var select_type = select_item_id.slice(-4);

                $(this).addClass("selected");
                $(this).siblings().removeClass("selected");
                $('.exit-item:eq(0)').trigger('click');
                $(".info-" + select_type).css("display", "block");
                $(".info-" + select_type).siblings().css("display", "none");

            }
            if ($(this).attr("id") == "tab-exit") {
                $("#exit-1").click();
            }
            //设置infowindow的高度
            var infow_h = $(".info-window").outerHeight();
            var sw_infowin = d3.select("#infowindow-content");
            sw_infowin.attr("height", infow_h);
            //设置info-content-item 高度
            var content_height = $(".info-time").height();
            // $("#exit-name,.info-exit").css("height",content_height - 5);
            // $("#infowindow-content").attr("transform", "scale(2)").attr("transform", "scale(1)");//不刷新事件表现有问题

        });

        $("#subway-content").on("mouseover", ".exit-item", function () {
            $(this).addClass("exit-hover");
            // $("#infowindow-content").attr("transform", "scale(2)").attr("transform", "scale(1)");
        }).on("mouseout", ".exit-item", function () {
            $(this).removeClass("exit-hover");
            // $("#infowindow-content").attr("transform", "scale(2)").attr("transform", "scale(1)");
        });

        $("#subway-content").on("click", ".exit-item", function () {
            var exit_id = $(this).attr("id").split("-")[1];
            $(".exit-item").removeClass("exit-select");
            $(".round-info").css("display", "none");
            $(this).addClass("exit-select");
            $("#round-" + exit_id).css("display", "block");
            //设置infowindow的高度
            var infow_h = $(".info-window").outerHeight();
            var sw_infowin = d3.select("#infowindow-content");
            sw_infowin.attr("height", infow_h);
            $("#infowindow-content").attr("transform", "scale(2)").attr("transform", "scale(1)");
        })
    },
    reLocateInfowin: function () {
        //判断infowindow距离地铁区域上部和左部的距离，
        //大于0，不移动
        //小于0，向下或者向右移动。改变viewbox的值。
        var infowin_offset = $("#infowindow-content").offset();
    },
    createInfowin: function () {
        var self = this;
        var subway = $("#subway");
        // var transform_temp = svg_g.attr("transform").split(" ")[0].split("(")[1];
        // var transform = transform_temp.substring(0, transform_temp.length - 1).split(",");
        // var scale_temp = svg_g.attr("transform").split(" ")[1].split("(")[1];
        // var scale = scale_temp.substring(0, scale_temp.length - 1);
        // var transform_arr = svg_g.attr("transform").match(/(-?\d+(\.\d+)?)/g);
        //      var translate_x = Number(transform_arr[0]);
        //      var translate_y = Number(transform_arr[1]);
        //      var scale = transform_arr[2];

        // var infowin_g = d3.select("#svg-g")
        //     .append("svg:g")
        // var infowin_content = d3.select("#svg-g")
        //     .append("svg:foreignObject")
        //     .attr("id", "infowindow-content")
        //     .attr("transform", "scale(" + 1 / scale + ")")
        //     // .attr("requiredExtensions", "http://www.w3.org/1999/xhtml")
        //     // .attr("requiredFeatures", "http://www.w3.org/TR/SVG11/feature#Extensibility")
        //     .append("xhtml:body")
        //     .attr("xmlns","http://www.w3.org/1999/xhtml");

        // var infow_body = $("#infowindow-content body");
        var infowin_content = $('<div class="infowindow-content" id="infowindow-content"></div>');
        subway.append(infowin_content);
        // infow_body.append("<div class=\"info-window\" style=\"display:block\"><div id=\"info-title\"><span id=\"station-name\"></span><a href=\"javascript:void(0)\" class=\"close_info_btn\"></a></div><div id=\"info-content\"><ul class=\"info-tab\"><li class=\"info-tab-item selected\" id=\"tab-time\">首末车时间</li> <li class=\"info-tab-item\" id=\"tab-exit\">站点出口与公交</li></ul><div class=\"info-detail-content\"><div class=\"info-content-item info-time\"></div><div class=\"info-content-item info-exit\" style=\"display:none\"><div id=\"exit-name\" class=\"scroll-pane\"><ul class=\"exit-list\"></ul></div><div id=\"exit-around\" class=\"scroll-pane\"></div></div></div></div></div>");
        // infow_body.append("<div class=\"info-window\" style=\"display:block\"><div id=\"info-title\"><span id=\"station-name\"></span><a href=\"javascript:void(0)\" class=\"close_info_btn\">close</a></div><div id=\"info-content\"><div class=\"info-detail-content\"><div class=\"info-content-item info-time\"></div></div></div></div>"); 

        infowin_content.append("<div class=\"info-window\"><div id=\"info-title\"><span id=\"station-name\"></span><a href=\"javascript:void(0)\" class=\"close_info_btn\"></a></div><div id=\"info-content\"><div class=\"info-detail-content\"><div class=\"info-content-item info-time\"></div></div></div></div><div class=\"info-window-bottom\"></div>");
    },
    laodinfo: function (lineId, nodeId) {
        var self = this;
        var select_station_dpt_time = [],
            select_station_name, select_station_ref_line = [],
            infowHtml = [];
        select_station_dpt_time = self.stationsInfo[nodeId].d;
        select_station_name = self.stations[nodeId].n;
        select_station_ref_line = self.stations[nodeId].r.split("|");
        // var current_station = [];
        var current_station = {};
        for (var i = 0, len = select_station_dpt_time.length; i < len; i++) {
            var item = select_station_dpt_time[i];
            if (!current_station[item.ls]) {
                current_station[item.ls] = [];
            }
            current_station[item.ls].push(item);
        }
        $("#info-title #station-name").html(select_station_name);
        var lineid = '';
        for (lineid in current_station) {
            if (current_station.hasOwnProperty(lineid)) {
                if (self.lines[lineid]) {
                    var line_sub_name = self.lines[lineid].la;
                    if (line_sub_name == '') {

                    } else {
                        line_sub_name = '(' + line_sub_name + ')';
                    }
                    infowHtml.push("<div class=\"time-item\">");
                    infowHtml.push("<div class=\"time-item-title\" style=\"color:#" + self.lines[lineid].cl + "\"><label class=\"line-label\">地铁</label>" + self.lines[lineid].ln + line_sub_name + "</div>")
                    infowHtml.push("<ul class=\"time-item-main\">");
                    for (var j = 0; j < 2; j++) {
                        if (current_station[lineid][j]) {
                            var first_time = current_station[lineid][j].ft;
                            var last_time = current_station[lineid][j].lt;
                            var direction = self.stations[current_station[lineid][j].n];
                            // if(direction){
                            if (first_time.split(':')[0] != '--' || last_time.split(':')[0] != '--') {
                                infowHtml.push("<li class=\"time-item-detail\">");
                                infowHtml.push("<div class=\"train-direct fl\"><label class=\"direct-label\">开往</label><span class=\"direct-name\">" + direction.n + "</span></div>"); //下一站名，表示方向
                                infowHtml.push("<div class=\"train-time fl\">");
                                infowHtml.push("<div class=\"start-time time-box fl\"><label class=\"time-label\">首</label><span class\"time\">" + first_time + "</span></div>"); //首发
                                infowHtml.push("<div class=\"last-time time-box fl\"><label class=\"time-label\">末</label><span class=\"time\">" + last_time + "</span></div>"); //末发
                                infowHtml.push("</div>");
                                infowHtml.push("</li>");
                            }
                            // }else{
                            //     return
                            // }
                        }
                    }
                    infowHtml.push("</ul>");
                    infowHtml.push("</div>");
                }

            }
        }
        $(".info-time").html(infowHtml.join(""));
    },
    exitSort: function (data) {
        data.sort(function (e1, e2) {
            if (/^\d{1,2}$/.test(e1.exit_code) && /^\d{1,2}$/.test(e2.exit_code)) {
                return parseInt(e1.exit_code) > parseInt(e2.exit_code) ? 1 : -1;
            } else {
                if (e1.exit_code.charCodeAt(0) == e2.exit_code.charCodeAt(0)) {
                    return e1.exit_code.charCodeAt(1) > e2.exit_code.charCodeAt(1) ? 1 : -1;
                } else {
                    return e1.exit_code.charCodeAt(0) > e2.exit_code.charCodeAt(0) ? 1 : -1;
                }
            }
        })
    },
    laodAroundinfo: function (nodeId) {
        var self = this;
        var select_station_sw_exit = [],
            roundBuilding = [],
            roundBus = [],
            gataHtml = [],
            gataInfoHtml = [];
        select_station_sw_exit = self.stationsInfo[nodeId].sw_exit;
        self.exitSort(select_station_sw_exit);
        for (var i = 0; i < select_station_sw_exit.length; i++) {
            var roundBuilding_tmp = select_station_sw_exit[i].vippoiname.split("|");
            if (roundBuilding_tmp[0] == '') {
                roundBuilding_tmp.shift();
                roundBuilding = roundBuilding_tmp;
            } else {
                roundBuilding = roundBuilding_tmp;
            }
            roundBus = select_station_sw_exit[i].busline.split("|");
            gataHtml.push("<li class=\"exit-item\" id=\"exit-" + select_station_sw_exit[i].exit_id + "\">" + select_station_sw_exit[i].exit_name + "</li>");
            gataInfoHtml.push("<div class=\"round-info\" id=\"round-" + select_station_sw_exit[i].exit_id + "\" style=\"display:none\"><div class=\"round-building\">" + roundBuilding.join("&nbsp;&nbsp;") + "</div>");
            gataInfoHtml.push("<div class=\"round-bus\">" + roundBus.join("、") + "</div></div>");
        }
        $(".exit-list").html(gataHtml.join(""));
        $("#exit-around").html(gataInfoHtml.join(""));
    }
}