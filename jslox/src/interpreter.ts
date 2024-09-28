import { Binary, Expr, Grouping, Literal, Unary, Visitor } from './expr.js';
import { TokenType } from './tokenType.js';

type Object = {};

export class Interpreter implements Visitor<Object> {
  visitBinaryExpr(expr: Binary): Object {
    const left = this.evaluate(expr.left);
    const right = this.evaluate(expr.right);

    switch (expr.operator.type) {
      case TokenType.PLUS:
        if (typeof left === 'string' && typeof right === 'string') {
          return `${left}${right}`;
        }
        if (typeof left === 'number' && typeof right === 'number') {
          return (left as number) + (right as number);
        }
      case TokenType.MINUS:
        return (left as number) - (right as number);
      case TokenType.STAR:
        return (left as number) * (right as number);
      case TokenType.SLASH:
        return (left as number) / (right as number);
      case TokenType.GREATER:
        return left > right;
      case TokenType.GREATER_EQUAL:
        return left >= right;
      case TokenType.LESS:
        return left < right;
      case TokenType.LESS_EQUAL:
        return left <= right;
      case TokenType.BANG_EQUAL: 
        return !this.isEqual(left, right);
      case TokenType.EQUAL_EQUAL: 
        return this.isEqual(left, right);
    }

    return null;
  }

  visitGroupingExpr(expr: Grouping): Object {
    return this.evaluate(expr.expression);
  }

  visitLiteralExpr(expr: Literal): Object {
    return expr.value;
  }

  visitUnaryExpr(expr: Unary): Object {
    const right: Object = this.evaluate(expr.right);

    switch (expr.operator.type) {
      case TokenType.BANG:
        return !this.isTruthy(right);
      case TokenType.MINUS:
        return -(right as number);
    }

    // Unreachable.
    return null;
  }

  private evaluate(expr: Expr): Object {
    return expr.accept(this);
  }

  private isTruthy(object: Object): boolean {
    if (object === null) {
      return false;
    }
    if (typeof object === 'boolean') {
      return object;
    }

    return true;
  }

  private isEqual(a: Object, b: Object): boolean {
    return a === b
  }
}
