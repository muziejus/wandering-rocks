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


d3.queue(1) // one task at a time.
  .defer(prepareInstances)
  //.defer(prepareInset)
  .defer(prepareCollisions)
  .await(function(error, instances, collisions) {
    if (error) throw error;

    var svg = d3.select(my.map.getPanes().overlayPane).append("svg").attr("id", "d3Pane"),
      g = svg.append("g").attr("class", "leaflet-zoom-hide");
      transform = d3.geoTransform({point: projectPoint}),
      path = d3.geoPath().projection(transform);
      topLeftLatLng = [-6.34, 53.39];
      bottomRightLatLng = [-6.19, 53.30];

    var features = [makeDotPaths(instances, "instance", g), makeDotPaths(collisions, "collision", g)];

    my.map.on("viewreset", reset);
    my.map.on("zoomend", reset);
    reset();

    function reset() {
      var topLeft = LatLngToXY(topLeftLatLng);
        bottomRight = LatLngToXY(bottomRightLatLng),

      svg.attr("width", bottomRight[0] - topLeft[0])
        .attr("height", bottomRight[1] - topLeft[1])
        .style("left", topLeft[0] + "px")
        .style("top", topLeft[1] + "px");
      g.attr("transform", "translate(" + -topLeft[0] + "," + -topLeft[1] + ")");

      features.forEach(function(feature){
        feature.attr("d", path);
      });
    } 

  });

function makeDotPaths(geojson, cssClass, g) {
  var feature = g.selectAll("path." + cssClass)
    .data(geojson.features)
    .enter().append("path")
    .classed(cssClass, true);
  return feature;
}
  
var parseTime = d3.timeParse("%Y/%m/%d %H'%M'%S");

function projectPoint(x, y) {
  var point = my.map.latLngToLayerPoint(new L.LatLng(y, x));
  this.stream.point(point.x, point.y);
}

function LatLngToXY(arr) {
  var latLng = my.map.latLngToLayerPoint(new L.LatLng(arr[1], arr[0]));
  // creates {x, y}
  return [latLng.x, latLng.y];
}

function prepareInstances(callback) {
  d3.csv("instances.csv", function(data) {
    var instancesGeoJSON = {"type": "FeatureCollection", "features": []};
    var instances = data.map(function(obj, i){
      if (+obj.space === 1) {
        instancesGeoJSON.features.push(
          {
            "type": "Feature",
            "geometry": {"type": "Point",
              "coordinates": [+obj.longitude, +obj.latitude]},
            "properties": {
              "space": 1,
              "placeNameInText": +obj.place_name_in_text,
              "place": obj.place,
              "instaceId": "instance_" + obj.instace_id,
              "placeId": +obj.place_id,
              "time": parseTime("1904/06/16 " + obj.time),
              "order": i // so sorting by time doesn't break the narrative order.
            }
          }
        );
        return {
          latitude: +obj.latitude,
          longitude: +obj.longitude,
          placeId: +obj.place_id,
        };
      }
    });
    my.instances = instances.filter(Boolean); // this is the list against which the collision checks.
    my.instancesGeoJSON = instancesGeoJSON;
    callback(null, instancesGeoJSON);
  });
}

function prepareCollisions(callback) {
  d3.csv("collisions.csv", function(data) {
    var collisionsGeoJSON = {"type": "FeatureCollection", "features": []};
    collisionsGeoJSON.features = data.map(function(obj, i){
      if (obj.latitude === "") { 
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
      return {
        "type": "Feature",
        "geometry": {"type": "Point",
          "coordinates": [+obj.longitude, +obj.latitude]},
        "properties": {
          "primaryActor": obj.primary_actor,
          "secondaryActor": obj.secondary_actor,
          "time": parseTime("1904/06/16 " + obj.time),
          "order": i // so sorting by time doesn't break the narrative order.
        }
      };
    });
    my.collisionsGeoJSON = collisionsGeoJSON;
    callback(null, collisionsGeoJSON);
  });
}
