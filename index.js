import 'ol/ol.css';
import Map from 'ol/Map';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import View from 'ol/View';
import XYZ from 'ol/source/XYZ';
import {fromLonLat} from 'ol/proj';
import {getRenderPixel} from 'ol/render';
import $ from "jquery";
import Feature from 'ol/Feature';
import {circular} from 'ol/geom/Polygon';
import Point from 'ol/geom/Point';
import {containsXY} from 'ol/extent';
import 'bootstrap';


// on the page load open the information modal
$('#aboutModal').modal('show');

var key = 'pk.eyJ1IjoicmNvd2xpbmciLCJhIjoiY2lzZ2YwcjZtMDFwdzNvcnQ3bmR3NXFhcCJ9.TI01a_YqNaqKWigFu70x7w';
var attributions =
  '<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> ' +
  '<a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>';

var imagery = new TileLayer({
  source: new XYZ({
    attributions: attributions,
    url: 'https://api.mapbox.com/v4/rcowling.2pl2vmye/{z}/{x}/{y}@2x.png?access_token=' + key,
    tileSize: 256,
    maxZoom: 22,
  }),
});
// old tile url: 'https://api.mapbox.com/v4/rcowling.8ta5jhuo/{z}/{x}/{y}@2x.png?access_token='
var imagery2 = new TileLayer({
  source: new XYZ({
    attributions: attributions,
    url: 'https://api.mapbox.com/v4/rcowling.2pl2vmye/{z}/{x}/{y}@2x.png?access_token=' + key,
    tileSize: 256,
    maxZoom: 22,
  }),
});

var roads = new TileLayer({
  source: new XYZ({
    attributions: attributions,
    url: 'https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v11/tiles/{z}/{x}/{y}@2x?access_token=' + key,
    tileSize: 512,
    maxZoom: 22,
  }),
});

// Create a source for to show the GPS location
var source = new VectorSource();
var gpsLayer = new VectorLayer({
  source: source
});

var container = document.getElementById('map');

var view = new View({
    center: fromLonLat([-88.4529, 46.7566]),
    zoom: 18,
  });

var map = new Map({
  layers: [roads, imagery, gpsLayer],
  target: container,
  view: view
});

//var extent = map.getView().calculateExtent(map.getSize());
//console.log(extent);
function spyGlass () {  
  var radius = 175;
  document.addEventListener('keydown', function (evt) {
    if (evt.which === 38) {
      radius = Math.min(radius + 5, 150);
      map.render();
      evt.preventDefault();
    } else if (evt.which === 40) {
      radius = Math.max(radius - 5, 25);
      map.render();
      evt.preventDefault();
    }
  });

  // get the pixel position with every move
  var mousePosition = null;

  container.addEventListener('mousemove', function (event) {
    mousePosition = map.getEventPixel(event);
    map.render();
  });

  container.addEventListener('mouseout', function () {
    mousePosition = null;
    map.render();
  });

  // before rendering the layer, do some clipping
  imagery.on('prerender', function (event) {
    var ctx = event.context;
    ctx.save();
    ctx.beginPath();
    if (mousePosition) {
      // only show a circle around the mouse
      var pixel = getRenderPixel(event, mousePosition);
      var offset = getRenderPixel(event, [
        mousePosition[0] + radius,
        mousePosition[1] ]);
      var canvasRadius = Math.sqrt(
        Math.pow(offset[0] - pixel[0], 2) + Math.pow(offset[1] - pixel[1], 2)
      );
      ctx.arc(pixel[0], pixel[1], canvasRadius, 0, 2 * Math.PI);
      ctx.lineWidth = (5 * canvasRadius) / radius;
      ctx.strokeStyle = 'rgba(0,0,0,0.5)';
      ctx.stroke();
    }
    ctx.clip();    
  });

  // after rendering the layer, restore the canvas context
  imagery.on('postrender', function (event) {
    var ctx = event.context;
    ctx.restore();
  });
}; // end of spyGlass function

// set the names of the layers
imagery.set('name', 'imagery');
imagery2.set('name', 'imagery2');

// when the spyglass button is clicked run the spyglass function
// remove the opacity imagery layer
$("#spyBtn").click( function() {
  // when the spy button is clicked hide the slider
  $(".slider").hide();
  $("#spyAlert").show();
  // set the opacity back to 100
  imagery.setOpacity(100);
  slider.value = 100;
  map.getLayers().forEach(function (layer) {    
    if (layer.get('name') == 'imagery2') {
        map.removeLayer(imagery2);
        map.addLayer(imagery);        
    }
  });  
   spyGlass();  
});

