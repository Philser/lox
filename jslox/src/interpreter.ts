import {
  Binary,
  Expr,
  ExprVisitor,
  Grouping,
  Literal,
  Unary,
  Variable,
} from './expr.js';
import { Lox } from './main.js';
import { Expression, Print, Stmt, StmtVisitor, Var } from './stmt.js';
import { Token } from './token.js';
import { TokenType } from './tokenType.js';

type Object = {};

export class RuntimeError extends Error {
  public token: Token;

  constructor(token: Token, message: string) {
    super(message);
    this.token = token;
  }
}

export class Interpreter implements ExprVisitor<Object>, StmtVisitor<void> {
  interpret(stmts: Stmt[]) {
    try {
      for (const stmt of stmts) {
        this.execute(stmt);
      }
    } catch (e) {
      if (e! instanceof RuntimeError) {
        throw e;
      }

      Lox.runtimeError(e);
    }
  }

  visitBinaryExpr(expr: Binary): Object {
    const left = this.evaluate(expr.left);
    const right = this.evaluate(expr.right);

    switch (expr.operator.type) {
      case TokenType.PLUS:
        if (typeof left === 'string' || typeof right === 'string') {
          return `${left}${right}`;
        }

        if (typeof left === 'number' && typeof right === 'number') {
          return (left as number) + (right as number);
        }
        throw new RuntimeError(
          expr.operator,
          'Operands must be two numbers or two strings'
        );
      case TokenType.MINUS:
        this.assertNumbers(expr.operator, left, right);
        return (left as number) - (right as number);
      case TokenType.STAR:
        this.assertNumbers(expr.operator, left, right);
        return (left as number) * (right as number);
      case TokenType.SLASH:
        this.assertNumbers(expr.operator, left, right);
        if (right === 0) {
          throw new RuntimeError(expr.operator, 'Divison by 0 is not allowed');
        }
        return (left as number) / (right as number);
      case TokenType.GREATER:
        this.assertNumbers(expr.operator, left, right);
        return left > right;
      case TokenType.GREATER_EQUAL:
        this.assertNumbers(expr.operator, left, right);
        return left >= right;
      case TokenType.LESS:
        this.assertNumbers(expr.operator, left, right);
        return left < right;
      case TokenType.LESS_EQUAL:
        this.assertNumbers(expr.operator, left, right);
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
        this.assertNumber(expr.operator, right);
        return -(right as number);
    }

    // Unreachable.
    return null;
  }

  visitVariableExpr(expr: Variable): Object {
    throw new Error('Method not implemented.');
  }

  visitExpressionStmt(stmt: Expression): void {
    this.evaluate(stmt.expression);
  }

  visitPrintStmt(stmt: Print): void {
    const value = this.evaluate(stmt.expression);
    console.log(this.stringifyValue(value));
  }

  visitVarStmt(stmt: Var): void {
    throw new Error('Method not implemented.');
  }

  private execute(stmt: Stmt) {
    stmt.accept(this);
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
    return a === b;
  }

  private assertNumber(operator: Token, operand: Object) {
    if (typeof operand !== 'number') {
      throw new RuntimeError(operator, 'Operand must be a number.');
    }
  }

  private assertNumbers(operator: Token, left: Object, right: Object) {
    if (typeof left !== 'number' || typeof right !== 'number') {
      throw new RuntimeError(operator, 'Operands must be numbers.');
    }
  }

  private stringifyValue(value: Object) {
    if (value === null) {
      return 'nil';
    }

    if (typeof value === 'string') {
      return value;
    }

    return `${value}`;
  }
}
