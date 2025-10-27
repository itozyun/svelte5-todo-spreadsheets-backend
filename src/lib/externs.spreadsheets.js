/**
 * @fileoverview This is an externs file.
 * @externs
 * 
 * https://github.com/DefinitelyTyped/DefinitelyTyped/blob/267f67d44eeaac946ec61d9da258d0d69a8fd76a/types/google-apps-script/google-apps-script.spreadsheet.d.ts
 */

/******************************************************************************
 * @constructor
 */
function FilterCriteria(){};

/******************************************************************************
 * @constructor
 */
function FilterCriteriaBuilder(){};
/**
 * @return {!FilterCriteria}
 */
FilterCriteriaBuilder.prototype.build = function(){};
/**
 * @param {Date} date
 * @return {!FilterCriteriaBuilder}
 */
FilterCriteriaBuilder.prototype.whenDateAfter = function(date){};
/**
 * @param {Date} date
 * @return {!FilterCriteriaBuilder}
 */
FilterCriteriaBuilder.prototype.whenDateBefore = function(date){};
/**
 * @param {Date} date
 * @return {!FilterCriteriaBuilder}
 */
FilterCriteriaBuilder.prototype.whenDateEqualTo = function(date){};
/**
 * @param {Date} date
 * @return {!FilterCriteriaBuilder}
 */
FilterCriteriaBuilder.prototype.whenDateNotEqualTo = function(date){};
/**
 * @param {number} start
 * @param {number} end
 * @return {!FilterCriteriaBuilder}
 */
FilterCriteriaBuilder.prototype.whenNumberBetween = function(start, end){};
/**
 * @param {number} start
 * @param {number} end
 * @return {!FilterCriteriaBuilder}
 */
FilterCriteriaBuilder.prototype.whenNumberNotBetween = function(start, end){};
/**
 * @param {number} number
 * @return {!FilterCriteriaBuilder}
 */
FilterCriteriaBuilder.prototype.whenNumberEqualTo = function(number){};
/**
 * @param {number} number
 * @return {!FilterCriteriaBuilder}
 */
FilterCriteriaBuilder.prototype.whenNumberNotEqualTo = function(number){};
/**
 * @param {number} number
 * @return {!FilterCriteriaBuilder}
 */
FilterCriteriaBuilder.prototype.whenNumberGreaterThan = function(number){};
/**
 * @param {number} number
 * @return {!FilterCriteriaBuilder}
 */
FilterCriteriaBuilder.prototype.whenNumberGreaterThanOrEqualTo = function(number){};
/**
 * @param {number} number
 * @return {!FilterCriteriaBuilder}
 */
FilterCriteriaBuilder.prototype.whenNumberLessThan = function(number){};
/**
 * @param {number} number
 * @return {!FilterCriteriaBuilder}
 */
FilterCriteriaBuilder.prototype.whenNumberLessThanOrEqualTo = function(number){};
/**
 * @param {string} text
 * @return {!FilterCriteriaBuilder}
 */
FilterCriteriaBuilder.prototype.whenTextEqualTo = function(text){};
/**
 * @param {string} text
 * @return {!FilterCriteriaBuilder}
 */
FilterCriteriaBuilder.prototype.whenTextNotEqualTo = function(text){};
/**
 * @param {string} text
 * @return {!FilterCriteriaBuilder}
 */
FilterCriteriaBuilder.prototype.whenTextContains = function(text){};
/**
 * @param {string} text
 * @return {!FilterCriteriaBuilder}
 */
FilterCriteriaBuilder.prototype.whenTextDoesNotContain = function(text){};
/**
 * @param {string} text
 * @return {!FilterCriteriaBuilder}
 */
FilterCriteriaBuilder.prototype.whenTextEndsWith = function(text){};
/**
 * @param {string} text
 * @return {!FilterCriteriaBuilder}
 */
FilterCriteriaBuilder.prototype.whenTextStartsWith = function(text){};

/******************************************************************************
 * @constructor
 */
function Filter(){};
/**
 * @return {Range}
 */
Filter.prototype.getRange = function(){};
/**
 * @param {number} columnPosition 
 * @param {FilterCriteria} filterCriteria
 * @return {Filter}
 */
