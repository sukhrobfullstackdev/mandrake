export class Queue<T> {
  private items: T[] = [];

  constructor() {
    this.items = [];
  }

  enqueue(element: T) {
    this.items.push(element);
  }

  dequeue() {
    if (this.isEmpty()) {
      return null;
    }
    return this.items.shift() ?? null;
  }

  front() {
    if (this.isEmpty()) {
      return undefined;
    }
    return this.items[0];
  }

  isEmpty() {
    return this.items.length === 0;
  }
}
