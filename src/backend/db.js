import SpreadSheetDB from '../lib/SpreadSheetDB.js';
import SheetNames from '../common/sheetNames.js';
import {default as scriptProperties, LATEST_UPDATED} from './scriptProperties.js';

/** @type {SpreadSheetDB} */
const db = new SpreadSheetDB(
    goog.SPREAD_SHEETS_ID,
    [
        {
            sheetName : SheetNames.Todos,
            sortKey   : 'created',
            ascending : true,
            columns   : [
                {
                    key      : 'id',
                    label    : 'id',
                    dataType : SpreadSheetDB.DataType.UNIQUE_HASH
                },
                {
                    key      : 'label',
                    label    : 'ラベル',
                    dataType : SpreadSheetDB.DataType.STRING
                },
                {
                    key      : 'completed',
                    label    : '✓',
                    dataType : SpreadSheetDB.DataType.BOOLEAN
                },
                {
                    key      : 'createdAt',
                    label    : '作成日時',
                    dataType : SpreadSheetDB.DataType.INSERTED_AT
                },
                {
                    key      : 'updatedAt',
                    label    : '更新日時',
                    dataType : SpreadSheetDB.DataType.UPDATED_AT
                }
            ]
        },
        {
            sheetName : SheetNames.EventLog,
            sortKey   : 'created',
            delete    : false,
            update    : false,
            columns   : [
                {
                    key      : 'created',
                    label    : '作成日時',
                    dataType : SpreadSheetDB.DataType.INSERTED_AT
                },
                {
                    key      : 'event_type',
                    label    : 'イベント種別',
                    dataType : SpreadSheetDB.DataType.NUMBER
                },
                {
                    key      : 'description',
                    label    : '概要',
                    dataType : SpreadSheetDB.DataType.STRING
                },
                {
                    key      : 'json',
                    label    : 'JSONデータ',
                    dataType : SpreadSheetDB.DataType.JSON,
                    adminOnly : true
                }
            ]
        }
    ]
);

db.listen(
    SheetNames.Todos,
    SpreadSheetDB.ActionType.DELETE,
    function( event ){
        if( event.records ){
            for( let i = 0, l = event.records.length; i < l; ++i ){
                log( event.records[ i ] ); // TODO use .insert(records)
            };
        } else if( event.record ){
            log( event.record );
        };

        function log( record ){
            db.insert(
                SheetNames.EventLog,
                {
                    'event_type'  : 1,
                    'description' : record[ 'label' ] + ' の削除',
                    'json'        : JSON.stringify( record )
                },
                true
            );
        };
    }
);

db.listen(
    SheetNames.Todos,
    SpreadSheetDB.ActionType.INSERT | SpreadSheetDB.ActionType.UPDATE | SpreadSheetDB.ActionType.DELETE,
    function( event ){
        scriptProperties.setProperty( LATEST_UPDATED, SpreadSheetDB.toDateTimeString( Date.now() ) ) // 最終更新時間
    }
);

export {db as default}
