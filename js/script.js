if (window.location.href.match(/github/)){
  $("#modal").modal("show");
}
d3.queue(1) // one task at a time.
  .defer(prepareInstances, "main")
  .defer(prepareInstances, "inset")
  .defer(prepareCollisions)
  .defer(preparePaths)
  .await(function(error, instances, inset, collisions, paths) {
    if (error) { throw error; }

    // The graphical elements
    createFeatures(my.main, [paths, instances, collisions]);
    createFeatures(my.inset, [inset]);
    createTheLine();
    createLegend();

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
    my.times = my.timesEvents.map(function(event){return event.time; })
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
      }
    });


    // The sjužet data
    buildSjuzetData();
    
    // The line
    populateSectionStarts();
    populateTimeLine();
    populatePlotLine();
    clearTheLine("timeline");
    
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
    $("#help_btn").click(function(){
      $("#modal").modal("show");
      $("#tabs a:last").tab("show");
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

    $("#pathToggle").change(function() {
      if ($(this).is(":checked")) {
        alterPaths(0.6);
      } else {
        alterPaths(0);
      }
    });

    $("#fsToggle").change(function() {
      if (!$(this).is(":checked")) {
        my.mode = "sjuzet";
        clearTheLine("plotline");
        reviveTheLine("timeline");
        d3.selectAll(".btn-info")
          .classed("btn-info", false)
          .classed("btn-success", true);
        // $('#text_box').on("scroll", function() {
        //   // console.log($('#text_box').scrollTop());
        //   // update some scroll container variable.
        // });
      } else {
        my.mode = "fabula";
        clearTheLine("timeline");
        reviveTheLine("plotline");
        d3.selectAll(".btn-success")
          .classed("btn-success", false)
          .classed("btn-info", true);
        getSjuzetPosition(90);
        var time = my.firingLineEvents[my.currentLineIndex][0].time,
        nextEvents = my.times.filter(function(t){
          return t >= time;
        });
        my.currentTimeIndex = my.times.indexOf(nextEvents[0]);
        // $('#text_box').off("scroll");
      }
    });

    $(window).resize(function(){
      clearTimeout(my.recalculate);
      recalculate();
    });

  }); // close await()

function playFabula() {
  var interval = 5000 / my.timeFactor;
  var time = my.time ? my.time : my.times[0];
  if (time === my.times[my.times.length - 1]){
    time = my.times[0];
  }
  my.interval = setInterval(function(){
    if (time === my.times[my.times.length - 1]){
      stop();
    }
    if (time === my.times[my.currentTimeIndex]){
      fireEvents(my.firingTimeEvents[my.currentTimeIndex], true);
      if (my.currentTimeIndex === my.times.length - 1){
        my.currentTimeIndex = 0;
      } else {
        my.currentTimeIndex++;
      }
    }
    updateClock(time);
    time = time + 5000;
  }, interval);
}

