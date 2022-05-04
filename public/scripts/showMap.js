mapboxgl.accessToken = token;
const map = new mapboxgl.Map({
  container: 'map', // container ID
  style: 'mapbox://styles/mapbox/light-v10', // style URL
  center: campground.geometry.coordinates, // starting position [lng, lat]
  zoom: 9 // starting zoom
});

// Create a new marker.
const marker = new mapboxgl.Marker()
  .setLngLat(campground.geometry.coordinates)
  .setPopup(
    new mapboxgl.Popup({ offset: 30 })
      .setHTML(`<h6>${campground.title}</h6><p><em>${campground.location}</em></p>`)
  )
  .addTo(map);



