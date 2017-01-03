// $('#modal').modal('show')
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

    // The events
    my.features = instances.features
      .concat(inset.features)
      .concat(collisions.features);
    $(".place").each(function() {
      var id = this.id.replace(/^text_/, "");
      var feature = my.features.filter(function(f){
        return f.properties.id === id;
      })[0];
      my.events.push({
        id: feature.properties.id,
        time: feature.properties.time,
        line: $("#text_" + id).position().top,
        latLng: L.latLng(feature.geometry.coordinates[1], feature.geometry.coordinates[0]),
        zoom: feature.properties.zoom
      });
    });
 
    // The fabula data
    my.timesEvents = my.events.sort(function(a, b){
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
    my.linesEvents = my.events.sort(function(a, b){
      return a.line - b.line;
    });
    my.lines = my.events.map(function(event){return event.line;})
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
      stepForward();
    });
    d3.select("#step_back_btn").on("click", function(){
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
      var id = $(this).attr("id").replace(/^text_/, ""),
        event = my.timesEvents.filter(function(ev) {
          return ev.id === id;
        })[0];
      updateIndices(event);
      updateClock();
      fireEvents(my.firingTimeEvents[my.currentTimeIndex]);
    });

    $("#fsToggle").change(function() {
      if (!$(this).is(":checked")) {
        // $('#text_box').on("scroll", function() {
        //   // console.log($('#text_box').scrollTop());
        //   // update some scroll container variable.
        // });
      } else {
        getSjuzetPosition(90);
        var time = my.firingLineEvents[my.currentLineIndex][0].time
        nextEvents = my.times.filter(function(t){
          return t >= time;
        });
        my.currentTimeIndex = my.times.indexOf(nextEvents[0]);
        // $('#text_box').off("scroll");
      }
    });

  }); // close await()

function playFabula() {
  var interval = 1000 / my.timeFactor;
  var time = my.time ? my.time : my.times[0];
  if (time === my.times[my.times.length - 1]){
    time = my.times[0];
  };
  my.interval = setInterval(function(){
    if (time === my.times[my.times.length - 1]){
      stop();
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
  }, interval);
}

function playSjuzet() {
  var boxMax = my.lines[my.lines.length - 1],
    totalTime = 3900000 / my.timeFactor, // 65 mins = 3900000 milliseconds
    boxRemaining = boxMax - $('#text_box').scrollTop(),
    boxRemainingPct = boxRemaining / boxMax,
    timeRemainingPct = boxRemainingPct * totalTime,
    interval = (my.lineHeight * totalTime)/boxMax,
    line = getSjuzetPosition(my.buffer);
  line = line + my.lineHeight;
  $("#text_box").scrollTop(line); // no continuous scroll.
  // $("#text_box").animate({scrollTop: line}, interval, "linear");
  my.interval = setInterval(function(){
    if (line >= my.lines[my.lines.length - 1]){
      stop();
    };
    if (my.lines[my.currentLineIndex] <= (line + my.buffer) && (line + my.buffer) < (my.lines[my.currentLineIndex] + my.lineHeight)){
      fireEvents(my.firingLineEvents[my.currentLineIndex]);
      updateClock(my.firingLineEvents[my.currentLineIndex][0].time);
      if (my.currentLineIndex === my.lines.length - 1){
        my.currentLineIndex = 0;
      } else {
        my.currentLineIndex++;
      };
    };
    line = line + my.lineHeight;
    my.line = line;
    $("#text_box").scrollTop(line); // no continuous scroll.
    // $("#text_box").animate({scrollTop: line}, interval, "linear");
  }, interval);
}

function fireEvents(firingEvents, scroll){
  if (firingEvents.length == 1){
    var css = firingEvents[0].id.match(/set/) ? my.inset.firedCss : my.main.firedCss ;
    deFireAll(css);
  } else {
    var insetEvents = firingEvents.filter(function(ev){ 
      return ev.id.match(/set/) 
    });
    if (insetEvents.length === 0){ // no inset events
      deFireAll(my.main.firedCss);
    } else if (insetEvents.length === firingEvents.length){ // all inset events
      deFireAll(my.inset.firedCss);
    } else { // mixed between inset and main
      deFireAll();
    }
  }
  firingEvents.forEach(function(event){
    fireDot(event);
      if (scroll){
      setTimeout(function(){
        scrollTo(event.id);
      }, 2500 / my.timeFactor);
    }
  });
}

function scrollTo(id){
  if (typeof(id) === "string") {
    var scrollFactor = $("#text_box").scrollTop() + $("#text_" + id).position().top - my.buffer;
    $("#text_box").animate({
      scrollTop: scrollFactor
    }, 2500 / my.timeFactor);
  }
}

function getSjuzetPosition(buffer) {
  var line = $("#text_box").scrollTop(),
    nextEvents = my.lines.filter(function(l){
      return l >= line + buffer;
    });
  my.currentLineIndex = my.lines.indexOf(nextEvents[0]);
  return line;
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
      css = my.inset.firedCss,
      path = my.inset.path;
  } else {
    var path = my.main.path,
      css = my.main.firedCss;
    if (event.id.match(/coll/)){
      var bg = my.colors.collision;
    } else {
      var bg = my.colors.instance;
    }
  }
  d3.select("#text_" + event.id)
    .classed("fired-text", true)
    .transition()
    .duration(4000 / my.timeFactor)
    .style("background-color", bg);
  if (event.id.match(/set/)) {
    my.inset.map.setView(event.latLng, +event.zoom, {animate: false, duration: 0});
  }
  d3.select("#" + event.id)
    .classed(css, true)
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

function deFireAll(css){
  if (css){
    deFireDot(css);
  } else {
    [my.main.firedCss, my.inset.firedCss].forEach(function(cssClass){
      deFireDot(cssClass);
    });
  }
}

function deFireDot(css){
  var finalOpacity = $('#dotToggle').is(":checked") ? .5 : 0;
  d3.selectAll("." + css)
    .classed(css, false)
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
  d3.csv("data/instances.csv", function(data) {
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
  d3.csv("data/collisions.csv", function(data) {
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
  d3.json("data/paths.geojson", function(error, paths) {
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
  clearInterval(my.interval);
  $("#text_box").stop();
  d3.select("#play_btn")
    .classed("active", false);
  d3.select("#pause_btn")
    .classed("active", true);
}

function stop() {
  clearInterval(my.interval);
  $("#text_box").stop();
  d3.select("#play_btn")
    .classed("active", false);
}


function stepForward() {
  pause();
  // console.log(my.currentTimeIndex);
  if ($("#fsToggle").is(":checked")){
    my.currentTimeIndex++;
    updateClock();
    fireEvents(my.firingTimeEvents[my.currentTimeIndex], true);
  } else {
    getSjuzetPosition(90);
    updateClock(my.firingLineEvents[my.currentLineIndex][0].time);
    fireEvents(my.firingLineEvents[my.currentLineIndex], true);
  }
}

function stepBackward() {
  pause();
  // console.log(my.currentTimeIndex);
  if ($("#fsToggle").is(":checked")){
    my.currentTimeIndex--;
    updateClock();
    fireEvents(my.firingTimeEvents[my.currentTimeIndex], true);
  } else {
    getSjuzetPosition(90);
    my.currentLineIndex--;
    my.currentLineIndex--;
    updateClock(my.firingLineEvents[my.currentLineIndex][0].time);
    fireEvents(my.firingLineEvents[my.currentLineIndex], true);
  }
}

function updateIndices(event) {
  my.currentTimeIndex = my.times.indexOf(event.time);
  // my.currentLineIndex = my.lines.indexOf(event.line);
}

