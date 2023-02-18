import L from 'leaflet';
import 'leaflet-control-geocoder';
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet-control-geocoder/dist/Control.Geocoder.css';

import key from './utils/config';

export default class Map {
  #isMapInitialized = false;

  #map;

  #coords;

  #geoPolygon;

  #homeMarker;

  #mapZoomLevel = 1;

  #createMap(coords = [50, 20]) {
    const bounds = new L.LatLngBounds(new L.LatLng(-70, -180), new L.LatLng(80, 190));

    this.#map = L.map('map', {
      maxBounds: bounds,
      maxBoundsViscosity: 0.8,
    }).setView(coords, this.#mapZoomLevel);

    L.tileLayer(`https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=${key}`, {
      tileSize: 512,
      zoomOffset: -1,
      minZoom: 3,
      attribution:
        '\u003ca href="https://www.maptiler.com/copyright/" target="_blank"\u003e\u0026copy; MapTiler\u003c/a\u003e \u003ca href="https://www.openstreetmap.org/copyright" target="_blank"\u003e\u0026copy; OpenStreetMap contributors\u003c/a\u003e',
      crossOrigin: true,
    }).addTo(this.#map);
  }

  #createGeocoder() {
    L.Control.geocoder({
      geocoder: L.Control.Geocoder.nominatim(),
      defaultMarkGeocode: false,
    })
      .on('markgeocode', event => {
        const { bbox } = event.geocode;
        if (this.#geoPolygon) this.#geoPolygon.remove();
        this.#geoPolygon = L.polygon([
          bbox.getSouthEast(),
          bbox.getNorthEast(),
          bbox.getNorthWest(),
          bbox.getSouthWest(),
        ]).addTo(this.#map);
        this.#map.flyToBounds(this.#geoPolygon.getBounds());
        this.#map.on('click', () => {
          this.#geoPolygon.remove();
        });
      })
      .addTo(this.#map);
  }

  #createClusterLayer() {
    this.clusterLayer = L.markerClusterGroup({
      iconCreateFunction: cluster =>
        L.divIcon({
          html: `<div class="cluster-div">${cluster.getChildCount()}</div>`,
        }),
    });
  }

  #createHomeMarker(coords) {
    const greenIcon = new L.Icon({
      iconUrl:
        'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });

    this.#homeMarker = L.marker(coords, {
      opacity: 0.8,
      icon: greenIcon,
    })
      .bindPopup(
        L.popup({
          maxWidth: 200,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: 'current-position-popup',
        }),
      )
      .setPopupContent('You are here!')
      .on('click', () => {
        this.#homeMarker.setOpacity(0.8);
      })
      .on('mouseover ', () => {
        this.#homeMarker.openPopup();
      })
      .on('mouseout ', () => {
        this.#homeMarker.closePopup();
      })
      .openPopup()
      .addTo(this.#map);
  }

  #getCoords(position) {
    if (position) {
      const { latitude, longitude } = position.coords;
      this.#coords = [latitude, longitude];
    }
    return this.#coords;
  }

  loadMap(position) {
    const coords = this.#getCoords(position);

    if (!this.#isMapInitialized) {
      this.#createMap(coords);
      this.#createClusterLayer();
      this.#createGeocoder();
      this.#isMapInitialized = true;
    }

    if (!position) return;

    this.#createHomeMarker(coords);
    this.#map.on('click', () => {
      this.#homeMarker.setOpacity(0.4);
      this.#homeMarker.closePopup();
    });
  }
}
