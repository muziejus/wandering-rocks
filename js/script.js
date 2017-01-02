d3.queue(1) // one task at a time.
  .defer(prepareInstances, "main")
  .defer(prepareInstances, "inset")
  .defer(prepareCollisions)
  .defer(preparePaths)
  .await(function(error, instances, inset, collisions, paths) {
    if (error) throw error;

    // The graphical elements
    createFeatures(my.main, [paths, collisions, instances]);
    createFeatures(my.inset, [inset]);

    // The fabula data
    my.timesEvents = instances.features
      .concat(inset.features)
      .concat(collisions.features)
      .map(function(feature){
        return {
          id: feature.properties.id,
          time: feature.properties.time,
          latLng: L.latLng(feature.geometry.coordinates[1], feature.geometry.coordinates[0]),
          zoom: feature.properties.zoom
        };
      }).sort(function(a, b){
        return a.time - b.time;
      });
    my.times = my.timesEvents.map(function(event){return event.time})
      .filter(function(value, index, self) {
        return self.indexOf(value) === index;
      });
    my.times.forEach(function(time){ // using map and filter doesn't work here…
      var events = [];
      my.timesEvents.forEach(function(event){
        if(event.time === time){
          events.push(event);
        }
      });
      if (events.length > 0){
        my.firingTimeEvents.push(events);
      };
    });

    // The sjužet data
    // Note, sjužet data comes in from pulling the text. my.events is based on what comes from the csvs.
    my.linesEvents = []; // map won't work presumably because of the two returns...?
    $(".place").each(function() {
      var id = this.id;
      var event = my.timesEvents.filter(function(event){
        return event.id.substr(event.id.length - 5, event.id.length - 1) === id.substr(id.length - 5, id.length - 1);
      });
      event[0].line = $("#" + id).position().top;
      my.linesEvents.push(event[0]);
    });
    my.lines = my.linesEvents.map(function(event){return event.line;})
      .filter(function(value, index, self) {
        return self.indexOf(value) === index;
      });
    my.lines.forEach(function(line){
      var events = [];
      my.linesEvents.forEach(function(event){
        if(event.line === line){
          events.push(event);
        }
      });
      if (events.length > 0){
        my.firingLineEvents.push(events);
      };
    });
    
    // The clock
    d3.select("#clock")
      .html(my.clockGlyph + my.formatTime(new Date(my.times[0])));

    // The event listeners.
      // The buttons
    d3.select("#step_forward_btn").on("click", function(){
      pause();
      stepForward();
    });
    d3.select("#step_back_btn").on("click", function(){
      pause();
      stepBackward();
    });
    d3.select("#play_btn").on("click", function(){
      play();
    });
    d3.select("#pause_btn").on("click", function(){
      pause();
    });
    
      // The map
    $("path").on("click", function(){
      pause();
      scrollTo($(this).attr("id"));
    });
    
      // The textbox
    $(".place").on("click", function(){
      pause();
      var idNum = $(this).attr("id").replace(/^.*_/, ""),
        event = my.timesEvents.filter(function(ev) {
          return ev.id.match(new RegExp("_" + idNum + "$"));
        })[0];
      my.currentTimeIndex = my.times.indexOf(event.time);
      updateClock();
      fireEvents(my.firingTimeEvents[my.currentTimeIndex]);
    });

  }); // close await()

function playFabula() {
  var timeOut = 1000 / my.timeFactor;
  var time = my.time ? my.time : my.times[0];
  if (time === my.times[my.times.length - 1]){
    time = my.times[0];
  };
  my.interval = setInterval(function(){
    if (time === my.times[my.times.length - 1]){
      clearInterval(my.interval);
      d3.select("#play_btn")
        .classed("active", false);
    };
    if (time === my.times[my.currentTimeIndex]){
      fireEvents(my.firingTimeEvents[my.currentTimeIndex], true);
      if (my.currentTimeIndex === my.times.length - 1){
        my.currentTimeIndex = 0;
      } else {
        my.currentTimeIndex++;
      };
    };
    updateClock(time);
    time = time + 1000;
  }, timeOut);
}

function playSjuzet() {
  // var line = my.line ? my.line : my.lines[0];
  console.log("playing sjuzet");
  var boxMax = my.lines[my.lines.length - 1],
    totalTime = 650000 / my.timeFactor,
    boxRemaining = boxMax - $('#text_box').scrollTop(),
    boxRemainingPct = boxRemaining / boxMax;
    timeRemainingPct = boxRemainingPct * totalTime;
  console.log(boxMax);
  $("#text_box").animate({scrollTop: boxMax}, timeRemainingPct, "linear");
}

