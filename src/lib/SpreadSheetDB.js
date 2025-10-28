import {Record, Records} from './record.js';
import SpreadSheetDBError from './SpreadSheetDBError.js';

/* ----------------------------------------------------------------------------
 *
 *  typedef
 *
 --------------------------------------------------------------------------- */
    /**
     * @typedef {{
     *   key          : string,
     *   dataType     : number,
     *   label        : (string|undefined),
     *   unique       : (boolean|undefined),
     *   freeze       : (boolean|undefined),
     *   adminOnly    : (boolean|undefined),
     *   defaultValue : (number|string|!Date|boolean|undefined)
     * }}
     */
    var ColumnDefinition;

    /**
     * @typedef {{
     *   sheetName : string,
     *   columns   : !Array.<!ColumnDefinition>,
     *   sortKey   : (string|undefined),
     *   ascending : (boolean|undefined),
     *   insert    : (boolean|undefined),
     *   update    : (boolean|undefined),
     *   delete    : (boolean|undefined)
     * }}
     */
    var SheetDefinition;

    /**
     * @typedef {!Array.<!SheetDefinition>}
     */
    var SheetDefinitionList;

    /**
     * @typedef {{
     *   sheetName  : string,
     *   actionType : number,
     *   data       : (!Records|!Record|undefined),
     *   db         : !SpreadSheetDB
     * }}
     */
    var SpreadSheetDBEvent;

    /**
     * @typedef {!function(!SpreadSheetDBEvent):(boolean|void)}
     */
    var SpreadSheetDBCallback;

    /**
     * @private
     * @typedef {{
     *   actionType  : number,
     *   callback    : !SpreadSheetDBCallback,
     *   thisContext : *,
     *   _off        : (boolean|undefined)
     * }}
     */
    var _SpreadSheetDBListener;

/* ----------------------------------------------------------------------------
 *
 *  patch
 *
 --------------------------------------------------------------------------- */
    /**
     * 【GAS】CacheServiceをもっと簡単に使おう
     *   https://qiita.com/toratosoine/items/9c17fea4083059649cd2#%E6%97%A5%E4%BB%98%E3%81%AE%E5%87%A6%E7%90%86
     *     > JSONにはできるけど元に戻せない...ので、やむを得ず上書きしました。 */
    Date.prototype.toJSON = function(){
        return SpreadSheetDB.toDateTimeString( this.getTime() );
    };

/* ----------------------------------------------------------------------------
 *
 *  SpreadSheetDB Class
 *
 --------------------------------------------------------------------------- */
    /**
     * @constructor
     * 
     * @param {string} spreadSheetID 
     * @param {!SheetDefinitionList} sheetDefinitionList */
    function SpreadSheetDB( spreadSheetID, sheetDefinitionList ){
        /** @type {string} */
        this.spreadSheetID = spreadSheetID;
        /** @type {!SheetDefinitionList} */
        this._sheetDefinitionList = sheetDefinitionList;
        /** @type {!Object.<string,Sheet>} */
        this._sheets = {};
        /** @type {!Object.<string,string>} */
        this._indexKeys = {};
        /** @type {!Object.<string,!Array.<!_SpreadSheetDBListener>>} */
        this._listeners = {};
        /** @type {Spreadsheet|null} */
        this._spreadSheet = null;

        for( let i = 0, l = sheetDefinitionList.length; i < l; ++i ){
            const sheetDefinition   = sheetDefinitionList[ i ];
            const columnDefinitions = sheetDefinition.columns;
            const prefixedSheetName = SpreadSheetDB.PREFIX + sheetDefinition.sheetName;

            if( columnDefinitions[ 0 ].dataType !== SpreadSheetDB.DataType.INDEX ){
                columnDefinitions.unshift(
                    {
                        key      : SpreadSheetDB.DEFAULT_INDEX_KEY,
                        label    : 'No.',
                        dataType : SpreadSheetDB.DataType.INDEX
                    }
                );
                this._indexKeys[ prefixedSheetName ] = SpreadSheetDB.DEFAULT_INDEX_KEY;
            } else {
                this._indexKeys[ prefixedSheetName ] = columnDefinitions[ 0 ].key;
            };
            // if( goog.DEBUG ){
                // 重複する sheetName のチェック
            /* for( let j = 1, m = columnDefinitions.length; i < l; ++i ){
                // 重複する key のチェック, 不正なデータ型のチェック
                // sortKey の存在確認
            }; */
            // };
        };
    };

    /** @const */
    SpreadSheetDB.DEFINE = {};
    /** @define {number} */
    SpreadSheetDB.DEFINE.HASH_LENGTH = 6; // goog.define( 'SpreadSheetDB.DEFINE.HASH_LENGTH' , 6 );

    /** @const */
    SpreadSheetDB.TIME_ZONE_OFFSET = new Date( '2000-01-01' ).getHours();

    /**
     * @enum {number} */
    SpreadSheetDB.ActionType = {
        INSERT       : 1,
        UPDATE       : 2,
        DELETE       : 4,
        CREATE_SHHET : 8,
        ALL          : 1 + 2 + 4 + 8
    };
    /**
     * @enum {number} */
    SpreadSheetDB.DataType = {
        INDEX       :  0,
        UNIQUE_HASH :  1, // 自動で設定される値 ランダムな文字列
        INSERTED_AT :  2, // 自動で設定される値 挿入日時
        UPDATED_AT  :  3, // 自動で設定される値 更新日時
        NUMBER      :  4,
        BOOLEAN     :  5,
        STRING      :  6,
        DATETIME    :  7,
        DATE        :  8,
        TIME_OF_DAY :  9,
        JSON        : 10
    };
    /**
     * 2023-03-21 13:56:15.012
     * @param {number|string} numberOrDateTimeString
     * @return {string} */
    SpreadSheetDB.toDateTimeString = function( numberOrDateTimeString ){
        const date = new Date( numberOrDateTimeString );

        return date.getFullYear() + '-' + SpreadSheetDB._toXX( date.getMonth() + 1 ) + '-' + SpreadSheetDB._toXX( date.getDate() )
            + ' ' + SpreadSheetDB._toXX( date.getHours() ) + ':' + SpreadSheetDB._toXX( date.getHours() )  + ':' + SpreadSheetDB._toXX( date.getSeconds() )
            + '.' + SpreadSheetDB._toXXX( date.getMilliseconds() );
    };

