const locations = JSON.parse(document.querySelector('#map').dataset.locations);

mapboxgl.accessToken =
  'pk.eyJ1IjoiY2hhb2EiLCJhIjoiY2w0emYzOXkzMGRxODNxcXVuNmV0bHYyYiJ9.TAVtYq9TNuOrJ6tWe3a31g';

var map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/chaoa/cl4zhkl32000214rw3li2aqkm',
  scrollZoom: false
});

const bounds = new mapboxgl.LngLatBounds();

locations.forEach(loc => {
  const el = document.createElement('div');
  el.className = 'marker';

  new mapboxgl.Marker({
    element: el,
    anchor: 'bottom'
  })
    .setLngLat(loc.coordinates)
    .addTo(map);

  new mapboxgl.Popup({
    offset: 30
  })
    .setLngLat(loc.coordinates)
    .setHTML(`<p>Day ${loc.day}:${loc.description} </p>`)
    .addTo(map);

  bounds.extend(loc.coordinates);
});

map.fitBounds(bounds, {
  padding: {
    top: 200,
    right: 100,
    left: 100,
    bottom: 150
  }
});
