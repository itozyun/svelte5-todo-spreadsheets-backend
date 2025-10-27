import {src, dest, series} from 'gulp';
import {gulp as ClosureCompiler} from 'google-closure-compiler';
import PluginError from 'plugin-error';
import {obj as through2} from 'through2';
import Vinyl from 'vinyl';

let isDebug = false;
let isPrettify = false;

for(var i = 2;i < process.argv.length; ++i){
  if(process.argv[i] === '--debug'){
    isDebug = true;
  } else if(process.argv[i] === '--pretty'){
    isPrettify = true;
  };
};

let js;

export default series(
    function(cb){
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

                    if (file.isStream()) return cb(new PluginError('admin', 'Streaming not supported'));

                    js = file.contents.toString(encoding);
                    cb();
                }
            )
        );
    },
    function(cb){
        let css, html;

        return src(
            ['./dist/assets/*.css', './index.html']
        ).pipe(
            through2(
                (file, encoding, cb) => {
                    if (file.isNull()) return cb(null, file);

                    if (file.isStream()) return cb(new PluginError('admin', 'Streaming not supported'));

                    const content = file.contents.toString(encoding);

                    switch( file.extname ){
                        case '.js' :
                            js = content;
                            break;
                        case '.css' :
                            css = content;
                            break;
                        case '.html' :
                            html = content;
                            break;
                        default :
                            return cb( new PluginError( 'admin', file.basename + ' Unknown file type!' ) );
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