/* ----------------------------------------------------------------------------
 *
 *  Public
 *
 --------------------------------------------------------------------------- */
    /**
     * 
     * @return {number} */
    SpreadSheetDB.prototype.getTotalSheets = function(){
        return this._sheetDefinitionList.length;
    };

    /**
     * 
     * @param {number} sheetIndex
     * @return {string} */
    SpreadSheetDB.prototype.getSheetName = function( sheetIndex ){
        const sheetDefinitionList = this._sheetDefinitionList;

        return sheetIndex < sheetDefinitionList.length ? sheetDefinitionList[ sheetIndex ].sheetName : '';
    };

    /**
     * 
     * @param {string} sheetName
     * @return {number} */
    SpreadSheetDB.prototype.getTotalRecords = function( sheetName ){
        const sheet = this._getSheet( sheetName );

        return sheet.getLastRow() - SpreadSheetDB.DATA_ROW_START;
    };

    /**
     * 
     * @param {string} sheetName
     * @return {number} */
    SpreadSheetDB.prototype.getTotalCells = function( sheetName ){
        const sheet = this._getSheet( sheetName );
        const sheetDefinition = this._getSheetDefinition( sheetName );

        return sheet.getLastRow() * sheetDefinition.columns.length;
    };

    /**
     * 
     * @param {string} sheetName
     * @param {string} query
     * @param {boolean} isAdmin
     * @param {number} startIndex
     * @param {number} maxRecords
     * @return {!Records} */
    SpreadSheetDB.prototype.get = function( sheetName, query, isAdmin, startIndex, maxRecords ){
        return this._getRecordsOrIndexes( sheetName, query, false, false, isAdmin, startIndex, maxRecords );
    };

    /**
     * @param {string} sheetName
     * @param {!Records|!Record} newRecordOrRecords 空の場合は最後
     * @param {boolean} isAdmin
     * @return {!Records|!Record} 値が補われた record を返す
     * @throws {SpreadSheetDBError} */
    SpreadSheetDB.prototype.insert = function( sheetName, newRecordOrRecords, isAdmin ){
        const sheetDefinition = this._getSheetDefinition( sheetName );

        if( sheetDefinition.insert === false ){
            throw SpreadSheetDBError.create( SpreadSheetDBError.CODE.INSERT_OPERATION_BLOCKED, sheetName );
        };

        const newRecords = /** @type {!Records} */ (Array.isArray( newRecordOrRecords ) ? newRecordOrRecords : [ newRecordOrRecords ]);
        const sheet = this._getSheet( sheetName );
        const lastRow = sheet.getLastRow();
        const newValues = [];

        for( let i = 0, l = newRecords.length; i < l; ++i ){
            newValues.push( this._objectToValueArray( sheetName, SpreadSheetDB.ActionType.INSERT, newRecords[ i ], void 0, isAdmin ) );
        };
        const columnDefinitions = sheetDefinition.columns;

        for( let i = 0, l = columnDefinitions.length; i < l; ++i ){
            switch( columnDefinitions[ i ].dataType ){
                case SpreadSheetDB.DataType.INDEX :
                    sheet.getRange( lastRow + 1, i + 1, newRecords.length, 1 ).setFormula( '=ROW()-1' );
                    break;
                /* case SpreadSheetDB.DataType.DATE :
                    sheet.getRange( lastRow + 1, i + 1, newRecords.length, 1 ).setNumberFormat( 'yyyy/mm/dd' );
                    break;
                case SpreadSheetDB.DataType.TIME_OF_DAY :
                    sheet.getRange( lastRow + 1, i + 1, newRecords.length, 1 ).setNumberFormat( 'HH:mm:ss' );
                    break;
                case SpreadSheetDB.DataType.DATETIME    :
                case SpreadSheetDB.DataType.INSERTED_AT :
                case SpreadSheetDB.DataType.UPDATED_AT  :
                    sheet.getRange( lastRow + 1, i + 1, newRecords.length, 1 ).setNumberFormat( 'yyyy/mm/dd hh:mm' );
                    break; */
                case SpreadSheetDB.DataType.STRING      :
                case SpreadSheetDB.DataType.UNIQUE_HASH :
                case SpreadSheetDB.DataType.JSON        :
                    // 【GAS】数値の先頭にある0が消えるのを防ぐ表示形式の設定
                    // https://chusotsu-program.com/gas-number-format/
                    sheet.getRange( lastRow + 1, i + 1, newRecords.length, 1 ).setNumberFormat( '@' );
                    break;
            };
        };
        sheet.getRange( lastRow + 1, 2, newRecords.length, columnDefinitions.length - 1 ).setValues( newValues );

        this._sortSheet( sheetName );

        this._dispatch( sheetName, SpreadSheetDB.ActionType.INSERT, newRecordOrRecords );
        SpreadsheetApp.flush();
        return newRecordOrRecords;
    };

    /**
     * queryOrRecord に record を指定した場合一件の変更, セレクタを使用した場合、ヒットした全てのレコードを opt_updateKeyValues を使って更新する
     * @param {string} sheetName
     * @param {string|!Record} queryOrRecord
     * @param {!Record=} opt_updateKeyValues
     * @param {boolean=} opt_noErrorWhenFailToUpdate
     * @return {boolean}
     * @throws {SpreadSheetDBError} */
    SpreadSheetDB.prototype.update = function( sheetName, queryOrRecord, opt_updateKeyValues, opt_noErrorWhenFailToUpdate ){
        const sheetDefinition = this._getSheetDefinition( sheetName );

        if( sheetDefinition.update === false ){
            throw SpreadSheetDBError.create( SpreadSheetDBError.CODE.UPDATE_OPERATION_BLOCKED, sheetName );
        };

        const sheet = this._getSheet( sheetName );
        let records, newRecord = opt_updateKeyValues;

        if( typeof queryOrRecord === 'string' ){
            records = this._getRecordsOrIndexes( sheetName, queryOrRecord, false, true, true );
        } else if( typeof queryOrRecord === 'object' ){
            records = this._getOneRecordByUniqueKey( sheetName, newRecord = queryOrRecord, false, true );
            if( !records ){
                throw SpreadSheetDBError.create( SpreadSheetDBError.CODE.NO_UNIQUE_COLUMN, sheetName );
            };
        } else {
            throw SpreadSheetDBError.create( SpreadSheetDBError.CODE.BAD_QYERY_OR_RECORD, sheetName, '', queryOrRecord );
        };
        if( records.length ){
            const newRecords = [];
            const indexKey   = this._indexKeys[ SpreadSheetDB.PREFIX + sheetName ];

            while( records.length ){
                const _newRecord = clone( newRecord );
                const record = records.shift();
                const values = this._objectToValueArray(
                    sheetName, SpreadSheetDB.ActionType.UPDATE,
                    /** @type {!Object} */ (_newRecord),
                    record, true
                );
                sheet.getRange( record[ indexKey ] + 1, 2, 1, values.length ).setValues( [ values ] );
                newRecords.push( _newRecord );
            };
            if( sheetDefinition.sortKey in newRecord ){
                this._sortSheet( sheetName );
            };
            this._dispatch( sheetName, SpreadSheetDB.ActionType.UPDATE, newRecords );
            SpreadsheetApp.flush();
        } else if( !opt_noErrorWhenFailToUpdate ){
            throw SpreadSheetDBError.create( SpreadSheetDBError.CODE.TARGET_RECORD_NOT_FOUND, sheetName, '', queryOrRecord );
        } else {
            return false;
        };
        return true;

        function clone( obj ){
            return JSON.parse( JSON.stringify( obj ) );
        };
    };

    /**
     * 一致する record を削除する
     * @param {string} sheetName
     * @param {string|!Record} queryOrRecord
     * @param {boolean=} opt_noErrorWhenFailToDelete
     * @return {boolean}
     * @throws {SpreadSheetDBError} */
    SpreadSheetDB.prototype.delete = function( sheetName, queryOrRecord, opt_noErrorWhenFailToDelete ){
        const sheetDefinition = this._getSheetDefinition( sheetName );

        if( sheetDefinition.delete === false ){
            throw SpreadSheetDBError.create( SpreadSheetDBError.CODE.DELETE_OPERATION_BLOCKED, sheetName );
        };

        const sheet = this._getSheet( sheetName );
        const hasDeleteListener = this.listening( sheetName, SpreadSheetDB.ActionType.DELETE );
        let recordsOrIndexArray;

        // https://developers.google.com/apps-script/reference/spreadsheet/sheet#deleterowrowposition
        if( typeof queryOrRecord === 'string' ){
            recordsOrIndexArray = this._getRecordsOrIndexes( sheetName, queryOrRecord, !hasDeleteListener, hasDeleteListener, true );
        } else if( typeof queryOrRecord === 'object' ){
            recordsOrIndexArray = this._getOneRecordByUniqueKey( sheetName, queryOrRecord, !hasDeleteListener, hasDeleteListener );
            if( !recordsOrIndexArray ){
                throw SpreadSheetDBError.create( SpreadSheetDBError.CODE.NO_UNIQUE_COLUMN, sheetName );
            };
        } else {
            throw SpreadSheetDBError.create( SpreadSheetDBError.CODE.BAD_QYERY_OR_RECORD, sheetName, '', queryOrRecord );
        };
        if( recordsOrIndexArray.length ){
            let i = recordsOrIndexArray.length;
            const indexKey = this._indexKeys[ SpreadSheetDB.PREFIX + sheetName ];

            while( i ){
                sheet.deleteRow( /** @type {number} */ (
                    !hasDeleteListener
                        ? recordsOrIndexArray[ --i ] // index が変わるので最期から
                        : /** @type {!Records} */ (recordsOrIndexArray)[ --i ][ indexKey ]
                    ) + 1 );
            };
            if( hasDeleteListener ){
                this._dispatch( sheetName, SpreadSheetDB.ActionType.DELETE, /** @type {!Records} */ (recordsOrIndexArray) );
            };
            SpreadsheetApp.flush();
        } else if( !opt_noErrorWhenFailToDelete ){
            throw SpreadSheetDBError.create( SpreadSheetDBError.CODE.TARGET_RECORD_NOT_FOUND, sheetName, '', queryOrRecord );
        } else {
            return false;
        };
        return true;
    };

    /**
     * 
     * @param {string} sheetName 
     * @param {number} actionType 
     * @param {!SpreadSheetDBCallback} callback
     * @param {*=} opt_thisContext
     * @return {!SpreadSheetDB} */
    SpreadSheetDB.prototype.listen = function( sheetName, actionType, callback, opt_thisContext ){
        const prefixedSheetName = SpreadSheetDB.PREFIX + sheetName;

        if( !this._listeners[ prefixedSheetName ] ){
            this._listeners[ prefixedSheetName ] = [];
        };
        const listeners = this._listeners[ prefixedSheetName ];

        for( let i = 0, l = listeners.length; i < l; ++i ){
            const listener = listeners[ i ];
            if( listener.actionType === actionType && listener.callback === callback && listener.thisContext == opt_thisContext ){
                if( listener._off ){
                    listener._off = false;
                };
                return this;
            };
        };
        listeners.push( { actionType : actionType, callback : callback, thisContext : opt_thisContext } );
        return this;
    };

    /**
     * 
     * @param {string} sheetName 
     * @param {number} actionType 
     * @param {!SpreadSheetDBCallback} callback
     * @param {*=} opt_thisContext
     * @return {boolean} 削除した場合は true, リスナが非存在の場合は false */
    SpreadSheetDB.prototype.unlisten = function( sheetName, actionType, callback, opt_thisContext ){
        const prefixedSheetName = SpreadSheetDB.PREFIX + sheetName;
        const listeners = this._listeners[ prefixedSheetName ];

        if( !listeners ){
            return false;
        };

        for( let i = 0, l = listeners.length; i < l; ++i ){
            const listener = listeners[ i ];
            if( listener.actionType === actionType && listener.callback === callback && listener.thisContext == opt_thisContext ){
                if( listeners._dispatchDepth ){
                    listener._off = true;
                } else {
                    listeners.splice( i, 1 );
                };
                return true;
            };
        };
        return false;
    };

    /**
     * 
     * @param {string} sheetName 
     * @param {number} actionType 
     * @param {!SpreadSheetDBCallback=} callback undefined の場合は、sheetName と actiontype の一致するリスナが存在すれば true
     * @param {*=} opt_thisContext
     * @return {boolean} リスナが存在する場合は true, 非存在の場合は false */
    SpreadSheetDB.prototype.listening = function( sheetName, actionType, callback, opt_thisContext ){
        const prefixedSheetName = SpreadSheetDB.PREFIX + sheetName;
        const listeners = this._listeners[ prefixedSheetName ];

        if( !listeners ){
            return false;
        };

        for( let i = 0, l = listeners.length; i < l; ++i ){
            const listener = listeners[ i ];
            if( listener.actionType & actionType && callback === void 0 && listener._off !== true ){
                return true;
            };
            if( listener.actionType === actionType && listener.callback === callback && listener.thisContext == opt_thisContext ){
                return listener._off !== true;
            };
        };
        return false;
    };

