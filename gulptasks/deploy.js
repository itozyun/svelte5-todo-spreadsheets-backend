import {config} from 'dotenv';
import {series} from 'gulp';
import {exec} from 'child_process';

config();

const deployID = process.env.APPS_SCRIPT_DEPLOY_ID;

if (!deployID) {
    // throw '.env APPS_SCRIPT_DEPLOY_ID= is undefined!';
};

export default series(
    function push(cb){
        exec(
            'clasp push',
            (err, stdout, stderr) => {
                err && console.log(err);
                console.log(stdout);
                err || cb();
            }
        );
    },
    function deploy(cb){
        exec(
            'clasp deploy' + ( deployID ? ' -i ' + deployID : '' ),
            (err, stdout, stderr) => {
                err && console.log(err);
                console.log(stdout);
                err || cb();
            }
        );
    }
);
