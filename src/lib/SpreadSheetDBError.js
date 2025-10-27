import {Record} from './record.js'

class SpreadSheetDBError extends Error {
    /** @param {string} message */
    constructor( message ){
        super( message );

        this.name = 'SpreadSheetDBError';
        /** @type {number} */
        this.code = 0;
        /** @type {string} */
        this.spreadSheetID = '';
        /** @type {string} */
        this.sheetName = '';
        /** @type {string} */
        this.columnKey = '';
        /** @type {string} */
        this.selector = '';
        /** @type {string|!Record} */
        this.detail = '';
    };
};

/** @enum {number} */
SpreadSheetDBError.CODE = {
    UNKNOWN_ERROR                : -1,
    SHEETS_NOT_FOUND             :  1,
    SHEET_DEFINITION_NOT_FOUND   :  2,
    COLUMN_DEFINITION_NOT_FOUND  :  3,
    FAILED_TO_PARSE_SELECTOR     :  4,
    UNSUPPORTED_OPERATOR         :  5,
    UNKNOWN_DATA_TYPE            :  6,
    UNKNOWN_KEYWORD              :  7,
    COLUMN_IS_FREEDZED           :  8,
    EMPTY_VALUE                  :  9,
    INVALID_VALUE                : 10,
    NOT_UNIQUE_VALUE             : 11,
    INSERT_OPERATION_BLOCKED     : 12,
    UPDATE_OPERATION_BLOCKED     : 13,
    DELETE_OPERATION_BLOCKED     : 14,
    NO_UNIQUE_COLUMN             : 15,
    BAD_QYERY_OR_RECORD          : 16,
    TARGET_RECORD_NOT_FOUND      : 17,
    FAILED_TO_ESCAPE_QUERY_VALUE : 18,
    BAD_ARGUMENT                 : 19,
    __LAST__                     : 19
};

/**
 * 
 * @param {number} code 
 * @param {string=} opt_sheetName 
 * @param {string=} opt_columnKey
 * @param {string|!Record=} opt_textOrRecord 
 * @return {SpreadSheetDBError} */