/* ----------------------------------------------------------------------------
 *
 *  Private
 *
 --------------------------------------------------------------------------- */
/** @private @const */
SpreadSheetDB.DEFAULT_INDEX_KEY = '_myRowIndex';
/** @private @const */
SpreadSheetDB.PREFIX = '-';
/** @private @const */
SpreadSheetDB.DATA_ROW_START = 1;
/** @private @const */
SpreadSheetDB.HIDDEN_QUERY_SHEET_NAME = 'hidden-query-sheet';
/**
 * @private
 * @enum {number} */
SpreadSheetDB._Operators = {
    EQUAL                 :  1,
    NOT_EQUAL             :  2,
    LESS_THAN_OR_EQUAL    :  3,
    LESS_THAN             :  4,
    GREATER_THAN_OR_EQUAL :  5,
    GREATER_THAN          :  6,
    STARTS_WITH           :  7, // 文字列の前方一致
    ENDS_WITH             :  8, // 文字列の後方一致
    CONTAINS              :  9, // 文字列の部分一致
    NOT_CONTAINS          : 10  // 文字列を含まない
};
/**
 * @private
 * @enum {number} */
SpreadSheetDB._SymboleToOperator = {
    '==' : SpreadSheetDB._Operators.EQUAL,
    '='  : SpreadSheetDB._Operators.EQUAL,
    '!=' : SpreadSheetDB._Operators.NOT_EQUAL,
    '<>' : SpreadSheetDB._Operators.NOT_EQUAL,
    '><' : SpreadSheetDB._Operators.NOT_EQUAL,
    '≠' : SpreadSheetDB._Operators.NOT_EQUAL,
    '<=' : SpreadSheetDB._Operators.LESS_THAN_OR_EQUAL,
    '=<' : SpreadSheetDB._Operators.LESS_THAN_OR_EQUAL,
    '≦' : SpreadSheetDB._Operators.LESS_THAN_OR_EQUAL,
    '<'  : SpreadSheetDB._Operators.LESS_THAN,
    '>=' : SpreadSheetDB._Operators.GREATER_THAN_OR_EQUAL,
    '=>' : SpreadSheetDB._Operators.GREATER_THAN_OR_EQUAL,
    '≧' : SpreadSheetDB._Operators.GREATER_THAN_OR_EQUAL,
    '>'  : SpreadSheetDB._Operators.GREATER_THAN,
    '^=' : SpreadSheetDB._Operators.STARTS_WITH, // 文字列の前方一致
    '$=' : SpreadSheetDB._Operators.ENDS_WITH,   // 文字列の後方一致
    '*=' : SpreadSheetDB._Operators.CONTAINS,    // 文字列の部分一致
    '!*' : SpreadSheetDB._Operators.NOT_CONTAINS // 文字列を含まない
};

/**
 * 9:30:15.012
 * @private
 * @param {number} numberOrHHmmssLikeString
 * @return {string} */
SpreadSheetDB._toHHmmssString = function( numberOrHHmmssLikeString ){
    /* let num;

    if( typeof numberOrHHmmssLikeString === 'string' ){
        num = SpreadSheetDB._HHmmssLikeStringToNumber( numberOrHHmmssLikeString, false );
    } else {
        num = numberOrHHmmssLikeString;
    }; */
    let num = numberOrHHmmssLikeString;
    
    const ms = num % 1000;
    num -= ms;
    const ss = num % ( 60 * 1000 );
    num -= ss;
    const mm = num % ( 60 * 60 * 1000 );
    num -= mm;

    return num / ( 60 * 60 * 1000 ) + ':' + SpreadSheetDB._toXX( mm / ( 60 * 1000 ) ) + ':' + SpreadSheetDB._toXX( ss / 1000 ) + '.' + SpreadSheetDB._toXXX( ms );
};
/**
 * @private
 * @param {number|string|!Date|boolean|undefined} HHmmss
 * @param {boolean} throwError 
 * @return {number} */
