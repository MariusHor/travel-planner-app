import Map from './modules/map';
import Geolocation from './modules/Gelocation';
import PermissionError from './modules/customErrors.js/PermissionError';

export default class App {
  #userPosition;

  constructor(map) {
    this.map = map;
    this.geolocation = new Geolocation();
    this.parentEl = document.querySelector('#root');
    this.userPositionBtn = document.querySelector('.form__get-position');
    this.positionErrorEl = document.querySelector('.invalid-feedback');
  }

  handleGetUserPosition() {
    this.userPositionBtn.addEventListener('click', async () => {
      try {
        await this.geolocation.checkGelocationPermission();
        this.#userPosition = await Geolocation.getUserPosition();
      } catch (error) {
        this.#handleErrors(error);
      } finally {
        this.map.loadMap(this.#userPosition);
      }
    });
  }

  #handleErrors(error) {
    if (error instanceof PermissionError) {
      this.#renderPositionNotAllowed({
        type: 'Permission',
      });
    }

    if (error.message === 'User denied Geolocation') {
      this.#renderPositionNotAllowed({
        type: 'Geolocation',
      });
    }
  }

  #renderPositionNotAllowed(error) {
    if (error.type === 'Permission') {
      this.positionErrorEl.textContent =
        'Geolocation is blocked. Try changing your browser settings.';
    }
    if (error.type === 'Geolocation') {
      this.positionErrorEl.textContent = 'Geolocation was denied by the user';
    }

    this.positionErrorEl.classList.add('show');
    setTimeout(() => {
      this.positionErrorEl.classList.remove('show');
    }, 3000);
  }

  init() {
    this.map.loadMap(this.#userPosition);
    this.handleGetUserPosition();
  }
}

const map = new Map();
const app = new App(map);

app.init();
