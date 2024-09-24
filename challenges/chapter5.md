### 1

Earlier, I said that the `|`, `\*`, and `+` forms we added to our grammar metasyntax were just syntactic sugar. Take this grammar:

```
expr → expr ( "(" ( expr ( "," expr )* )? ")" | "." IDENTIFIER )+
     | IDENTIFIER
     | NUMBER
```

Produce a grammar that matches the same language but does not use any of that notational sugar.

Bonus: What kind of expression does this bit of grammar encode?

#### Answer

```
expr → expr morePhrases
expr → expr dotIdentifier
expr → IDENTIFIER
expr → NUMBER

calls → calls call
calls → call

call → "(" ")"
call → "(" additionalExpr ")"
call → "." IDENTIFIER

additionalExpr →  expr commaExpr
additionalExpr →  expr

commaExpr → commaExpr "," expr
commaExpr → expr
```

Function invocation
