var my = {
  map: L.map('main_map', {zoom: 13, minZoom: 3, maxZoom: 18, center: [53.347778, -6.259722]}),
  geoJSONFile: 'ulysses-1922_instances.geo.json',
  markersLayer: new L.FeatureGroup()
};

$.get("./text.html", function(data){
  if(typeof(data) === 'string'){
    $("#text_box").html(data); // how github.io sees it.
  }else{
    $("#text_box").html(data.activeElement.innerHTML); // how my local machine sees it.
  }
});

L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
  subdomains: 'abcd',
  maxZoom: 19
}).addTo(my.map);

$.getJSON('paths.geojson', function(data){
  console.log("Loading paths");
}).done(function(data){
  var paths = L.geoJSON(data, {
    onEachFeature: function(feature, layer){
      layer.bindTooltip(L.tooltip({opacity: 0.7}).setContent("Actor: " + feature.properties.actor));
    }
  });
  my.map.addLayer(paths);
}).fail(function (d, textStatus, error) {
  console.log("getJSON failed, status: " + textStatus + ", error: " + error)
});

$.getJSON(my.geoJSONFile, function(data) {
  console.log("Loading " + my.geoJSONFile);
}).done(function(data) {
  my.geoJSONData = data;
  //$('button', '#toolbar').prop("disabled", false);
  $('#play_btn').prop("disabled", false);
}).fail(function (d, textStatus, error) {
  console.log("getJSON failed, status: " + textStatus + ", error: " + error)
});

$('#play_btn').click(function(){
  var points = my.geoJSONData["features"];
  my.map.removeLayer(my.markersLayer); // so it doesn't duplicate itself
  my.markersLayer = new L.FeatureGroup();
  my.map.addLayer(my.markersLayer);
  var marker;
  for (var i = 0; i < points.length; i++) {
    window.setTimeout(animateMarker(points[i], marker, my.markersLayer), 500);
  }
});

function animateMarker(point, marker, markers){
  if (point["geometry"]["coordinates"][0] !== null) {
    if (point["properties"]["space"] === "1") {
      marker = L.marker([point["geometry"]["coordinates"][1], point["geometry"]["coordinates"][0]]).addTo(my.map);
      marker.bindTooltip(point["properties"]["place_name_in_text"]);
      markers.addLayer(marker);
    }
  }
}

var parseTime = d3.timeParse("%Y/%m/%d %H'%M'%S");

d3.csv("instances.csv", function(data) {
  my.instancesRaw = data;
  var instances = data.map(function(obj, i){
    var instance = {
      latitude: +obj.latitude,
      longitude: +obj.longitude,
      space: +obj.space,
      placeNameInText: obj.place_name_in_text,
      place: obj.place,
      time: parseTime("1904/06/16 " + obj.time),
      instanceId: "instance_" + obj.instance_id,
      placeId: +obj.place_id,
      order: i // so sorting by time doesn't break the narrative order.
    };
    return instance;
  });
  my.instances = instances;
});

d3.csv("collisions.csv", function(data) {
  my.collisionsRaw = data;
  var collisionsGeoJSON = {"type": "FeatureCollection", "features": []};
  var collisions = data.map(function(obj, i){
    if(obj.latitude === ""){ 
      // I was lazy about copying over lats and lons. It wouldn't be a
      // terrible idea to use the place id to pull in *all* lats and 
      // lons. That way, instances is always correct, and collisions
      // is only supplemental.
      var place = my.instances.filter(function (instance) {
        return instance.placeId === +obj.place_id;
      })[0];
      obj.latitude = place.latitude;
      obj.longitude = place.longitude;
    }
    collisionsGeoJSON.features.push(
      {
        "type": "Feature",
        "geometry": {"type": "Point",
          "coordinates": [+obj.longitude, +obj.latitude]},
        "properties": {
          "primaryActor": obj.primary_actor,
          "secondaryActor": obj.secondary_actor,
          "time": parseTime("1904/06/16 " + obj.time),
          "order": i // so sorting by time doesn't break the narrative order.
        }
      }
    );
  });
  my.collisionsGeoJSON = collisionsGeoJSON;

  var feature = g.selectAll("path")
    .data(collisionsGeoJSON.features)
    .enter().append("path")
    .classed("collision", true);

  my.map.on("viewreset", reset(g, feature, path));
  my.map.on("zoomend", reset(g, feature, path));
  reset(g, feature, path);

});

var svg = d3.select(my.map.getPanes().overlayPane).append("svg"),
  g = svg.append("g").attr("class", "leaflet-zoom-hide");

var transform = d3.geoTransform({point: projectPoint}),
  path = d3.geoPath().projection(transform);

var topLeftLatLng = [-6.32558, 53.3709];
var bottomRightLatLng = [-6.20398, 53.3284];

function projectPoint(x, y) {
  var point = my.map.latLngToLayerPoint(new L.LatLng(y, x));
  this.stream.point(point.x, point.y);
}

function LatLngToXY(arr){
  var latLng = my.map.latLngToLayerPoint(new L.LatLng(arr[1], arr[0]));
  // creates {x, y}
  return [latLng.x, latLng.y];
}

// Reposition the SVG to cover the features.
function reset(g, feature, path) {
  var bottomRight = LatLngToXY(bottomRightLatLng),
    topLeft = LatLngToXY(topLeftLatLng);
    
  svg.attr("width", bottomRight[0] - topLeft[0])
    .attr("height", bottomRight[1] - topLeft[1])
    .style("left", topLeft[0] + "px")
    .style("top", topLeft[1] + "px");

  g.attr("transform", "translate(" + -topLeft[0] + "," + -topLeft[1] + ")");
  feature.attr("d", path);
}

