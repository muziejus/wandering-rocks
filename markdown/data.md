## Data

There are three distinct datasets in this project, and all of them rely on the
previous work done by Gifford and Gunn and Hart.

The data in the first dataset are what I call “instances.” These are instances
of a place’s being mentioned in the text. I wrote a web application,
[`NYWalker`](http://nywalker.newyorkscapes.org/), that makes it easier to add
these instances by hand. They include a page number, a sequence, and a specific
location. To this data, I also added times, using Hart’s measurements. Hart did
not time each instance of a place’s being mentioned, so I guessed a time for a
lot of them. The dataset is further split by spatiotemporalities, in that there
is an “exterior” spacetime and an “interior” spacetime. These distinctions are
local to this visualization and are not part of the `NYWalker` data, which is
[available for download](http://nywalker.newyorkscapes.org/books/ulysses-1922).

The second dataset is built on the first. It includes “collisions.” These are
incidents that clearly take place at a specific place and time and feature
multiple actors but may not be explicitly noted in the text with an “instance”
(though a nearby instance often provides a clue for location and time!). An
instance is Conmee’s boarding a tram on *Newcomen Bridge*. A collision is
*Conmee’s* (actor 1) looking at the *awkward man* (actor 2) while on the tram.

The third dataset is mostly invisible at this time. It is made up of the paths
taken by around 30 different actors in the episode. Currently, only two are
visible: Conmee’s and the cavalcades’ paths. These two are available because,
apparently, Joyce relied on them in constructing the mechanics of the episode.
These paths I drew by hand and rely on a lot of speculation, such as how
someone walks from O’Connell Bridge to “King Billy’s horse” on College Green.
The narrator does not tell us how the Breens took the trip.

There are several famous geographical “blunders” in the episode, where the
narrator (or a character) misidentifies a place. Three deserve special comment.
important here.  First, the Poddle river acts as an actor and not a place. This
permits its “misplacing” by the Wood Quay with no worry. Next, Farrell confuses
the Merrion Hall with the Metropolitan Hall. Finally, Stratton’s image welcomes
the cavalcade on a bridge spanning the Grand Canal that is referred to as the
“Royal Canal Bridge.” In both later instances, I treated these as
misidentifications, not as references to places far removed from the
spatiotemporal logic of either actor’s location and movement. 

Finally, Gifford writes that Thomas Court, the location of the unfindable
“mansion of the Kildares” that Love mentions, “was the main street of the
walled city of medieval Dublin. It is at present a series of streets including
Thomas Street” (Gifford 268). I read the reference as one to, instead, the
[Liberty of Thomas Court and
Donore](https://en.wikipedia.org/wiki/Liberty_of_Thomas_Court_and_Donore), a
manor right outside the walled city and the location of the current Dublin
street Thomas Court. 

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
extended with the [Bootstrap Toggle](http://www.bootstraptoggle.com/) extension
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

### Let’s get technical…

For those seeking to emulate this project, by far and away the most complicated
aspect for me is/was figuring out how to control what a `Point` GeoJSON object
would look like using the `d3.geoPath` generator. It doesn’t draw a simple
`<circle>` SVG object, but, rather, creates a circle in the SVG `<path>` minilanguage
(visible under attribute `d`). Hence, the points don’t respond to the usual
changes in the `r` attribute like one might expect (or like every D3 tutorial
expects). 

This mostly became an issue because there are two maps in this visualization,
meaning two different `d3.geoTransform`s and `d3.geoProjection`s. I rewrote the
whole project using `<circle>`s with on-the-fly conversions for each, but it slowed the
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

