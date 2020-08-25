{
  var logger = require('./logger');

  logger.setContext(function() {
    return {
      line: line(),
      column: column()
    };
  });
}

Main
  = toplevelComment: _ version:Version? before: Function* _ service:Service after: Function*
  { 
    return {"type": "root", toplevelComment, version, service, functionsBefore: before, functionsAfter: after}; 
  }

AllowToken    = "allow"
IfToken       = "if"
MatchToken    = "match"
VersionToken  = "rules_version"

Version
  = VersionToken _ "=" _ "'" vn:VersionNumber "'" _ ";"? comment: EOL
  { return {"type": "version", "version": vn, comment}; }  
VersionNumber
  = "1"/"2"
 
Service
  = "service" _ type:("cloud.firestore"/"firebase.storage") EOL
  "{" EOL 
  content:Content EOL
  "}" EOL
  { return {"type": "service", "head": ["service", type], "content": content}; }

Content
  = left: (Matcher/Function) right: (_ (Matcher/Function))*
  { return right ? [left, ...right.map(v => v[1])] : [left]; }

Matcher
  = _ MatchToken __ path:MatcherPath EOL
    "{" EOL
    matcherBody: (Matcher/Allow/Function/Comment)+ _
    "}" EOL
  { return {"type": "match", path, "content": matcherBody}; }
  
Allow 
  = _ AllowToken __ scopes: AllowScopes ":" (EOL/__) _
  IfToken __ content: ConjunctedCondition
  { return { "type": "allow", scopes, content }; }
AllowScopes 
  = mainsope:AllowScope _ morescopes:("," _ AllowScope)*
   { return [mainsope, ...morescopes.flatMap(x => x).filter(x => x && x !== "," && x !== "")] }
AllowScope 
  = "write"/"read"/"get"/"list"/"update"/"delete"/"create"

ConjunctedCondition
  = c1: Condition cn: SubCondition*
  { return [c1, cn].flatMap(x => x).filter(x => x && x !== "");}
SubCondition
  = _ EOL condOp: ("&&" / "||") _ EOL _ cond: Condition
  { return {"type": "connection", "operator": condOp, "content": Array.isArray(cond) ? cond.flatMap(x => x).filter(x => x && x !== "") : cond}; }
  
Condition
  = (
    "!" condition: Condition
    { return condition; }
  / "(" EOL condition: Condition EOL ")" EOL
    { return condition; }
  / left: (ValueStatement / Literal) _ operation: ValueOperator _ right: (ValueStatement / Literal)
  	{ return { "type": "operation", "left": [left].flatMap(x => x), operation, "right": [right].flatMap(x => x)}; }  
  / left: (ValueStatement / Literal) _ "is" _ right: DataType
  	{ return { "type": "operation", "left": [left].flatMap(x => x), "operation": "is", "right": [{"type": "text", "text": right}]}; }  
  / vs: ValueStatement 
  	{ return vs; }   
  / Literal
  	{ return {"type": "text", "text": text()} }
  ) (";" EOL {} / EOL {})
  
ValueStatement
  = "[" _ statement: ValueStatement _ "]"
    { return {"type": "text", "text": text()}; }
  / left: FunctionCall "." right: ValueStatement
  	{ return [left, right]; }
  / fc: FunctionCall
  	{ return fc; }
  / left: WordDotWord "." right: ValueStatement
  	{ return [left, right]; }
  / WordDotWord
  	{ return {"type": "text", "text": text()}; }
      
LiteralArray
  = "[" Literals? "]"
  { return { "type": "Array", values: []}; }
Literals
  = l1: Literal ln: (_ "," _ Literal)*
  { return [l1, ln].flatMap(x => x).filter(x => x && x !== "," && x !== "");  }
Literal
  = (String / SlashString / DecimalLiteral / LiteralArray)
  { return { "type": "text", "text": text() }; }
  
Function
  = _ "function" __ name:FunctionName "(" params:FunctionParameters? ")" _ "{" (EOL/__) body:FunctionBody (EOL/__) "}"
  { return {"type": "function-declaration", name, params, "content": body.flatMap(x => x)}; }

MatcherPath 
  = "/" first: PathSegment following: MatcherPath*
  { return "/" + first + following.flatMap(x => x).join(""); }
  
PathSegment
  = Word 
  { return text(); }
  / "{" Word ("=**")? "}"
  { return text(); }

FunctionName
  = Word
FunctionParameters 
  = p1: Word pn:("," _ Word)*
  { return [p1, ...pn.flatMap(x => x).filter(x => x && x !== "," && x !== "")]; }
FunctionBody 
  = VariableDeclaration* ReturnStatement
  
VariableDeclaration
  = "let" (EOL/__) _ name: Word _ "=" _ content: ConjunctedCondition EOL ";"? EOL
  { return { "type": "variable-declaration", name, content }; }
  
ReturnStatement
  = "return" (EOL/__) _ content: ConjunctedCondition ";"? comment: EOL
  { return { "type": "return", "content": Array.isArray(content) ? content.flatMap(x => x) : content, comment };}

FunctionCall
  = name: WordDotWord _ "(" _ params: FunctionCallParameters? _ ")"
  { return { "type": "function-call", name, params }; }
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
  = (Whitespace / comment: Comment / LineTerminatorSequence)
  / (Whitespace? ";" Whitespace / comment: Comment / LineTerminatorSequence)
  { return comment;}

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

// Require some whitespace
__ = (Whitespace / Comment)+

// Optional whitespace
_ = value: (Whitespace / Comment)*
	{ return value.filter(v => v)}

Whitespace "whitespace" = [ \t\r\n]+
	{}

Comment "comment"
  = SingleLineComment

SingleLineComment
  = "//" comment:(!LineTerminatorSequence .)*
 { return comment.flatMap(x => x).join("").trim(); }

LineTerminatorSequence "end of line"
  = "\n"
  / "\r\n"
  / "\r"
  / "\u2028"
  / "\u2029"
  {}