function fireEvents(firingEvents, scroll){
  deFireDot();
  firingEvents.forEach(function(event){
    fireDot(event);
      if (scroll){
      setTimeout(function(){
        scrollTo(event.id);
      }, 2500 / my.timeFactor);
    }
  });
}

function scrollTo(eventId){
  if (typeof(eventId) === "string") {
    var id = eventId.replace(/inset/, "instance");
    var scrollFactor = $("#text_box").scrollTop() + $("#text_" + id).position().top - 80;
    $("#text_box").animate({
      scrollTop: scrollFactor
    }, 2500 / my.timeFactor);
  }
}

function updateClock(epochTime) {
  if (my.currentTimeIndex < 0){
    my.currentTimeIndex = my.times.length - 1;
  } else if (my.currentTimeIndex >= my.times.length){
    my.currentTimeIndex = 0;
  }
  if (epochTime) {
    my.time = epochTime;
  } else {
    my.time = my.times[my.currentTimeIndex];
  }
  d3.select("#clock")
    .html(my.clockGlyph + my.formatTime(new Date(my.time)));
}

function fireDot(event){
  if (event.id.match(/set/)){
    var bg = my.colors.inset,
      path = my.inset.path;
  } else {
    var path = my.main.path;
    if (event.id.match(/coll/)){
      var bg = my.colors.collision;
    } else {
      var bg = my.colors.instance;
    }
  }
  d3.select("#text_" + event.id.replace(/inset/, "instance"))
    .classed("fired-text", true)
    .transition()
    .duration(4000 / my.timeFactor)
    .style("background-color", bg);
  if (event.id.match(/set/)) {
    my.inset.map.setView(event.latLng, +event.zoom, {animate: false, duration: 0});
  }
  d3.select("#" + event.id)
    .classed("fired", true)
    .style("cursor", "pointer")
    .style("pointer-events", "visibleFill")
    .style("fill", bg)
    .style("fill-opacity", 0.9)
    .style("stroke-opacity", 0.9)
    .transition()
    .duration(3500 / my.timeFactor)
    .style("fill-opacity", 0.25)
    .style("stroke-opacity", 0.1)
    .attr("d", path.pointRadius(100))
    // .on('end', function(){
    //   d3.select("#" + event.id)
    .transition()
    .duration(3500 / my.timefactor)
    .style("fill-opacity", 0.9)
    .style("stroke-opacity", 0.9)
    .attr("d", path.pointRadius(4.5));
    // });
}

function deFireDot(){
  var finalOpacity = $('#dotToggle').is(":checked") ? .5 : 0;
  d3.selectAll(".fired")
    .classed("fired", false)
    // .attr("d", function(d){
    //   var path = d.properties.id.match(/set/) ?  my.inset.path : my.main.path;
    //   return path.pointRadius(4.5);
    // })
    .style("pointer-events", "none")
    .style("cursor", "auto")
    .transition()
    .duration(function(d){if(d.properties.instanceType === "instance"){ return 50000 / my.timeFactor; } else { return 10000 / my.timeFactor;}})
    .style("fill-opacity", finalOpacity)
    .style("stroke-opacity", finalOpacity);
  d3.selectAll(".fired-text")
    .classed("fired-text", false)
    .transition()
    .duration(25000 / my.timeFactor)
    .style("background-color", "transparent");
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
      .classed(geojson.properties.css, true)
      .classed("dot", true);
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
          "zoom": obj.zoom,
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
  my.ia = instancesArray;
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

function play() {
  if ($("#fsToggle").is(":checked")){
    playFabula();
  } else {
    playSjuzet();
  }
  d3.select("#play_btn")
    .classed("active", true);
  d3.select("#pause_btn")
    .attr("disabled", null)
    .classed("active", false);
}

function pause() {
  $("#fsToggle").is(":checked") ? clearInterval(my.interval) : $('#text_box').stop();
  d3.select("#play_btn")
    .classed("active", false);
  d3.select("#pause_btn")
    .classed("active", true);
}

function stepForward() {
  if ($("#fsToggle").is(":checked")){
    my.currentTimeIndex++;
    updateClock();
    fireEvents(my.firingTimeEvents[my.currentTimeIndex], true);
  } else {

  }
}

function stepBackward() {
  if ($("#fsToggle").is(":checked")){
    my.currentTimeIndex--;
    updateClock();
    fireEvents(my.firingTimeEvents[my.currentTimeIndex], true);
  } else {

  }
}

$("#fsToggle").change(function() {
  if (!$(this).is(":checked")) {
    $('#text_box').on("scroll", function() {
      console.log($('#text_box').scrollTop());
    });
  } else {
    $('#text_box').off("scroll");
  }
});

