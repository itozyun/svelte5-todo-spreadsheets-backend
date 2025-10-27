/**
 * @fileoverview This is an externs file.
 * @externs
 */

/**
 * https://developers.google.com/apps-script/reference/properties/properties-service?hl=ja
 */
const PropertiesService = {};

/** @return {Properties} */
PropertiesService.getScriptProperties = function(){};

/**
 * @constructor
 * @see https://developers.google.com/apps-script/reference/properties/properties?hl=ja
 */
function Properties(){};
Properties.prototype.getProperty = function( key ){}
Properties.prototype.setProperty = function( key, value ){}
Properties.prototype.getProperties = function(){};


var CacheService = {
    getScriptCache : function(){}
};

/**
 * @constructor
 * https://developers.google.com/apps-script/guides/web?hl=ja&text=creatdoGeteHtmlOutputFromFile
 */
function GoogleAppsScriptWebAppRequestEvent(){};
GoogleAppsScriptWebAppRequestEvent.prototype.parameter = {"name": "alice", "n": "1"};
GoogleAppsScriptWebAppRequestEvent.prototype.queryString = 'name=alice&n=1&n=2';
GoogleAppsScriptWebAppRequestEvent.prototype.parameters = {"name": ["alice"], "n": ["1", "2"]};
GoogleAppsScriptWebAppRequestEvent.prototype.pathInfo = 'hello';
GoogleAppsScriptWebAppRequestEvent.prototype.contentLength = -1;
GoogleAppsScriptWebAppRequestEvent.prototype.postData = { contents : '', length : 0, name : 'postData', type : 'text/csv' };

// https://developers.google.com/apps-script/reference/html/html-output?hl=ja
/**
 * @constructor
 */
function HTMLTemplete(){};
/** @return {HtmlOutput} */
HTMLTemplete.prototype.evaluate = function(){};

var HtmlService = {
    /** @return {HTMLTemplete} */
    createTemplateFromFile : function(path){}
};

/**
 * @constructor
 */
function HtmlOutput(){};
HtmlOutput.prototype.setTitle = function( title ){};
HtmlOutput.prototype.addMetaTag = function( name, value ){};

var ContentService = {
    /**
     * @param {string} text
     */
    createTextOutput : function(text){},
    /**
     * @param {string} mineType
     */
    setMimeType : function(mineType){},

    MimeType : {
        JSON : 'JSON'
    }
};

// https://developers.google.com/apps-script/guides/web?hl=ja

/**
 * @type {!function(!GoogleAppsScriptWebAppRequestEvent):*|undefined}
 */
var __do_get__;

/**
 * @type {!function(!GoogleAppsScriptWebAppRequestEvent):*|undefined}
 */
var __do_post__;

/**
 * @type {!function(*=):*|undefined}
 */
var __do_schedule__;

/**
 * @type {!function(number,Object):(string|number)|undefined}
 */
var __admin__;

/**
 * @type {!function()|undefined}
 */
var __test1__;
/**
 * @type {!function()|undefined}
 */
var __test2__;
/**
 * @type {!function()|undefined}
 */
var __test3__;
/**
 * @type {!function()|undefined}
 */
var __test4__;
/**
 * @type {!function()|undefined}
 */
var __test5__;
/**
 * @type {!function()|undefined}
 */
var __test6__;

var Logger = {
    /**
     * @nosideeffects
     * @param {string} text 
     */
    log : function(text){}
};