## Technology

First, this project is available on
[GitHub](https://github.com/muziejus/wandering-rocks/). 

The scholarly incentive for the project was to think about wandering in the
city, but a secondary incentive was to get to know a few technologies better,
namely [Leaflet](http://leafletjs.com) and [D3](http://d3js.org). Along the
way, my familiarity with JavaScript and especially [jQuery](http://jquery.com)
also improved.

The text in these various tabs was written in Markdown and is converted to HTML
on the fly by [Showdown](https://github.com/showdownjs/showdown). The overall
aesthetic is farmed out to [Bootstrap](http://getbootstrap.com), which is
extended with the [Bootstrap Toggle](http://www.bootstraptoggle.com/) extention
to make the handsome switches.

If the project looks a lot like Chris Whong’s [NYC Taxis: A Day in the
Life](http://chriswhong.github.io/nyctaxi/) visualization, that’s not a
coincidence. The project proved to me that it was possible to do a time
animation usefully using a combination of D3 and Leaflet (in fact, I found it
by just googling “d3 Leaflet”). Mike Bostock’s OG “[D3 +
Leaflet](https://bost.ocks.org/mike/leaflet/)” demo underlies how the various
dots and paths are converted from GeoJSON to SVG objects.

I also consulted two books rather extensively. Scott Murray’s [_Interactive
Data Visualization for the
Web_](http://chimera.labs.oreilly.com/books/1230000000345/index.html) is a
great introduction to how weird D3 is. Once I read and understood everything
there, Elijah Meeks’s [_D3.js in
Action_](https://www.manning.com/books/d3-js-in-action) served as handy
secondary resource. Both books need updates, I feel. Those updates could
include dealing with, among other things, something like Leaflet. Meeks’s
chapter on geospatial information visualization, for example, rather
startlingly answered very few of my questions, largely because of the weirdness
of using `d3.geoPath` with Leaflet instead of creating a sui generis map where
I provide even the basemap/shapes (see below).

Of course, I also used [StackOverflow](http://stackoverflow.com) extensively, but that goes without saying. 

### Deep Dive…

For those seeking to emulate this project, by far and away the most complicated
aspect for me is/was figuring out how to control what a `Point` GeoJSON object
would look like using the `d3.geoPath` generator. It doesn’t draw a simple
`<circle>` SVG object, but, rather, creates a circle in the SVG minilanguage
(visible under attribute `d`). Hence, the points don’t respond to the usual
changes in the `r` attribute like one might expect (or like every D3 tutorial
expects). 

This mostly became an issue because there are two maps in this visualization,
meaning two different `d3.geoTransform`s and `d3.geoProjection`s. I rewrote the
whole project using on the fly conversions for each point, but it slowed the
site down. Bostock’s example, in contrast, streams points, which is, if I
understand correctly, asynchronous and much faster. So I had to stick to
`d3.geoPath`s and figure out how to manipulate `d`.

Actually, [this video from
DashingD3js](https://www.dashingd3js.com/lessons/d3-geo-path), despite its
hilariously dull repetition, was what finally made me understand what was going
on with the path and why changing the `r` attribute wasn’t doing anything!

### To Come…

I had hoped to have animated paths like in the NYC Taxi visualization above.
Whong has it kind of easy in this case, because the path is pre-defined,
there’s a start point, an end point, and a duration. The animation is made up
of only one piece, then—that specific path. Here, rather, I have paths covered
by people where they have to be in many different places at many different
times. That’s a granular return to the data I am not quite yet ready to do.
Building up the other datasets was enough work for now. But in the future,
however, I’d love a little horse emoji representing the Cavalcade as it rides
to the Bazaar, say.

