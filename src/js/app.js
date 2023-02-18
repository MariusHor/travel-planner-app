import Map from './modules/Map';
import Geolocation from './modules/Gelocation';
import { PermissionError, UsernameValidationError } from './modules/customErrors.js';
import { capitalize, focusElement, removeElClasses } from './modules/utils/helpers';

export default class App {
  #userPosition;

  constructor(map) {
    this.map = map;
    this.geolocation = new Geolocation();

    this.parentEl = document.querySelector('#root');
    this.formEl = document.querySelector('.form');
    this.mapEl = document.querySelector('#map');
    this.mapSectionTitleEl = document.querySelector('.map-wrapper__title');
    this.userNameInputEl = document.querySelector('#user-name');
    this.userPositionBtnEl = document.querySelector('.form__get-position');
    this.feedbackEl = document.querySelector('.input-feedback');
  }

  #handleGetUserPosition() {
    this.userPositionBtnEl.addEventListener('click', async () => {
      try {
        clearTimeout(this.feedbackElTimeout);

        await this.geolocation.checkGelocationPermission();

        this.#userPosition = await Geolocation.getUserPosition();
        const positionData = await App.getPositionData(this.#userPosition);
        this.#renderPositionPositiveFeedback(positionData);
      } catch (error) {
        this.#handleErrors(error);
      } finally {
        this.map.loadMap(this.#userPosition);
      }
    });
  }

  #handleErrors(error) {
    if (error instanceof UsernameValidationError) {
      this.#renderInvalidUsernameFeedback();
    }

    if (error instanceof PermissionError) {
      this.#renderPositionNegativeFeedback({
        type: 'Permission',
      });
    }

    if (error.message === 'User denied Geolocation') {
      this.#renderPositionNegativeFeedback({
        type: 'Geolocation',
      });
    }
  }

  #toggleShowClass(secondaryClass) {
    removeElClasses(this.feedbackEl, {
      classes: ['input-feedback--positive', 'input-feedback--negative'],
    });
    this.feedbackEl.classList.add('show', secondaryClass);

    this.feedbackElTimeout = setTimeout(() => {
      this.feedbackEl.classList.remove('show', secondaryClass);
    }, 5000);
  }

  #renderPositionPositiveFeedback(positionData) {
    const { city, locality, countryName: country } = positionData;
    this.feedbackEl.textContent = `Current position was set as ${city || locality}, ${country}`;

    this.#toggleShowClass('input-feedback--positive');
  }

  #renderPositionNegativeFeedback(error) {
    if (error.type === 'Permission')
      this.feedbackEl.textContent = 'Geolocation is blocked. Try changing your browser settings.';
    if (error.type === 'Geolocation')
      this.feedbackEl.textContent = 'Geolocation was denied by the user';

    this.#toggleShowClass('input-feedback--negative');
  }

  #renderInvalidUsernameFeedback() {
    this.feedbackEl.textContent = 'Username cannot be empty';
    this.#toggleShowClass('input-feedback--negative');
  }

  #renderUserNameOnPage() {
    if (!this.userNameInputEl.value) throw new UsernameValidationError();

    const userName = capitalize(this.userNameInputEl.value);
    this.userNameInputEl.value = '';

    this.mapSectionTitleEl.textContent = `
    ${userName}, click on the map and create your dream vacation
    `;
  }

  static async getPositionData(userPosition) {
    const { latitude, longitude } = userPosition.coords;

    const response = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`,
    );
    const positionData = await response.json();
    return positionData;
  }

  #handleFormSubmit() {
    this.formEl.addEventListener('submit', event => {
      event.preventDefault();

      removeElClasses(this.feedbackEl, {
        classes: ['show', 'input-feedback--positive', 'input-feedback--negative'],
      });

      clearTimeout(this.feedbackElTimeout);

      try {
        this.#renderUserNameOnPage();
        this.mapEl.scrollIntoView();
      } catch (error) {
        this.#handleErrors(error);
      }
    });
  }

  init() {
    focusElement(this.userNameInputEl);
    this.map.loadMap(this.#userPosition);
    this.#handleGetUserPosition();
    this.#handleFormSubmit();
  }
}

const map = new Map();
const app = new App(map);

app.init();
