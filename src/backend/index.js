import db from './db.js';
import {default as scriptProperties, LATEST_UPDATED} from './scriptProperties.js';
import Actions from '../common/actions.js';
import SpreadSheetDBError from '../lib/SpreadSheetDBError.js';
import TodoDBError from '../common/todoDBError.js';

const TIMEOUT_IN_MILLIS = 2000;

__do_get__ = function( e ){
    const templete = HtmlService.createTemplateFromFile( 'dashboard.html' );

    return templete.evaluate()
                   .setTitle( '管理' )
                   .addMetaTag( 'viewport', 'width=device-width,initial-scale=1' );
};

__do_post__ = function( e ){
    try {
        var start     = Date.now();
        var parameter = /** @type {!Object} */ (JSON.parse( e.postData.contents ) || {});
    } catch( O_o ) {
        return ContentService.createTextOutput( JSON.stringify( { 'errorCode' : TodoDBError.FAIL_TO_PARSE_JSON, 'time' : Date.now() - start } ) ).setMimeType( ContentService.MimeType.JSON );
    };
    return ContentService.createTextOutput( JSON.stringify( accessToDB( start, parameter[ 'action' ], parameter, false ) ) ).setMimeType( ContentService.MimeType.JSON );
};

/**
 * @param {number} action 
 * @param {!Object|null=} opt_parameter 
 * @return {!Object} JSON
 */
__admin__ = function( action, opt_parameter ){
    function createJSONOutput( json ){
        json[ 'action' ] = action;
        json[ 'time'   ] = Date.now() - start;

        return json;
    };
    var start = Date.now();

    switch( action ){
        case Actions.latestUpdate :
            return scriptProperties.getProperty( LATEST_UPDATED );
        case Actions.totalRecords :
            var lock = LockService.getScriptLock();

            if( lock.tryLock( TIMEOUT_IN_MILLIS ) ){ // lock
                let totalRecords = 0;
                for( let sheetIndex = 0, l = db.getTotalSheets(); sheetIndex < l; ++sheetIndex ){
                    totalRecords += db.getTotalRecords( db.getSheetName( sheetIndex ) );
                };
                lock.releaseLock(); // release lock
                return createJSONOutput( { 'totalRecords' : totalRecords } );
            };
            return createJSONOutput( { 'errorCode' : TodoDBError.BUSY } );
        case Actions.totalCells :
            lock = LockService.getScriptLock();

            if( lock.tryLock( TIMEOUT_IN_MILLIS ) ){ // lock
                let totalCells = 0;
                for( let sheetIndex = 0, l = db.getTotalSheets(); sheetIndex < l; ++sheetIndex ){
                    totalCells += db.getTotalCells( db.getSheetName( sheetIndex ) );
                };
                lock.releaseLock(); // release lock
                return createJSONOutput( { 'totalCells' : totalCells } );
            };
            return createJSONOutput( { 'errorCode' : TodoDBError.BUSY } );
    };

    var parameter = opt_parameter || {};  // /** @type {!Object} */ (JSON.parse( opt_parameter ) || {});

    return accessToDB( start, action, parameter, true );
};

/**
 * @private
 * @param {number} start 
 * @param {number} action 
 * @param {!Object} parameter 
 * @param {boolean} isAdmin
 * @return {!Object} JSON */
function accessToDB( start, action, parameter, isAdmin ){
    function createJSONOutput( json ){
        json[ 'action' ] = action;
        json[ 'time'   ] = Date.now() - start;

        return json;
    };

    const sheetIndex = parameter[ 'sheetIndex' ] || 0;
    const sheetName  = db.getSheetName( sheetIndex );
    const query      = parameter[ 'query' ];
    const record     = parameter[ 'record' ];
    const diff       = parameter[ 'diff' ];
    const lock       = LockService.getScriptLock();

    if( lock.tryLock( TIMEOUT_IN_MILLIS ) ){ // lock
        switch( action ){
            case Actions.get :
                try {
                    var rcords = db.get( sheetName, query || '', isAdmin, parameter[ 'startIndex' ] || 0, parameter[ 'maxRecords' ] || Infinity );
                } catch( O_o ) {
                    lock.releaseLock(); // release lock
                    return createJSONOutput( { 'errorCode' : /** @type {SpreadSheetDBError} */ (O_o).code || /** @type {SpreadSheetDBError} */ (O_o).message } );
                };
                lock.releaseLock(); // release lock
                return createJSONOutput( { 'records' : rcords } );
            case Actions.insert :
                try {
                    var newRecords = db.insert( sheetName, record, isAdmin );
                } catch( O_o ) {
                    lock.releaseLock();
                    return createJSONOutput( { 'errorCode' : /** @type {SpreadSheetDBError} */ (O_o).code || /** @type {SpreadSheetDBError} */ (O_o).message } );
                };
                lock.releaseLock();
                return createJSONOutput( { 'inserted' : newRecords } );
            case Actions.update :
                try {
                    var bool = db.update( sheetName, query || record, diff, true );
                } catch( O_o ) {
                    lock.releaseLock();
                    return createJSONOutput( { 'errorCode' : /** @type {SpreadSheetDBError} */ (O_o).code || /** @type {SpreadSheetDBError} */ (O_o).message } );
                };
                lock.releaseLock();
                return createJSONOutput( { 'updated' : bool } );
            case Actions.delete :
                try {
                    var bool = db.delete( sheetName, query || record, true );
                } catch( O_o ) {
                    lock.releaseLock();
                    return createJSONOutput( { 'errorCode' : /** @type {SpreadSheetDBError} */ (O_o).code || /** @type {SpreadSheetDBError} */ (O_o).message } );
                };
                lock.releaseLock();
                return createJSONOutput( { 'deleted' : bool } );
            default :
                lock.releaseLock();
                return createJSONOutput( { 'errorCode' : TodoDBError.UNKNOWN_ACTION } );
        };
    };
    return createJSONOutput( { 'errorCode' : TodoDBError.BUSY } );
};
