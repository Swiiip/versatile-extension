%lex

Index                               \$[0-9a-zA-Z_]+
Identifier                          [A-Za-z_\\][0-9A-Za-z_\\-]*
NumberConstant                      [0-9+-]+( "." [0-9]+ )?
StringConstant                      "\""[^"\n]*"\""
EscapedStringConstant               "\\\""[^"\n]*"\\\""
Comment                             "#"[^#]*"#"
Macro                               "${".*"}"

%s dialect

%%
<INITIAL>\n\s*                       return "NEWLINE";
[^\S\n]+                             /* ignore whitespace other than newlines */
"true"                               return "TRUE";
"false"                              return "FALSE";
<INITIAL>(?:".Dialect"[\w.]*\s*":"\s*)(["])               console.log("DIALECTBEGIN"); this.begin("dialect"); return "DIALECTBEGIN"
<dialect>{EscapedStringConstant}     console.log("ESCAPEDSTRINGCONSTANT"); return "ESCAPEDSTRINGCONSTANT";
<dialect>\n\s*                       /*ignore whitespaces in dialect*/
<dialect>["](?!.*["])                console.log("DIALECTBEGIN"); this.popState(); return "DIALECTEND"
"("                                   console.log("("); return "(";
")"                                   return ")";
"["                                   return "[";
"]"                                   return "]";
"{"                                   return "{";
"}"                                   return "}";
"="                                   console.log("="); return "=";
","                                   return ",";
"!"                                   return "!";
"?"                                   return "?";
":"                                   return ":";
"."                                   console.log("."); return ".";
{Identifier}                          console.log("IDENTIFIER"); return "IDENTIFIER";
<INITIAL>{StringConstant}             console.log("STRINGCONSTANT"); return "STRINGCONSTANT";
{NumberConstant}                      console.log("NUMBERCONSTANT"); return "NUMBERCONSTANT";
{Index}                               console.log("INDEX"); return "INDEX";
{Macro}                   console.log("MACRO"); return "MACRO";
{Comment}                            /* do nothing */
<<EOF>>                              console.log("EOF"); return "EOF";

/lex

%ebnf

%%

pgm
    : configuration* EOF {return $1}
    ;

configuration
    : configuration-dialect
    | member ":" STRINGCONSTANT NEWLINE? {$$ = {type:"configuration", key: $1, value: $3}}
    | member ":" NUMBERCONSTANT NEWLINE? {$$ = {type:"configuration",key: $1, value: $3}}
    | member ":" MACRO NEWLINE? {$$ = {type:"configuration",key: $1, value: $3}}
    | member ":" (TRUE|FALSE) NEWLINE? {$$ = {type:"configuration",key: $1, value: $3}}
    ;

configuration-dialect
    : member DIALECTBEGIN field* DIALECTEND NEWLINE? {$$ = {type:"configuration-dialect", key: $1, dialect: $3}}
    ;

member
    : name {$$ = $1}
    | name membersubscript+ {$$ = $1 + $2}
    ;

membersubscript
    : "." IDENTIFIER {$$ = $1 + $2}
    | "[" INDEX "]" {$$ = $1 + $2 + $3}
    | "[" NUMBERCONSTANT "]" {$$ = $1 + $2 + $3}
    | "[" NUMBERCONSTANT ":" NUMBERCONSTANT "]" {$$ = $1 + $2 + $3 + $4 + $5}
    ;

definitions
    : definition {$$ = $1}
    | "[" definition* "]" {$$ = $2}
    ;

definition
    : "{" field* "}" {$$ = {type:"definition", fields: $2}}
    ;

field
    : member "[" INDEX "]" "=" (definition|directive) {$$ = {type:"field-array-iteration", arrayName: $1, arrayIndex: $3, arrayIteration: $6}}
    | member "=" expression {$$ = {type:"field", fieldName: $1, fieldValue: $3}}
    | member "=" "[" expression+ "]" {$$ = {type:"field", fieldName: $1, fieldValue: $3}}
    | member "=" (definition|directive) {$$ = {type:"field", fieldName: $1, fieldValue: $3}}
    | member "=" "[" definition* "]" {$$ = {type:"field", fieldName: $1, fieldValue: $4}}
    ;

name
    : IDENTIFIER {$$ = $1}
    ;

expression
    : functioncall {$$ = $1}
    | member {$$ = $1}
    | NUMBERCONSTANT {$$ = $1}
    | ESCAPEDSTRINGCONSTANT {$$ = $1}
    | STRINGCONSTANT {$$ = $1}
    | (TRUE|FALSE) {$$ = $1}
    ;

expressions
    : expression {$$ = $1}
    | expressions "," expression? {$$ = $1 + [$3]}
    ;

functioncall
    : IDENTIFIER "(" expressions? ")" {$$ = {type:"functioncall", functionName: $1, functionParams: $3}}
    ;

directive
    : expression definitions {$$ = {type:"directive", condition: $1, definition:$2}}
    | "?" directive  {$$ = $2}
    ;