Main
  = version:Version? service:Service
  { return {"type": "root", version, service}; }

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
  { return {"type": "service", "head": ["service", type], "content": content}; }

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
  { return { "type": "allow", scope, condition }; }

ConjunctedCondition
  = c1: Condition cn: SubCondition*
  { return [c1, cn].flatMap(x => x).filter(x => x && x !== "");}
SubCondition
  = _ EOL condOp: ("&&" / "||") _ EOL _ cond: Condition
  { return [condOp, Array.isArray(cond) ? cond.flatMap(x => x).filter(x => x && x !== "") : cond]; }
  
Condition
  = (
    "!" condition: Condition
    { return condition; }
  / "(" EOL condition: Condition EOL ")" EOL
    { return condition; }
  / left: (ValueStatement / Literal) _ op: ValueOperator _ right: (ValueStatement / Literal)
  	{ return [left, op, right]; }  
  / left: (ValueStatement / Literal) _ "is" _ right: DataType
  	{ return [left, "is", right]; }  
  / vs: ValueStatement 
  	{ return vs; }   
  / Literal
  	{ return text(); }
  ) (";" EOL {} / EOL {})
  
ValueStatement
  = "[" _ statement: ValueStatement _ "]"
    { return text(); }
  / left: FunctionCall "." right: ValueStatement
  	{ return [left, right]; }
  / fc: FunctionCall
  	{ return fc; }
  / left: WordDotWord "." right: ValueStatement
  	{ return left + "." + right; }
  / WordDotWord
  	{ return text(); }
    
Literal
  = String / SlashString / DecimalLiteral / LiteralArray
  
LiteralArray
  = "[" Literals? "]"
  { return { "type": "Array", values: []}; }
Literals
  = l1: Literal ln: (_ "," _ Literal)*
  { return [l1, ln].flatMap(x => x).filter(x => x && x !== "," && x !== "");  }
  
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
  = "return" (EOL/__) _ condition: ConjunctedCondition EOL ";"? EOL
  { return { "head": "return", condition}; }

FunctionCall
  = name: WordDotWord _ "(" _ params: FunctionCallParameters? _ ")"
  { return { "type": "FunctionCall", name, params }; }
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
  {}
  
LineTerminatorSequence "end of line"
  = "\n"
  / "\r\n"
  / "\r"
  / "\u2028"
  / "\u2029"
  {}

__ "required_whitespace"
  = [ \t\n\r]+ 
  {}
  
_ "whitespace"
  = [ \t\n\r]*
  {}
  