var my = {
  map: L.map('main_map', {zoom: 13, minZoom: 3, maxZoom: 18, center: [53.347778, -6.259722]}),
  inset: L.map('inset_map', {zoom: 1, minZoom: 1, maxZoom: 18, center: [40, -40], zoomControl: false, dragging: false}), 
  geoJSONFile: 'ulysses-1922_instances.geo.json',
  parseTime: d3.timeParse("%Y/%m/%d %H'%M'%S"),
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

L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
  // attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
  subdomains: 'abcd',
  maxZoom: 19
}).addTo(my.inset);

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
  .defer(prepareInstances, "main")
  .defer(prepareInstances, "inset")
  .defer(prepareCollisions)
  .defer(preparePaths)
  .await(function(error, instances, inset, collisions, paths) {
    if (error) throw error;

    createFeatures(my.map, 
      [[instances, "instance"], [paths, "trail"], [collisions, "collision"]], 
      [[-6.34, 53.39], [-6.19, 53.30]]
    );
      
    createFeatures(my.inset,
      [[inset, "inset"]],
      [[-170, 80], [170, -80]]
    );

  });

function createFeatures(map, dataArray, cornersArray) {
  // map is the leaflet map
  // dataArray is [[data, cssClass], [data, cssClass]]
  // cornersArray is [topLeft[lon, lat], bottomRight[lon, lat]]
  var svg = d3.select(map.getPanes().overlayPane).append("svg"),
    g = svg.append("g").attr("class", "leaflet-zoom-hide"),
    transform = d3.geoTransform({point: projectPoint}),
    path = d3.geoPath().projection(transform),
    topLeft = LatLngToXY(cornersArray[0]),
    bottomRight = LatLngToXY(cornersArray[1]);

  var features = dataArray.map(function(obj){
    return makeDotPaths(obj[0], obj[1], g);
  });

    map.on("viewreset", reset);
    map.on("zoomend", reset);
    reset();

  function reset() {
    svg.attr("width", bottomRight[0] - topLeft[0])
      .attr("height", bottomRight[1] - topLeft[1])
      .style("left", topLeft[0] + "px")
      .style("top", topLeft[1] + "px");
    g.attr("transform", "translate(" + -topLeft[0] + "," + -topLeft[1] + ")");

    features.forEach(function(feature){
      feature.attr("d", path);
    });
  } 

  function projectPoint(x, y) {
    var point = map.latLngToLayerPoint(new L.LatLng(y, x));
    this.stream.point(point.x, point.y);
  }

  function LatLngToXY(arr) {
    var latLng = map.latLngToLayerPoint(new L.LatLng(arr[1], arr[0]));
    // creates {x, y}
    return [latLng.x, latLng.y];
}

}

  

function makeDotPaths(geojson, cssClass, g) {
  var feature = g.selectAll("path." + cssClass)
    .data(geojson.features)
    .enter().append("path")
    .classed(cssClass, true);
  return feature;
}
  

function prepareInstances(map, callback) {
  d3.csv("instances.csv", function(data) {
    var instancesGeoJSON = {"type": "FeatureCollection", "features": []};
    if (map === "main") {
      var instancesArray = prepareInstancesBySpace(data, instancesGeoJSON, 1);
      my.instances = instancesArray.filter(Boolean); // this is the list against which the collision checks.
      my.instancesGeoJSON = instancesGeoJSON;
    } else {
      prepareInstancesBySpace(data, instancesGeoJSON, 0);
    }
    callback(null, instancesGeoJSON);
  });
}

function prepareInstancesBySpace(data, geojson, spaceNum) { 
  var instancesArray = data.map(function(obj, i){
    var instanceType = "";
    if (spaceNum === 1){
      instanceType = "instance";
    } else {
      instanceType = "inset";
    }
    if (spaceNum === +obj.space){
      var instance = {
        "type": "Feature",
        "geometry": {"type": "Point",
          "coordinates": [+obj.longitude, +obj.latitude]},
        "properties": {
          "instanceType": instanceType,
          "space": +obj.space,
          "placeNameInText": +obj.place_name_in_text,
          "place": obj.place,
          "instanceId": instanceType + "_" + obj.instance_id,
          "placeId": +obj.place_id,
          "time": my.parseTime("1904/06/16 " + obj.time),
          "order": i // so sorting by time doesn't break the narrative order.
        }
      }
      geojson.features.push(instance);
      if (spaceNum === 1) {
        var returnObj = {
          latitude: +obj.latitude,
          longitude: +obj.longitude,
          placeId: +obj.place_id,
        };
        return returnObj;
      }
    }
  });
  return instancesArray;
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
          "instanceType": "collision",
          "instanceId": "collision_" + obj.instance_id,
          "primaryActor": obj.primary_actor,
          "secondaryActor": obj.secondary_actor,
          "time": my.parseTime("1904/06/16 " + obj.time),
          "order": i // so sorting by time doesn't break the narrative order.
        }
      };
    });
    my.collisionsGeoJSON = collisionsGeoJSON;
    callback(null, collisionsGeoJSON);
  });
}

function prepareTimedArray(dataArray) {

// tsArray = [instances, inset, collisions].forEach(function(array){

//    n   k
}

function preparePaths(callback) {
  d3.json("paths.geojson", function(error, paths) {
    if (error) throw error;
    callback(null, paths);
  });
}