// When the opacity button is clicked add the alternative imagery layer
$("#opacBtn").click ( function () {
  $(".slider").show(); 
  $("#spyAlert").hide(); 
  // set the opacity back to 100
  imagery2.setOpacity(100);
  slider.value = 100;
  slider.oninput = function() {
    imagery2.setOpacity(this.value / 100); 
  }
  map.getLayers().forEach(function (layer) {    
    if (layer.get('name') == 'imagery') {
        //map.removeLayer(imagery2);
        map.removeLayer(imagery);
        map.addLayer(imagery2);
    }     
  });  
});  

$(".nav-link").click ( function () {
  $('#aboutModal').modal('show');
});

var slider = document.getElementById("myRange");
var val = slider.value;

// Update the sanborn layers opacity (each time you drag the slider handle)
slider.oninput = function() {
 imagery.setOpacity(this.value / 100);  
}

// When an item is selected from the dropdown menu zoom to its location
$( ".custom-select" ).change(function(evt) {
  if (evt.target.value === "lhs") {    
    view.setCenter(fromLonLat([-88.44941245354919, 46.75749572656625]));
    view.setZoom(18);
  } else if (evt.target.value === "court") {
    view.setCenter(fromLonLat([-88.45311796075435, 46.757867204197]));
    view.setZoom(18);
  } else if (evt.target.value === "lpgs") {
    view.setCenter(fromLonLat([-88.45143389231637, 46.75774951346722]));
    view.setZoom(18);
  } else if (evt.target.value === "post") {
    view.setCenter(fromLonLat([-88.45363483924818, 46.758071140056245]));
    view.setZoom(18);
  } else if (evt.target.value === "jail") {
    view.setCenter(fromLonLat([-88.45332307153872, 46.75771516231458]));
    view.setZoom(18);
  } else if (evt.target.value === "saw") {
    view.setCenter(fromLonLat([-88.45853043756406, 46.75539447429435]));
    view.setZoom(18);
  } else if (evt.target.value === "sacred") {
    view.setCenter(fromLonLat([-88.45030384130378, 46.75427739696923]));
    view.setZoom(18);
  } else if (evt.target.value === "mchurch") {
    view.setCenter(fromLonLat([-88.45114059509795, 46.759869365942166]));
    view.setZoom(18);
  } else if (evt.target.value === "hwydep") {
    view.setCenter(fromLonLat([ -88.44280188273223, 46.74855510903387]));
    view.setZoom(18);
  }
});

// Add geolocation from the browser's geolocation API
navigator.geolocation.watchPosition(function(pos) {
  const coords = [pos.coords.longitude, pos.coords.latitude];
  const accuracy = circular(coords, pos.coords.accuracy);
  source.clear(true);
  source.addFeatures([
    new Feature(accuracy.transform('EPSG:4326', map.getView().getProjection())),
    new Feature(new Point(fromLonLat(coords)))
  ]);  
}, function(error) {
  alert(`ERROR: ${error.message}`);
}, {
  enableHighAccuracy: true
});

// When the locate button is clicked display the users geolocation
$("#locateBtn").click ( function () {
  if (!source.isEmpty()) {
    map.getView().fit(source.getExtent(), {
      maxZoom: 18,
      duration: 500
    });

    //Get the array of features fr
    var features = gpsLayer.getSource().getFeatures();

    // Go through this array and get coordinates of their geometry.
    features.forEach(function(feature) {
       var featCoords = feature.getGeometry().getCoordinates();
       // the approximate extent of the sanborn map layer
      var extent = [-88.464857,46.751452,-88.43492,46.768974];
      // if the user is not within the extent of the sanborn maps display an alert
      var isWithin = containsXY(extent, featCoords);
      if (isWithin == false) {    
        document.getElementById("gpsAlert").style.visibility = "visible";
      }
    });    
  } 
});

// if the user clicks the map, hide the spy glass alert
map.on('click', function(e) {
  $("#spyAlert").hide();
});

// if the users clicks the return to map link
// hide the gps alert and zoom to the default map view
$("#maplink").click ( function () {
  document.getElementById("gpsAlert").style.visibility = "hidden";
  view.setCenter(fromLonLat([-88.4529, 46.7566]));
  view.setZoom(18);
});

// hide the spy glass and gps alerts by default
$("#spyAlert").hide();





