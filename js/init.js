// First, initialize the constants.
var my = {
  showdownConverter: new showdown.Converter(),
  clockGlyph: '<span class="glyphicon glyphicon-time"></span>&nbsp;',
  timeFactor: 10,
  buffer: 90,
  lineHeight: 20,
  events: [],
  firingTimeEvents: [],
  firingLineEvents: [],
  geoJSONFile: 'ulysses-1922_instances.geo.json',
  formatTime: d3.utcFormat("%d %B %Y %H:%M:%S"),
  currentTimeIndex: 0,
  currentLineIndex: 0,
  markersLayer: new L.FeatureGroup(),
  colors: {
    inset: "rgba(27, 158, 119, 0.5)",
    instance: "rgba(217, 95, 2, 0.5)",
    collision: "rgba(117, 112, 179, 0.5)"
  },
  main: {
    map: L.map('main_map', {zoom: 13, minZoom: 3, maxZoom: 18, center: [53.335, -6.258]}),
    topLeft: [-6.34, 53.39],
    bottomRight: [-6.19, 53.30],
    firedCss: "fired-main"
  },
  inset: {
    map: L.map('inset_map', {zoom: 9, minZoom: 2, maxZoom: 18, center: [53.3406, -6.2445]}),// zoomControl: false}),// dragging: false}), 
    topLeft: [-170, 80],
    bottomRight: [170, -80],
    firedCss: "fired-inset"
  }
};

// The below is dying for refactoring.

// Add the leaflet tile layers.
my.main.tileLayer = L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(my.main.map);
my.inset.tileLayer = L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
      subdoinsets: 'abcd',
      maxZoom: 19
    }).addTo(my.inset.map);

// Now setup the d3 objects.
my.main.projectPoint = function(x, y){var point = my.main.map.latLngToLayerPoint(new L.LatLng(y, x)); this.stream.point(point.x, point.y);};
my.main.transform = d3.geoTransform({point: my.main.projectPoint});
my.main.path = d3.geoPath().projection(my.main.transform);
my.main.svg = d3.select(my.main.map.getPanes().overlayPane)
  .append("svg").attr("id", "mainSvg");
my.main.g = d3.select("#mainSvg").append("g")
      .attr("class", "leaflet-zoom-hide")
      .attr("id", "#mainG");
my.inset.projectPoint = function(x, y){var point = my.inset.map.latLngToLayerPoint(new L.LatLng(y, x)); this.stream.point(point.x, point.y);};
my.inset.transform = d3.geoTransform({point: my.inset.projectPoint});
my.inset.path = d3.geoPath().projection(my.inset.transform);
my.inset.svg = d3.select(my.inset.map.getPanes().overlayPane)
  .append("svg").attr("id", "insetSvg");
my.inset.g = d3.select("#insetSvg").append("g")
      .attr("class", "leaflet-zoom-hide")
      .attr("id", "#insetG");

// Read in the chapter text.
$.ajax({
  url: "text.html",
  success: function(text){
    $("#text_box").html(text)
  }
});

// Read in the markdown…
["fabulaandsjuzet", "wanderingrocks", "spacetime", "data", "tech", "further", "help"].forEach(function(section){
  $.ajax({
    url: "markdown/" + section + ".md", 
    success: function(text){
     var html = my.showdownConverter.makeHtml(text);
     $("#" + section).html(html);
    }
  });
});
