%lex

Index                   \$[0-9a-zA-Z_]+
Identifier              [A-Za-z_\\][0-9A-Za-z_\-]*
NumberConstant          [0-9+-]+( "." [0-9]+ )?
StringConstant          "\""[^"\n]*"\""
EscapedStringConstant   "\\\""[^"\n]*"\\\""
Comment                 "#"[^#]*"#"

%s dialect

%%
<INITIAL>\n\s*                       console.log("NEWLINE"); return "NEWLINE";
[^\S\n]+                    /* ignore whitespace other than newlines */
"true"                      console.log("TRUE"); return "TRUE";
"false"                     console.log("FALSE"); return "FALSE";
<INITIAL>["](?!.*["])                      console.log("DIALECTBEGIN"); this.begin("dialect");return "DIALECTBEGIN"
<dialect>{EscapedStringConstant}     console.log("ESCAPEDSTRINGCONSTANT"); return "ESCAPEDSTRINGCONSTANT";
<dialect>\n\s*          /*ignore whitespaces in dialect*/
<dialect>["](?!.*["])                      console.log("DIALECTEND"); this.popState(); return "DIALECTEND"
"("                         console.log("("); return "(";
")"                         console.log(")"); return ")";
"["                         console.log("["); return "[";
"]"                         console.log("]"); return "]";
"{"                         console.log("{"); return "{";
"}"                         console.log("}"); return "}";
"="                         console.log("="); return "=";
","                         console.log(","); return ",";
"!"                         console.log("!"); return "!";
"?"                         console.log("?"); return "?";
":"                         console.log(":"); return ":";
"."                         console.log("."); return ".";
{Identifier}                console.log("IDENTIFIER"); return "IDENTIFIER";
<INITIAL>{StringConstant}            console.log("STRINGCONSTANT"); return "STRINGCONSTANT";
{NumberConstant}            console.log("NUMBERCONSTANT"); return "NUMBERCONSTANT";
{Index}                     console.log("INDEX"); return "INDEX";
{Comment}                   console.log("COMMENT");
<<EOF>>                     console.log("EOF"); return "EOF";

/lex

%ebnf

%%

pgm
    : configuration* EOF {return $1}
    ;

configuration
    : member ":" DIALECTBEGIN field* DIALECTEND NEWLINE? {$$ = {type:"configuration-dialect", arguments: $4}}
    | member ":" STRINGCONSTANT NEWLINE? {$$ = {type:"configuration", arguments: $3}}
    | member ":" NUMBERCONSTANT NEWLINE? {$$ = {type:"configuration", arguments: $3}}
    | member ":" (TRUE|FALSE) NEWLINE? {$$ = {type:"configuration", arguments: $3}}
    ;

member
    : name
    | name membersubscript+ {$$ = {type:"member"}}
    ;

membersubscript
    : "." IDENTIFIER {$$ = {type:"membersubscript"}}
    | "[" NUMBERCONSTANT "]" {$$ = {type:"membersubscript"}}
    | "[" INDEX "]" {$$ = {type:"membersubscript"}}
    ;

protocol     
    : field* {$$ = {type:"protocol"}}
    ;

definition
    : "{" field* "}" {$$ = {type:"definition", arguments: $2}}
    ;

field
    : member "[" INDEX "]" "=" definition|directive definition {$$ = {type:"field"}}
    | member "=" expression {$$ = {type:"field", arguments: [$member, $3]}}
    | member "=" "[" expression+ "]" {$$ = {type:"field", arguments: [$member, $3]}}
    | member "=" (definition|directive) {$$ = {type:"field", arguments: [$member, $3]}}
    | member "=" "[" definition* "]" {$$ = {type:"field"}}
    | member "=" "?"? expression "{" field+ "}" {$$ = {type:"field"}}
    ;

name
    : IDENTIFIER {$$ = {type:"name", arguments: $1}}
    ;

expression
    : functioncall {$$ = {type:"expression"}}
    | member {$$ = {type:"expression"}}
    | NUMBERCONSTANT {$$ = {type:"expression"}}
    | STRINGCONSTANT {$$ = {type:"expression"}}
    | ESCAPEDSTRINGCONSTANT {$$ = {type:"expression"}}
    | (TRUE|FALSE) {$$ = {type:"expression"}}
    ;

expressions
    : expression {$$ = {type:"expressions"}}
    | name "[" NUMBERCONSTANT ":" [0-9]+ "]" {$$ = {type:"expressions"}}
    | expressions "," expression {$$ = {type:"expressions"}}
    ;

functioncall
    : IDENTIFIER "(" expressions? ")" {$$ = {type:"functioncall"}}
    ;

directive
    : "?" expression definition{$$ = {type:"directive"}}
    ;