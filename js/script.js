d3.queue(1) // one task at a time.
  .defer(prepareInstances, "main")
  .defer(prepareInstances, "inset")
  .defer(prepareCollisions)
  .defer(preparePaths)
  .await(function(error, instances, inset, collisions, paths) {
    if (error) throw error;

    // The graphical elements
    createFeatures(my.main, [paths, instances, collisions]);
    createFeatures(my.inset, [inset]);

    // The time data
    my.events = instances.features
      .concat(inset.features)
      .concat(collisions.features)
      .map(function(feature){
        var path = feature.properties.instanceType === "inset" ? my.inset.path : my.main.path;
        return {
          instanceType: feature.properties.instanceType,
          id: feature.properties.id,
          time: feature.properties.time,
          path: path
        };
      }).sort(function(a, b){
        return a.time - b.time;
      });
    my.times = my.events.map(function(event){return event.time})
      .filter(function(value, index, self) {
        return self.indexOf(value) === index;
      });

    // The clock
    updateClock();

    // The event listeners.
    // some kind of de-disabling?
    d3.select("#step_forward_btn").on("click", function(){
      my.currentTimeIndex++;
      updateClock();
    });
    d3.select("#step_back_btn").on("click", function(){
      my.currentTimeIndex--;
      updateClock();
    });

  }); // close await()

function updateClock() {
  // The clock
  var glyph = '<span class="glyphicon glyphicon-time"></span>&nbsp;';
  if (my.currentTimeIndex < 0){
    my.currentTimeIndex = my.times.length - 1;
  } else if (my.currentTimeIndex >= my.times.length){
    my.currentTimeIndex = 0;
  }
  d3.select("#clock")
    .html(glyph + my.formatTime(new Date(my.times[my.currentTimeIndex])));

  // The graphical elements
    // The old
  d3.selectAll(".fired")
    .classed("fired", false);
    // The new
  var firingEvents = my.events.map(function(event){
    if (event.time === my.times[my.currentTimeIndex]) {
      return event;
    }
  }).filter(Boolean);
  firingEvents.forEach(function(event){
    d3.select("#" + event.id)
      .classed("fired", true)
      .transition()
      .duration(500)
      // .style("fill-opacity", 1)
      .attr("d", event.path.pointRadius(100))
      .transition()
      .duration(500)
      .attr("d", event.path.pointRadius(4.5))
  });
}

function createFeatures(mapObj, dataArray) {
  // mapObj is the my.main or my.inset object.
  // dataArray is [data, data]
  var features = dataArray.map(function(dataObj){
    return makeDotPaths(dataObj, mapObj);
  });
  mapObj.map.on("viewreset", reset);
  mapObj.map.on("zoomend", reset);
  reset();

  function reset() {
    var topLeft = LatLngToXY(mapObj.topLeft, mapObj.map),
      bottomRight = LatLngToXY(mapObj.bottomRight, mapObj.map);
    mapObj.svg.attr("width", bottomRight[0] - topLeft[0])
      .attr("height", bottomRight[1] - topLeft[1])
      .style("left", topLeft[0] + "px")
      .style("top", topLeft[1] + "px");
    mapObj.g.attr("transform", "translate(" + -topLeft[0] + "," + -topLeft[1] + ")");
    features.forEach(function(feature){
      feature.attr("d", mapObj.path);
    });
  } 
}

function LatLngToXY(arr, map) {
  var latLng = map.latLngToLayerPoint(new L.LatLng(arr[1], arr[0]));
  // creates {x, y}
  return [latLng.x, latLng.y];
}

function makeDotPaths(geojson, mapObj) {
    var feature = mapObj.g.selectAll("path" + "." + geojson.properties.css)
      .data(geojson.features)
      .enter().append("path")
      .attr("id", function(d){ return d.properties.id.toString().replace(/^(\d)/, "path_$1"); }) // so paths don't have IDs that are only numbers
      .classed(geojson.properties.css, true);
  return feature;
}
  
function prepareInstances(map, callback) {
  d3.csv("instances.csv", function(data) {
    var instancesGeoJSON = {"type": "FeatureCollection", "properties": {"css": map}, "features": []};
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
          "id": instanceType + "_" + obj.instance_id,
          "placeId": +obj.place_id,
          "time": d3.isoParse("1904-06-16T" + obj.time.replace(/'/g, ":") + ".000Z").getTime(),
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
    var collisionsGeoJSON = {"type": "FeatureCollection", "properties": {"css": "collision"}, "features": []};
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
          "id": "collision_" + obj.instance_id,
          "primaryActor": obj.primary_actor,
          "secondaryActor": obj.secondary_actor,
          "time": d3.isoParse("1904-06-16T" + obj.time.replace(/'/g, ":") + ".000Z").getTime(),
          "order": i // so sorting by time doesn't break the narrative order.
        }
      };
    });
    my.collisionsGeoJSON = collisionsGeoJSON;
    callback(null, collisionsGeoJSON);
  });
}

function preparePaths(callback) {
  d3.json("paths.geojson", function(error, paths) {
    if (error) throw error;
    callback(null, paths);
  });
}

