// import type { Parameter } from 'google.script.client-side';

import type { Todo, TodoDiff } from "../types/todo";

export type Parameter = {
    sheetIndex: number,
    startIndex?: number,
    maxRecords?: number,
    record?: any,
    query?: string,
    diff?: TodoDiff
};

export type Response = {
    action: number,
    time: number,
    errorCode?: number,
    records?: any[],
    inserted?: any,
    updated?: boolean,
    deleted? : boolean
};

export function run(
        action  : number,
        param   : Parameter | null,
        callback: (error:number, result?:Response) => void
) {
    google.script.run.withSuccessHandler(
        (result: Response) => {
            const errorCode = result.errorCode;

            if (errorCode) {
                callback(errorCode);
            } else {
                callback(0, result);
            };
        }
    ).admin(action, param);
};

export type Request = {action:string, param?: Object};

export function serial(
        requestList    : Request[],
        callback       : (error:number, result?:Response[]) => void,
        opt_resultList?: Response[]
) {
    const request    = requestList.shift();
    const resultList = opt_resultList || [];

    run(
        // @ts-ignore
        request.action, request.param,
        (errorCode, result) => {
            if (errorCode) {
                callback(errorCode);
            } else {
                resultList.push(result as Response);
                if (requestList.length) {
                    serial(requestList, callback, resultList); // repeat
                } else {
                    callback(0, resultList);
                };
            };
        }
    );
};