SpreadSheetDB._HHmmssLikeStringToNumber = function( HHmmss, throwError ){
    function isValidNumber( num ){
        return 0 <= num && num <= 24 * 60 * 60 * 1000 - 1;
    };

    if( isValidNumber( HHmmss ) ){
        return /** @type {number} */ (HHmmss);
    } else if( HHmmss instanceof Date && isValidNumber( + HHmmss ) ){
        return + HHmmss;
    } else if( typeof HHmmss === 'string' ){
        const _HHmmss = HHmmss.split( ':' );

        if( 0 <= parseFloat( _HHmmss[ 0 ] ) && 0 <= parseFloat( _HHmmss[ 1 ] ) ){
            const num = parseFloat( _HHmmss[ 0 ] ) * 60 * 60 * 1000 + 
                        parseFloat( _HHmmss[ 1 ] ) * 60      * 1000 +
                        parseFloat( _HHmmss[ 2 ] || 0 )      * 1000;
            if( isValidNumber( num ) ){
                return num;
            };
        };
    };

    if( throwError ){
        throw SpreadSheetDBError.create( SpreadSheetDBError.CODE.INVALID_VALUE, '', '', 'not_timeodday: ' + HHmmss );
    };
    return NaN;
};
/** @private */
SpreadSheetDB._toXX = function( num ){
    return ( num < 10 ? '0' : '' ) + num;
};
/** @private */
SpreadSheetDB._toXXX = function( num ){
    num = '00' + num;
    return num.substr( num.length - 3 );
};
/** @private */
SpreadSheetDB._isInvalidDateObject = function( date ){
    return '' + date === 'Invalid Date';
};
/**
 * 2023-03-21
 * @private
 * @param {number|string} numberOrDateString 
 * @return {string} */
SpreadSheetDB._toDateString = function( numberOrDateString ){
    const date = new Date( numberOrDateString );

    return date.getFullYear() + '-' + SpreadSheetDB._toXX( date.getMonth() + 1 ) + '-' + SpreadSheetDB._toXX( date.getDate() );
};
/**
 * 2023-03-21
 * @private
 * @param {number|string|!Date|boolean|undefined} numberOrDateString
 * @param {boolean} throwError
 * @return {number}
 * @throws {SpreadSheetDBError} */
SpreadSheetDB._dateStringToNumber = function( numberOrDateString, throwError ){
    const date = new Date( numberOrDateString );

    if( SpreadSheetDB._isInvalidDateObject( date ) || date.getHours() !== SpreadSheetDB.TIME_ZONE_OFFSET || date.getMinutes() || date.getMilliseconds() ){
        if( throwError ){
            throw SpreadSheetDBError.create( SpreadSheetDBError.CODE.INVALID_VALUE, '', '', 'not_date: ' + numberOrDateString );
        } else {
            return NaN;
        };
    };
    return + date;
};
/**
 * 2023-03-21
 * @private
 * @param {number|string|!Date|boolean|undefined} numberOrDateString
 * @param {boolean} throwError
 * @return {number}
 * @throws {SpreadSheetDBError} */
SpreadSheetDB._dateTimeStringToNumber = function( numberOrDateString, throwError ){
    const date = new Date( numberOrDateString );

    if( SpreadSheetDB._isInvalidDateObject( date ) ){
        if( throwError ){
            throw SpreadSheetDBError.create( SpreadSheetDBError.CODE.SHEETS_NOT_FOUND, '', '', 'not_datetime: ' + numberOrDateString );
        } else {
            return NaN;
        };
    };
    return + date;
};

/**
 * @private
 * @param {string} sheetName 
 * @return {!Sheet} 
 * @throws {SpreadSheetDBError} */
SpreadSheetDB.prototype._getSheet = function( sheetName ){
    const sheets = this._sheets;
    const prefixedSheetName = SpreadSheetDB.PREFIX + sheetName;
    let spreadSheet = this._spreadSheet;

    if( !spreadSheet ){
        spreadSheet = this._spreadSheet = SpreadsheetApp.openById( this.spreadSheetID );
        if( !spreadSheet ){
            throw SpreadSheetDBError.create( SpreadSheetDBError.CODE.SHEETS_NOT_FOUND, '', '', this.spreadSheetID );
        };
    };
    if( !sheets[ prefixedSheetName ] ){
        sheets[ prefixedSheetName ] = spreadSheet.getSheetByName( sheetName );
        if( !sheets[ prefixedSheetName ] ){
            const sheetDefinitionList = this._sheetDefinitionList;

            if( sheetName === SpreadSheetDB.HIDDEN_QUERY_SHEET_NAME ){
                const querySheet = sheets[ prefixedSheetName ] = spreadSheet.insertSheet( sheetName, sheetDefinitionList.length );
                if( !goog.DEBUG ){
                    querySheet.hideSheet();
                };
            } else {
                for( let i = 0, l = sheetDefinitionList.length; i < l; ++i ){
                    const sheetDefinition = sheetDefinitionList[ i ];

                    if( sheetDefinition.sheetName === sheetName ){
                        const sheet = sheets[ prefixedSheetName ] = spreadSheet.insertSheet( sheetName, i );
                        const headerLabels = [];
                        const columnDefinitions = sheetDefinition.columns;
                        const m = columnDefinitions.length;
                        for( let j = 0; j < m; ++j ){
                            const columnDefinition = columnDefinitions[ j ];
                            headerLabels.push( columnDefinition.label || columnDefinition.key );
                        };
                        if( m < 26 ){
                            sheet.deleteColumns( m + 1, 26 - m ) // 不要な列を削除
                        };
                        sheet.getRange( 1, 1, 1, m ).setValues( [ headerLabels ] );
                        this._dispatch( sheetName, SpreadSheetDB.ActionType.CREATE_SHHET );
                        return sheet;
                    };
                };
                throw SpreadSheetDBError.create( SpreadSheetDBError.CODE.SHEET_DEFINITION_NOT_FOUND, sheetName );
                // https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet#insertsheetsheetname
            };
        };
    };
    return /** @type {!Sheet} */ (sheets[ prefixedSheetName ]);
};
/**
 * @private
 * @param {string} sheetName 
 * @return {!SheetDefinition} 
 * @throws {SpreadSheetDBError} */
SpreadSheetDB.prototype._getSheetDefinition = function( sheetName ){
    const sheetDefinitionList = this._sheetDefinitionList;

    for( let i = 0, l = sheetDefinitionList.length; i < l; ++i ){
        if( sheetDefinitionList[ i ].sheetName === sheetName ){
            return sheetDefinitionList[ i ];
        };
    };
    throw SpreadSheetDBError.create( SpreadSheetDBError.CODE.SHEET_DEFINITION_NOT_FOUND, sheetName );
};
/**
 * @private
 * @param {string} sheetName 
 * @param {string} key 
 * @return {number}
 * @throws {SpreadSheetDBError} */
SpreadSheetDB.prototype._getColumnIndexFromKey = function( sheetName, key ){
    const sheetDefinition = this._getSheetDefinition( sheetName );
    const columnDefinitions = sheetDefinition.columns;

    for( let i = SpreadSheetDB.DATA_ROW_START, l = columnDefinitions.length; i < l; ++i ){
        if( columnDefinitions[ i ].key === key ){
            return i;
        };
    };
    throw SpreadSheetDBError.create( SpreadSheetDBError.CODE.COLUMN_DEFINITION_NOT_FOUND, sheetName, key );
};
/**
 * @private
 * @param {string} sheetName 
 * @param {string} key 
 * @return {!ColumnDefinition} */
SpreadSheetDB.prototype._getColumnDefinitionFromKey = function( sheetName, key ){
    const sheetDefinition = this._getSheetDefinition( sheetName );

    return sheetDefinition.columns[ this._getColumnIndexFromKey( sheetName, key ) ];
};
/**
 * @private
 * @param {string} sheetName 
 * @return {string|undefined} */
SpreadSheetDB.prototype._getUniqueKey = function( sheetName ){
    const sheetDefinition = this._getSheetDefinition( sheetName );
    const columnDefinitions = sheetDefinition.columns;

    for( let i = SpreadSheetDB.DATA_ROW_START, l = columnDefinitions.length; i < l; ++i ){
        const columnDefinition = columnDefinitions[ i ];

        if( columnDefinition.unique ||
            columnDefinition.dataType === SpreadSheetDB.DataType.UNIQUE_HASH ){
            return columnDefinitions[ i ].key;
        };
    };
};
/**
 * ユニークな文字列を生成する。間違えて入力しやすい文字を含まないようにする。
 * @private
 * @param {string} sheetName 
 * @param {string} key 
 * @return {string} */
