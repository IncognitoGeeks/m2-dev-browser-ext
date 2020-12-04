$(document).ready(function() {

    $('#url').val(window.localStorage.getItem("mageExtBaseUrl"));
    let ajaxUrl = $('#url').val();
    
    if(parseInt(window.localStorage.getItem("dark"))) {
        $('#dark_toggle').prop('checked', true);
        $("body").addClass("dark");
    }

    if(parseInt(window.localStorage.getItem("tph"))) {
        $('#tempath_toggle').prop('checked', true);
    }

    testConnection();

    function isUrlValid(url) {
        return /^(https?|s?ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i.test(url);
    }

    $('#dark_toggle').click(function() {
        if($(this).prop("checked") == true) {
            window.localStorage.setItem("dark", 1);
            $("body").addClass("dark");
        }
        else {
            window.localStorage.setItem("dark", 0);
            $("body").removeClass("dark");
        }
    });

    $('.setting').click(function() {
        $(".back-btn").toggleClass("open");
        $(".setting").toggleClass("close");
        $("#about").toggleClass("open");
    });

    $('.back-btn').click(function() {
        $(".back-btn").toggleClass("open");
        $(".setting").toggleClass("close");
        $("#about").toggleClass("open");
    });

    $('#tempath_toggle').click(function() {
        if($(this).prop("checked") === true) {
            makeAjaxCall("/chromeext/index/enabletph?enable=1", "tempath_toggle");
        }
        else {
            makeAjaxCall("/chromeext/index/enabletph?enable=0", "tempath_toggle");
        }
    });

    $("#url").focusout(function(){
        var input = $(this);
        var url = $(this).val();
        if(isUrlValid(url)) {
            ajaxUrl = url;
            window.localStorage.setItem("mageExtBaseUrl", url);
            input.removeClass("invalid").addClass("valid");
            testConnection();
        } else {
            $("#current_status").text("Connection Failed");
            $("#current_status").removeClass("success");
            $("#current_status").addClass("failure");
            input.removeClass("valid").addClass("invalid");
        }
    });

    $("button").on("click", function(event) {
        switch(event.target.id) {
            case "clearCache":
                makeAjaxCall("/chromeext/index/cacheclean", "clearCache");
                break;
            case "cacheFlush":
                makeAjaxCall("/chromeext/index/cacheflush", "cacheFlush");
                break;
            case "reIndex":
                makeAjaxCall("/chromeext/index/runreindex", "reIndex");
                break;
            case "browserCache":
                clearBrowserCache();
                break;
        }
    });

    function makeAjaxCall(route, loaderDiv = null) {
        if(loaderDiv != 'tempath_toggle') {
            $("#"+loaderDiv).append(constructLoader());
            $("#"+loaderDiv).prop('disabled', true);
        }
        $.ajax({
            url: ajaxUrl + route,
            type: 'GET',
            success: function(response) {
                console.log("Response ", response);
                if(loaderDiv != 'tempath_toggle') {
                    $("#" + loaderDiv + " .loader").remove();
                    $("#" + loaderDiv).prop('disabled', false);
                } else {
                    if(route.indexOf("enable=1") !== -1) {
                        localStorage.setItem("tph", 1);
                    }else {
                        localStorage.setItem("tph", 0);
                    }
                    chrome.tabs.getSelected(null, function(tab) {
                        var code = 'window.location.reload();';
                        chrome.tabs.executeScript(tab.id, {code: code});
                    });
                }
                MessageHelper.succesMsgHandler(response);
            },
            error: function (error) {
                console.log("error", error);
                setTimeout(function() {
                    if(loaderDiv != 'tempath_toggle') {
                        $("#" + loaderDiv + " .loader").remove();
                        $("#" + loaderDiv).prop('disabled', false);
                    }else {
                        $("#" + loaderDiv).prop("checked", false);
                    }
                    MessageHelper.errorMsgHandler(error);
                }, 2000);
            }
        });
    }

    function constructLoader() {
        return `<div class="loader"></div>`;
    }

    function testConnection(){
        $.ajax({
            url: ajaxUrl + "/chromeext/index/testconnection",
            type: 'GET',
            success: function(response) {
                console.log("Response ", response);
                $("#current_status").text("Connection Established!");
                $("#current_status").removeClass("failure");
                $("#current_status").addClass("success");
            },
            error: function (error) {
                console.log("error", error);
                $("#current_status").text("Connection Failed");
                $("#current_status").removeClass("success");
                $("#current_status").addClass("failure");
            }
        });

    }

    function clearBrowserCache() {
        var millisecondsPerWeek = 1000 * 60 * 60 * 24 * 7;
        var oneWeekAgo = (new Date()).getTime() - millisecondsPerWeek;
        chrome.browsingData.remove({
            "since": oneWeekAgo
        }, {
            "appcache": true,
            "cache": true,
            "cacheStorage": true,
            "cookies": true
        }, MessageHelper.succesMsgHandler("sucess"));
    }
});


MessageHelper = {
    succesMsgHandler: function() {
        $("#msg").addClass("success_msg");
        $("#msg strong").text("Success!");
        $("#msg span").text("");
        setTimeout(function() {
            $("#msg").removeClass("success_msg");
        }, 5000);
    },

    errorMsgHandler: function(error) {
        $("#msg").addClass("error_msg");
        $("#msg strong").text("Error");
        $("#msg span").text("Internal Server error");
        setTimeout(function() {
            $("#msg").removeClass("error_msg");
        }, 5000);
    }
}
