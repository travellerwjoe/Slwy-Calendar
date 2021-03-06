/**
 * @preserve jquery.Slwy.Calendar.js
 * @author Joe.Wu
 * @version v1.5.3
 */
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        require(['jQuery'], factory)
    } else if (typeof module !== 'undefined' && typeof module.exports === 'object') {
        module.exports = factory(require('jQuery'))
    } else {
        root.SlwyCalendar = factory(root.jQuery)
    }
}(this, function ($) {
    var SETTING = {
        locales: {
            en_US: {
                daysShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
                days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
                monthsShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
                today: 'Today',
                getYearMonth: function (year, month) {
                    return this.months[month] + ' ' + year
                }
            },
            zh_CN: {
                daysShort: ["日", "一", "二", "三", "四", "五", "六"],
                days: ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"],
                monthsShort: ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"],
                months: ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"],
                today: '今天',
                getYearMonth: function (year, month) {
                    return year + '年' + this.months[month]
                }
            }
        },
        getTemplate: function (tplName) {
            var headTemplate = '<thead>' +
                '<tr class="' + this.prefix + '-calendar-header">' +
                '<th></th>' +
                '<th colspan="5" class="' + this.prefix + '-calendar-switch">' +
                '<div class="' + this.prefix + '-calendar-select"></div></th>' +
                '<th></th>' +
                '</tr></thead>';
            var contTemplate = '<tbody><tr><td colspan="7"></td></tr></tbody>';
            var tableGroupTemplate = '<div class="' + this.prefix + '-calendar-table-group">' +
                '<div class="' + this.prefix + '-calendar-table-group-bg"></div>' +
                '</div>'
            var tableTemplate = '<table class="' + this.prefix + '-calendar-table">' +
                headTemplate +
                '<tbody></tbody>' +
                '</table>';
            var template = '<div class="' + this.prefix + '-calendar">' +
                '<div class="' + this.prefix + '-calendar-caret"></div>' +
                '<div class="' + this.prefix + '-calendar-action">' +
                '<div class="' + this.prefix + '-calendar-prev">' +
                '<i class="' + this.prefix + '-calendar-prev-icon"></i></div>' +
                '<div class="' + this.prefix + '-calendar-next">' +
                '<i class="' + this.prefix + '-calendar-next-icon"></i></div>' +
                '</div>' +
                '<div class="' + this.prefix + '-calendar-days">' +
                // tableTemplate +
                '</div>' +
                '<div class="' + this.prefix + '-calendar-months">' +
                '<table class="' + this.prefix + '-calendar-table">' +
                headTemplate +
                contTemplate +
                '</table>' +
                '</div>' +
                '<div class="' + this.prefix + '-calendar-years">' +
                '<table class="' + this.prefix + '-calendar-table">' +
                headTemplate +
                contTemplate +
                '</table>' +
                '</div>' +
                '</div>';
            var tpl = {
                headTemplate: headTemplate,
                contTemplate: contTemplate,
                tableTemplate: tableTemplate,
                tableGroupTemplate: tableGroupTemplate,
                template: template
            }
            return tpl[tplName ? (tplName + 'Template') : 'template']
        },
        prefix: 'Slwy',
        theme: {
            THEME_CUTE: 'cute',
            THEME_CUTE_NOBORDER: 'cute-noborder'
        },
        size: {
            sm: 'sm'
        }
    }

    var VARS = {
        defaults: {
            locale: 'zh_CN',//语言时区  
            highlightWeek: true,//是否高亮周末
            onlyThisMonth: false,//每个面板只显示本月
            showLunarAndFestival: false,//显示农历和节日
            showFestival: false,//只显示节日
            showMainFestival: false,//只显示主要节假日
            mainFestival: [],//配置要显示的主要节日列表
            paneCount: 1,//面板数量
            minDate: null,
            maxDate: null,
            dateFormat: 'yyyy-MM-dd',
            onChangeDate: null,
            viewMode: 'days',
            minViewMode: 'days',
            theme: 'THEME_CUTE',
            invalidTips: '该日期不可选',
            size: null,//日历大小，sm 与 默认
            caret: true,
            paneCountOfGroup: 3, // 一组显示的paneCount数量
            weekStart: 0,//一周开始星期，0星期日
            yearStart: 1900,//年份开始
            yearEnd: 2050,//年份结束
        },
        festival: {
            "0101": "元旦",
            "0214": "情人节",
            "0308": "妇女节",
            "0312": "植树节",
            "0315": "消费者权益日",
            "0401": "愚人节",
            "0501": "劳动节",
            "0504": "青年节",
            "0512": "护士节",
            "0601": "儿童节",
            "0701": "建党节",
            "0801": "建军节",
            "0910": "教师节",
            "0928": "孔子诞辰",
            "1001": "国庆节",
            "1006": "老人节",
            "1024": "联合国日",
            "1224": "平安夜",
            "1225": "圣诞节"
        },
        lunarFestival: {
            "0101": "春节",
            "0115": "元宵",
            "0505": "端午",
            "0707": "七夕",
            "0715": "中元",
            "0815": "中秋",
            "0909": "重阳",
            "1208": "腊八",
            "1224": "小年"
        },
        mainFestival: ['元旦', '除夕', '春节', '元宵', '情人节', '清明', '劳动节', '端午', '儿童节', '七夕', '国庆节', '中秋', '重阳', '圣诞节'],
        modesName: ['days', 'months', 'years'],
        modes: [
            {
                className: 'days',
                name: 'Days',
                navFnc: 'Month',
                navStep: 1,
                level: 0
            },
            {
                className: 'months',
                name: 'Months',
                navFnc: 'FullYear',
                navStep: 1,
                level: 1
            },
            {
                className: 'years',
                name: 'Years',
                navFnc: 'FullYear',
                navStep: 10,
                level: 2
            }
        ],
        events: {
            clickEvent: 'click.' + SETTING.prefix + '.Calendar',
            focusEvent: 'focus.' + SETTING.prefix + '.Calendar',
            blurEvent: 'blur.' + SETTING.prefix + '.Calendar',
            keyupEvent: 'keyup.' + SETTING.prefix + '.Calendar',
            keydownEvent: 'keydown.' + SETTING.prefix + '.Calendar',
            inputEvent: 'input.' + SETTING.prefix + '.Calendar',
            changeEvent: 'change.' + SETTING.prefix + '.Calendar',
            changeDateEvent: 'changeDate.' + SETTING.prefix + '.Calendar'
        },
        className: {
            active: SETTING.prefix + '-calendar-active',
            activeDay: SETTING.prefix + '-calendar-day-active',
            disabled: SETTING.prefix + '-calendar-disabled',
            prev: SETTING.prefix + '-calendar-prev',
            next: SETTING.prefix + '-calendar-next',
            day: SETTING.prefix + '-calendar-day',
            days: SETTING.prefix + '-calendar-days',
            old: SETTING.prefix + '-calendar-old',
            _new: SETTING.prefix + '-calendar-new',
            week: SETTING.prefix + '-calendar-week',
            month: SETTING.prefix + '-calendar-month',
            months: SETTING.prefix + '-calendar-months',
            year: SETTING.prefix + '-calendar-year',
            years: SETTING.prefix + '-calendar-years',
            title: SETTING.prefix + '-calendar-title',
            titles: SETTING.prefix + '-calendar-titles',
            select: SETTING.prefix + '-calendar-select',
            today: SETTING.prefix + '-calendar-today',
            lunar: SETTING.prefix + '-calendar-lunar',
            festival: SETTING.prefix + '-calendar-festival',
            action: SETTING.prefix + '-calendar-action',
            // hidden: SETTING.prefix + '-calendar-hidden',
            nocaret: SETTING.prefix + '-calendar-nocaret',
            caret: SETTING.prefix + '-calendar-caret',
            _switch: SETTING.prefix + '-calendar-switch',
        },
        //用于限制日期的正则，$y-$m-$d 
        limitReg: /^\$\{((?:[yY]{1}|\d+){1}(?:[\+\-]\d+)?)\}[-\/]\$\{((?:[mM]{1}|\d+){1}(?:[\+\-]\d+)?)\}[-\/]\$\{((?:l?[dD]{1}|\d+){1}(?:[\+\-]\d+)?)\}$/,
        //提取参数正则，参数用于动态限制日期
        pickLimitArgReg: /^\$\{(['"]([.#]\w+)['"](?:,(\{.*\}))*)\}$/
    }

    var UTILS = {
        //是否是页面中存在的jquery input对象
        isJqueryElement: function (selector) {
            return (typeof selector === 'object' && !!selector.length) || (/^[.#]{1}[\w]+$/.test(selector))
        },
        //指定元素是否上是否存在指定命名空间的事件
        isEventOnNamespace: function (el, event, namespace) {
            var flag = false,
                events = $._data(el[0], 'events')[event]
            el = $(el)
            if (!events) {
                return flag
            }
            $.each(events, function (index, event) {
                if (typeof event.namespace !== 'undefined' && event.namespace === namespace) {
                    flag = true
                }
            })
            return flag
        },
        //是否闰年
        isLeapYear: function (year) {
            return (((year % 4 === 0) && (year % 100 !== 0)) || (year % 400 === 0));
        },
        //获取year年month月的天数
        getDaysOfYearMonth: function (year, month) {
            return [31, (UTILS.isLeapYear(year) ? 29 : 28), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month];
        },
        //比较两个时间是否同一天
        isSameDay: function (date1, date2) {
            return date1.getFullYear() === date2.getFullYear() && date1.getMonth() === date2.getMonth() && date1.getDate() === date2.getDate()
        },
        //返回有效的date
        getValidDate: function (date) {
            return new Date(typeof date === 'string' ? date.replace(/(\d+)[\-\/](\d+)[\-\/](\d+).*/, '$1/$2/$3') : UTILS.setDateTimeZero(date))
        },
        //将date的时间部分置为0
        setDateTimeZero: function (date) {
            if (!(date instanceof Date)) date = new Date()
            date.setHours(0)
            date.setMinutes(0)
            date.setSeconds(0)
            date.setMilliseconds(0)
            return date
        },
        formatDateTime: function (date, fmt) {
            if (typeof (date) == 'string') date = date.replace(/-/g, '/');
            date = new Date(date).toString() !== 'Invalid Date' ? new Date(date) : new Date();
            var o = {
                "M+": date.getMonth() + 1, //月份 
                "d+": date.getDate(), //日 
                "h+": date.getHours(), //小时 
                "m+": date.getMinutes(), //分 
                "s+": date.getSeconds(), //秒 
                "q+": Math.floor((date.getMonth() + 3) / 3), //季度 
                "S": date.getMilliseconds(), //毫秒
                "D+": formatDay(date.getDay())  //周几
            };
            function formatDay(num) {
                switch (num) {
                    case 0: return '周日';
                    case 1: return '周一';
                    case 2: return '周二';
                    case 3: return '周三';
                    case 4: return '周四';
                    case 5: return '周五';
                    case 6: return '周六';
                }
            }
            if (/(y+)/.test(fmt)) {
                fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
            }
            for (var k in o) {
                if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
            }
            return fmt;
        }
    }


    var lunarInfo = new Array(
        0x04bd8, 0x04ae0, 0x0a570, 0x054d5, 0x0d260, 0x0d950, 0x16554, 0x056a0, 0x09ad0, 0x055d2,
        0x04ae0, 0x0a5b6, 0x0a4d0, 0x0d250, 0x1d255, 0x0b540, 0x0d6a0, 0x0ada2, 0x095b0, 0x14977,
        0x04970, 0x0a4b0, 0x0b4b5, 0x06a50, 0x06d40, 0x1ab54, 0x02b60, 0x09570, 0x052f2, 0x04970,
        0x06566, 0x0d4a0, 0x0ea50, 0x06e95, 0x05ad0, 0x02b60, 0x186e3, 0x092e0, 0x1c8d7, 0x0c950,
        0x0d4a0, 0x1d8a6, 0x0b550, 0x056a0, 0x1a5b4, 0x025d0, 0x092d0, 0x0d2b2, 0x0a950, 0x0b557,
        0x06ca0, 0x0b550, 0x15355, 0x04da0, 0x0a5d0, 0x14573, 0x052d0, 0x0a9a8, 0x0e950, 0x06aa0,
        0x0aea6, 0x0ab50, 0x04b60, 0x0aae4, 0x0a570, 0x05260, 0x0f263, 0x0d950, 0x05b57, 0x056a0,
        0x096d0, 0x04dd5, 0x04ad0, 0x0a4d0, 0x0d4d4, 0x0d250, 0x0d558, 0x0b540, 0x0b5a0, 0x195a6,
        0x095b0, 0x049b0, 0x0a974, 0x0a4b0, 0x0b27a, 0x06a50, 0x06d40, 0x0af46, 0x0ab60, 0x09570,
        0x04af5, 0x04970, 0x064b0, 0x074a3, 0x0ea50, 0x06b58, 0x055c0, 0x0ab60, 0x096d5, 0x092e0,
        0x0c960, 0x0d954, 0x0d4a0, 0x0da50, 0x07552, 0x056a0, 0x0abb7, 0x025d0, 0x092d0, 0x0cab5,
        0x0a950, 0x0b4a0, 0x0baa4, 0x0ad50, 0x055d9, 0x04ba0, 0x0a5b0, 0x15176, 0x052b0, 0x0a930,
        0x07954, 0x06aa0, 0x0ad50, 0x05b52, 0x04b60, 0x0a6e6, 0x0a4e0, 0x0d260, 0x0ea65, 0x0d530,
        0x05aa0, 0x076a3, 0x096d0, 0x04bd7, 0x04ad0, 0x0a4d0, 0x1d0b6, 0x0d250, 0x0d520, 0x0dd45,
        0x0b5a0, 0x056d0, 0x055b2, 0x049b0, 0x0a577, 0x0a4b0, 0x0aa50, 0x1b255, 0x06d20, 0x0ada0)

    var solarTerms = new Array("小寒", "大寒", "立春", "雨水", "惊蛰", "春分", "清明", "谷雨", "立夏", "小满", "芒种", "夏至", "小暑", "大暑", "立秋", "处暑", "白露", "秋分", "寒露", "霜降", "立冬", "小雪", "大雪", "冬至");

    var solarTermsInfo = new Array(0, 21208, 42467, 63836, 85337, 107014, 128867, 150921, 173149, 195551, 218072, 240693, 263343, 285989, 308563, 331033, 353350, 375494, 397447, 419210, 440795, 462224, 483532, 504758);

    var cDays = new Array('十', '一', '二', '三', '四', '五', '六', '七', '八', '九');
    var cDays2 = new Array('初', '十', '廿', '三');


    function Calendar(opts, srcElement) {
        this.opts = $.extend(true, {}, VARS.defaults, opts)
        var template = SETTING.getTemplate()
        this.$calendar = $(template).appendTo('body')
        this.$calendarDays = this.$calendar.find('.' + VARS.className.days)
        this.$calendarMonths = this.$calendar.find('.' + VARS.className.months)
        this.$calendarYears = this.$calendar.find('.' + VARS.className.years)
        this.$calendarAction = this.$calendar.find('.' + VARS.className.action)
        this.$srcElement = srcElement && $(srcElement).length ? $(srcElement) : null//触发元素

        this.now = new Date()
        this.viewDate = this.$srcElement && this.$srcElement.val() ? UTILS.getValidDate(this.$srcElement.val()) : new Date() //当前面板显示时间
        this.viewDate.setDate(1)
        this.activeDate = this.$srcElement && this.$srcElement.val() ? UTILS.getValidDate(this.$srcElement.val()) : new Date() //当前选中时间
        this.paneCount = this.opts.paneCount //面板数量
        this.curPaneIndex = 0 //当前面板索引
        this.Lunar = Lunar
        this.mainFestival = $.isArray(this.opts.mainFestival) && this.opts.mainFestival.length && this.opts.mainFestival || VARS.mainFestival
        this.viewMode = $.inArray(this.opts.viewMode, VARS.modesName) >= 0 ? $.inArray(this.opts.viewMode, VARS.modesName) : 0
        this.minViewMode = $.inArray(this.opts.minViewMode, VARS.modesName) >= 0 ? $.inArray(this.opts.minViewMode, VARS.modesName) : 0
        this.theme = SETTING.theme[this.opts.theme]
        this.yearStart = typeof this.opts.yearStart === 'number' ? parseInt(this.opts.yearStart) : 1900
        this.yearEnd = typeof this.opts.yearEnd === 'number' ? parseInt(this.opts.yearEnd) : 2050
        this.maxDate = new Date(this.yearEnd, 0, 1)
        this.minDate = new Date(this.yearStart, 11, 31)
        this.maxDateLimitOpts = null //动态限制的最大日期选项 {d:1,m:-1,y} || {d:true} || {ld:true}等
        this.minDateLimitOpts = null
        this.maxDateElement = [] //maxDate或minDate规则中包含的元素
        this.minDateElement = []
        this.size = SETTING.size[this.opts.size]
        this.weekStart = parseInt(this.opts.weekStart) >= 0 && parseInt(this.opts.weekStart) < 7 ? parseInt(this.opts.weekStart) : 0

        $.each(['minDate', 'maxDate'], $.proxy(function (i, date) {
            var optsDate = this.opts[date]
            this[date + 'Alternative'] = []
            if (typeof optsDate === 'string') {
                optsDates = optsDate.split('||')
                optsDate = $.trim(optsDates[0])
                this[date + 'Alternative'] = optsDates.slice(1) //minDate或maxDate的备用，用于有多个限制条件的minDate或maxDate
            }
            this.setMinOrMaxDate(date, optsDate)
            //如果minDate或maxDate为Invalid Date使用备用规则设置
            for (var i = 0; !this[date].valueOf() && this[date + 'Alternative'][i]; i++) {
                this.setMinOrMaxDate(date, $.trim(this[date + 'Alternative'][i]))
            }
        }, this))

        if (this.theme) {
            this.$calendar.addClass(SETTING.prefix + '-calendar-' + this.theme)
        }

        if (this.size) {
            this.$calendar.addClass(SETTING.prefix + '-calendar-' + this.size)
        }

        if (!this.$srcElement || !this.opts.caret) {
            this.$calendar.addClass(VARS.className.nocaret).find('.' + VARS.className.caret).remove()
        }
        //如有触发元素隐藏日历待触发时显示
        /*if (this.$srcElement) {
            this.$calendar.addClass(VARS.className.hidden)
        }*/

        this.init()
    }
    Calendar.prototype.init = function () {
        this.bind()
        this.show()
    }

    Calendar.prototype.bind = function () {
        var _this = this,
            clickEvent = VARS.events.clickEvent,
            focusEvent = VARS.events.focusEvent,
            blurEvent = VARS.events.blurEvent,
            keyupEvent = VARS.events.keyupEvent,
            keydownEvent = VARS.events.keydownEvent,
            inputEvent = VARS.events.inputEvent,
            changeEvent = VARS.events.changeEvent,
            changeDateEvent = VARS.events.changeDateEvent

        //检查绑定控件的值是否是有效的可选日期，满足lte maxData && gte minDate
        function checkDateValid() {
            if (!$(this).val()) return true
            var date = new Date(UTILS.getValidDate($(this).val()))
            if (!date.valueOf() || (_this.maxDate && date.valueOf() > new Date(_this.maxDate).valueOf()) || (_this.minDate && date.valueOf() < new Date(_this.minDate).valueOf())) {
                alert(_this.opts.invalidTips);
                $(this).val('').trigger(keyupEvent).focus()
                return false
            }
            return true
        }

        if (this.$srcElement) {
            this.$srcElement.on(keyupEvent + ' ' + changeEvent, function () {
                var val = $(this).val(),
                    date
                // if (!val) return
                date = val ? UTILS.getValidDate(val) : null
                _this.activeDate = date && date.valueOf() ? new Date(date) : null
                _this.viewDate = date && date.valueOf() ? new Date(date) : new Date()
                _this.viewDate.setDate(1)
                _this.show()
            }).on(keydownEvent, function (e) {
                var keyCode = e.keyCode || e.which
                //tab键失去焦点前
                if (keyCode === 9) {
                    if (!checkDateValid.call(this)) {
                        e.preventDefault();
                        return
                    }
                    _this.close()
                }
            }).on(focusEvent, function () {
                _this.open()
            }).on(blurEvent, function () {
                checkDateValid.call(this)
            })

            $(document).on(clickEvent, function (e) {
                var $target = $(e.target)
                if (!$target.is(_this.$srcElement) && !$target.closest('.' + SETTING.prefix + '-calendar').is(_this.$calendar)) {
                    _this.close()
                }
            })
        }

        //当minDate或maxDate是另一个元素时与其交互改变可选日期
        $.each(['minDate', 'maxDate'], function (index, date) {
            //多个限制规则中可能含有多个动态元素
            for (var i = 0; i < _this[date + 'Element'].length; i++) {
                if (_this[date + 'Element'][i] && _this[date + 'Element'][i].length) {
                    var $date = _this[date + 'Element'][i],
                        //改变与另一个日历交互的minDate和maxDate日期
                        changeOtherDate = function (e) {
                            if (e.type === "changeDate" && e.namespace !== 'Calendar.' + SETTING.prefix) return
                            var value = getPriorDateElementValue(e.data.index) || e.date || $(this).val() //按限制规则顺序优先获取限制规则前面元素的值，若无值则依次取后面元素的值
                            _this[date] = _this.getLimitDate(UTILS.getValidDate(value), _this[date + 'LimitOpts'])
                            //如果minDate或maxDate为Invalid Date使用备用规则设置
                            for (var i = 0; !_this[date].valueOf() && _this[date + 'Alternative'][i]; i++) {
                                _this.setMinOrMaxDate(date, $.trim(_this[date + 'Alternative'][i]))
                            }

                            _this.viewDate = _this.$srcElement && _this.$srcElement.val() ? UTILS.getValidDate(_this.$srcElement.val()) : new Date()
                            _this.viewDate.setDate(1)
                            _this.activeDate = _this.$srcElement ? UTILS.getValidDate(_this.$srcElement.val()) : null
                            _this.renderDays()
                        },
                        //多个限制规则中存在多个动态元素优先获取第一个存在值的元素的值
                        getPriorDateElementValue = function (maxIndex) {
                            for (var i = 0; i < maxIndex; i++) {
                                if (_this[date + 'Element'][i].val()) {
                                    return _this[date + 'Element'][i].val()
                                }
                            }
                            return
                        }

                    $date.on(changeDateEvent, { index: i }, changeOtherDate).on(keyupEvent + ' ' + inputEvent + ' ' + changeEvent, { index: i }, changeOtherDate)
                }
            }
        })

        this.$calendar.on(clickEvent, function (e) {
            e.stopPropagation()
            var $target = $(e.target).closest('span, td, th'),
                // activeClassName = VARS.className.active,
                activeDayClassName = VARS.className.activeDay,
                disabledClassName = VARS.className.disabled,
                dateAttr = SETTING.prefix + '-calendar-date'

            if ($target.is('th') && $target.hasClass(VARS.className._switch)) {
                _this.show(1)
            } else if ($target.is('td') && $target.hasClass(VARS.className.day)) {
                if ($target.hasClass(disabledClassName)) {
                    return
                }
                var dateStr = $target.attr(dateAttr);

                changeDate(dateStr)
                _this.close()
            } else if ($target.is('span')) {
                var dateStr = $target.attr(dateAttr),
                    // curMode = VARS.modes[_this.viewMode],
                    setFunc,
                    renderFunc,
                    pos = 0

                if (_this.viewMode === 1) {
                    setFunc = 'setMonth'
                    pos = $target.index()
                    renderFunc = 'renderDays'
                } else if (_this.viewMode === 2) {
                    setFunc = 'setFullYear'
                    renderFunc = 'renderMonths'
                    pos = dateStr
                }
                if (_this.viewMode > 0 && _this.viewMode === _this.minViewMode) {
                    changeDate(dateStr)
                }
                _this.viewDate[setFunc].call(_this.viewDate, pos);

                (function () {
                    var oldViewDate = new Date(_this.viewDate),
                        paneCount = _this.opts.paneCount
                    _this.viewDate.setMonth(_this.viewDate.getMonth() + paneCount - 1)
                    if (_this.viewDate.getFullYear() > _this.yearEnd) {
                        oldViewDate.setMonth(oldViewDate.getMonth() - paneCount + 1)
                    }
                    _this.viewDate = oldViewDate
                })()
                _this.show(-1)
            }

            function changeDate(date) {
                var date = new Date(date),
                    formatedDate = UTILS.formatDateTime(date, _this.opts.dateFormat),
                    activeDateLunarInfo,
                    callbackRes = false
                if (new Date(_this.activeDate).valueOf() === date.valueOf()) {
                    return
                }

                _this.$calendarDays.find('td').removeClass(activeDayClassName)
                $target.addClass(activeDayClassName)

                _this.activeDate = date
                activeDateLunarInfo = new _this.Lunar(_this.activeDate)
                callbackRes = typeof _this.opts.onChangeDate === 'function' && _this.opts.onChangeDate.call(_this, _this.activeDate, formatedDate, activeDateLunarInfo, {
                    close: $.proxy(_this.close, _this),
                    open: $.proxy(_this.open, _this),
                    formatDateTime: UTILS.formatDateTime
                })

                if (_this.$srcElement) {
                    $.each(['changeDate', changeDateEvent], function (index, item) {
                        _this.$srcElement.trigger({
                            type: item,
                            date: new Date(_this.activeDate),
                            value: formatedDate,
                            lunarInfo: $.extend(true, {}, activeDateLunarInfo),
                            formatDateTime: UTILS.formatDateTime,
                            close: $.proxy(_this.close, _this),
                            open: $.proxy(_this.open, _this)
                        })
                    })
                    //如果onChangeDate回调未声明并且未在jqueryDom对象上绑定无命名空间的onChangeDate事件或者onChangeDate申明并调用返回的结果为true执行默认操作
                    if (typeof _this.opts.onChangeDate !== 'function' && !UTILS.isEventOnNamespace(_this.$srcElement, 'changeDate', '') || callbackRes) {
                        _this.$srcElement.val(formatedDate)
                        checkDateValid.call(_this.$srcElement)
                    }
                }
            }
        })

        this.$calendarAction.on(clickEvent, function (e) {
            var $target = $(e.target).closest('div'),
                prevClassName = VARS.className.prev,
                nextClassName = VARS.className.next,
                curMode = VARS.modes[_this.viewMode],
                setFunc = 'set' + curMode.navFnc,
                getFunc = 'get' + curMode.navFnc,
                navStep = curMode.navStep,
                oldViewDate = new Date(_this.viewDate)
            if ($target.hasClass(prevClassName)) {
                var prevStep = _this.viewMode === 0 ? _this.paneCount * 2 - navStep : navStep
                _this.viewDate[setFunc].call(_this.viewDate, _this.viewDate[getFunc].call(_this.viewDate) - prevStep)
            } else if ($target.hasClass(nextClassName)) {
                var nextStep = navStep
                _this.viewDate[setFunc].call(_this.viewDate, _this.viewDate[getFunc].call(_this.viewDate) + nextStep)
            }

            if (_this.viewDate.getFullYear() > _this.yearEnd || _this.viewDate.getFullYear() < _this.yearStart) {
                _this.viewDate = oldViewDate
                return
            }
            _this.show()
        })

        $(window).on('resize', $.proxy(this.resetCalendarPos, this))
    }

    Calendar.prototype.renderDays = function () {
        var minDate = this.minDate,
            maxDate = this.maxDate,
            tables = [],
            tableGroups = [],
            $tableGroup = $(SETTING.getTemplate('tableGroup'))
        this.$calendarDays.html('');
        this.curPaneIndex = 0;
        (function renderTable() {
            var viewDate = this.viewDate,
                viewYear = viewDate.getFullYear(),
                viewMonth = viewDate.getMonth(),
                nowDate = this.now,
                //上月
                prevMonthDate = new Date(viewYear, viewMonth - 1),
                prevMonthDateY = prevMonthDate.getFullYear(),
                prevMonthDateM = prevMonthDate.getMonth(),
                prevMonthDays = UTILS.getDaysOfYearMonth(prevMonthDateY, prevMonthDateM),
                //下月
                nextMonthDate,
                prevMonthDateCount = nextMonthDateCount = 0,
                $table = $(SETTING.getTemplate('table')),
                daysHtml = "",
                tr = ''

            prevMonthDate.setDate(prevMonthDays)
            prevMonthDate.setDate(prevMonthDays - (prevMonthDate.getDay() - this.weekStart + 7) % 7)

            nextMonthDate = new Date(prevMonthDate)
            nextMonthDate.setDate(nextMonthDate.getDate() + 42)

            renderTitle.call(this, $table);
            for (startIndex = 1; prevMonthDate.valueOf() < nextMonthDate.valueOf(); prevMonthDate.setDate(prevMonthDate.getDate() + 1), startIndex++) {
                var prevY = prevMonthDate.getFullYear(),
                    prevM = prevMonthDate.getMonth(),
                    prevD = prevMonthDate.getDate(),
                    prevW = prevMonthDate.getDay(),
                    className = VARS.className.day,
                    calendarDateAttr = SETTING.prefix + '-calendar-date="' + prevY + '/' + (prevM + 1) + '/' + prevD + '"',
                    isShow = true,
                    td

                if (prevY < viewYear || (prevY === viewYear && prevM < viewMonth)) {
                    if (this.opts.onlyThisMonth) isShow = false
                    className += ' ' + VARS.className.old
                    prevMonthDateCount++
                } else if (prevY > viewYear || (prevY === viewYear && prevM > viewMonth)) {
                    if (this.opts.onlyThisMonth) isShow = false
                    className += ' ' + VARS.className._new
                    nextMonthDateCount++
                }

                if (minDate && prevMonthDate.valueOf() < minDate.valueOf() || maxDate && prevMonthDate.valueOf() > maxDate.valueOf()) {
                    className += ' ' + VARS.className.disabled
                }

                if ((prevW === 0 || prevW === 6) && this.opts.highlightWeek) {
                    className += ' ' + VARS.className.week
                }

                if (this.activeDate && (prevMonthDate.valueOf() === this.activeDate.valueOf())) {
                    className += ' ' + VARS.className.activeDay
                }

                if (startIndex % 7 === 1) {
                    tr += '<tr>'
                }

                td = isShow ? '<td class="' + className + '" ' + calendarDateAttr + '>' +
                    this.getDay(prevMonthDate, nowDate) +
                    '</td>' : '<td></td>'

                tr += td

                if (startIndex % 7 === 0) {
                    tr += '</tr>'
                    if (this.opts.onlyThisMonth && (prevMonthDateCount === 7 || nextMonthDateCount === 7)) {
                        tr = tr.replace(/<tr>/, '<tr style="display:none"')
                    }
                    prevMonthDateCount = nextMonthDateCount = 0
                    daysHtml += tr
                    tr = ''
                }
            }

            $table.find('tbody').html(daysHtml)
            $table.find('.' + VARS.className.select).text(SETTING.locales[this.opts.locale].getYearMonth(viewDate.getFullYear(), viewDate.getMonth()))
            tables.push($table[0])

            this.curPaneIndex++
            if (this.curPaneIndex < this.paneCount) {
                this.viewDate.setMonth(this.viewDate.getMonth() + 1)
                renderTable.call(this)
            }

            if (this.curPaneIndex > 0 && (this.curPaneIndex % this.opts.paneCountOfGroup) === this.opts.paneCountOfGroup || this.curPaneIndex === this.paneCount) {
                $tableGroup.append(tables)
                tableGroups.push($tableGroup)
                tables = []
                $tableGroup = $(SETTING.getTemplate('tableGroup'))
            }
            function renderTitle(tableEl) {
                var weekStart = this.weekStart, tr = '<tr class="' + VARS.className.titles + '">';
                for (var titleIndex = weekStart; titleIndex < weekStart + 7; titleIndex++) {
                    var className = VARS.className.title,
                        th

                    if (this.opts.highlightWeek && ((titleIndex % 7) === 0 || (titleIndex % 7) === 6)) {
                        className += ' ' + VARS.className.week
                    }

                    th = '<th class="' + className + '">' +
                        SETTING.locales[this.opts.locale].daysShort[titleIndex % 7] +
                        '</th>'

                    tr += th
                }
                tableEl.find('thead').append(tr)
            }
        }.call(this))
        this.$calendarDays.append(tableGroups)
    }

    Calendar.prototype.renderMonths = function () {
        var viewDate = this.viewDate,
            activeYear = this.activeDate ? this.activeDate.getFullYear() : null,
            activeMonth = this.activeDate ? this.activeDate.getMonth() : null,
            className = VARS.className.month,
            html = ''

        for (var i = 0; i < 12; i++) {
            var clsName = className,
                year = viewDate.getFullYear(),
                attr = SETTING.prefix + '-calendar-date="' + year + '-' + (i + 1) + '"'
            year === activeYear && i === activeMonth && (clsName += ' ' + VARS.className.active)
            html += '<span class="' + clsName + '" ' + attr + '>' +
                SETTING.locales[this.opts.locale].months[i] +
                '</span>'
        }
        this.$calendarMonths.find('tbody td').first().html(html)
        this.$calendarMonths.find('.' + VARS.className.select).text(viewDate.getFullYear())
    }

    Calendar.prototype.renderYears = function () {
        var viewDate = this.viewDate,
            className = VARS.className.year,
            viewYear = viewDate.getFullYear(),
            activeYear = this.activeDate ? this.activeDate.getFullYear() : null,
            startYear = parseInt(viewYear / 10) * 10,
            html = ''
        for (var i = -1; i <= 10; i++) {
            var clsName = className,
                year = startYear + i,
                attr = SETTING.prefix + '-calendar-date="' + year + '"'
            i === -1 && (clsName += ' ' + VARS.className.old)
            i === 10 && (clsName += ' ' + VARS.className._new)
            year === activeYear && (clsName += ' ' + VARS.className.active)
            if (year > this.yearEnd || year < this.yearStart) continue
            html += '<span class="' + clsName + '" ' + attr + '>' +
                year +
                '</span>'
        }

        this.$calendarYears.find('tbody td').first().html(html)
        this.$calendarYears.find('.' + VARS.className.select).text(startYear + '-' + (startYear + 9))
    }

    Calendar.prototype.show = function (level) {
        if (level) {
            this.viewMode = Math.max(this.minViewMode,
                Math.min(2, this.viewMode + level))
        }
        var renderFunc = 'render' + VARS.modes[this.viewMode].name
        this.paneCount = this.viewMode > 0 ? 1 : this.opts.paneCount

        this[renderFunc].call(this)
        this.$calendar.find('>div').hide().
            filter('.' + SETTING.prefix + '-calendar-' + VARS.modes[this.viewMode].className).show()
        this.resetCalendarStyle()
    };

    Calendar.prototype.getDay = function (loopDate, nowDate) {
        var str = '',
            todayClassName = VARS.className.today,
            lunarClassName = VARS.className.lunar,
            festivalClassName = VARS.className.festival

        if (UTILS.isSameDay(loopDate, nowDate)) {
            str = '<div class="' + todayClassName + '">' + SETTING.locales[this.opts.locale].today + '</div>'
        } else {
            str = loopDate.getDate()
        }
        if (this.opts.showLunarAndFestival) {
            str += '<div class="' + lunarClassName + '">' + this.getLunarAndFestival(loopDate) + '</div>'
        } else if (this.opts.showMainFestival || this.opts.showFestival) {
            var festival = this.getLunarAndFestival(loopDate, {
                onlyReturnMainFestival: this.opts.showMainFestival,
                onlyReturnFestival: this.opts.showFestival
            })
            this.opts.showMainFestival && !!festival && (str = '')
            str += festival ? ('<div class="' + festivalClassName + '">' + festival + '</div>') : ''
        }
        return str
    }

    Calendar.prototype.getLunarAndFestival = function (date, options) {
        var lunar = new this.Lunar(date),
            sMonthDay = UTILS.formatDateTime(date, 'MMdd'),
            lMonthDay = (lunar.month < 10 ? '0' + lunar.month : lunar.month) + (lunar.day < 10 ? '0' + lunar.day : lunar.day),
            sFestival = VARS.festival[sMonthDay],
            lFestival = VARS.lunarFestival[lMonthDay],
            lDay = lunar.cDay,
            sTerm = lunar.sTerm,
            lunarStr,
            festival,
            mainFestival,
            defaults = {
                onlyReturnFestival: false,
                onlyReturnMainFestival: false
            }
        $.extend(defaults, options)

        if (lunar.month === 12) {
            var lEndDay = lunar.isLeap ? lunar.getLunarLeapDaysByYear(lunar.year) : lunar.getLunarDaysByYearMonth(lunar.year, lunar.month)
            if (lEndDay === lunar.day) {
                lFestival = '除夕'
            }
        }

        lunarStr = sFestival || lFestival || sTerm || lDay
        festival = sFestival || lFestival || sTerm
        mainFestival = $.inArray(festival, this.mainFestival) >= 0 && festival
        return defaults.onlyReturnMainFestival ? mainFestival : defaults.onlyReturnFestival ? festival : lunarStr
    }

    Calendar.prototype.resetCalendarStyle = function () {
        var $table = this['$calendar' + VARS.modes[this.viewMode].name].find('table'),
            paneCountOfGroup = this.opts.paneCountOfGroup,
            // tableHeight = $table.height(),
            tableWidth = this.viewMode === 0 ? $table.width() + 20 : $table.width()
        this.$calendar
            .width(this.paneCount > paneCountOfGroup ? tableWidth * paneCountOfGroup : tableWidth * this.paneCount)
        // .height(Math.ceil(this.paneCount / 3) * tableHeight)
        this.resetCalendarPos()
    }

    Calendar.prototype.resetCalendarPos = function () {
        if (!this.$srcElement) return
        var offset = this.$srcElement.offset(),
            srcElH = this.$srcElement.outerHeight()
        this.$calendar.css({
            left: offset.left,
            top: offset.top + srcElH,
            position: 'absolute'
        })
    }

    Calendar.prototype.open = function () {
        this.resetCalendarPos()
        this.$calendar.show()
        //设置viewDate与activeDate为控件的值
        if (this.$srcElement && this.$srcElement.val()) {
            var val = this.$srcElement.val()
            if (UTILS.getValidDate(val).valueOf() !== this.activeDate.valueOf()) {
                this.viewDate = UTILS.getValidDate(val)
                this.viewDate.setDate(1)
                this.activeDate = UTILS.getValidDate(val)
                this.show()
            }
        }
    }

    Calendar.prototype.close = function () {
        this.$calendar.hide()
    }

    //获取动态限制的日期
    Calendar.prototype.getLimitDate = function (date, opts) {
        if (!opts) return date
        var optD = opts.d || opts.D || opts.day || opts.Day,
            optM = opts.m || opts.M || opts.month || opts.Month,
            optY = opts.y || opts.Y || opts.year || opts.Year,
            optLD = opts.ld || opts.LD,
            optLM = opts.lm || opts.LM,
            d = date.getDate(),
            m = date.getMonth(),
            y = date.getFullYear()

        if (!date) return
        if (typeof optD === 'number') {
            date.setDate(d + parseInt(optD))
        } else if (typeof optD === 'boolean' && optD) {
            date.setDate(1)
        } else if (typeof optLD === 'boolean' && optLD) {
            date.setDate(UTILS.getDaysOfYearMonth(y, m))
        }
        if (typeof optM === 'number') {
            date.setMonth(m + parseInt(optM))
        } else if (typeof optM === 'boolean' && optM) {
            date.setMonth(0)
            date.setDate(1)
        } else if (typeof optLM === 'boolean' && optLM) {
            date.setMonth(11)
            date.setDate(UTILS.getDaysOfYearMonth(y, m))
        }
        if (typeof optY === 'number') {
            date.setYear(y + parseInt(optY))
        }
        return date
    }

    //设置最小或最大日期
    Calendar.prototype.setMinOrMaxDate = function (date, optsDate) {
        if (optsDate) {
            var matches

            if (typeof optsDate === 'string' && (matches = optsDate.match(VARS.limitReg))) {
                var matchY = matches[1],
                    matchM = matches[2],
                    matchD = matches[3],
                    y = this.now.getFullYear(),
                    m = this.now.getMonth() + 1,
                    d = this.now.getDate()
                matchY = eval(matchY.replace(/y/gi, y))
                matchM = eval(matchM.replace(/m/gi, m))
                matchD = eval(matchD.replace(/ld/gi, UTILS.getDaysOfYearMonth(y, m - 1))).toString()
                matchD = eval(matchD.replace(/d/gi, d))
                this[date] = new Date(matchY, matchM - 1, matchD)
            } else if (typeof optsDate === 'string' && (matches = optsDate.match(VARS.pickLimitArgReg))) {
                var selector = matches[2],
                    limitOpts = matches[3] && eval('(' + matches[3] + ')')
                if (UTILS.isJqueryElement(selector)) {
                    var $selector = $(selector),
                        d = UTILS.getValidDate($(selector).val())
                    this[date + 'Element'].push($(selector))
                    this[date] = d.valueOf() ? this.getLimitDate(UTILS.getValidDate($(selector).val()), limitOpts) : d
                    this[date + 'LimitOpts'] = limitOpts
                }
            } else if (UTILS.isJqueryElement(optsDate)) {
                this[date] = UTILS.getValidDate($(optsDate).val())
                this[date + 'Element'].push($(optsDate))
            } else {
                this[date] = UTILS.getValidDate(optsDate)
            }
        }
    }

    function Lunar(sDate) {
        var i,
            leap = 0,
            temp = 0,
            baseDate = new Date(1900, 0, 31),
            offset = (sDate - baseDate) / 86400000

        this.dayCyl = offset + 40
        this.monCyl = 14
        for (i = 1900; i < 2050 && offset > 0; i++) {
            temp = this.getLunarDaysByYear(i)
            offset -= temp
            this.monCyl += 12
        }
        if (offset < 0) {
            offset += temp
            i--
            this.monCyl -= 12
        }
        this.year = i
        this.yearCyl = i - 1864
        leap = this.getLunarLeapMonthByYear(i) //闰哪个月
        this.isLeap = false
        for (i = 1; i < 13 && offset > 0; i++) {
            if (leap > 0 && i == (leap + 1) && this.isLeap === false) {	//闰月
                --i
                this.isLeap = true
                temp = this.getLunarLeapDaysByYear(this.year)
            } else {
                temp = this.getLunarDaysByYearMonth(this.year, i)
            }
            if (this.isLeap === true && i == (leap + 1)) this.isLeap = false;	//解除闰月
            if (this.isLeap === false) this.monCyl++;
            offset -= temp;
        }
        if (offset == 0 && leap > 0 && i == leap + 1) {
            if (this.isLeap) {
                this.isLeap = false;
            } else {
                this.isLeap = true; --i; --this.monCyl;
            }
        }
        if (offset < 0) {
            offset += temp
            --i
            --this.monCyl
        }
        this.month = i
        this.day = offset + 1
        this.cDay = this.getChineseLunarDay(this.day)
        this.sTermDay1 = this.getSolarTermDay(sDate.getFullYear(), sDate.getMonth() * 2)
        this.sTermDay2 = this.getSolarTermDay(sDate.getFullYear(), sDate.getMonth() * 2 + 1)
        this.sTerm = ''
        if (sDate.getDate() === this.sTermDay1) {
            this.sTerm = solarTerms[sDate.getMonth() * 2]
        } else if (sDate.getDate() === this.sTermDay2) {
            this.sTerm = solarTerms[sDate.getMonth() * 2 + 1]
        }
    }

    Lunar.prototype = {
        //返回农历year年的总天数
        getLunarDaysByYear: function (year) {
            var i, sum = 348;
            for (i = 0x8000; i > 0x8; i >>= 1)
                sum += (lunarInfo[year - 1900] & i) ? 1 : 0;
            return (sum + this.getLunarLeapDaysByYear(year));
        },
        //返回农历year年闰月的天数
        getLunarLeapDaysByYear: function (year) {
            if (this.getLunarLeapMonthByYear(year)) return ((lunarInfo[year - 1900] & 0x10000) ? 30 : 29);
            else return (0);
        },
        //返回农历year年闰几月，不闰返回0
        getLunarLeapMonthByYear: function (year) {
            return (lunarInfo[year - 1900] & 0xf);
        },
        //返回农历year年month月的总天数
        getLunarDaysByYearMonth: function (year, month) {
            return ((lunarInfo[year - 1900] & (0x10000 >> month)) ? 30 : 29);
        },
        //返回中文农历日期
        getChineseLunarDay: function (day) {
            var str = cDays2[Math.floor(day / (day <= 10 ? 11 : 10))];
            str += cDays[day % 10];
            return str
        },
        //返回year年的第n个节气为几日(从0小寒起算)
        getSolarTermDay: function (year, n) {
            var offDate = new Date((31556925974.7 * (year - 1900) + solarTermsInfo[n] * 60000) + Date.UTC(1900, 0, 6, 2, 5));
            return (offDate.getUTCDate())
        }
    }

    function setDefaults(options) {
        VARS.defaults = $.extend(true, VARS.defaults, options)
    }

    function C(options, srcElement) {
        if (typeof options === 'string') srcElement = options, options = {}
        if (typeof options === 'undefined') options = {}
        new Calendar(options, srcElement)
    }

    C.setDefaults = setDefaults

    $.fn.SlwyCalendar = function (options) {
        new Calendar(options, $(this))
        return $(this)
    }
    $.SlwyCalendar = C

    return C
}))