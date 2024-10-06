### 1

Allowing comparisons on types other than numbers could be useful. The operators might have a reasonable interpretation for strings. Even comparisons among mixed types, like 3 < "pancake" could be handy to enable things like ordered collections of heterogeneous types. Or it could simply lead to bugs and confusion.

Would you extend Lox to support comparing other types? If so, which pairs of types do you allow and how do you define their ordering? Justify your choices and compare them to other languages.

#### Answer

Obviously, if a language distinguishes multiple types of numbers, than being able to compare these numbers would be very useful.

It is also very useful to compare strings with each other to be able to order them alphabetically.

If one of the values in the comparison is not a string and the other is, the interpreter could try to cast the string to the same
type as the non-string value is. If that works, we could simply return this comparison instead, e.g. (`3 == "3"`) /_ true _/.
JavaScript supports this, Python for example, does not. JavaScript allows both a type-strict and non-strict comparison by offering an `==` and an `===` operator. However, this also tends to be a source of confusion and bugs for new-to-the-language developers. It might come in handy for truthiness, where you want to have `3 == true` and `'3' == true` to evaluate to true. But you could easily just use the truthiness evaluation of `!` and use `!!` to receive the truthiness of a value when assigning a variable.

```
let userInput = "4"
let inputGiven = !!userInput
```

Comparing different types would be necessary in languages that allow sets, lists, maps of heterogenerous types. E.g. when trying to sort a list where elements can be numbers, strings, Nil, objects, etc. However, I don't know what the use case of these might be, whereas I can definitely see downsides: Programmers would need to know how the language orders different types in comparisons and design their code with these designs in mind. Programmers unfamiliar with this could fall into a trap where the language lets them make comparisons they did not have in mind, leading to unexpected states.

So all in all, I would be in favor of comparing strings in addition to numbers while not allowing anything else.

### 2

Many languages define + such that if either operand is a string, the other is converted to a string and the results are then concatenated. For example, "scone" + 4 would yield scone4. Extend the code in visitBinaryExpr() to support that.

#### Answer

```Typescript
visitBinaryExpr(expr: Binary): Object {
  switch (expr.operator.type) {
    case TokenType.PLUS:
      // ...
      if (
        (typeof left === 'string' && typeof right === 'number') ||
        (typeof left === 'number' && typeof right === 'string')
      ) {
        return `${left}${right}`;
      }
  }
}
```
or simply `if (typeof left === 'string' && typeof right === 'number')`.

### 3

What happens right now if you divide a number by zero? What do you think should happen? Justify your choice. How do other languages you know handle division by zero, and why do they make the choices they do?

Change the implementation in visitBinaryExpr() to detect and report a runtime error for this case.

#### Answer

Right now Lox would just conjure up the value that the underlying implementing language has reserved for dividing by 0. In my case it would be `Infinity` (except for `0/0` where it is `NaN`), in Java's case it depends if you are dividing integers or floats.

This behaviour is defined in the IEEE 754 floating point arithmetic standard. Because in JavaScript under the hood all numbers are floats, its behaviour always adheres to this standard.

```Typescript
case TokenType.SLASH:
  this.assertNumbers(expr.operator, left, right);
  if (right === 0) {
    throw new RuntimeError(expr.operator, 'Divison by 0 is not allowed');
  }
  return (left as number) / (right as number);
```