SpreadSheetDBError.create = function( code, opt_sheetName, opt_columnKey, opt_textOrRecord ){
    let error;

    switch( code ){
        case SpreadSheetDBError.CODE.SHEETS_NOT_FOUND :
            error = new SpreadSheetDBError( 'SHEETS_NOT_FOUND' );
            error.spreadSheetID = /** @type {string} */ (opt_textOrRecord);
            break;
        case SpreadSheetDBError.CODE.SHEET_DEFINITION_NOT_FOUND :
            error = new SpreadSheetDBError( 'SHEET_DEFINITION_NOT_FOUND' );
            error.sheetName = /** @type {string} */ (opt_sheetName);
            break;
        case SpreadSheetDBError.CODE.COLUMN_DEFINITION_NOT_FOUND :
            error = new SpreadSheetDBError( 'COLUMN_DEFINITION_NOT_FOUND' );
            error.sheetName = /** @type {string} */ (opt_sheetName);
            error.columnKey = /** @type {string} */ (opt_columnKey);
            break;
        case SpreadSheetDBError.CODE.FAILED_TO_PARSE_SELECTOR :
            error = new SpreadSheetDBError( 'FAILED_TO_PARSE_SELECTOR' );
            error.detail = /** @type {string} */ (opt_textOrRecord);
            break;
        case SpreadSheetDBError.CODE.UNSUPPORTED_OPERATOR :
            error = new SpreadSheetDBError( 'UNSUPPORTED_OPERATOR' );
            error.sheetName = /** @type {string} */ (opt_sheetName);
            error.columnKey = /** @type {string} */ (opt_columnKey);
            error.detail    = /** @type {string} */ (opt_textOrRecord);
            break;
        case SpreadSheetDBError.CODE.UNKNOWN_DATA_TYPE :
            error = new SpreadSheetDBError( 'UNKNOWN_DATA_TYPE' );
            error.sheetName = /** @type {string} */ (opt_sheetName);
            error.columnKey = /** @type {string} */ (opt_columnKey);
            error.detail    = /** @type {string} */ (opt_textOrRecord);
            break;
        case SpreadSheetDBError.CODE.UNKNOWN_KEYWORD :
            error = new SpreadSheetDBError( 'UNKNOWN_KEYWORD' );
            error.sheetName = /** @type {string} */ (opt_sheetName);
            error.columnKey = /** @type {string} */ (opt_columnKey);
            error.detail    = /** @type {string} */ (opt_textOrRecord);
            break;
        case SpreadSheetDBError.CODE.COLUMN_IS_FREEDZED :
            error = new SpreadSheetDBError( 'COLUMN_IS_FREEDZED' );
            error.sheetName = /** @type {string} */ (opt_sheetName);
            error.columnKey = /** @type {string} */ (opt_columnKey);
            break;
        case SpreadSheetDBError.CODE.EMPTY_VALUE :
            error = new SpreadSheetDBError( 'EMPTY_VALUE' );
            error.sheetName = /** @type {string} */ (opt_sheetName);
            error.columnKey = /** @type {string} */ (opt_columnKey);
            break;
        case SpreadSheetDBError.CODE.INVALID_VALUE :
            error = new SpreadSheetDBError( 'INVALID_VALUE' );
            error.sheetName = /** @type {string} */ (opt_sheetName);
            error.columnKey = /** @type {string} */ (opt_columnKey);
            error.detail    = /** @type {string} */ (opt_textOrRecord);
            break;
        case SpreadSheetDBError.CODE.NOT_UNIQUE_VALUE :
            error = new SpreadSheetDBError( 'NOT_UNIQUE_VALUE' );
            error.sheetName = /** @type {string} */ (opt_sheetName);
            error.columnKey = /** @type {string} */ (opt_columnKey);
            error.detail    = /** @type {string} */ (opt_textOrRecord);
            break;
        case SpreadSheetDBError.CODE.INSERT_OPERATION_BLOCKED :
            error = new SpreadSheetDBError( 'INSERT_OPERATION_BLOCKED' );
            error.sheetName = /** @type {string} */ (opt_sheetName);
            break;
        case SpreadSheetDBError.CODE.UPDATE_OPERATION_BLOCKED :
            error = new SpreadSheetDBError( 'UPDATE_OPERATION_BLOCKED' );
            error.sheetName = /** @type {string} */ (opt_sheetName);
            break;
        case SpreadSheetDBError.CODE.DELETE_OPERATION_BLOCKED :
            error = new SpreadSheetDBError( 'DELETE_OPERATION_BLOCKED' );
            error.sheetName = /** @type {string} */ (opt_sheetName);
            break;
        case SpreadSheetDBError.CODE.NO_UNIQUE_COLUMN :
            error = new SpreadSheetDBError( 'NO_UNIQUE_COLUMN' );
            error.sheetName = /** @type {string} */ (opt_sheetName);
            break;
        case SpreadSheetDBError.CODE.BAD_QYERY_OR_RECORD :
            error = new SpreadSheetDBError( 'BAD_QYERY_OR_RECORD' );
            error.sheetName = /** @type {string}         */ (opt_sheetName);
            error.detail    = /** @type {string|!Record} */ (opt_textOrRecord);
            break;
        case SpreadSheetDBError.CODE.TARGET_RECORD_NOT_FOUND :
            error = new SpreadSheetDBError( 'TARGET_RECORD_NOT_FOUND' );
            error.sheetName = /** @type {string}         */ (opt_sheetName);
            error.detail    = /** @type {string|!Record} */ (opt_textOrRecord);
            break;
        case SpreadSheetDBError.CODE.FAILED_TO_ESCAPE_QUERY_VALUE :
            error = new SpreadSheetDBError( 'FAILED_TO_ESCAPE_QUERY_VALUE' );
            error.detail = /** @type {string|!Record} */ (opt_textOrRecord);
            break;
        case SpreadSheetDBError.CODE.BAD_ARGUMENT :
            error = new SpreadSheetDBError( 'BAD_ARGUMENT' );
            error.sheetName = /** @type {string}      */ (opt_sheetName);
            error.detail = /** @type {string|!Record} */ (opt_textOrRecord);
            break;
        default : 
            error = new SpreadSheetDBError( 'UNKNOWN_ERROR' );
            error.sheetName = /** @type {string}         */ (opt_sheetName) || '';
            error.columnKey = /** @type {string}         */ (opt_columnKey) || '';
            error.detail    = /** @type {string|!Record} */ (opt_textOrRecord) || '';
            code = SpreadSheetDBError.CODE.UNKNOWN_ERROR;
            break;
    };
    error.code = code;
    return error;
};

export {SpreadSheetDBError as default}
