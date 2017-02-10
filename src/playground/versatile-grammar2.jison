%lex

Index                   \$[0-9a-zA-Z_]+
Identifier              [A-Za-z_\\][0-9A-Za-z_\-]*
NumberConstant          [0-9]+( "." [0-9]+ )?
StringConstant          "\""[^"\n]*"\""
EscapedStringConstant   "\\\""[^"\n]*"\\\""

%s dialect

%%
<INITIAL>\n\s*                       console.log("NEWLINE"); return "NEWLINE";
[^\S\n]+                    /* ignore whitespace other than newlines */
{Identifier}                console.log("IDENTIFIER"); return "IDENTIFIER";
{StringConstant}            console.log("STRINGCONSTANT"); return "STRINGCONSTANT";
{NumberConstant}            console.log("NUMBERCONSTANT"); return "NUMBERCONSTANT";
{Index}                     console.log("INDEX"); return "INDEX";
\"\n\s*                        console.log("DIALECTBEGIN"); this.begin("dialect");return "DIALECTBEGIN"
<dialect>{EscapedStringConstant}     console.log("ESCAPEDSTRINGCONSTANT"); return "ESCAPEDSTRINGCONSTANT";
<dialect>\n\s*     /*ignore whitespaces in dialect*/
<dialect>\s*\"\n?                        console.log("DIALECTEND"); this.popState();return "DIALECTEND"
"true"                      console.log("TRUE"); return "TRUE";
"false"                     console.log("FALSE"); return "FALSE";
"("                         console.log("("); return "(";
")"                         console.log(")"); return ")";
"["                         console.log("["); return "[";
"]"                         console.log("]"); return "]";
"{"                         console.log("{"); return "{";
"}"                         console.log("}"); return "}";
"-"                         console.log("-"); return "-";
"+"                         console.log("+"); return "+";
"="                         console.log("="); return "=";
","                         console.log(","); return ",";
"!"                         console.log("!"); return "!";
"?"                         console.log("?"); return "?";
":"                         console.log(":"); return ":";
"."                         console.log("."); return ".";
<<EOF>>                     console.log("EOF"); return "EOF";

/lex


%%

pgm
    : configurations EOF {return $1}
    ;

configurations
    : configuration {$$ = {type:"configuration", arguments: [$1]}}
    | configurations configuration {$$ = [$1, $2]}
    ;

configuration
    : member ":" DIALECTBEGIN fields DIALECTEND {$$ = {type:"configuration-dialect", arguments: $4}}
    | member ":" STRINGCONSTANT NEWLINE {$$ = {type:"configuration", arguments: $3}}
    | member ":" NUMBERCONSTANT NEWLINE {$$ = {type:"configuration", arguments: $3}}
    | member ":" (TRUE|FALSE) NEWLINE {$$ = {type:"configuration", arguments: $3}}
    ;

member
    : IDENTIFIER membersubscripts {$$ = {type:"member"}}
    ;

membersubscripts
    : membersubscript {$$ = {type:"membersubscripts"}}
    | membersubscripts membersubscript {$$ = {type:"membersubscripts"}}
    ;

membersubscript
    : "." IDENTIFIER {$$ = {type:"membersubscript"}}
    | "[" NUMBERCONSTANT "]" {$$ = {type:"membersubscript"}}
    | "[" INDEX "]" {$$ = {type:"membersubscript"}}
    ;

protocol     
    : definitions {$$ = {type:"protocol"}}
    ;

definitions
    : definition {$$ = {type:"definitions"}}
    | definitions definition {$$ = {type:"definitions"}}
    ;

definition
    : "{" fields "}" {$$ = {type:"definition"}}
    ;

fields
    : field {$$ = {type:"fields"}}
    | fields field {$$ = {type:"fields"}}
    ;

field
    : name "[" INDEX "]" "=" definition|directive definition {$$ = {type:"field"}}
    | name "=" expression {$$ = {type:"field"}}
    | name "=" definition|directive {$$ = {type:"field"}}
    | name "=" "[" definitions "]" {$$ = {type:"field"}}
    ;

name
    : IDENTIFIER {$$ = {type:"name"}}
    ;

expression
    : functioncall {$$ = {type:"expression"}}
    | member {$$ = {type:"expression"}}
    | NUMBERCONSTANT {$$ = {type:"expression"}}
    | STRINGCONSTANT {$$ = {type:"expression"}}
    | ESCAPEDSTRINGCONSTANT {$$ = {type:"expression"}}
    ;

expressions
    : expression {$$ = {type:"expressions"}}
    | name "[" NUMBERCONSTANT ":" [0-9]+ "]" {$$ = {type:"expressions"}}
    | expressions "," expressions {$$ = {type:"expressions"}}
    ;

functioncall
    : IDENTIFIER "(" expressions? ")" {$$ = {type:"functioncall"}}
    ;

directive
    : "?" expression {$$ = {type:"directive"}}
    ;