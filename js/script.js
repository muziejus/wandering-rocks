d3.queue(1) // one task at a time.
  .defer(prepareInstances, "main")
  .defer(prepareInstances, "inset")
  .defer(prepareCollisions)
  .defer(preparePaths)
  .await(function(error, instances, inset, collisions, paths) {
    if (error) throw error;

    createFeatures(my.main, 
      [[instances, "instance"], [paths, "trail"], [collisions, "collision"]]
    );
      
    createFeatures(my.inset,
      [[inset, "inset"]]
    );

    my.events = instances.features
      .concat(inset.features)
      .concat(collisions.features)
      .map(function(feature){
        return {
          instanceType: feature.properties.instanceType,
          instanceId: feature.properties.instanceId,
          time: feature.properties.time
        };
      }).sort(function(a, b){
        return a.time - b.time;
      });

    my.times = my.events.map(function(event){return event.time})
      .filter(function(value, index, self) {
        return self.indexOf(value) === index;
      });

    updateClock(my.currentTimeIndex);

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

function updateClock(path) {
  var glyph = '<span class="glyphicon glyphicon-time"></span>&nbsp;';
  if (my.currentTimeIndex < 0){
    my.currentTimeIndex = my.times.length - 1;
  } else if (my.currentTimeIndex >= my.times.length){
    my.currentTimeIndex = 0;
  }
  d3.select("#clock")
    .html(glyph + my.formatTime(new Date(my.times[my.currentTimeIndex])));

  // d3.selectAll(".fired")
  //   .transition()
  //   .duration(1000)
  //   .attr("r", "10")
  //   .classed("fired", false);

  var firingEvents = my.events.map(function(event){
    if (event.time === my.times[my.currentTimeIndex]) {
      return event.instanceId;
    }
  }).filter(Boolean);
  
  console.log(path);

  firingEvents.forEach(function(id){
    d3.select("#" + id)
      .classed("fired", true)
      .transition()
      .duration(1000)
      .attr("fill", "#00d")
      .attr("r", "10")
  });

}

function createFeatures(mapObj, dataArray) {
  // mapObj is the my.main or my.inset object.
  // dataArray is [[data, cssClass], [data, cssClass]]

  var features = dataArray.map(function(obj){
    return makeDotPaths(obj[0], obj[1], mapObj);
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
    // d3.selectAll("path")
    //   .attr("d", mapObj.path)

    // d3.selectAll("circle")//.each(function(d) {
    //   .classed("reset", true);

      // var latLng = LatLngToXY([d.geometry.coordinates[0], d.geometry.coordinates[1]]);
      // d3.select("#" + d.properties.instanceId)
      //   .attr("cx", latLng[0])
      //   .attr("cy", latLng[1]);
    // });

  } 

}

function LatLngToXY(arr, map) {
  var latLng = map.latLngToLayerPoint(new L.LatLng(arr[1], arr[0]));
  // creates {x, y}
  return [latLng.x, latLng.y];
}

function makeDotPaths(geojson, cssClass, mapObj) {
  // if (geojson.features[0].geometry.type === "Point"){
  //   function convert(d){
  //     var longitude = d.geometry.coordinates[0],
  //       latitude = d.geometry.coordinates[1],
  //       latLng = new L.LatLng(latitude, longitude);
  //     // console.log(d.properties.instanceId);
  //     // console.log("lon lat: " + longitude + ", " + latitude);
  //     // console.log(latLng);
  //     var newpoint = map.latLngToLayerPoint(latLng);
  //     // console.log(newpoint);
  //     return newpoint;
  //   }
    
  //   var feature = g.selectAll("circle." + cssClass)
  //     .data(geojson.features)
  //     .enter().append("circle")
  //     .attr("id", function(d){ return d.properties.instanceId; })
  //     .attr("data-latitude", function(d){ return d.geometry.coordinates[1]; })
  //     .attr("data-longitude", function(d){ return d.geometry.coordinates[0]; })
  //     .attr("cx", function(d){ var newpoint = convert(d); console.log(d, newpoint); return newpoint.x; })
  //     .attr("cy", function(d){ var newpoint = convert(d); console.log(d, newpoint); return newpoint.y; })
  //     .attr("r", 5)
  //     .classed(cssClass, true);
  // } else {
    var feature = mapObj.g.selectAll("path" + "." + cssClass)
      .data(geojson.features)
      .enter().append("path")
      .attr("id", function(d){ return "path_" + d.properties.id; })
      .classed(cssClass, true);
  // }
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

