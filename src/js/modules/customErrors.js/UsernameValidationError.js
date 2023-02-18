export default class UsernameValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'Username Validation Error';
  }
}
