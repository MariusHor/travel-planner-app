import PermissionError from './customErrors.js/PermissionError';

export default class Geolocation {
  #permission;

  async checkGelocationPermission() {
    try {
      this.#permission = await navigator.permissions.query({ name: 'geolocation' });
      if (this.#permission.state === 'denied') {
        throw new PermissionError(this.#permission.state);
      }
    } catch (error) {
      throw error;
    }
  }

  static async getUserPosition() {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject);
    });
  }
}