SpreadSheetDB.prototype._generateUniqueString = function( sheetName, key ){
    // 小文字の L, 大文字の I, 数値の O はハッシュに出現しない
    const SEED = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
                     .split( 'l' ).join( '' ).split( 'I' ).join( '' ).split( '0' ).join( '' );
    
    let hash = '';
    
    for( let i = 0; i < SpreadSheetDB.DEFINE.HASH_LENGTH; ++i ){
        hash += SEED[ ( SEED.length * Math.random() ) | 0 ];
    };

    hash = SpreadSheetDB._normalizeHash( hash );

    if( this._getRecordsOrIndexes( sheetName, key + '==' + hash, true, false, true ).length ){
        return this._generateUniqueString( sheetName, key );
    };
    return hash;
};
/**
 * 間違えて入力しやすい文字を変換する
 * @private
 * @param {string} hash 
 * @return {string} */
SpreadSheetDB._normalizeHash = function( hash ){
    // 小文字のL => 1
    // 大文字のI => 1
    // 数値の0   => 大文字のO(オー) 先頭のゼロはセルのフォーマットによっては消えるので、使用しない
    return hash.split( 'l' ).join( '1' ).split( 'I' ).join( '1' ).split( '0' ).join( 'O' );
};
/**
 * @private
 * @param {string} selector 
 * @return {!Array.<!Array.<string|number>>}
 * @throws {SpreadSheetDBError} */
SpreadSheetDB.prototype._parseSelector = function( selector ){
    const _SYMBOLE_TO_OPERATOR = SpreadSheetDB._SymboleToOperator;
    let token, selectors = [];
    const tokens = createTokens( selector );
    const parsedSelectors = [ selectors ];

    while( tokens.length ){
        token = tokens.shift();
        if( token === ',' ){
            selectors = [];
            parsedSelectors.push( selectors );
        } else if( token !== '&&' ){
            selectors.push( token );
        };
    };

    return parsedSelectors;

    function createTokens( selector ){
        const tokens = [];
        const PHASE_KEY_START = 1, PHASE_IN_KEY =2, PHASE_OPERATOR = 3, PHASE_VALUE_START = 4, PHASE_IN_VALUE = 5, PHASE_VALUE_END = 6;

        let inQuot = '', phase = PHASE_KEY_START, token = '';

        for( let i = 0, l = selector.length; i < l; ++i ){
            const chr = selector[ i ];
            const two = chr + selector[ i + 1 ];
            switch( phase ){
                case PHASE_KEY_START :
                    if( chr === ' ' ){
                        break;
                    } else if( isAlphabetOrUnderScore( chr ) ){
                        token += chr;
                        phase = PHASE_IN_KEY;
                        break;
                    } else {
                        throw SpreadSheetDBError.create( SpreadSheetDBError.CODE.FAILED_TO_PARSE_SELECTOR, '', '', 'selector:' + selector );
                    };
                case PHASE_IN_KEY :
                    if( isAlphabetOrUnderScore( chr ) || ( token.length && isNumber( chr ) ) ){
                        token += chr;
                        break;
                    };
                case PHASE_OPERATOR :
                    if( chr === ' ' ){
                        phase = PHASE_OPERATOR;
                    } else if( _SYMBOLE_TO_OPERATOR[ two ] ){
                        phase = PHASE_VALUE_START;
                        token && tokens.push( token );
                        tokens.push( _SYMBOLE_TO_OPERATOR[ two ] );
                        token = '';
                        ++i;
                    } else if( _SYMBOLE_TO_OPERATOR[ chr ] ){
                        phase = PHASE_VALUE_START;
                        token && tokens.push( token );
                        tokens.push( _SYMBOLE_TO_OPERATOR[ chr ] );
                        token = '';
                    } else {
                        throw SpreadSheetDBError.create( SpreadSheetDBError.CODE.FAILED_TO_PARSE_SELECTOR, '', '', selector );
                    };
                    break;
                case PHASE_VALUE_START :
                    if( chr === ' ' ){
                        break;
                    };
                    const str = selector.substr( i );
                    const num = Number.parseFloat( str ) + '';
                    if( num === str.substr( 0, num.length ) && isEndOfValue( i + num.length ) ){
                        tokens.push( Number( num ) );
                        i += num.length - 1;
                        phase = PHASE_VALUE_END;
                        break;
                    } else if( num === '0' + str.substr( 0, num.length - 1 ) && isEndOfValue( i + num.length - 1 ) ){ // "0.123" === ".123"
                        tokens.push( Number( num ) );
                        i += num.length - 2;
                        phase = PHASE_VALUE_END;
                        break;
                    } else if( num === '-0' + str.substr( 1, num.length - 1 ) && isEndOfValue( i + num.length - 1 ) ){ // "-0.123" === "-.123"
                        tokens.push( Number( num ) );
                        i += num.length - 2;
                        phase = PHASE_VALUE_END;
                        break;
                    };
                    phase = PHASE_IN_VALUE;
                case PHASE_IN_VALUE :
                    if( inQuot ){
                        if( chr === inQuot ){
                            inQuot = '';
                            tokens.push( token );
                            token = '';
                            phase = PHASE_VALUE_END;
                        } else {
                            token += chr;
                        };
                        break;
                    } else if( chr === '"' || chr === "'" || chr === "`" ){
                        if( token ){
                            token += chr;
                        } else {
                            inQuot = chr;
                        };
                        break;
                    } else if( two !== '&&' && chr !== '+' && chr !== ',' ){
                        token += chr;
                        break;
                    };
                case PHASE_VALUE_END :
                    if( two === '&&' ){
                        if( phase === PHASE_IN_VALUE ){
                            tokens.push( cleanSpace( token ) );
                            token = '';
                        };
                        tokens.push( two );
                        ++i;
                        phase = PHASE_OPERATOR;
                    } else if( chr === '+' || chr === ',' ){
                        if( phase === PHASE_IN_VALUE ){
                            tokens.push( cleanSpace( token ) );
                            token = '';
                        };
                        tokens.push( chr );
                        phase = PHASE_KEY_START;
                    } else {
                        throw SpreadSheetDBError.create( SpreadSheetDBError.CODE.FAILED_TO_PARSE_SELECTOR, '', '', selector );
                    };
                    break;
            };
        };
        if( token && phase === PHASE_IN_VALUE ){
            tokens.push( token );
        };
        return tokens;

        function isAlphabetOrUnderScore( chr ){
            return 'A' <= chr && chr <= 'Z' || 'a' <= chr && chr <= 'z' || chr === '_';
        };
        function isNumber( chr ){
            return '0' <= chr && chr <= '9';
        };
        function cleanSpace( str ){
            const ary = str.split( '' );

            while( ary[ ary.length - 1 ] === ' ' ){
                ary.pop();
            };
            return ary.join( '' );
        };
        function isEndOfValue( start ){
            const chr = selector.substr( start, 1 );
            const two = selector.substr( start, 2 );

            return !chr || chr === ' ' || chr === '+' || chr === ',' || two === '&&';
        };
    };
};
/**
 * @private
 * @param {string|number|boolean} value
 * @return {string|number|boolean}
 * @throws {SpreadSheetDBError} */