function playSjuzet() {
  var boxMax = my.lines[my.lines.length - 1],
    totalTime = 3900000 / my.timeFactor, // 65 mins = 3900000 milliseconds
    // boxRemaining = boxMax - $("#text_box").scrollTop(),
    // boxRemainingPct = boxRemaining / boxMax,
    // timeRemainingPct = boxRemainingPct * totalTime,
    interval = (my.lineHeight * totalTime)/boxMax,
    line = getSjuzetPosition(my.buffer);
  line = line + my.lineHeight;
  $("#text_box").scrollTop(line); // no continuous scroll.
  // $("#text_box").animate({scrollTop: line}, interval, "linear");
  my.interval = setInterval(function(){
    if (line >= my.lines[my.lines.length - 1]){
      stop();
    }
    if (my.lines[my.currentLineIndex] <= (line + my.buffer) && (line + my.buffer) < (my.lines[my.currentLineIndex] + my.lineHeight)){
      fireEvents(my.firingLineEvents[my.currentLineIndex]);
      updateClock(my.firingLineEvents[my.currentLineIndex][0].time);
      if (my.currentLineIndex === my.lines.length - 1){
        my.currentLineIndex = 0;
      } else {
        my.currentLineIndex++;
      }
    }
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
      return ev.id.match(/set/);
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
  var bg, css, path;
  if (event.id.match(/set/)){
    bg = my.colors.inset;
    css = my.inset.firedCss;
    path = my.inset.path;
  } else {
    path = my.main.path;
    css = my.main.firedCss;
    if (event.id.match(/coll/)){
      bg = my.colors.collision;
    } else {
      bg = my.colors.instance;
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
  var theLine = my.mode === "sjuzet" ? "time" : "plot",
    cursorPosition = my.mode === "sjuzet" ? my.timexScale(event.time) : my.plotxScale(event.line);
  d3.select("#" + theLine + "Line_" + event.id)
    .classed("fired-" + theLine + "line-dot", true)
    .style("fill-opacity", 1)
    .style("stroke-pacity", 1);
  d3.select("#" + event.id)
    .classed(css, true)
    .style("cursor", "pointer")
    .style("pointer-events", "visibleFill")
    .style("fill", bg)
    .style("fill-opacity", 0.9)
    .style("stroke-opacity", 0.9)
    .transition()
    .duration(4000 / my.timeFactor)
    .style("fill-opacity", 0.25)
    .style("stroke-opacity", 0.1)
    .attr("d", path.pointRadius(50))
    // .on('end', function(){
    //   d3.select("#" + event.id)
    .transition()
    .duration(4000 / my.timefactor)
    .style("fill-opacity", 0.9)
    .style("stroke-opacity", 0.9)
    .attr("d", path.pointRadius(4.5));
    // });
  d3.select("." + theLine + "linecursor")
    .attr("x1", function(){ return cursorPosition; })
    .attr("x2", function(){ return cursorPosition; })
    .attr("y1", 0)
    .attr("y2", 80);
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
  var theLine = my.mode === "sjuzet" ? "time" : "plot";
  d3.selectAll(".fired-" + theLine + "line-dot")
    .classed("fired-timeline-dot", false)
    .style("stroke-opacity", 0.6)
    .style("fill-opacity", 0.4);
}

function alterPaths(opacity) {
  [1, 19].forEach(function(num){
    d3.select("#path_" + num)
      .style("stroke", my.colors.path)
      .transition()
      .style("stroke-opacity", opacity);
  });
}

function createTheLine() {
  my.theLineWidth = $("#inset_map").offset().left - 55;
  d3.select("#main_container")
    .append("div").attr("id", "theLineDiv")
    .attr("width", my.theLineWidth);
  d3.select("#theLineDiv")
    .append("svg").attr("id", "theLineSvg")
    .attr("height", 100)
    .attr("width", my.theLineWidth);
}

function clearTheLine(css){
  d3.selectAll("." + css)
    .style("fill-opacity", 0)
    .style("stroke-opacity", 0);
}

function reviveTheLine(css){
  d3.selectAll("." + css)
    .style("fill-opacity", 1)
    .style("stroke-opacity", 1);
  d3.selectAll("." + css + "-dot")
    .style("fill-opacity", 0.4)
    .style("stroke-opacity", 0.6);
}


function populateTimeLine() {
  var svg = d3.select("#theLineSvg"),
    eventsArray = [[], [], []];
    strings = ["instance", "inset", "collision"],
    cssArray = [my.colors.instance, my.colors.inset, my.colors.collision];
  my.timexScale = d3.scaleLinear()
    .domain([my.times[0], my.times[my.times.length - 1]])
    .range([20, my.theLineWidth - 20]);
  var xAxis = d3.axisBottom()
    .tickFormat(d3.utcFormat("%H:%M"))
    // .ticks(d3.timeMinute.every(15))
    .scale(my.timexScale);
  my.events.forEach(function(event){
    if (event.id.match(/stance/)){
      eventsArray[0].push(event);
    } else if (event.id.match(/inset/)){
      eventsArray[1].push(event);
    } else {
      eventsArray[2].push(event);
    }
  });
  strings.forEach(function(string, i){
    svg.append("g").attr("id", "timeLine_" + string);
    d3.select("#timeLine_" + string)
      .selectAll("circle")
      .data(eventsArray[i])
      .enter().append("circle")
      .classed("theline-dot", true)
      .classed("timeline-dot", true)
      .classed("timeline", true)
      .classed("timeline-" + string, true)
      .attr("id", function(d){ return "timeLine_" + d.id; })
      .attr("r", 3)
      .attr("cx", function(d){ return my.timexScale(d.time); })
      .attr("cy", function(){ return ((i + 1) * 20); })
      .style("fill", cssArray[i]);
  });
  svg.append("g")
    .classed("axis", true)
    .classed("timeline", true)
    .attr("transform", "translate(0, 80)")
    .call(xAxis);
  svg.append("line")
    .classed("timelinecursor", true)
    .classed("timeline", true)
    .attr("x1", function(){ return my.timexScale(my.times[0]); })
    .attr("x2", function(){ return my.timexScale(my.times[0]); })
    .attr("y1", 0)
    .attr("y2", 80);
}

function populatePlotLine() {
  var svg = d3.select("#theLineSvg");
  my.plotxScale = d3.scaleLinear()
    .domain([my.lines[0], my.lines[my.lines.length - 1]])
    .range([20, my.theLineWidth - 20]);
  // console.log("the width is " + my.theLineWidth + " and section 19 is " + my.sectionStarts[18] + " and it should be at " + my.plotxScale(my.sectionStarts[18]));
  var xAxis = d3.axisBottom()
    // .tickFormat(d3.utcFormat("%H:%M"))
    // .ticks(d3.timeMinute.every(15))
    .tickValues(my.sectionStarts)
    .scale(my.plotxScale);
  svg.append("g").attr("id", "plotLine");
  d3.select("#plotLine")
    .selectAll("circle")
    .data(my.events)
    .enter().append("circle")
    .attr("class", function(d){ return "plotline-" + d.id.replace(/_.*$/, ""); })
    .classed("theline-dot", true)
    .classed("plotline-dot", true)
    .classed("plotline", true)
    .attr("id", function(d){ return "plotLine_" + d.id; })
    .attr("r", 3)
    .attr("cx", function(d){ return my.plotxScale(d.line); })
    .attr("cy", function(d){ 
      if (d.id.match(/instance/)){
        return (1 * 20);
      } else if (d.id.match(/inset/)){
        return (2 * 20);
      } else {
        return (3 * 20);
      }
    })
    .style("fill", function(d){ 
      if (d.id.match(/instance/)){
        return my.colors.instance;
      } else if (d.id.match(/inset/)){
        return my.colors.inset;
      } else {
        return my.colors.collision;
      }
    });
  svg.append("g")
    .classed("axis", true)
    .classed("plotline", true)
    .attr("transform", "translate(0, 80)")
    .call(xAxis)
    .selectAll("text").each(function(d, i){
      d3.select(this).text(i + 1);
    });

  svg.append("line")
    .classed("plotlinecursor", true)
    .classed("plotline", true)
    .attr("x1", function(){ return my.plotxScale(my.lines[0]); })
    .attr("x2", function(){ return my.plotxScale(my.lines[0]); })
    .attr("y1", 0)
    .attr("y2", 80);
}

function populateSectionStarts(){
  console.log("hitting populateSectionStarts");
  my.sectionStarts = $(".section").map(function(){ return $(this).position().top; }).toArray(); 
  my.sectionStarts[0] = my.lines[0];
}

function createLegend(){
  d3.selectAll(".legend")
    .style("opacity", 1)
    .style("cursor", "auto");
  var colors = [my.colors.instance, my.colors.inset, my.colors.collision];
  ["instance", "inset", "collision"].forEach(function(string, i){
    d3.selectAll(".legend-" + string)
      .style("background-color", colors[i]);
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
      };
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
    if (error) { throw error; }
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

function recalculate(){
  ["#timeLine_instance", "#timeLine_inset", "#timeLine_collision", ".plotline", ".timeline", "#plotLine", "#recalculating"].forEach(function(el){
    d3.selectAll(el).remove();
  my.recalculate = setTimeout(function(){
    console.log("recalculating");
    buildSjuzetData();
    my.theLineWidth = $("#inset_map").offset().left - 55;
    d3.select("#theLineDiv")
      .attr("width", my.theLineWidth);
    d3.select("#theLineSvg")
      .attr("width", my.theLineWidth)
      .append("text").attr("id", "recalculating");
    d3.select("#recalculating")
      .attr("x", my.theLineWidth/2)
      .attr("y", 60)
      .attr("text-anchor", "middle")
      .attr("font-family", "sans-serif")
      .attr("font-size", "20")
      .attr("fill", "#ddd")
      .text("Recalculating… Reload page to ensure correct x-axis.");
    });
    populateSectionStarts();
    setTimeout(function(){
      d3.select("#recalculating").remove();
      populateTimeLine();
      populatePlotLine();
      my.mode === "sjuzet" ? clearTheLine("plotline") : clearTheLine("timeline");
    }, 5000);
  }, 5000);
}

function buildSjuzetData(){
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
    }
  });
}


function updateIndices(event) {
  my.currentTimeIndex = my.times.indexOf(event.time);
  // my.currentLineIndex = my.lines.indexOf(event.line);
}

