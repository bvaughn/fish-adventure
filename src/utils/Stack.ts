export class Stack<Type extends Object> {
  private defaultValues: Type;
  private stack: Type[] = [];

  constructor(defaultValues: Type) {
    this.defaultValues = defaultValues;
  }

  getCurrent(): Type {
    if (this.stack.length === 0) {
      return this.defaultValues;
    }

    return this.stack[this.stack.length - 1];
  }

  pop() {
    if (this.stack.length > 0) {
      this.stack.pop();
    }
  }

  push() {
    this.stack.push({
      ...this.getCurrent(),
    });
  }
}