SpreadSheetDB._escapeSelectorValue = function( value ){
    if( typeof value === 'string' ){
        const firstChar = value[ 0 ];

        if( firstChar === '"' ){
            if( value.indexOf( "'" ) === -1 ){
                value = "'" + value + "'";
            } else if( value.indexOf( "`" ) === -1 ){
                value = "`" + value + "`";
            } else {
                throw SpreadSheetDBError.create( SpreadSheetDBError.CODE.FAILED_TO_ESCAPE_QUERY_VALUE, '', '', 'query_value:' + value );
            };
        } else if( firstChar === "'" ){
            if( value.indexOf( '"' ) === -1 ){
                value = '"' + value + '"';
            } else if( value.indexOf( "`" ) === -1 ){
                value = "`" + value + "`";
            } else {
                throw SpreadSheetDBError.create( SpreadSheetDBError.CODE.FAILED_TO_ESCAPE_QUERY_VALUE, '', '', 'query_value:' + value );
            };
        } else if( firstChar === "`" ){
            if( value.indexOf( '"' ) === -1 ){
                value = '"' + value + '"';
            } else if( value.indexOf( "'" ) === -1 ){
                value = "'" + value + "'";
            } else {
                throw SpreadSheetDBError.create( SpreadSheetDBError.CODE.FAILED_TO_ESCAPE_QUERY_VALUE, '', '', 'query_value:' + value );
            };
        } else if( 0 <= value.indexOf( '&&' ) || 0 <= value.indexOf( '+' ) || 0 <= value.indexOf( ',' ) ){
            value = '"' + value + '"';
        };
    };
    return value;
};
/**
 * https://developers.google.com/chart/interactive/docs/querylanguage?hl=ja
 *   Query Language リファレンス（バージョン 0.7）
 * 
 * @private
 * @param {string} sheetName
 * @param {string} query
 * @return {string}
 * @throws {SpreadSheetDBError} */
SpreadSheetDB.prototype._createQueryString = function( sheetName, query ){
    const parsedSelectors = this._parseSelector( query );
    const whereList = [];
    let where = '';

    while( parsedSelectors.length ){ // , で区切られた複数の選択条件を一つづつ検索する
        if( where ){
            whereList.push( where );
            where = '';
        };
        const parsedSelector = parsedSelectors.shift();
        let key      = /** @type {string} */ (parsedSelector.shift());
        let alphabet = keyToAlphabet( this, sheetName, key );
        let dataType = this._getColumnDefinitionFromKey( sheetName, key ).dataType;

        while( parsedSelector.length ){
            if( parsedSelector[ 0 ] === '+' ){
                parsedSelector.shift();
                where += ' and ';
                key      = /** @type {string} */ (parsedSelector.shift());
                alphabet = keyToAlphabet( this, sheetName, key );
                dataType = this._getColumnDefinitionFromKey( sheetName, key ).dataType;
            } else if( where ){
                where += ' and ';
            };
            const operator = parsedSelector.shift();
            let value = parsedSelector.shift();
            let num;
    
            switch( dataType ){
                case SpreadSheetDB.DataType.DATETIME :
                case SpreadSheetDB.DataType.INSERTED_AT :
                case SpreadSheetDB.DataType.UPDATED_AT :
                    value = Number.isFinite( value ) ? value : SpreadSheetDB._dateTimeStringToNumber( value, true );
                case SpreadSheetDB.DataType.DATE :
                    value = Number.isFinite( value ) ? value : SpreadSheetDB._dateStringToNumber( value, true );
                case SpreadSheetDB.DataType.TIME_OF_DAY :
                    value = Number.isFinite( value ) ? value : SpreadSheetDB._HHmmssLikeStringToNumber( value, true );
                case SpreadSheetDB.DataType.NUMBER :
                    num = /** @type {number} */ (value);
                    switch( operator ){
                        case SpreadSheetDB._Operators.EQUAL :
                            where += alphabet + '=' + num;
                            break;
                        case SpreadSheetDB._Operators.NOT_EQUAL :
                            where += alphabet + '!=' + num;
                            break;
                        case SpreadSheetDB._Operators.LESS_THAN_OR_EQUAL :
                            where += alphabet + '<=' + num;
                            break;
                        case SpreadSheetDB._Operators.LESS_THAN :
                            where += alphabet + '<' + num;
                            break;
                        case SpreadSheetDB._Operators.GREATER_THAN_OR_EQUAL :
                            where += alphabet + '>=' + num;
                            break;
                        case SpreadSheetDB._Operators.GREATER_THAN :
                            where += alphabet + '>' + num;
                            break;
                        default :
                            throw SpreadSheetDBError.create( SpreadSheetDBError.CODE.UNSUPPORTED_OPERATOR, sheetName, key, 'operator:' + operator );
                    };
                    break;
                case SpreadSheetDB.DataType.STRING :
                case SpreadSheetDB.DataType.UNIQUE_HASH :
                    let text = '' + value;
                    if( dataType === SpreadSheetDB.DataType.UNIQUE_HASH ){
                        text = SpreadSheetDB._normalizeHash( /** @type {string} */(text) );
                    };
                    text = escapeStringLiteral( text );
                    /**
                     * string のリテラルは、単一引用符または二重引用符で囲みます。例: "fourteen" 'hello world' "It's raining"
                     * https://developers.google.com/chart/interactive/docs/reference?hl=ja#literals
                     */
                    switch( operator ){
                        case SpreadSheetDB._Operators.EQUAL :
                            where += alphabet + '=' + text;
                            break;
                        case SpreadSheetDB._Operators.NOT_EQUAL :
                            where += alphabet + '!=' + text;
                            break;
                        case SpreadSheetDB._Operators.STARTS_WITH :
                            where += alphabet + ' starts with ' + text;
                            break;
                        case SpreadSheetDB._Operators.ENDS_WITH :
                            where += alphabet + ' ends with ' + text;
                            break;
                        case SpreadSheetDB._Operators.CONTAINS :
                            where += alphabet + ' contains ' + text;
                            break;
                        case SpreadSheetDB._Operators.NOT_CONTAINS :
                            where += 'not ' + alphabet + ' contains ' + text;
                            break;
                        default :
                            throw SpreadSheetDBError.create( SpreadSheetDBError.CODE.UNSUPPORTED_OPERATOR, sheetName, key, 'operator:' + operator );
                    };
                    break;
                case SpreadSheetDB.DataType.BOOLEAN :
                    let bool = value === 'true' ? 1 : value === 'false' ? 0 : -1;

                    if( bool === -1 ){
                        throw SpreadSheetDBError.create( SpreadSheetDBError.CODE.UNKNOWN_KEYWORD, sheetName, key, 'not boolen keyword:' + value );
                    };
                    switch( operator ){
                        case SpreadSheetDB._Operators.EQUAL :
                            where += alphabet + '=' + bool;
                            break;
                        case SpreadSheetDB._Operators.NOT_EQUAL :
                            where += alphabet + '!=' + bool;
                            break;
                        default :
                            throw SpreadSheetDBError.create( SpreadSheetDBError.CODE.UNSUPPORTED_OPERATOR, sheetName, key, 'operator:' + operator );
                    };
                    break;
                case SpreadSheetDB.DataType.JSON :
                    throw SpreadSheetDBError.create( SpreadSheetDBError.CODE.UNSUPPORTED_OPERATOR, sheetName, key, 'operator:' + operator );
                default :
                    throw SpreadSheetDBError.create( SpreadSheetDBError.CODE.UNKNOWN_DATA_TYPE, sheetName, key, 'dataType:' + dataType );
            };
        };
    };
    whereList.push( where );
    return whereList.join( ' or ' );

    function escapeStringLiteral( str ){
        if( /* 0 <= str.indexOf( '"' ) && */ 0 <= str.indexOf( "'" ) ){
            throw SpreadSheetDBError.create( SpreadSheetDBError.CODE.FAILED_TO_ESCAPE_QUERY_VALUE, sheetName, '', 'string_literal:' + str );
        };
        return "'" + str + "'"; // "WHERE で " を使っている為、' しか使えない?
    };

    function keyToAlphabet( db, sheetName, key ){
        const index = db._getColumnIndexFromKey( sheetName, key );

        return db._toLetterColumnIndex( index );
    };
};
/**
 * @private
 * @param {number} numeric_col_index 0~
 * @return {string} A~ZZZ */
