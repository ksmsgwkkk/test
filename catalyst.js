var catalyst = {
    originPageProp: s.prop1,
    pathSearch: '',
    searchHistories: [],
    viewHistories : [],
    favoriteList: [],
	searchCount: '-',
	viewCount: '-',
	favCount: '-',
    saveCount: '-',
    viewOrgCount: '-',
    viewAdCount: '-',
    favoriteOrgCount: '-',
    favoriteAdCount: '-',
    isLocalStorageAvailable: false,
    isSessionStorageAvailable: false,
    isAndroid: false,
    sourceSiteNameList: [],
	refresh: function() {
        this.getIsLocalStorageAvailable();
        this.getIsSessionStorageAvailable();
        this.getSearchHistory();
        this.getViewHistory();
        this.getFavoriteList();
        this.getSaveCondition();
        this.getIsAndroid();
        this.getCookieUha();
	},
	init: function() {
      this.getSourceSiteNameList();
        this.getIsLocalStorageAvailable();
        this.getIsSessionStorageAvailable();
	},
    /**
     * WebStorageチェック mdnの例を利用
     * @param type
     * @returns {boolean}
     * @see https://developer.mozilla.org/ja/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API
     */
    storageAvailable: function(type) {
        var storage;
        try {
            storage = window[type];
            var x = '__storage_test__';
            storage.setItem(x, x);
            storage.removeItem(x);
            return true;
        } catch (e) {
            return e instanceof DOMException && (
                    // everything except Firefox
                    e.code === 22 ||
                    // Firefox
                    e.code === 1014 ||
                    // test name field too, because code might not be present
                    // everything except Firefox
                    e.name === 'QuotaExceededError' ||
                    // Firefox
                    e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
                // acknowledge QuotaExceededError only if there's something already stored
                (storage && storage.length !== 0);
        }
    },
    getIsLocalStorageAvailable: function() {
        if (this.storageAvailable('localStorage')) {
            this.isLocalStorageAvailable = true;
        }
    },
    getIsSessionStorageAvailable: function() {
        if (this.storageAvailable('sessionStorage')) {
            this.isSessionStorageAvailable = true;
        }
    },
    getIsAndroid: function() {
        if (this.isSessionStorageAvailable) {
            this.isAndroid = sessionStorage.getItem('aai') !== null;
        }
    },
    getAndroidFid: function() {
        var aai = '';
        if (this.isSessionStorageAvailable) {
            aai = sessionStorage.getItem('aai');
        }
        if (aai) {
            return JSON.parse(aai).fid;
        } else {
            return null;
        }
    },
    getCookieUha: function() {
        return document.cookie.match(/(^|;\s*)uha=([^;]+)/)?RegExp.$2:"guest";
    },
	getSearchHistory: function() {
    	try {
            var historiesStorage = '[]';
            if (common.getItemIfAvailable('searchHistory') !== null) {
                historiesStorage = localStorage.getItem('searchHistory');
            }
            this.searchHistories = JSON.parse(historiesStorage);
			this.searchCount = this.searchHistories.length;
        } catch (e) {
    		this.searchHistories = [];
    		this.searchCount = '-';
		}
	},
    getViewHistory: function() {
        try {
            var historiesStorage = '[]';
            if (common.getItemIfAvailable('detailHistory') !== null) {
                historiesStorage = localStorage.getItem('detailHistory');
            }
            var dh = JSON.parse(historiesStorage);
            this.viewHistories = !dh.histories ? [] : dh.histories;
            this.viewCount = this.viewHistories.length;

            this.viewOrgCount = 0;
            this.viewAdCount = 0;
            for (var i = 0; i < this.viewHistories.length; i++) {
                if (this.viewHistories[i].isAd) {
                    this.viewAdCount++;
                } else {
                    this.viewOrgCount++;
                }
            }
        } catch (e) {
            this.viewHistories = [];
            this.viewCount = '-';
        }
	},
    getFavoriteList: function() {
        try {
            var favStorage = '[]';
            if (common.getItemIfAvailable('favorite') !== null) {
                favStorage = localStorage.getItem('favorite');
            }
            var fav = JSON.parse(favStorage);
            this.favoriteList = !fav.histories ? [] : fav.histories;
            this.favCount = this.favoriteList.length;

            this.favoriteOrgCount = 0;
            this.favoriteAdCount = 0;
            for (var i = 0; i < this.favoriteList.length; i++) {
                if (this.favoriteList[i].isAd) {
                    this.favoriteAdCount++;
                } else {
                    this.favoriteOrgCount++;
                }
            }
        } catch (e) {
            this.favoriteList = [];
        	this.favCount = '-';
		}
	},
    getSaveCondition: function() {
        try {
            var conditionStorage = '[]';
            if (common.getItemIfAvailable('saveCondition') !== null) {
                conditionStorage = localStorage.getItem('saveCondition');
            }
            this.saveConditions = JSON.parse(conditionStorage);
            this.saveCount = this.saveConditions.length;
        } catch (e) {
            this.saveConditions = [];
            this.saveCount = '-';
        }
    },
    getHistoryParam: function() {
        return this.viewCount + ',' + this.searchCount;
    },
    getFavoriteParam: function() {
        return this.favCount + ',' + this.saveCount;
    },
    getBrowserInfo: function() {
        return 'Cookie' + (navigator.cookieEnabled ? '有効' : '無効') + ',UA(' + navigator.userAgent + ')';
    },
    getViewHistoryCounts: function() {
        return this.viewOrgCount + ',' + this.viewAdCount + ',0';
    },
    getEventsViewHistoryCounts: function() {
        return 'event301=' + this.viewOrgCount + ',event302=' + this.viewAdCount + ',event303=0';
    },
    getFavoriteCounts: function() {
        return this.favoriteOrgCount + ',' + this.favoriteAdCount + ',0';
    },
    getEventsFavoriteCounts: function() {
        return 'event301=' + this.favoriteOrgCount + ',event302=' + this.favoriteAdCount + ',event303=0';
    },
    isViewHistoryExists : function(uid) {
        return this.viewHistories.filter(function(item) {
                return item.uid == uid;
            }).length > 0;
    },
	isFav: function(uid) {
        return this.favoriteList.filter(function(item) {
                return item.uid == uid;
            }).length > 0;
	},
	isDispDetailView: function(events) {
    	if (events) {
            if ($.inArray('event1', events) > -1) {
            	return false;
            }
		}
		return true;
	},
    getFavoriteKyujinId: function() {
        var uidList = [];
        for(var i = 0; i < this.favoriteList.length; i++) {
            uid = this.favoriteList[i].uid;
            if (this.favoriteList[i].siteId) {
                var rank = i + 1;
                var kyujinPrefix = '';
                if (this.favoriteList[i].isAd) {
                    kyujinPrefix = 'a';
                } else {
                    kyujinPrefix = 'o';
                }
                uid = this.favoriteList[i].siteId + '_' + this.favoriteList[i].uid + '_' + kyujinPrefix + 'fav-' + rank.toString();
            }
            uidList.push(uid);
        }
        return uidList.join(',');
    },
	getViewHistoriesKyujinId: function() {
        var uidList = [];
        for(var i = 0; i < this.viewHistories.length; i++) {
            uid = this.viewHistories[i].uid;
            if (this.viewHistories[i].siteId) {
                var rank = i + 1;
                var kyujinPrefix = '';
                if (this.viewHistories[i].isAd) {
                    kyujinPrefix = 'a';
                } else {
                    kyujinPrefix = 'o';
                }
                uid = this.viewHistories[i].siteId + '_' + this.viewHistories[i].uid + '_' + kyujinPrefix + 'his-' + rank.toString();
            }
            uidList.push(uid);
        }
        return uidList.join(',');
	},
    getCheckboxState: function (isAuthenticated) {
        var propValue = '';
        var checked = document.getElementById("profileSave_01").checked;
        if (isAuthenticated == 1) {
            propValue = checked ? '1-1' : '1-2';
        } else if (isAuthenticated == 0) {
            propValue = checked ? '2-1' : '2-2';
        }
        return propValue;
    },
	createOnclickCatalyst: function(s, item, clicklocation, events) {
		events = events.join(',');
        s.linkTrackVars ="channel,prop1,prop56,prop57,prop71,eVar31,eVar32,eVar33,eVar34,eVar35,eVar36,eVar38,eVar39,eVar41,eVar44,eVar45,eVar50,eVar78,eVar84,events";
        s.linkTrackEvents=events;
        //Setting blank to prop (use eVar) is important to protect overwriting eVar by s_code.js.
        if (s.prop31) s.prop31= '';
        if (s.prop32) s.prop32= '';
        if (s.prop33) s.prop33= '';
        if (s.prop34) s.prop34= '';
        if (s.prop35) s.prop35= '';
        if (s.prop36) s.prop36= '';
        if (s.prop38) s.prop38= '';
        if (s.prop39) s.prop39= '';
        if (s.prop41) s.prop41= '';
        if (s.prop44) s.prop44= '';
        if (s.prop45) s.prop45= '';
        if (s.prop50) s.prop50= '';
        s.prop56= this.getHistoryParam();
        s.prop57= this.getFavoriteParam();
        if (this.isAndroid) s.prop71 = 'app';
        s.eVar31= item.uid;
        s.eVar32= this.getSourceSiteName(item.site, item.siteId);
        s.eVar34= this.hasCompanyName(item.company) ? '1' : '0';
        s.eVar35= item.title.length;
        s.eVar36= item.title.length + ',' + (this.hasCompanyName(item.company) ? item.company.length : '0');
        s.eVar38= item.employ ? item.employ : 'なし';
        s.eVar39= this.createPayment(item.pay);
        s.eVar41= item.area ? item.area.replace(' ', '_') : 'なし';
        s.eVar44= item.allianceId ? item.allianceId : 'なし';
        s.eVar45= item.isAd ? 'ad,,normal' : 'org,normal,';
        s.eVar78= catalyst.getCookieUha();
        s.eVar84= this.getAndroidFid()
        s.events= events;
        return s;
	},
	createElaplsedInterval: function(addTime, prefix) {
    	var elapsedInterval = '';
        var dateNow = new Date();
        var diff = dateNow.getTime() - addTime;
        var day = Math.floor(diff / (1000 * 60 * 60 * 24));
        if (day >= 30) {
            elapsedInterval = '30日以上前';
		} else if (day < 1) {
        	var hour = Math.floor(diff / (1000 * 60 * 60));
            if (hour == 0) {
            	var minutes = Math.floor(diff / (1000 * 60));
                elapsedInterval = minutes + '分前';
            } else {
				elapsedInterval = hour + '時間前';
            }
        } else {
            elapsedInterval = day + '日前';
		}

		return prefix + elapsedInterval;
	},
    getSourceSiteName: function(siteName, siteId) {
        if (!siteName || !siteId) {
            return siteName;
        } else if (Number(siteId) === 839) {
            return "s_1_" + siteName;
        }

        if (this.sourceSiteNameList[siteId]) {
            siteName = this.sourceSiteNameList[siteId];
        }

        return siteName;
    },
    getSourceSiteNameList: function() {
        $.ajax({
            url: "/api/source-site-name-list",
            type: "POST"
        }).done((data, textStatus, jqXHR) => {
            if (data && Object.keys(data).length > 0) {
                this.sourceSiteNameList = data;
            }
        });
    },
    hasCompanyName: function(company) {
        return ((company != '非公開') && (company != '企業名非公開') && company);
    },
    createPayment: function(pay) {
        if (!pay) return 'なし';

        var re = new RegExp("(時給|日給|月給|年収|固定報酬)([0-9,万]+円)?(～?)([0-9,万]+円)?", "u");
        var m = pay.match(re);
        if (m) {
            var count = m.length;
            var paytype = m[1];
            var minprice = this.convertPriceToNum(m[2]);
            var hyphen = '';
            var maxprice = '';
            if (!minprice) minprice = '下限なし';
            if (count >= 4 && m[3]) {
                hyphen = '-';
                maxprice = '上限なし';
            }
            if (count == 5 && m[4]) {
                maxprice = this.convertPriceToNum(m[4]);
            }

            return paytype + minprice + hyphen + maxprice;
        }
    },
    convertPriceToNum: function(price) {
        var price = price.replace(/[円,]/g, '');
        var arr = price.split('万');
        if (arr.length > 1) {
            price = (arr[1] * 1) + (arr[0] * 10000);
        }
        return price;
    },
    callCatalystinputcount: function(inputitem,id) {
      var s = s_gi(s_account);
      s.linkTrackVars = 'prop52,prop71,eVar78,eVar84';
      s.linkTrackEvents = 'None';
      s.prop52 = '入力フォーム_' + s.prop1 + '_' + inputitem + '_入力';
        if (catalyst.isAndroid) {
            s.prop71 = 'app';
        }
        s.eVar78 = catalyst.getCookieUha();
        s.eVar84 = catalyst.getAndroidFid();
      s.tl(this, 'o', '入力フォーム_項目入力');
      $(id).removeAttr('onkeyup onclick onchange');
    }
};
catalyst.refresh();
window.addEventListener('load', function () {
    catalyst.init();
});

function onclickcatalyst_buttonclick(buttontype, flag, jobid, clicklocation) {
    catalyst.refresh();
    var s = s_gi(s_account);
    s.linkTrackVars = "channel,prop1,prop56,prop57,prop58,prop71,eVar31,eVar50,eVar76,eVar78,eVar84";
    s.linkTrackEvents = "";
    s.channel = "ボタンクリック";
    s.prop1 = "BC_" + buttontype;
    if (buttontype == '詳細検索' || buttontype == '応募フォーム') {
        s.prop1 = buttontype;
    }
    s.prop56 = catalyst.getHistoryParam();
    s.prop57 = catalyst.getFavoriteParam();
    s.prop58 = flag;
    if (buttontype == '応募送信') {
        s.prop58 = catalyst.getCheckboxState(flag);
    }
    if (catalyst.isAndroid) {
        s.prop71 = 'app';
    }
    s.eVar31 = jobid;
    s.eVar50 = clicklocation;
    if (buttontype == 'HDメニュー') {
        s.eVar76 = 'middle_0002';
    }
    s.eVar78 = catalyst.getCookieUha();
    s.eVar84 = catalyst.getAndroidFid();
    s.tl(this, 'o', s.prop1);
}

function onclickcatalyst_buttonclick_appbanner(buttontype, flag, jobid, clicklocation, appbanner) {
    catalyst.refresh();
    var s = s_gi(s_account);
    s.linkTrackVars = "channel,prop1,prop56,prop57,prop58,prop71,eVar31,eVar50,eVar76,eVar78,eVar84";
    s.linkTrackEvents = "";
    s.channel = "ボタンクリック";
    s.prop1 = "BC_" + buttontype;
    s.prop56 = catalyst.getHistoryParam();
    s.prop57 = catalyst.getFavoriteParam();
    s.prop58 = flag;
    if (catalyst.isAndroid) {
        s.prop71 = 'app';
    }
    s.eVar31 = jobid;
    s.eVar50 = clicklocation;
    s.eVar76 = appbanner;
    s.eVar78 = catalyst.getCookieUha();
    s.eVar84 = catalyst.getAndroidFid();
    s.tl(this, 'o', s.prop1);
}

function onclickcatalyst_buttonclick_sametab(link,buttontype,flag,jobid,clicklocation){
    catalyst.refresh();
    var s=s_gi(s_account);
    s.linkTrackVars ="channel,prop1,prop56,prop57,prop58,eVar31,eVar50,eVar78";
    s.linkTrackEvents="";
    s.channel = "ボタンクリック";
    s.prop1 = "BC_" + buttontype;
    s.prop56= catalyst.getHistoryParam();
    s.prop57= catalyst.getFavoriteParam();
    s.prop58= flag;
    s.eVar31 = jobid;
    s.eVar50 = clicklocation;
    s.eVar78 = catalyst.getCookieUha();
    s.tl(link,'o',s.prop1,null,'navigate');
}

function onclickcatalyst_buttonclick_phonenumber(link,buttontype,flag,jobid,clicklocation){
    catalyst.refresh();
    var s = s_gi(s_account);
    s.linkTrackVars = "channel,prop1,prop56,prop57,prop58,eVar31,eVar50,eVar78";
    s.linkTrackEvents = "";
    s.channel = "電話番号クリック";
    s.prop1 = "BC_" + buttontype;
    s.prop56 = catalyst.getHistoryParam();
    s.prop57 = catalyst.getFavoriteParam();
    s.prop58 = flag;
    s.eVar31 = jobid;
    s.eVar50 = clicklocation;
    s.eVar78 = catalyst.getCookieUha();
    s.tl(link,'o','電話番号',null,'navigate');
}

function onclickcatalyst_favorite_cv(item, clicklocation){
    catalyst.refresh();
    var s=s_gi(s_account);
    s.channel = "行動履歴クリック";
    s.prop1 = "行動履歴:お気に入り求人クリック";
    s.eVar32= catalyst.getSourceSiteName(item.site, item.siteId);
    s.eVar33= catalyst.createElaplsedInterval(item.addTime, 'お気に入り');
    s.eVar50= 'お気に入り求人,' + clicklocation;
    var events = ['event1','event9'];
    if (catalyst.isFav(item.uid)) {
        events.push('event101');
    }
    s = catalyst.createOnclickCatalyst(s, item, clicklocation, events);
    s.tl(this,'o',s.prop1);
}

function onclickcatalyst_favorite_cv_sametab(link, item, clicklocation){
    catalyst.refresh();
    var s=s_gi(s_account);
    s.channel = "行動履歴クリック";
    s.prop1 = "行動履歴:お気に入り求人クリック";
    s.eVar32= catalyst.getSourceSiteName(item.site, item.siteId);
    s.eVar33= catalyst.createElaplsedInterval(item.addTime, 'お気に入り');
    s.eVar50= 'お気に入り求人,' + clicklocation;
    var events = ['event9'];
    if (item.isDtl != '1') {
        events.push('event1');
        events.push('event101');
    }
    s = catalyst.createOnclickCatalyst(s, item, clicklocation, events);
    s.tl(link,'o',s.prop1,null,'navigate');
}

function onclickcatalyst_favoritemenu_cv(link, item, clicklocation){
    catalyst.refresh();
    var s=s_gi(s_account);
    s.channel = "行動履歴クリック";
    s.prop1 = "行動履歴:お気に入り求人_メニュークリック";
    s.eVar32= catalyst.getSourceSiteName(item.site, item.siteId);
    s.eVar33= catalyst.createElaplsedInterval(item.addTime, 'お気に入り');
    s.eVar50= 'お気に入り求人メニュー,' + clicklocation;
    var events = ['event10'];
    if (item.isDtl != '1') {
        events.push('event1');
        events.push('event101');
    }
    s = catalyst.createOnclickCatalyst(s, item, clicklocation, events);
    s.tl(link,'o',s.prop1,null,'navigate');
}

function onclickcatalyst_history_cv(item, clicklocation){
    catalyst.refresh();
    var s=s_gi(s_account);
    s.channel = "行動履歴クリック";
    s.prop1 = "行動履歴:閲覧求人履歴クリック";
    s.eVar32= catalyst.getSourceSiteName(item.site, item.siteId);
    s.eVar33= catalyst.createElaplsedInterval(item.addTime, '閲覧');
    s.eVar50= '閲覧求人履歴,' + clicklocation;
    var events = ['event1','event11'];
    if (catalyst.isFav(item.uid)) {
        events.push('event101');
        events.push('event111');
    }
    s = catalyst.createOnclickCatalyst(s, item, clicklocation, events);
    s.tl(this,'o',s.prop1);
}

function onclickcatalyst_history_cv_sametab(link, item, clicklocation){
    catalyst.refresh();
    var s=s_gi(s_account);
    s.channel = "行動履歴クリック";
    s.prop1 = "行動履歴:閲覧求人履歴クリック";
    s.eVar32= catalyst.getSourceSiteName(item.site, item.siteId);
    s.eVar33= catalyst.createElaplsedInterval(item.addTime, '閲覧');
    s.eVar50= '閲覧求人履歴,' + clicklocation;
    var events = ['event11'];
    if (item.isDtl != '1') {
        events.push('event1');
    }
    if (catalyst.isFav(item.uid)) {
        events.push('event111');
        if (item.isDtl != '1') {
            events.push('event101');
        }
    }
    s = catalyst.createOnclickCatalyst(s, item, clicklocation, events);
    s.tl(link,'o',s.prop1,null,'navigate');
}

function onclickcatalyst_historymenu_cv(item, clicklocation){
    catalyst.refresh();
    var s=s_gi(s_account);
    s.channel = "行動履歴クリック";
    s.prop1 = "行動履歴:閲覧求人履歴_メニュークリック";
    s.eVar32= catalyst.getSourceSiteName(item.site, item.siteId);
    s.eVar33= catalyst.createElaplsedInterval(item.addTime, '閲覧');
    s.eVar50= '閲覧求人履歴メニュー,' + clicklocation;
    var events = ['event1','event12'];
    if (catalyst.isFav(item.uid)) {
        events.push('event101');
        events.push('event112');
    }
    s = catalyst.createOnclickCatalyst(s, item, clicklocation, events);
    s.tl(this,'o',s.prop1);
}

function onclickcatalyst_historymenu_cv_sametab(link, item, clicklocation){
    catalyst.refresh();
    var s=s_gi(s_account);
    s.channel = "行動履歴クリック";
    s.prop1 = "行動履歴:閲覧求人履歴_メニュークリック";
    s.eVar32= catalyst.getSourceSiteName(item.site, item.siteId);
    s.eVar33= catalyst.createElaplsedInterval(item.addTime, '閲覧');
    s.eVar50= '閲覧求人履歴メニュー,' + clicklocation;
    var events = ['event12'];
    if (catalyst.isFav(item.uid)) {
        events.push('event112');
    }
    s = catalyst.createOnclickCatalyst(s, item, clicklocation, events);
    s.tl(link,'o',s.prop1,null,'navigate');
}

function onclickcatalyst_path_search(old_keyword, old_area){
    if (!catalyst.pathSearch) return;
    var page = catalyst.pathSearch;
    var new_keyword = $('#s-keywordSearch1_fire').val();
    var new_area = $('#s-placeSearch1_fire').val();
    var pathParam = '';

    if (new_keyword == '' && new_area == '') {
        //変更なし
        pathParam = page + '_nochange>list';
    } else if (new_keyword != old_keyword && new_area != old_area) {
        //両方入力・再入力
        pathParam = page + '_KW-area>list';
    } else if (new_keyword != old_keyword) {
        //キーワードだけ入力・再入力
        pathParam = page + '_KW->list';
    } else if (new_area != old_area) {
        //勤務地だけ入力・再入力
        pathParam = page + '_-area>list';
    } else {
        //変更なし
        pathParam = page + '_nochange>list';
    }
    catalyst.refresh();
    var s=s_gi(s_account);
    s.linkTrackVars ="prop7,prop52,prop56,prop57,eVar78"
    s.linkTrackEvents="None"
    s.prop7 = pathParam;
    s.prop52= "検索導線click";
    s.prop56= catalyst.getHistoryParam();
    s.prop57= catalyst.getFavoriteParam();
    s.eVar78= catalyst.getCookieUha();
    s.tl(this,'o',s.prop52);
}

function onclickcatalyst_path(pathParam){
    catalyst.refresh();
    var s=s_gi(s_account);
    s.linkTrackVars ="prop7,prop52,prop56,prop57,eVar78"
    s.linkTrackEvents="None"
    s.prop7 = pathParam;
    s.prop52= "検索導線click";
    s.prop56= catalyst.getHistoryParam();
    s.prop57= catalyst.getFavoriteParam();
    s.eVar78= catalyst.getCookieUha();
    s.tl(this,'o',s.prop52);
}

function onclickcatalyst_adv(events){
    events = events || '';
    var isKeywordGroupChanged = false;
    var isPlaceGroupChanged = false;
    var isFilteringGroupChanged = false;
    var $targets;
    var prop7 = '';

    // キーワード・グループ
    $targets = $('[id^="s-keywordSearch"][id$="_adv_fire"]');
    $targets.each(function(){
        if ($(this).val().trim() !== this.defaultValue.trim()) {
            isKeywordGroupChanged = true;
            return false;
        }
    });

    // 勤務地グループ
    $targets = $('[id^="s-placeSearch"][id$="_adv_fire"]');
    $targets.each(function(){
        if ($(this).val().trim() !== this.defaultValue.trim()) {
            isPlaceGroupChanged = true;
            return false;
        }
    });

    // 絞り込みグループ
    $targets = [];
    $targets.push($('#filteringEmployType'));
    $targets.push($('#payType'));
    $targets.push($('#filteringMinPrice'));
    $targets.push($('#filteringMaxPrice'));
    $targets.push($('#filteringUpdatedType'));
    $targets.push($('#filteringHwExcept'));
    $targets.push($('#filteringFeature'));
    $targets.push($('#filteringAreaGroupHash'));
    $.each($targets, function(index, $target){
        if ($target.val() !== $target.attr('data-original-value')) {
            isFilteringGroupChanged = true;
            return false;
        }
    });

    // prop7の値を決める。
    if (isKeywordGroupChanged && isPlaceGroupChanged && !(isFilteringGroupChanged)) {
        prop7 = 'adv_KW-area>list'; // KW枠、勤務地枠両方再入力して検索
    } else if (isKeywordGroupChanged && !(isPlaceGroupChanged) && !(isFilteringGroupChanged)) {
        prop7 = 'adv_KW->list'; // KW枠のみ再入力して検索
    } else if (!(isKeywordGroupChanged) && isPlaceGroupChanged && !(isFilteringGroupChanged)) {
        prop7 = 'adv_-area>list'; // 勤務地枠のみ再入力して検索
    } else if (!(isKeywordGroupChanged) && !(isPlaceGroupChanged) && !(isFilteringGroupChanged)) {
        prop7 = 'adv_nochange>list'; // KW、勤務地変更せず検索
    } else if (isKeywordGroupChanged && isPlaceGroupChanged && isFilteringGroupChanged) {
        prop7 = 'adv_KW-area_menu>list'; // KW枠、勤務地枠両方再入力、絞込みを追加・解除して検索
    } else if (isKeywordGroupChanged && !(isPlaceGroupChanged) && isFilteringGroupChanged) {
        prop7 = 'adv_KW-_menu>list'; // KW枠のみ再入力、絞込みを追加・解除して検索
    } else if (!(isKeywordGroupChanged) && isPlaceGroupChanged && isFilteringGroupChanged) {
        prop7 = 'adv_-area_menu>list'; // 勤務地枠のみ再入力、絞込みを追加・解除して検索
    } else if (!(isKeywordGroupChanged) && !(isPlaceGroupChanged) && isFilteringGroupChanged) {
        prop7 = 'adv_nochange_menu>list'; // KW、勤務地変更せず検索、絞込みを追加・解除して検索
    }

    catalyst.refresh();
    var s=s_gi(s_account);
    s.linkTrackVars = "channel,prop1,prop7,prop56,prop57,eVar78,eVar84";
    s.channel = "詳細検索ボタンクリック";
    s.prop1 = "詳細検索ボタンクリック";
    s.prop7 = prop7;
    s.prop56= catalyst.getHistoryParam();
    s.prop57= catalyst.getFavoriteParam();
    if (this.isAndroid) s.prop71 = 'app';
    s.eVar78 = catalyst.getCookieUha();
    s.eVar84 = catalyst.getAndroidFid();
    if (events.length > 0) {
        s.linkTrackVars += ',events';
        s.linkTrackEvents = events;
        s.events= events;
    }
    s.tl(this,'o',s.prop1);
}

function getApplicationCompleteEvents(jobid, adRecommendCount) {
    var eventList = ['event15'];
    if (catalyst.isFav(jobid)) {
        eventList.push('event115');
    }
    eventList.push('event302=' + adRecommendCount);

    return eventList.join(',');
}

function onclickcatalyst_jobdetail_region(furusatoKyujin, clicklocation) {
    catalyst.refresh();
    var s = s_gi(s_account);
    s.linkTrackVars = "channel,prop1,prop56,prop57,eVar31,eVar32,eVar37,eVar38,eVar39,eVar50,eVar78";
    s.linkTrackEvents = "";
    s.channel = "検索結果クリック";
    s.prop1 = "地方創生:求人クリック";
    s.prop56 = catalyst.getHistoryParam();
    s.prop57 = catalyst.getFavoriteParam();
    s.eVar31 = furusatoKyujin.uid;
    s.eVar32 = furusatoKyujin.company;
    s.eVar37 = furusatoKyujin.displayArea;
    s.eVar38 = furusatoKyujin.employTypeDisp;
    s.eVar39 = furusatoKyujin.payDisp;
    s.eVar50 = clicklocation;
    s.eVar78 = catalyst.getCookieUha();
    s.tl(this, 'o', s.prop1);
}

function onclickcatalyst_jobdetail_region_sametab(link, furusatoKyujin, clicklocation) {
    catalyst.refresh();
    var s = s_gi(s_account);
    s.linkTrackVars = "channel,prop1,prop56,prop57,eVar31,eVar32,eVar37,eVar38,eVar39,eVar50,eVar78";
    s.linkTrackEvents = "";
    s.channel = "検索結果クリック";
    s.prop1 = "地方創生:求人クリック";
    s.prop56 = catalyst.getHistoryParam();
    s.prop57 = catalyst.getFavoriteParam();
    s.eVar31 = furusatoKyujin.uid;
    s.eVar32 = furusatoKyujin.company;
    s.eVar37 = furusatoKyujin.displayArea;
    s.eVar38 = furusatoKyujin.employTypeDisp;
    s.eVar39 = furusatoKyujin.payDisp;
    s.eVar50 = clicklocation;
    s.eVar78 = catalyst.getCookieUha();
    s.tl(link, 'o', s.prop1, null, 'navigate');
}

function onclickcatalyst_buttonclick_saveconditions() {
    catalyst.refresh();
    var s = s_gi(s_account);
    //カタリスト引継ぎ
    s.linkTrackVars = "channel,prop1,prop2,prop3,prop4,prop5,prop6,prop7,prop8,prop9,prop10,prop11,prop12,prop13,prop14,prop15,"
    + "prop16,prop17,prop18,prop19,prop20,prop21,prop22,prop23,prop24,prop25,prop26,prop27,prop28,prop29,prop30,prop46,prop47,prop48,prop51,prop53,prop54,prop55,prop56,prop57,prop58,prop59,prop61,prop63,prop71,"
    + "eVar1,eVar2,eVar3,eVar4,eVar5,eVar6,eVar7,eVar9,eVar11,eVar12,eVar13,eVar14,eVar15,eVar16,eVar17,eVar18,eVar19,eVar20"
    + "eVar22,eVar23,eVar24,eVar25,eVar26,eVar27,eVar28,eVar29,eVar30,eVar46,eVar47,eVar48,eVar78,eVar84";
    s.linkTrackEvents = "";
    s.channel = "その他";
    s.prop1 = "BC_条件保存ON";
    s.prop56 = catalyst.getHistoryParam();
    s.prop57 = catalyst.getFavoriteParam();
    s.prop58 = "検索結果";
    s.eVar78 = catalyst.getCookieUha();
    if (this.isAndroid) s.prop71 = 'app';
    s.eVar84 = catalyst.getAndroidFid();
    s.tl(this, 'o', s.prop1);
}

/**
 * @param {string} crawlSiteName
 */
function onclickcatalyst_affiliateclick(crawlSiteName){
    catalyst.refresh();
    var s=s_gi(s_account);
    s.linkTrackVars ="channel,prop1,prop32,eVar32,eVar78,events";
    s.linkTrackEvents="event24";
    s.channel = "アフィリエイトクリック";
    s.prop1 = "アフィリエイトクリック";
    s.prop32 = crawlSiteName;
    s.eVar78 = catalyst.getCookieUha();
    s.events= "event24";
    s.tl(this,'o',s.prop1);
}

/**
 * 転職/比較アフィリエイト記事 クリック時のカタリスト設定
 * onclickcatalyst_affiliateclickを模倣
 *
 * @param {string} siteName
 */
function onclickcatalyst_affiliateclick_job_change_top(siteName){
    catalyst.refresh();
    var s = s_gi(s_account);
    s.linkTrackVars = "channel,prop1,prop32,eVar32,eVar78,events";
    s.linkTrackEvents = "event24";
    s.channel = "アフィリエイトクリック";
    s.prop1 = "アフィリエイトクリック";
    s.prop32 = '記事:' + siteName;
    s.eVar78 = catalyst.getCookieUha();
    s.events = "event24";
    s.tl(this,'o',s.prop1);
}

/**
 * 適職診断 回答ボタンクリック時に質問IDと質問番号を設定
 * @param {int} questionId
 * @param {int} questionOrder
 */
function onclickcatalyst_shindan_answer(questionId, questionOrder) {
    catalyst.refresh();
    var s = s_gi(s_account);
    s.linkTrackVars = "prop8,prop22,eVar78";
    s.prop8 = "転職_適職診断_question_" + questionId;
    s.prop22 = "転職_適職診断_question_" + questionOrder;
    s.eVar78 = catalyst.getCookieUha();
    s.tl(this,'o',s.prop1);
}

/**
 * @param {string} type
 * @param {string} uid
 */
function onclickcatalyst_no_login(type, uid){
    var s = s_gi(s_account);
    s.linkTrackVars = "channel,prop1,prop71,eVar50,eVar78,events"
    s.linkTrackEvents = "event1,event101"
    s.channel = "ボタンクリック";
    s.prop1 = "ログインせずに続けるボタンクリック";
    if (this.isAndroid) s.prop71 = 'app';
    s.eVar50 = type;
    s.eVar78 = catalyst.getCookieUha();
    s.eVar84 = catalyst.getAndroidFid();
    var events = 'event1';
    if (catalyst.isFav(uid)) {
        events += ',event101'
    }
    s.events = events;
    s.tl(this,'o',s.prop1);
}

/**
 * 新着メール・LINE登録モーダルを表示する直前に押されたパーツ情報を保持
 * onclickcatalyst_buttonclickのflagとclicklocationの値を保持したい
 */
function setModalActionPartsForButtonClickCatalyst(flag, clicklocation) {
    if ($('#s-modal-trigger-flag') != null && $('#s-modal-trigger-clicklocation')) {
        $('#s-modal-trigger-flag').val(flag);
        $('#s-modal-trigger-clicklocation').val(clicklocation);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    function onclickcatalyst_bannerad() {
        catalyst.refresh();
        var s=s_gi(s_account);
        s.linkTrackVars ="channel,prop1,eVar78";
        s.linkTrackEvents="event403";
        s.channel="検索結果クリック";
        s.prop1="検索結果_バナー広告クリック ";
        s.eVar78=catalyst.getCookieUha();
        s.events="event403"
        s.tl(this,'o',s.prop1);
    }

    const banners = document.getElementsByClassName('js-banner_ad');
    for(let i = 0; i < banners.length; i++) {
        banners[i].addEventListener('click', onclickcatalyst_bannerad, false);
    }

}, false);