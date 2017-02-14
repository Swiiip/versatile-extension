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
<INITIAL>\n\s*                                  return "NEWLINE";
[^\S\n]+                                        /* ignore whitespace other than newlines */
"true"                                          return "TRUE";
"false"                                         return "FALSE";
<INITIAL>(?:".Dialect"[\w.]*\s*":"\s*)(["])     this.begin("dialect"); return "DIALECTBEGIN"
<dialect>{EscapedStringConstant}                return "ESCAPEDSTRINGCONSTANT";
<dialect>\n\s*                                  /* ignore whitespaces in dialect */
<dialect>["](?!.*["])                           this.popState(); return "DIALECTEND"
"("                                             return "(";
")"                                             return ")";
"["                                             return "[";
"]"                                             return "]";
"{"                                             return "{";
"}"                                             return "}";
"="                                             return "=";
","                                             return ",";
"?"                                             return "?";
":"                                             return ":";
"."                                             return ".";
{Identifier}                                    return "IDENTIFIER";
<INITIAL>{StringConstant}                       return "STRINGCONSTANT";
{NumberConstant}                                return "NUMBERCONSTANT";
{Index}                                         return "INDEX";
{Macro}                                         return "MACRO";
{Comment}                                       /* ignore comments */
<<EOF>>                                         return "EOF";

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
    : member DIALECTBEGIN assignment* DIALECTEND NEWLINE? {$$ = {type:"configuration-dialect", key: $1, dialect: $3}}
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
    : "{" assignment* "}" {$$ = {type:"definition", assignments: $2}}
    ;

assignment
    : member "[" INDEX "]" "=" (definition|directive) {$$ = {type:"assignment-array-iteration", arrayName: $1, arrayIndex: $3, arrayIteration: $6}}
    | member "=" expression {$$ = {type:"assignment", leftMember: $1, rightMember: $3}}
    | member "=" "[" expression+ "]" {$$ = {type:"assignment", leftMember: $1, rightMember: $3}}
    | member "=" (definition|directive) {$$ = {type:"assignment", leftMember: $1, rightMember: $3}}
    | member "=" "[" definition* "]" {$$ = {type:"assignment", leftMember: $1, rightMember: $4}}
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