SpreadSheetDB.prototype._toLetterColumnIndex = function( numeric_col_index ){
    // https://penult.hatenablog.com/entry/20110329/1301410546
    const A = 'A'.charCodeAt( 0 );
    const fromCharCode = String.fromCharCode;
    let n = numeric_col_index + 1;
    let s = '';

    while( 1 <= n ){
        --n;
        s = fromCharCode( A + ( n % 26 ) ) + s;
        n = n / 26 | 0;
    };
    return s;
};
if( goog.DEBUG ){
    /**
     * @private
     * @param {string} string_col_index 
     * @return {number} */
    SpreadSheetDB.prototype._toNumericColumnIndex = function( string_col_index ){
        // https://penult.hatenablog.com/entry/20110329/1301410546
        const RADIX = 26;
        const A = 'A'.charCodeAt( 0 );
        const s = string_col_index.toUpperCase();
        let n = 0;
        for( let i = 0, len = s.length; i < len; ++i ){
            n = ( n * RADIX ) + ( s.charCodeAt ( i ) - A + 1 );
        };
        return n;
    };
};
/**
 * @private
 * @param {string} sheetName
 * @param {number} actionType
 * @param {!Record} newRecord
 * @param {!Record|undefined} oldRecordOrVoid
 * @param {boolean} isAdmin
 * @return {!Array.<string|number|boolean>}
 * @throws {SpreadSheetDBError} */
SpreadSheetDB.prototype._objectToValueArray = function( sheetName, actionType, newRecord, oldRecordOrVoid, isAdmin ){
    const db = this;
    const sheetDefinition = this._getSheetDefinition( sheetName );
    const columnDefinitions = sheetDefinition.columns;
    const isInsert = actionType === SpreadSheetDB.ActionType.INSERT;
    const isUpdate = actionType === SpreadSheetDB.ActionType.UPDATE;
    const newValues = [];
    const oldRecord = oldRecordOrVoid || newRecord;

    for( let i = SpreadSheetDB.DATA_ROW_START, l = columnDefinitions.length; i < l; ++i ){
        const columnDefinition = columnDefinitions[ i ];
        const key = columnDefinition.key;
        const oldValue = oldRecord[ key ];
        let newValue = newRecord[ key ];
        let newRecordValue = newValue;
        if( newValue == null ){
            newValue = newRecordValue = oldValue;
        };

        switch( columnDefinition.dataType ){
            case SpreadSheetDB.DataType.UNIQUE_HASH :
                if( isInsert ){
                    newValue = newRecordValue = this._generateUniqueString( sheetName, key );
                } else if( newValue !== oldValue ){
                    throw SpreadSheetDBError.create( SpreadSheetDBError.CODE.COLUMN_IS_FREEDZED, sheetName, key );
                };
                break;
            case SpreadSheetDB.DataType.INSERTED_AT :
                if( isInsert ){
                    newValue = newRecordValue = Date.now();
                } else if( SpreadSheetDB._dateTimeStringToNumber( newValue, false ) !== SpreadSheetDB._dateTimeStringToNumber( oldValue, false ) ){
                    throw SpreadSheetDBError.create( SpreadSheetDBError.CODE.COLUMN_IS_FREEDZED, sheetName, key );
                };
                break;
            case SpreadSheetDB.DataType.UPDATED_AT :
                if( isInsert || isUpdate ){
                    newValue = newRecordValue = Date.now();
                };
                break;
            case SpreadSheetDB.DataType.NUMBER :
                newValue = newRecordValue = getValue( columnDefinition, Number.isFinite, newValue, oldValue, columnDefinition.defaultValue );
                break;
            case SpreadSheetDB.DataType.STRING :
                newValue = newRecordValue = getValue( columnDefinition, function( v ){ return v === '' + v; }, newValue, oldValue, columnDefinition.defaultValue );
                break;
            case SpreadSheetDB.DataType.DATETIME :
                newValue = newRecordValue = getValue(
                    columnDefinition, null,
                    SpreadSheetDB._dateTimeStringToNumber( newValue, false ),
                    SpreadSheetDB._dateTimeStringToNumber( oldValue, false ),
                    SpreadSheetDB._dateTimeStringToNumber( columnDefinition.defaultValue, false )
                );
                break;
            case SpreadSheetDB.DataType.DATE :
                newValue = newRecordValue = getValue(
                    columnDefinition, null,
                    SpreadSheetDB._dateStringToNumber( newValue, false ),
                    SpreadSheetDB._dateStringToNumber( oldValue, false ),
                    SpreadSheetDB._dateStringToNumber( columnDefinition.defaultValue, false )
                );
                break;
            case SpreadSheetDB.DataType.TIME_OF_DAY :
                // 12:59, 12:59:00, 12:59:59.001
                // https://jex.im/regulex/#!flags=&re=%5E(%5B01%5D%3F%5B0-9%5D%7C2%5B0-3%5D)%3A%5B0-5%5D%3F%5B0-9%5D(%3A%5B0-5%5D%3F%5B0-9%5D(%5C.%5B0-9%5D%7B1%2C3%7D)%3F)%3F%24
                newValue = newRecordValue = getValue(
                    columnDefinition, null,
                    SpreadSheetDB._HHmmssLikeStringToNumber( newValue, false ),
                    SpreadSheetDB._HHmmssLikeStringToNumber( oldValue, false ),
                    SpreadSheetDB._HHmmssLikeStringToNumber( columnDefinition.defaultValue, false )
                );
                break;
            case SpreadSheetDB.DataType.BOOLEAN :
                newValue = getValue( columnDefinition, function( v ){ return v === !!v; }, newValue, !!oldValue, columnDefinition.defaultValue )
                             ? 1 : 0;
                newRecordValue = !!newValue;
                break;
            case SpreadSheetDB.DataType.JSON :
                if( newValue === oldValue ){
                    var _oldValue = newValue = newRecordValue = JSON.stringify( newValue );
                } else {
                    // TODO deepEqual
                    _oldValue = JSON.stringify( oldValue );
                    newValue  = JSON.stringify( newValue );
                };
                newValue = getValue( columnDefinition, null, newValue, _oldValue, columnDefinition.defaultValue );
                newRecordValue = JSON.parse( newValue );
                break;
        };
        newValues[ i - SpreadSheetDB.DATA_ROW_START ] = newValue;
        if( !columnDefinition.adminOnly || isAdmin ){
            newRecord[ key ] = newRecordValue;
        };
    };
    return newValues;

    function getValue( columnDefinition, testType, newValue, oldValue, defaultValue ){
        function isNullOrNaN( v ){
            return v == null || v !== v;
        };

        if( isNullOrNaN( newValue ) && isInsert ){
            if( !isNullOrNaN( defaultValue ) ){
                newValue = defaultValue;
            } else {
                throw SpreadSheetDBError.create( SpreadSheetDBError.CODE.EMPTY_VALUE, sheetName, columnDefinition.key );
            };
        };
        if( testType && !testType( newValue ) ){
            throw SpreadSheetDBError.create( SpreadSheetDBError.CODE.INVALID_VALUE, sheetName, columnDefinition.key, 'value:' + newValue );
        };
        if( isUpdate && columnDefinition.freeze ){
            if( newValue !== oldValue ){
                throw SpreadSheetDBError.create( SpreadSheetDBError.CODE.COLUMN_IS_FREEDZED, sheetName, columnDefinition.key );
            };
        };
        if( isInsert || isUpdate && ( newValue !== oldValue ) ){
            if( columnDefinition.unique ){
                if( db._getRecordsOrIndexes( sheetName, columnDefinition.key + '==' + SpreadSheetDB._escapeSelectorValue( newValue ), true, false, true ).length ){
                    throw SpreadSheetDBError.create( SpreadSheetDBError.CODE.NOT_UNIQUE_VALUE, sheetName, columnDefinition.key, 'value:' + newValue );
                };
            };
        };
        return newValue;
    };
};
/**
 * スプレッドシートから QUERY でレコードを取得する, query='' の場合、全てのレコードを取得する
 * @private
 * @param {string} sheetName
 * @param {string} query
 * @param {boolean} onlyIndex
 * @param {boolean} myRowIndexRequired
 * @param {boolean} isAdmin
 * @param {number=} opt_startIndex
 * @param {number=} opt_maxRecords
 * @return {!Records|!Array.<number>} */
