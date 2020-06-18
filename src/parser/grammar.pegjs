Main
  = version:Version? service:Service
  { return {version, service}; }

AllowToken    = "allow"
IfToken       = "if"
MatchToken    = "match"
VersionToken  = "rules_version"

Version
  = t: VersionToken _ "=" _ "'" vn:VersionNumber "'" _ ";"? EOL
  { return [t, "=", vn] }  
VersionNumber
  = "1"/"2"
 
Service
  = "service" _ type:("cloud.firestore"/"firebase.storage") EOL
  "{" EOL 
  content:Content EOL
  "}" EOL
  { return {"head": ["service", type], "content": content}; }

Content
  = left: Matcher right: (_ Matcher)*
  { return right ? [left, ...right.map(v => v[1])] : [left]; }

Matcher
  = _ MatchToken __ path:MatcherPath EOL
    "{" EOL
    matcherBody: (Matcher/Allow/Function/Comment)+ _
    "}" EOL
  { return {"head": ["match", path], "content": matcherBody}; }
  
Allow 
  = _ AllowToken __ scope: AllowScope ":" (EOL/__) _
  IfToken __ condition: ConjunctedCondition
  { return {"head": ["allow", scope, condition]}; }

ConjunctedCondition
  = c1: Condition cn: SubCondition*
  { return [c1, cn];}
SubCondition
  = _ EOL ("&&" / "||") _ EOL _ Condition
  
Condition
  = (
    "!" Condition
  / "(" EOL c: Condition EOL ")" EOL
   { return ["(", c, ")"]; }
  / left: (ValueStatement / Literal) _ op: ValueOperator _ right: (ValueStatement / Literal)
  	{ return [left, op, right]; }  
  / left: (ValueStatement / Literal) _ "is" _ right: DataType
  	{ return [left, "is", right]; }  
  / ValueStatement / Literal
  	{ return text(); }
  ) (";" EOL / EOL)
  
ValueStatement
  = "[" _ ValueStatement _ "]"
  / left: FunctionCall "." right: ValueStatement
  	{ return left + "." + right; }
  / FunctionCall
  	{ return text(); }
  / left: WordDotWord "." right: ValueStatement
  	{ return left + "." + right; }
  / WordDotWord
  	{ return text(); }
    
Literal
  = String / SlashString / DecimalLiteral / LiteralArray
  
LiteralArray
  = "[" (Literal (_ "," _ Literal)*)? "]"
  
  
Function
  = _ "function" __ name:FunctionName "(" params:FunctionParameters? ")" _ "{" (EOL/__) body:FunctionBody (EOL/__) "}"
  { return {"head": ["function", name], params, "content": body.flatMap(x => x)}; }

MatcherPath 
  = "/" first: PathSegment following: MatcherPath*
  { return "/" + first + following.flatMap(x => x).join(""); }
  
PathSegment
  = Word 
  { return text(); }
  / "{" Word ("=**")? "}"
  { return text(); }

AllowScope 
  = mainsope:AllowScopes _ morescopes:("," _ AllowScopes)*
   { return [mainsope, ...morescopes.flatMap(x => x).filter(x => x && x !== "," && x !== "")] }
AllowScopes 
  = "write"/"read"/"get"/"list"/"update"/"delete"/"create"

FunctionName
  = Word
FunctionParameters 
  = p1: Word pn:("," _ Word)*
  { return [p1, ...pn.flatMap(x => x).filter(x => x && x !== "," && x !== "")]; }
FunctionBody 
  = VariableDeclaration* ReturnStatement
  
VariableDeclaration
  = "let" (EOL/__) _ varName: Word _ "=" _ varDecl: ConjunctedCondition EOL ";"? EOL
  { return { "head": ["let", varName, "=", varDecl] }; }
ReturnStatement
  = "return" (EOL/__) _ ConjunctedCondition EOL ";"? EOL

FunctionCall
  = name: WordDotWord _ "(" _ params: FunctionCallParameters? _ ")"
  { return [name, params]}
FunctionCallParameters
  = left: FunctionCallParameter right: ("," _ FunctionCallParameter)*
  { return [left, ...right.map(v => v[2])]; } 
FunctionCallParameter
  = Literal / ValueStatement
//  = "[" _ FunctionCallParameter _ "]"
//  / WordDotWord / String / DecimalLiteral / SlashString
  
SlashString
  = "/" first:WordOrDollarWord following: SlashString*
  { return "/" + first + following.flatMap(x => x).join(""); }
WordOrDollarWord
  = Word / "$(" Word ")"
  { return text() }

TrueFalse
  = "true" / "false"
  
ValueOperator
  = "=="/"!="/"&&"/"||"/"<="/">="/"<"/">"
  
String
  = chars:("'" [^']+ "'")
  { return chars.flatMap(x => x).join(""); }
  
WordDotWord
  = first: Word second: ("." Word)*
  { return first + second.flatMap(x => x).join(""); }

Word
  = chars: [a-zA-Z0-9_]+
  { return chars.join(""); }
  
EOL
  = _ Comment? LineTerminatorSequence?
  {}

Comment "comment"
  = _ "//" comment: (!LineTerminator .)*
  { return { "head": ["//", comment.flatMap(x => x).join("").trim()]}; }

DecimalLiteral
  = DecimalIntegerLiteral "." DecimalDigit* 
  	{ return { type: "Literal", value: parseFloat(text()) }; }
  / "." DecimalDigit+
  	{ return { type: "Literal", value: parseFloat(text()) }; }

DecimalIntegerLiteral
  = "0"
  / [-]? NonZeroDigit DecimalDigit*

DecimalDigit
  = [0-9]

NonZeroDigit
  = [1-9]
  
DataType
  = "bool"
  / "bytes"
  / "constraint"
  / "duration"
  / "float"
  / "int"
  / "latlng"
  / "list"
  / "set"
  / "number"
  / "map"
  / "string"
  / "timestamp"
  / "path"
  / "map_diff"

LineTerminator
  = [\n\r\u2028\u2029]
  
LineTerminatorSequence "end of line"
  = "\n"
  / "\r\n"
  / "\r"
  / "\u2028"
  / "\u2029"

__ "required_whitespace"
  = [ \t\n\r]+ 
  {}
  
_ "whitespace"
  = [ \t\n\r]*
  {}