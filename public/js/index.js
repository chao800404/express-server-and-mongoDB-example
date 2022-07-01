import 'core-js/stable';
console.log('hello parcel');

import { displayMap } from './mapbox';
import { login } from './login';

const mapBox = document.querySelector('#map');
const loginForm = document.querySelector('.form');

if (mapBox) {
  const locations = JSON.parse(mapBox.dataset.locations);
  displayMap(locations);
}

if (loginForm) {
  loginForm.addEventListener('submit', e => {
    e.preventDefault();
    const email = document.querySelector('#email').value;
    const password = document.querySelector('#password').value;

    login({ email, password });
  });
}
