import SpreadSheetDBError from '../lib/SpreadSheetDBError.js'

/** @enum {number} */
const EnumTodoDBError = {
    FAIL_TO_PARSE_JSON : SpreadSheetDBError.CODE.__LAST__ + 1,
    UNKNOWN_ACTION     : SpreadSheetDBError.CODE.__LAST__ + 2,
    BUSY               : SpreadSheetDBError.CODE.__LAST__ + 3
};

export {EnumTodoDBError as default}
