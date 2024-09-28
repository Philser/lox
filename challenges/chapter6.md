### 1

In C, a block is a statement form that allows you to pack a series of statements where a single one is expected. The comma operator is an analogous syntax for expressions. A comma-separated series of expressions can be given where a single expression is expected (except inside a function call’s argument list). At runtime, the comma operator evaluates the left operand and discards the result. Then it evaluates and returns the right operand.

Add support for comma expressions. Give them the same precedence and associativity as in C. Write the grammar, and then implement the necessary parsing code.

#### Answer

In C, comma has the lowest precedence and is left-associative.
Adapted grammar:

```
* expression     → comma ;
* comma          → equality ( "," equality )* ;
* equality       → comparison ( ( "!=" | "==" ) comparison )* ;
```

Adapted parser:

```typescript
private expression(): Expr {
  return this.comma();
}

private comma(): Expr {
  let expr = this.equality();

  while (this.matchCurr([TokenType.COMMA])) {
    const operator = this.previous();
    const right = this.equality();
    expr = new Binary(expr, operator, right);
  }
  return expr;
}
```

### 2

Likewise, add support for the C-style conditional or “ternary” operator ?:. What precedence level is allowed between the ? and :? Is the whole operator left-associative or right-associative?

#### Answer

```
* expression     → ternary ;
* ternary        → equality '?' equality ':' equality ;
* equality       → comparison ( ( "!=" | "==" ) comparison )* ;
```

The operator is left-associative since it is evaluated from left to right: First evaluate the condition, then evaluate the relevant branch.

#### Corrected Answer

The above grammar is actually wrong, since the above grammar would make ternary operators mandatory. It also does not allow arbitrary nested expressions, which the operator actually supports. Think `a ? c=a+b : 0`. Last but not least the precedence wasn't correct, the left operand has higher precedence then the other two. A correct grammar would be:

```
* expression     → ternary ;
* ternary        → equality ( '?' ternary ':' ternary )? ;
* equality       → comparison ( ( "!=" | "==" ) comparison )* ;
```


### 3

Add error productions to handle each binary operator appearing without a left-hand operand. In other words, detect a binary operator appearing at the beginning of an expression. Report that as an error, but also parse and discard a right-hand operand with the appropriate precedence.
