/**
 * Created by huashao on 2016/5/10.
 */
/*公共获取ID的方法*/
function getId(obj, node) {
    try {
        if (node != null) {
            return node.getElementById(obj);
        }
        return document.getElementById(obj);
    } catch (e) {
        return null;
    }
}
/*公共获取Class的方法*/
function getClass(obj, node) {
    try {
        if (node != null) {
            return node.getElementsByClassName(obj);
        }
        return document.getElementsByClassName(obj);
    } catch (e) {
        return null;
    }

}
/*公共获取Tag的方法*/
function getTag(obj, node) {
    if (node != null) {
        return node.getElementsByTagName(obj);
    }
    return document.getElementsByTagName(obj);
}

function getStyle(obj, attr) {
    var Style = "";
    if (obj.currentStyle) {
        Style = obj.currentStyle[attr];
    } else {
        Style = getComputedStyle(obj, false)[attr];
    }
    var num = 0;
    if ("opacity" == attr) {
        num = parseInt(parseFloat(Style) * 100);
    } else {
        num = parseInt(Style);
    }
    if (!num) {
        return Style;
    }
    return num;

}

function setStyle(obj, json) {
    for (attr in json) {
        obj.style[attr] = json[attr];
    }
}
/*公共绑定监听事件的方法*/
function bindEventListeners(obj, ev, fn, useCapture) {
    if (obj != null) {
        if (obj.addEventListener) {
            obj.addEventListener(ev, fn, useCapture == undefined ? false : useCapture);
        } else {
            obj.attachEvent('on' + ev, function () {
                fn.call(obj);
            });
        }
    }
}

function addClass(obj, sClass) {
    var aClass = obj.className.split(' ');
    if (!obj.className) {
        obj.className = sClass;
        return;
    }
    for (var i = 0; i < aClass.length; i++) {
        if (aClass[i] == sClass) {
            return;
        }
    }
    obj.className += ' ' + sClass;
}

function removeClass(obj, sClass) {
    try {
        var aClass = obj.className.split(' ');
        if (!obj.className) {
            return;
        }
        for (var i = 0; i < aClass.length; i++) {
            if (aClass[i] == sClass) {
                aClass.splice(i, 1)
                obj.className = aClass.join(' ')
                break;
            }
        }
    } catch (e) {

    }
}

var showLog = false;
/*打印消息*/
function L(message, show) {
    if (show ? show : showLog) {
        console.log(message);
    }
}
function E(message) {
    if (showLog) {
        console.error(message);
    }
}
/*初始化微信*/
function initWx(appId, timestamp, nonceStr, signature, arr) {
    wx.config({
        debug: false,
        appId: appId, // 必填，公众号的唯一标识
        timestamp: timestamp, // 必填，生成签名的时间戳
        nonceStr: nonceStr, // 必填，生成签名的随机串
        signature: signature,// 必填，签名，见附录1
        jsApiList: arr // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
    });

}
function loadImg(url) {//预加载图片
    var img = new Image();
    img.src = url;
}
function loadImage(url, callback, n) {
    var img = new Image(); //创建一个Image对象，实现图片的预下载
    img.src = url;
    if (img.complete) { // 如果图片已经存在于浏览器缓存，直接调用回调函数
        callback.call(img, n);
        return; // 直接返回，不用再处理onload事件
    }
    img.onload = function () { //图片下载完毕时异步调用callback函数。
        callback.call(img, n);//将回调函数的this替换为Image对象
    };
    img.onerror = function (e) {
        callback.call(img, n);
        L("动画加载错误" + e);
    };
};

function showToast(msg, time, css) {
    if (layer) {
        var style = '';
        layer.open({
            skin: 'msg',
            style: css ? css : style,
            content: msg,
            time: time ? time : 1,
            shade: false
        });
    }
}
//获取距离屏幕上下左右
function getClientRect(element) {
    var bcr;
    //trace  IE6下在控制编辑器显隐时可能会报错，catch一下
    try {
        bcr = element.getBoundingClientRect();
    } catch (e) {
        bcr = {left: 0, top: 0, height: 0, width: 0}
    }
    var rect = {
        left: Math.round(bcr.left),
        top: Math.round(bcr.top),
        height: Math.round(bcr.bottom - bcr.top),
        width: Math.round(bcr.right - bcr.left)
    };
    var doc;
    while ((doc = element.ownerDocument) !== document &&
    (element = domUtils.getWindow(doc).frameElement)) {
        bcr = element.getBoundingClientRect();
        rect.left += bcr.left;
        rect.top += bcr.top;
    }
    rect.bottom = rect.top + rect.height;
    rect.right = rect.left + rect.width;
    return rect;
}
void function ($, undefined) {
    var INVALIDATE_CLICKS_AFTER_TAP_THRESHOLD = 600;
    var incrementalElementId = 0;
    var mutex = 0;
    $.fn.tap = function (threshold, callback, touchOnly) {
        if (typeof threshold === 'function') {
            touchOnly = callback;
            callback = threshold;
            threshold = 15;
        }
        if ('ontouchstart' in window) {
            this.each(function () {
                var moveDistance = 0;
                var touch = null;
                var elementId = ++incrementalElementId;
                var startPoint = null
                var touching = false;
                var self = this;
                var $self = $(this);
                var invalidateClicksBefore = null;

                $self.click(function () {
                    if (invalidateClicksBefore != null && Date.now() < invalidateClicksBefore) {
                        return;
                    } else {
                        callback.apply(self, arguments);
                    }
                });

                $self.bind('touchstart', function (e) {
                    if (mutex != 0) return;
                    else mutex = elementId;

                    touching = true;
                    moveDistance = 0;

                    if (e.originalEvent.touches && e.originalEvent.touches[0]) {
                        touch = e.originalEvent.touches[0];
                        startPoint = {
                            x: touch.screenX,
                            y: touch.screenY,
                            px: touch.pageX,
                            py: touch.pageY,
                            cx: touch.clientX,
                            cy: touch.clientY
                        }
                    }
                });

                $self.bind('touchend', function (e) {
                    if (mutex == elementId) mutex = 0;
                    if (!touching) return;
                    touching = false;
                    if (moveDistance < threshold) {
                        invalidateClicksBefore = Date.now() + INVALIDATE_CLICKS_AFTER_TAP_THRESHOLD;
                        e.pageX = startPoint.px;
                        e.pageY = startPoint.py;
                        e.clientX = startPoint.cx;
                        e.clientY = startPoint.cy;
                        e.screenX = startPoint.x;
                        e.scrrenY = startPoint.y;
                        callback.apply(self, arguments);
                    } else {
                        $self.trigger('tap-failed');
                    }
                });

                $self.bind('touchmove', function (e) {
                    if (!touching) return;
                    if (e.originalEvent.touches.length == 0 || startPoint === null) {
                        return touching = false;
                    }

                    touch = e.originalEvent.touches[0];

                    moveDistance = Math.sqrt(Math.pow(touch.screenX - startPoint.x, 2) +
                        Math.pow(touch.screenY - startPoint.y, 2));

                    if (moveDistance > threshold) {
                        $self.trigger('exceed-tap-threshold');
                        touching = false;
                    }
                });

                $self.bind('touchcancel', function () {
                    if (mutex == elementId) mutex = 0;
                    touching = false;
                    $self.trigger('tap-failed');
                })
            })
        } else if (!touchOnly) {
            this.click(callback);
        }
        return this;
    }
}(window.jQuery || window.$);