SpreadSheetDB.prototype._getRecordsOrIndexes = function( sheetName, query, onlyIndex, myRowIndexRequired, isAdmin, opt_startIndex, opt_maxRecords ){
    if( goog.DEBUG ){
        if(opt_startIndex < 0 || opt_maxRecords <= 0 ){
            throw SpreadSheetDBError.create( SpreadSheetDBError.CODE.BAD_ARGUMENT, sheetName, '', 'startIndex=' + opt_startIndex + ',maxRecords=' + opt_maxRecords );
        };
    };

    const recoreds   = [];
    const sheet      = this._getSheet( sheetName );
    const startIndex = opt_startIndex || 0;
    const maxRecords = opt_maxRecords || Infinity;
    let numDataRows  = sheet.getLastRow() - SpreadSheetDB.DATA_ROW_START;

    if( startIndex < numDataRows ){
        const sheetDefinition   = this._getSheetDefinition( sheetName );
        const columnDefinitions = sheetDefinition.columns;
    
        let targetSheet, queryCell;
    
        if( query ){
            const ZZZ   = this._toLetterColumnIndex( columnDefinitions.length - 1 );
            targetSheet = this._getSheet( SpreadSheetDB.HIDDEN_QUERY_SHEET_NAME );
            queryCell   = targetSheet.getRange( 1, 1 );
    
            queryCell.setValue( "=QUERY('" + sheetName + "'!A:" + ZZZ + ',"WHERE ' + this._createQueryString( sheetName, query ) + '")' ); // TODO " ' のエスケープ
            numDataRows = targetSheet.getLastRow() - SpreadSheetDB.DATA_ROW_START;
        } else {
            // クエリが無い場合、データシートをそのまま使用
            targetSheet = sheet;
        };
    
        if( startIndex < numDataRows ){
            const endRow = Math.min( numDataRows - startIndex, maxRecords );
            if( onlyIndex ){
                const results = targetSheet.getRange( startIndex + 2, 1, endRow, 1 ).getValues();
    
                for( let i = 0, l = results.length; i < l; ++i ){
                    recoreds.push( results[ i ][ 0 ] );
                };
                recoreds.sort( function( a, b ){ return a - b; } );
            } else {
                const results = targetSheet.getRange( startIndex + 2, 1, endRow, columnDefinitions.length ).getValues();
        
                for( let i = 0, l = results.length; i < l; ++i ){
                    const values = results[ i ];
                    const recored = {};
            
                    for( let j = 0, l = columnDefinitions.length; j < l; ++j ){
                        const columnDefinition = columnDefinitions[ j ];
                        if( !columnDefinition.adminOnly || isAdmin ){
                            const key = columnDefinition.key;
                            let value = values[ j ];
                            switch( columnDefinition.dataType ){
                                case SpreadSheetDB.DataType.INDEX :
                                    if( !myRowIndexRequired && key !== SpreadSheetDB.DEFAULT_INDEX_KEY ){
                                        continue;
                                    };
                                case SpreadSheetDB.DataType.NUMBER :
                                    value = Number( value ) || 0;
                                    break;
                                case SpreadSheetDB.DataType.BOOLEAN :
                                    value = !!Number( value );
                                    break;
                                case SpreadSheetDB.DataType.STRING :
                                case SpreadSheetDB.DataType.UNIQUE_HASH :
                                    value = '' + ( value || '' );
                                    break;
                                case SpreadSheetDB.DataType.JSON :
                                    value = JSON.parse( '' + value ); // TODO parse error
                                    break;
                                case SpreadSheetDB.DataType.DATE :
                                    value = Number( value ) || 0;
                                    value = SpreadSheetDB._toDateString( /** @type {number} */ (value) );
                                    break;
                                case SpreadSheetDB.DataType.DATETIME :
                                case SpreadSheetDB.DataType.INSERTED_AT :
                                case SpreadSheetDB.DataType.UPDATED_AT :
                                    value = Number( value ) || 0;
                                    value = SpreadSheetDB.toDateTimeString( /** @type {number} */ (value) );
                                    break;
                                case SpreadSheetDB.DataType.TIME_OF_DAY :
                                    value = Number( value ) || 0;
                                    value = SpreadSheetDB._toHHmmssString( /** @type {number} */ (value) );
                                    break;
                            };
                            recored[ key ] = value;
                        };
                    };
                    recoreds.push( recored );
                };
            };
        };
        // total が設定されていて最後に到達していない場合、クエリを残して次回の検索を速くする
        if( !goog.DEBUG && queryCell && ( startIndex + recoreds.length === numDataRows ) ){
            queryCell.setValue( '' );
        };
    };
    return recoreds;
};
/**
 * @private
 * @param {string} sheetName
 * @param {!Record} record
 * @param {boolean} onlyIndex
 * @param {boolean} myRowIndexRequired
 * @return {!Records|!Array.<number>|undefined} */
SpreadSheetDB.prototype._getOneRecordByUniqueKey = function( sheetName, record, onlyIndex, myRowIndexRequired ){
    const uniqueKey = this._getUniqueKey( sheetName );

    if( uniqueKey ){
        const columnDefinition = this._getColumnDefinitionFromKey( sheetName, uniqueKey );
        let uniqueValue = record[ uniqueKey ];
        uniqueValue = columnDefinition.dataType === SpreadSheetDB.DataType.UNIQUE_HASH ? SpreadSheetDB._normalizeHash( uniqueValue ) : uniqueValue;
        return this._getRecordsOrIndexes( sheetName, uniqueKey + '==' + SpreadSheetDB._escapeSelectorValue( uniqueValue ), onlyIndex, myRowIndexRequired, true );
    };
};
/**
 * @private
 * @param {string} sheetName */
SpreadSheetDB.prototype._sortSheet = function( sheetName ){
    const sheetDefinition = this._getSheetDefinition( sheetName );

    if( sheetDefinition.sortKey && 1 < this.getTotalRecords( sheetName ) ){
        const sheet = this._getSheet( sheetName );

        // 後の処理で filter.remove() に到達しなかった場合、ここで filter を削除する
        const filter = sheet.getFilter();
        filter && filter.remove();

        sheet.getDataRange()
                .createFilter()
                    .sort( this._getColumnIndexFromKey( sheetName, sheetDefinition.sortKey ) + 1, !!sheetDefinition.ascending )
                    .remove(); // remove filter
    };
};
/**
 * @private
 * dispatch 中に on した場合、次回以降で呼ばれます
 * dispatch 中に off した場合、まだ呼ばれていないリスナは呼ばれません。
 * @param {string} sheetName 
 * @param {number} actionType 
 * @param {!Records|!Record=} opt_record  */
SpreadSheetDB.prototype._dispatch = function( sheetName, actionType, opt_record ){
    const prefixedSheetName = SpreadSheetDB.PREFIX + sheetName;
    const listeners = this._listeners[ prefixedSheetName ];

    if( listeners ){
        const event = { sheetName : sheetName, actionType : actionType, db : this };
        if( Array.isArray( opt_record ) ){
            event.records = opt_record;
        } else if( opt_record ){
            event.record = opt_record;
        };
        const l = listeners.length;

        if( 0 < listeners._dispatchDepth ){
            ++listeners._dispatchDepth;
        } else {
            listeners._dispatchDepth = 1; // _dispatch 中に _dispatch が呼ばれた場合に対処
        };
        for( let i = 0; i < l; ++i ){
            const listener = listeners[ i ];
            if( !listener._off && ( listener.actionType & actionType ) ){
                if( listener.callback.call( listener.thisContext || this, event ) === true ){
                    listener._off = true;
                };
            };
        };
        --listeners._dispatchDepth;
        if( listeners._dispatchDepth === 0 ){
            delete listeners._dispatchDepth;
            for( let i = l; i; ){
                const listener = listeners[ --i ];
                if( listener._off ){
                    listeners.splice( i, 1 );
                };
            };
        };
    };
};

if( goog.DEBUG ){
    if( typeof exports === 'object' ){
        module.exports = SpreadSheetDB;
    };
};

export {SpreadSheetDB as default, ColumnDefinition, SheetDefinition, SheetDefinitionList, SpreadSheetDBEvent, SpreadSheetDBCallback}
