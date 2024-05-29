export class BaseError extends Error {
  name;
  description;
  constructor({name, description}) {
    super(description);
    this.name = name;
    this.description = description;
    Object.setPrototypeOf(this, BaseError.prototype);
  }
  getDescription() {
    return this.description;
  }
}
//# sourceMappingURL=index.js.map
