import L from 'leaflet';
document.addEventListener('DOMContentLoaded', () => {
    const somata = document.getElementById('somata');
    const map = L.map(somata).setView([51.505, -0.09], 13);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);
});