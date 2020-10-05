 /*  Constants: */
 var leftArrow = 37; //左键的code
 var upArrow = 38;
 var rightArrow = 39;
 var downArrow = 40;
 var panRate = 10; //每次移动的像素数   
 var zoomRate = 2; //缩放倍数
 var screen_width = document.documentElement.clientWidth;
 var screen_height = document.documentElement.clientHeight;

 /* Globals: */
 var svgMain;
 var svgBox;
 var mousedown = false; //标识鼠标点击标志
 var isScroll = false;
 // var isIE = (window.navigator.userAgent.indexOf("IE") == -1) ? false : true;//判断是不是ie浏览器
 var pos = function(x, y) {
     this.x = x;
     this.y = y;
 };
 var oldmouse = new pos(0, 0); //鼠标原始位置
 var moveLength = new pos(0, 0); //移动的距离
 var oldpose = new pos(0, 0); //svg原来的位置
 var iw_old_top, iw_old_left; //infowindow原来的位置

 function zoom(zoomType, pos, evt) {

     var evt = evt || window.event;
     var svg_g = $("#svg-g");
     var transform_arr = svg_g.attr("transform").match(/(-?\d+(\.\d+)?)/g);
     var translate_x = Number(transform_arr[0]);
     var translate_y = Number(transform_arr[1]);
     var scale = transform_arr[2];
     var viewBox = svgMain.getAttribute('viewBox');
     var viewBoxValues = viewBox.split(' ');
     var wh = svg_g.attr("wh").split(",");
     var dragObj = $("#sw-zoom-drag");
     var screen_center = new pos(screen_width / 2, screen_height / 2);
     oldpose.x = Number(viewBoxValues[0]);
     oldpose.y = Number(viewBoxValues[1]);
     if (isScroll == true) {
         oldmouse.x = evt.clientX;
         oldmouse.y = evt.clientY;
     } else { //点击缩放按钮，执行以屏幕中心缩放
         oldmouse.x = screen_center.x;
         oldmouse.y = screen_center.y;
     }


     if (zoomType == 'zoomIn') //放大
     {
         if (scale == "2") {
             return;
         } else if (scale == "1") {
             scale = scale * zoomRate;
             SW.dragMoveUp(dragObj);
         } else {
             scale = scale * zoomRate;
             var cityCode = $("#subway").attr("citycode");

             var drwData = SW.cache.cities[cityCode].stations;
             drwSw.reDrwname(cityCode, drwData, 12, 20);
             //重绘地铁名（全部数据）
             if (tip.isHighlight == true) { //高亮下的缩放
                 var lineId = $("#line-select-box").attr("line_id");
                 $("#g-line-select text").remove();
                 drwSw.reDrwZoomName(lineId, scale, 12, 20);
             }
             SW.dragMoveUp(dragObj);
         }
         moveLength_left = (2 - 1) * (oldmouse.x + oldpose.x);
         // moveLength_left = (2 - 1) * (oldmouse.x + oldpose.x) - (screen_width - 1024) / 2;
         moveLength_top = (2 - 1) * (oldmouse.y + oldpose.y);

     } else if (zoomType == 'zoomOut') //缩小
     {
         if (scale == "0.5") {
             return;
         } else if (scale == "2") {
             scale = scale / zoomRate;
             SW.dragMoveDown(dragObj);
         } else {
             scale = scale / zoomRate;
             //重绘地铁名（筛选后的数据）
             var cityCode = $("#subway").attr("citycode");
             var drwData = SW.cache.cities[cityCode].zostations;
             //drwSw.reDrwname(cityCode, drwData, 20, 26);
             if (tip.isHighlight == true) { //高亮下的缩放
                 var lineId = $("#line-select-box").attr("line_id");
                 $("#g-line-select text").remove();
                 //drwSw.reDrwZoomName(lineId, scale, 20, 26);
             }
             SW.dragMoveDown(dragObj);
         }
         moveLength_left = (0.5 - 1) * (oldmouse.x + oldpose.x);
         // moveLength_left = (0.5 - 1) * (oldmouse.x + oldpose.x) + (screen_width - 1024) / 4;
         moveLength_top = (0.5 - 1) * (oldmouse.y + oldpose.y);
     }

     svg_g.attr("transform", "translate(" + (wh[0]) * scale + "," + (wh[1]) * scale + ") scale(" + scale + ")");
     viewBoxValues[0] = oldpose.x + moveLength_left;
     viewBoxValues[1] = oldpose.y + moveLength_top;
     svgMain.setAttribute('viewBox', viewBoxValues.join(' '));
     isScroll = false;
 }

 function zoomViaMouseWheel(evt) {
     isScroll = true;
     if (evt.wheelDelta > 0 || evt.detail < 0) {
         zoom('zoomIn', pos, evt);
     } else {
         zoom('zoomOut', pos, evt);
     }
     evt.cancelBubble = true;
     return false;

 }

 function processKeyPress(evt) {
     vml_top = parseFloat(theVmlBox.offsetTop);
     vml_left = parseFloat(theVmlBox.offsetLeft);
     switch (evt.keyCode) {
         case leftArrow:
             theVmlBox.style.left = vml_left - panRate; // 减小left值，向左移动
             break;
         case rightArrow:
             theVmlBox.style.left = vml_left + panRate; // 增加left值，向右移动
             break;
         case upArrow:
             theVmlBox.style.top = vml_top - panRate; // 减小top值，向上移动
             break;
         case downArrow:
             theVmlBox.style.top = vml_top + panRate; // 增加top值，向下移动
             break;
     } // switch
 }

 function isLeftBtn(btn) {
     if (btn == 0) {
         return true;
     } else {
         return false;
     }
 }

 function down(evt) {
     evt = evt || window.event;
     if (!isLeftBtn(evt.button)) {
         return;
     } else {
         mousedown = true;
         oldmouse.x = evt.clientX;
         oldmouse.y = evt.clientY;

         var viewBox = svgMain.getAttribute('viewBox');
         var viewBoxValues = viewBox.split(' ');

         oldpose.x = parseFloat(viewBoxValues[0]);
         oldpose.y = parseFloat(viewBoxValues[1]);
         if (tip.isInfoShow) {
             var infowindow = $('#infowindow-content');
             iw_old_top = infowindow.offset().top + oldpose.y;
             iw_old_left = infowindow.offset().left + oldpose.x;
         }
     }
 }

 function up(evt) {
     if (!isLeftBtn(evt.button))
         return;
     svg_out.style.cursor = 'default';
     mousedown = false;
 }

 function isLeftDric(evt) {
     var old_pos = oldmouse.x;
     var new_pos = evt.clientX;
     if (old_pos - new_pos > 0) {
         return true;
     } else {
         return false;
     }
 }

 function isTopDric(evt) {
     var old_pos = oldmouse.y;
     var new_pos = evt.clientY;
     if (old_pos - new_pos > 0) {
         return true;
     } else {
         return false;
     }
 }

 function drag(evt) {
     if (!isLeftBtn(evt.button)) {
         return;
     } else if (mousedown) {
         evt = evt || window.event;
         moveLength.x = evt.clientX - oldmouse.x;
         moveLength.y = evt.clientY - oldmouse.y;
         var svg_g_box = $("#svg-g");
         var transform_arr = svg_g_box.attr("transform").match(/(-?\d+(\.\d+)?)/g);
         var scale = transform_arr[2];
         var svg_b = $('#g-line');
         var svg_g = document.getElementById("g-line");
         var svg_w = svg_g.getBBox().width * parseFloat(scale);
         var svg_h = svg_g.getBBox().height * parseFloat(scale);
         var svg_left = svg_b.offset().left;
         var svg_top = svg_b.offset().top;
         var viewBox = svgMain.getAttribute('viewBox');
         var viewBoxValues = viewBox.split(' ');
         svg_out.style.cursor = 'move';
         if (!isLeftDric(evt)) {
             if (svg_left <= screen_width - 100) {
                 viewBoxValues[0] = oldpose.x - moveLength.x;
             }
         } else {
             if (-svg_left <= svg_w - 100) {
                 viewBoxValues[0] = oldpose.x - moveLength.x;
             }
         }
         if (!isTopDric(evt)) {
             if (svg_top <= screen_height - 200) {
                 viewBoxValues[1] = oldpose.y - moveLength.y;
             }
         } else {
             if (-svg_top <= svg_h - 200) {
                 viewBoxValues[1] = oldpose.y - moveLength.y;
             }
         }
         svgMain.setAttribute('viewBox', viewBoxValues.join(' '));
         if (tip.isInfoShow) {
             var infowindow = $('#infowindow-content');

             infowindow.css({
                 top: iw_old_top - viewBoxValues[1] + 'px',
                 left: iw_old_left - viewBoxValues[0] + 'px'
             });
         }
     }
     try {
         window.getSelection ? window.getSelection().removeAllRanges() : document.selection.empty();
     } catch (err) {

     }

 }

 function initialize() {
     svgMain = document.getElementById("subway-svg");
     svgBox = document.getElementById("subway-box");
     svg_out = document.getElementById('subway-content');
     var mousewheel = (/Firefox/i.test(navigator.userAgent)) ? "DOMMouseScroll" : "mousewheel";

     svg_out.addEventListener(mousewheel, zoomViaMouseWheel, false);
     svg_out.addEventListener("mousedown", down, false);
     document.body.addEventListener("mouseup", up, false);
     svg_out.addEventListener("mousemove", drag, false);
     // svg_out.addEventListener('keydown', processKeyPress, false);
 }