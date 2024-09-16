define("ace/mode/prql_highlight_rules",["require","exports","module","ace/lib/oop","ace/mode/text_highlight_rules"],function(e,t,n){"use strict";var r=e("../lib/oop"),i=e("./text_highlight_rules").TextHighlightRules,s=function(){var e="min|max|sum|average|stddev|every|any|concat_array|count|lag|lead|first|last|rank|rank_dense|row_number|round|as|in|tuple_every|tuple_map|tuple_zip|_eq|_is_null|from_text|lower|upper|read_parquet|read_csv",t=["bool","int","int8","int16","int32","int64","int128","float","text","timestamp","set"].join("|"),n=this.createKeywordMapper({"constant.language":"null","constant.language.boolean":"true|false",keyword:"let|into|case|prql|type|module|internal","storage.type":"let|func","support.function":e,"support.type":t,"variable.language":"date|math"},"identifier"),r=/\\(\d+|['"\\&bfnrt]|u\{[0-9a-fA-F]{1,6}\}|x[0-9a-fA-F]{2})/,i=/[A-Za-z_][a-z_A-Z0-9]/.source,s=/(?:\d\d*(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+\b)?/.source,o="[\\u202A\\u202B\\u202D\\u202E\\u2066\\u2067\\u2068\\u202C\\u2069]";this.$rules={start:[{token:"string.start",regex:'s?"',next:"string"},{token:"string.start",regex:'f"',next:"fstring"},{token:"string.start",regex:'r"',next:"rstring"},{token:"string.single",start:"'",end:"'"},{token:"string.character",regex:"'(?:"+r.source+"|.)'?"},{token:"constant.language",regex:"^"+i+"*"},{token:["constant.numeric","keyword"],regex:"("+s+")(years|months|weeks|days|hours|minutes|seconds|milliseconds|microseconds)"},{token:"constant.numeric",regex:/0(?:[xX][0-9a-fA-F]+|[oO][0-7]+|[bB][01]+)\b/},{token:"constant.numeric",regex:s},{token:"comment.block.documentation",regex:"#!.*"},{token:"comment.line.number-sign",regex:"#.*"},{token:"keyword.operator",regex:/\|\s*/,next:"pipe"},{token:"keyword.operator",regex:/->|=>|==|!=|>=|<=|~=|&&|\|\||\?\?|\/\/|@/},{token:"invalid.illegal",regex:o},{token:"punctuation.operator",regex:/[,`]/},{token:n,regex:"[\\w\\xff-\\u218e\\u2455-\\uffff]+\\b"},{token:"paren.lparen",regex:/[\[({]/},{token:"paren.rparen",regex:/[\])}]/}],pipe:[{token:"constant.language",regex:i+"*",next:"pop"},{token:"error",regex:"",next:"pop"}],string:[{token:"constant.character.escape",regex:r},{token:"text",regex:/\\(\s|$)/,next:"stringGap"},{token:"string.end",regex:'"',next:"start"},{token:"invalid.illegal",regex:o},{defaultToken:"string.double"}],stringGap:[{token:"text",regex:/\\/,next:"string"},{token:"error",regex:"",next:"start"}],fstring:[{token:"constant.character.escape",regex:r},{token:"string.end",regex:'"',next:"start"},{token:"invalid.illegal",regex:o},{token:"paren.lparen",regex:"{",push:"fstringParenRules"},{token:"invalid.illegal",regex:o},{defaultToken:"string"}],fstringParenRules:[{token:"constant.language",regex:"^"+i+"*"},{token:"paren.rparen",regex:"}",next:"pop"}],rstring:[{token:"string.end",regex:'"',next:"start"},{token:"invalid.illegal",regex:o},{defaultToken:"string"}]},this.normalizeRules()};r.inherits(s,i),t.PrqlHighlightRules=s}),define("ace/mode/folding/cstyle",["require","exports","module","ace/lib/oop","ace/range","ace/mode/folding/fold_mode"],function(e,t,n){"use strict";var r=e("../../lib/oop"),i=e("../../range").Range,s=e("./fold_mode").FoldMode,o=t.FoldMode=function(e){e&&(this.foldingStartMarker=new RegExp(this.foldingStartMarker.source.replace(/\|[^|]*?$/,"|"+e.start)),this.foldingStopMarker=new RegExp(this.foldingStopMarker.source.replace(/\|[^|]*?$/,"|"+e.end)))};r.inherits(o,s),function(){this.foldingStartMarker=/([\{\[\(])[^\}\]\)]*$|^\s*(\/\*)/,this.foldingStopMarker=/^[^\[\{\(]*([\}\]\)])|^[\s\*]*(\*\/)/,this.singleLineBlockCommentRe=/^\s*(\/\*).*\*\/\s*$/,this.tripleStarBlockCommentRe=/^\s*(\/\*\*\*).*\*\/\s*$/,this.startRegionRe=/^\s*(\/\*|\/\/)#?region\b/,this._getFoldWidgetBase=this.getFoldWidget,this.getFoldWidget=function(e,t,n){var r=e.getLine(n);if(this.singleLineBlockCommentRe.test(r)&&!this.startRegionRe.test(r)&&!this.tripleStarBlockCommentRe.test(r))return"";var i=this._getFoldWidgetBase(e,t,n);return!i&&this.startRegionRe.test(r)?"start":i},this.getFoldWidgetRange=function(e,t,n,r){var i=e.getLine(n);if(this.startRegionRe.test(i))return this.getCommentRegionBlock(e,i,n);var s=i.match(this.foldingStartMarker);if(s){var o=s.index;if(s[1])return this.openingBracketBlock(e,s[1],n,o);var u=e.getCommentFoldRange(n,o+s[0].length,1);return u&&!u.isMultiLine()&&(r?u=this.getSectionRange(e,n):t!="all"&&(u=null)),u}if(t==="markbegin")return;var s=i.match(this.foldingStopMarker);if(s){var o=s.index+s[0].length;return s[1]?this.closingBracketBlock(e,s[1],n,o):e.getCommentFoldRange(n,o,-1)}},this.getSectionRange=function(e,t){var n=e.getLine(t),r=n.search(/\S/),s=t,o=n.length;t+=1;var u=t,a=e.getLength();while(++t<a){n=e.getLine(t);var f=n.search(/\S/);if(f===-1)continue;if(r>f)break;var l=this.getFoldWidgetRange(e,"all",t);if(l){if(l.start.row<=s)break;if(l.isMultiLine())t=l.end.row;else if(r==f)break}u=t}return new i(s,o,u,e.getLine(u).length)},this.getCommentRegionBlock=function(e,t,n){var r=t.search(/\s*$/),s=e.getLength(),o=n,u=/^\s*(?:\/\*|\/\/|--)#?(end)?region\b/,a=1;while(++n<s){t=e.getLine(n);var f=u.exec(t);if(!f)continue;f[1]?a--:a++;if(!a)break}var l=n;if(l>o)return new i(o,r,l,t.length)}}.call(o.prototype)}),define("ace/mode/prql",["require","exports","module","ace/lib/oop","ace/mode/text","ace/mode/prql_highlight_rules","ace/mode/folding/cstyle"],function(e,t,n){"use strict";var r=e("../lib/oop"),i=e("./text").Mode,s=e("./prql_highlight_rules").PrqlHighlightRules,o=e("./folding/cstyle").FoldMode,u=function(){this.HighlightRules=s,this.foldingRules=new o,this.$behaviour=this.$defaultBehaviour};r.inherits(u,i),function(){this.lineCommentStart="#",this.$id="ace/mode/prql"}.call(u.prototype),t.Mode=u});
                (function() {
                    window.require(["ace/mode/prql"], function(m) {
                        if (typeof module == "object" && typeof exports == "object" && module) {
                            module.exports = m;
                        }
                    });
                })();
            