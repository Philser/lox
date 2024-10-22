import { Binary, Expr, ExprVisitor, Grouping, Literal, Unary } from './expr';

export class AstPrinter implements ExprVisitor<String> {
  print(expr: Expr): string {
    return expr.accept(this);
  }

  public visitBinaryExpr(expr: Binary): string {
    return this.parenthesize(expr.operator.lexeme, expr.left, expr.right);
  }

  public visitGroupingExpr(expr: Grouping): string {
    return this.parenthesize('group', expr.expression);
  }

  public visitLiteralExpr(expr: Literal): string {
    if (expr.value === null) {
      return 'nil';
    }
    return expr.value.toString();
  }

  public visitUnaryExpr(expr: Unary): string {
    return this.parenthesize(expr.operator.lexeme, expr.right);
  }

  private parenthesize(name: string, ...exprs: Expr[]): string {
    const builder = [];

    builder.push('(');
    builder.push(name);
    for (const expr of exprs) {
      builder.push(' ');
      builder.push(expr.accept(this));
    }
    builder.push(')');

    return builder.join('');
  }
}
