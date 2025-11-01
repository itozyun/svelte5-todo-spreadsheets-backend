import {config} from 'dotenv';
import {src, dest, series} from 'gulp';
import {exec} from 'child_process';
import {gulp as ClosureCompiler} from 'google-closure-compiler';
import PluginError from 'plugin-error';
import {obj as through2} from 'through2';
import Vinyl from 'vinyl';

config();

const isDebug    = process.env.DEBUG  === 'true';
const isPrettify = process.env.PRETTY === 'true';
let js;

export default series(
    function getDeployVersion(cb){
        if(process.env.APPS_SCRIPT_DEPLOY_ID){
            exec(
                'clasp versions',
                (err, stdout, stderr) => {
                    err && console.log(err);
                    if(!err){
                        const versions = stdout.split('\n');
                        let version;
                        while(versions.length){
                            version = parseFloat(versions.pop());
                            if(version){
                                process.env.VITE_DEPLOY_VERSION = version + 1;
                                cb();
                                return;
                            };
                        };
                    };
                }
            );
        } else {
            process.env.VITE_DEPLOY_VERSION = 1;
        };
    },
    function prebuild(cb){
        exec(
            'npm run prebuild',
            (err, stdout, stderr) => {
                err && console.log(err);
                console.log(stdout);
                err || cb();
            }
        );
    },
    function toES6(cb){
        return src(
            ['./dist/assets/*.js']
        ).pipe(
            ClosureCompiler(
                {
                    compilation_level : isDebug ? 'WHITESPACE_ONLY' : 'SIMPLE_OPTIMIZATIONS',
                    formatting        : isPrettify ? 'PRETTY_PRINT' : 'SINGLE_QUOTES',
                    language_in       : 'ECMASCRIPT_2016',
                    language_out      : 'ECMASCRIPT6',
                    warning_level     : 'QUIET'
                }
            )
        ).pipe(
            through2(
                (file, encoding, cb) => {
                    if (file.isNull()) return cb(null, file);

                    if (file.isStream()) return cb(new PluginError('dashboard', 'Streaming not supported'));

                    js = file.contents.toString(encoding);
                    cb();
                }
            )
        );
    },
    function toHTML(cb){
        let css, html;

        return src(
            ['./dist/assets/*.css', './index.html']
        ).pipe(
            through2(
                (file, encoding, cb) => {
                    if (file.isNull()) return cb(null, file);

                    if (file.isStream()) return cb(new PluginError('dashboard', 'Streaming not supported'));

                    const content = file.contents.toString(encoding);

                    switch( file.extname ){
                        case '.css' :
                            css = content;
                            break;
                        case '.html' :
                            html = content;
                            break;
                        default :
                            return cb( new PluginError( 'dashboard', file.basename + ' Unknown file type!' ) );
                    };
                    cb();
                },
                (cb) => {
                    cb(
                        null,
                        new Vinyl(
                            {
                                path     : 'dashboard.html',
                                contents : Buffer.from(
                                        html.split('<script type="module" src="/src/dashboard/main.ts"></script>').join('<script>' + js + '</script>')
                                            .split('<style></style>').join('<style>' + css + '</style>')
                                    )
                            }
                        )
                    );
                }
            )
        ).pipe(
            dest('./')
        )
    }
);
