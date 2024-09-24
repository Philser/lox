import fs, { WriteStream } from 'fs';

function run() {
  const outputDir = 'src';
  defineAst(outputDir, 'Expr', [
    'Binary   = left: Expr, operator: Token, right: Expr',
    'Grouping = expression: Expr',
    'Literal  = value: Object',
    'Unary    = operator: Token, right: Expr',
  ]);
}

function defineAst(outputDir: string, baseName: string, types: string[]) {
  const path: string = outputDir + '/' + baseName.toLowerCase() + '.ts';

  const writer = fs.createWriteStream(path);
  writer.write("import { Token } from './token';\n\n");
  writer.write('export abstract class ' + baseName + ' {\n');
  // The base accept() method.
  writer.write('\tabstract accept<R>(visitor: Visitor<R>): R;\n');
  writer.write('}\n\n');

  defineVisitor(writer, baseName, types);

  for (const type of types) {
    const className = type.split('=')[0].trim();
    const fields = type.split('=')[1].trim();
    defineType(writer, baseName, className, fields);
  }

  writer.close();
}

function defineType(
  writer: WriteStream,
  baseName: string,
  className: string,
  fieldList: string
) {
  writer.write('export class ' + className + ' extends ' + baseName + ' {\n');
  // Fields
  const fields = fieldList.split(', ');
  for (const field of fields) {
    writer.write('\tpublic ' + field + ';\n');
  }
  writer.write('\n');

  // Constructor.
  writer.write('\tconstructor(' + fieldList + ') {\n');
  writer.write('\t\tsuper();\n');

  // Store parameters in fields.
  for (const field of fields) {
    const name = field.split(':')[0];
    writer.write('\t\tthis.' + name + ' = ' + name + ';\n');
  }

  writer.write('\t}\n\n');

  // Visitor pattern.
  writer.write('\taccept<R>(visitor: Visitor<R>): R {\n');
  writer.write('\t\treturn visitor.visit' + className + baseName + '(this);\n');
  writer.write('\t}\n');

  writer.write('}\n\n');
}

function defineVisitor(writer: WriteStream, baseName: string, types: string[]) {
  writer.write('export interface Visitor<R> {\n');

  for (const type of types) {
    const typeName = type.split('=')[0].trim();
    writer.write(
      '\tvisit' +
        typeName +
        baseName +
        '(' +
        baseName.toLowerCase() +
        ': ' +
        typeName +
        '): R;\n'
    );
  }

  writer.write('  }\n\n');
}

run();
