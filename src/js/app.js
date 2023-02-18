import Map from './modules/map';

export default class App {
  #userPosition;

  constructor(map) {
    this.map = map;
    this.parentEl = document.querySelector('#root');
    this.userPositionBtn = document.querySelector('.form__get-position');
    this.positionErrorEl = document.querySelector('.invalid-feedback');
  }

  handleGetUserPosition() {
    this.userPositionBtn.addEventListener('click', async () => {
      try {
        this.#userPosition = await Map.getUserPosition();
      } catch (error) {
        if (error.message === 'User denied Geolocation') this.#renderPositionNotAllowedError();
      } finally {
        this.map.loadMap(this.#userPosition);
      }
    });
  }

  #renderPositionNotAllowedError() {
    this.positionErrorEl.classList.add('show');
    // this.parentEl.insertAdjacentHTML('afterbegin', this.createErrorModal(error));
    // this.showModal();
  }

  init() {
    this.map.loadMap(this.#userPosition);
    this.handleGetUserPosition();
  }
}

const map = new Map();
const app = new App(map);

app.init();