Filter.prototype.setColumnFilterCriteria = function(columnPosition, filterCriteria){};
/**
 * @param {number} columnPosition 
 * @param {boolean} ascending
 * @return {Filter}
 */
Filter.prototype.sort = function(columnPosition, ascending){};
/**
 * @return {Filter}
 */
Filter.prototype.remove = function(){};

/******************************************************************************
 * @constructor
 * @extends {Array}
 */
function Range(){};
/**
 * @return {!Array.<!Array.<string|number|Date|boolean>>}
 */
Range.prototype.getValues = function(){};
/**
 * @return {boolean}
 */
Range.prototype.isBlank = function(){};
/**
 * @return {number}
 */
Range.prototype.getRowIndex = function(){};
/**
 * @return {number}
 */
Range.prototype.getNumRows = function(){};
/**
 * @param {string} format
 */
Range.prototype.setNumberFormat = function(format){};

/**
 * @param {!Array.<!Array.<string|number|Date|boolean>>} values
 */
Range.prototype.setValues = function(values){};

/**
 * @param {string|number|Date|boolean} value
 */
Range.prototype.setValue = function(value){};
/**
 * @param {string} formula
 */
Range.prototype.setFormula = function(formula){};
/**
 * @return {!Filter}
 */
Range.prototype.createFilter = function(){};

/******************************************************************************
 * @constructor
 */
function Sheet(){};
/**
 * @param {number} row 
 * @param {number} column 
 * @param {number=} numRows 
 * @param {number=} numColumns 
 * @return {Range}
 */
Sheet.prototype.getRange = function(row, column, numRows, numColumns){};
/**
 * @return {Range}
 */
Sheet.prototype.getDataRange = function(){};

/**
 * @return {number}
 */
Sheet.prototype.getLastRow = function(){};
/**
 * @return {Filter|null}
 */
Sheet.prototype.getFilter = function(){};

/**
 * @param {number} beforePosition
 * @return {Sheet}
 */
Sheet.prototype.insertRowBefore = function(beforePosition){};
/**
 * @param {number} afterPosition
 * @return {Sheet}
 */
Sheet.prototype.insertRowAfter = function(afterPosition){};
/**
 * @param {!Array.<string|number|Date|boolean>} rowContents
 * @return {Sheet}
 */
Sheet.prototype.appendRow = function(rowContents){};
/**
 * @param {number} rowPosition
 * @param {number=} howMany
 * @return {Sheet}
 */
Sheet.prototype.deleteRow = function(rowPosition, howMany){};
/**
 * @param {number} columnPosition
 * @param {number=} howMany
 * @return {Sheet}
 */
Sheet.prototype.deleteColumns = function(columnPosition, howMany){};
/**
 * @return {Sheet}
 */
Sheet.prototype.hideSheet = function(){};

/******************************************************************************
 * @constructor
 */
function Spreadsheet(){};
/**
 * @param {string} name
 * @return {Sheet|null}
 */
Spreadsheet.prototype.getSheetByName = function(name){};
/**
 * @param {string|number=} sheetNameOrIndex
 * @param {number=} sheetIndex
 * @return {!Sheet}
 */
Spreadsheet.prototype.insertSheet = function(sheetNameOrIndex, sheetIndex){};

/******************************************************************************
 * @const
 */
var SpreadsheetApp = {
    /**
     * @param {string} id 
     * @return {Spreadsheet}
     */
    openById : function(id){},
    /**
     * @return {!FilterCriteriaBuilder}
     */
    newFilterCriteria : function(){},

    flush : function(){}
};

/******************************************************************************
 * @constructor
 */
function Lock(){}
/**
 * @param {number} timeoutInMillis
 * @return {boolean}
 */
Lock.prototype.tryLock = function(timeoutInMillis){};
/**
 * @param {number} timeoutInMillis
 */
Lock.prototype.waitLock = function(timeoutInMillis){};

Lock.prototype.releaseLock = function(){};
/**
 * @return {boolean}
 */
Lock.prototype.hasLock = function(){};

/******************************************************************************
 * @const
 */
var LockService = {
    /**
     * @return {!Lock}
     */
    getDocumentLock : function(){},
    /**
     * @return {!Lock}
     */
    getScriptLock : function(){},
    /**
     * @return {!Lock}
     */
    getUserLock : function(){}
};

/******************************************************************************
 * @const
 */
var module = { exports : null };