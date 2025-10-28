import SpreadSheetDB from '../lib/SpreadSheetDB.js';
import SheetNames from '../common/sheetNames.js';
import {default as scriptProperties, LATEST_UPDATED} from './scriptProperties.js';

/** @type {SpreadSheetDB} */
const db = new SpreadSheetDB(
    goog.SPREAD_SHEETS_ID,
    [
        {
            sheetName : SheetNames.Todos,
            sortKey   : 'createdAt',
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
                    key          : 'completed',
                    label        : '✓',
                    dataType     : SpreadSheetDB.DataType.BOOLEAN,
                    defaultValue : false,
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
            delete    : false,
            update    : false,
            columns   : [
                {
                    key      : 'createdAt',
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
        function toLogRecord( record ){
            return {
                'event_type'  : 1,
                'description' : record[ 'label' ] + ' の削除',
                'json'        : record
            };
        };

        if( event.records ){
            const logRecords = [];
            for( let i = 0, l = event.records.length; i < l; ++i ){
                logRecords.push( toLogRecord( event.records[ i ] ) );
            };
            db.insert(
                SheetNames.EventLog,
                logRecords,
                true
            );
        } else if( event.record ){
            db.insert(
                SheetNames.EventLog,
                toLogRecord( event.record ),
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
