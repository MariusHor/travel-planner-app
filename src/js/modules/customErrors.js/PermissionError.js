export default class PermissionError extends Error {
  constructor(message) {
    super(message);
    this.name = 'Permission Error';
  }
}
