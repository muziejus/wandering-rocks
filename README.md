# Fabula and Sjužet in “Wandering Rocks”

This is a web project that aims to present Episode 10 of *Ulysses* (“Wandering
Rocks”) as a data visualization treating both two parallel concepts of space
and two contradictory concepts of time.

As the project matures, you can see it in action [on github pages](http://muziejus.github.io/wandering-rocks/).

## Background

“Wandering Rocks” is the most obviously complexly intertwined episode in the
novel. Having no analogue to the *Odyssey* (the rocks are only referred to, as
Odysseus chooses instead to take his chances with Scylla and Charybdis), the
chapter sits in the middle of the novel in order to, as Ellmann notes, “bring
the city of Dublin even more fully into the book by focusing upon it rather
than upon Bloom or Stephen” (452). In its difference from the rest of the novel
on these terms, it also reflects back on the rest of the novel. As Gilbert
notes, “In its structure and its _technic_ (“labyrinth”) this episode may be
regarded as a small-scale model of _Ulysses_ as a whole” (227).

As such, the episode is broken up into 19 distinct sections. Each centers
around, more or less, a different character in the novel. Some move around,
with the greatest distance covered in the first and last sections. But other
characters remain in one place during the course of their section.
Furthermore, each section except the last features at least “intrusion,” which
acts like a jump cut taking us to another location but at the same time.
Because the intrusions typically refer to characters who show up elsewhere in
the episode, a schedule of collisions can begin to be mapped. We know person
*x* was here to meet person *y*, but over there later to meet person *z*. But
through the intrusions, we also may know where *x* and *z* were at the same
time, though separate from one another. These collisions are nowhere
clearer than in the final section, which features a viceregal cavalcade
riding from Phoenix Park to the Mirus Bazaar in Ballsbridge, thereby riding
straight through downtown Dublin, where nearly every character in the
episode has an opportunity to remark on the cavalcade as it rides past.

While thinking of a chapter involving wandering in novels, I was reminded of
this episode, which is perhaps the best known example of a network of wandering
people in literature written in English. My ultimate goal has not been to
return to *Ulysses*, but after failing to find an appropriately rigorous and
granular study or visualization of the episode online, I decided I would try to
make my own. This would also serve as an opportunity to learn more
[d3](http://www.d3js.org) and [Leaflet](http://www.leafletjs.org).

## Space

Space is, at first, easy to describe. It’s where the action in the episode
happens. However, when mapping the episode, it’s quickly clear that that view
is insufficient. We need to think in terms of spatialities. First, there’s
where the actors in the episode *are*, but there are also the places that they
are *thinking of*, which include’s the narrator’s own geographical musings.

Consider this passage, for example:

>Off an inward bound tram stepped the reverend Nicholas Dudley C. C. of
saint Agatha’s church, north William street, on to Newcomen bridge.

>At Newcomen bridge Father Conmee stepped into an outward bound tram for
he disliked to traverse on foot the dingy way past Mud Island. (182)

We at least two or four actors here—Dudley, Conmee, and the two trams—but the
places refer to different spatialities. “Saint Agatha’s church” and “north
William street” are (expository?) information provided by the narrator, “Mud
Island” is a place Conmee thinks of (and would like to avoid walking past), but
Newcomen bridge is where both clerics interact with—*collide*—with their trams,
and, using a bit of narrative license, each other.

Space in the episode has been mapped using my application
[NYWalker](http://github.com/nyscapes/nywalker), where I have geocoded the 300+
references to places in the episode. Between Gifford’s extensive annotation and
my own research involving, among other things, a 19th century street guide to
Dublin, I have been able to provide coordinates for every place in the novel,
save one (Lynam’s in Temple Bar). This underlying data is available [from
NYWalker](http://nywalker.newyorkscapes.org/books/ulysses-1922).

This list of instances (that is, places mentioned in the episode) received a
second level of scrutiny so that I could separate out the two different
spatialities. In the dataset, then, Newcomen Bridge is treated as part of a
different spatiality from the others that are mentioned.

Additionally, the episode gives enough information to draw a series of paths
(around 28) involving the various actors in the episode. This is a separate
dataset I basically drew by hand on a map of Dublin. Generally, the streets are
the same as they were back in 1904.

## Time

Time is less exact in the episode. It opens with Conmee’s noting that it’s
14:55 on his watch, and Dunne types out the date (16 June 1904) on a sheet of
paper, but there are no other references to precise times in the episode. M’Coy
very unhelpfully tells Lenehan that it is “after three” in Temple Bar, but even
so, that information has its own temporal shift because it relates to whether
Lenehan has time to bet on a race that has already happened in England but
whose results have not yet made it to Ireland. As Gifford notes:

>The Gold Cup Race was run at 3:08 P.M. Greenwich time on 16 June 1904. If it
>is after 3:00 in Dublin (Dunsink time), it is after 3:25 Greenwich time.
>Thus, the race has already been run; but the news, which was to come by
>telegraph, was not due to reach Dublin until 4:00, so Dublin bookmakers
>would still take bets at 3:00. ([270](https://books.google.com/books?id=fE9mkomQHEQC&pg=PA270&dq=wandering+rocks+gold+cup+race&hl=en&sa=X&ved=0ahUKEwjLqLOKweDQAhVCyVQKHaXgAJcQ6AEIJjAC#v=onepage&q&f=false))

Nevertheless, Hart provides a timetable accounting for where 29 characters are
between 14:55 (when Conmee starts off the episode checking his watch) and
16:00, when the viceregal cavalcade arrives at Mirus Bazaar in Ballsbridge. The
timetable is incomplete (there are characters missing), and has small errors
(corrected when reprinted in Gunn and Hart). The timing strikes me as a bit
ambitious in places—Conmee walks through Mountjoy Square and has two
conversations in four minutes—but It serves a kind of backbone under which to
pitch the collisions.

## Collisions

Merging space and time into a spatiotemporality allows for seeing collisions
and non-collision, or simultaneity. Collisions give a visualization sparkle,
and they also show how interconnected the network of the episode is without
turning the network into a synchronous graph. Timing is important in the
episode, as in reality. Master Patrick Dignam sees an advertisement for a
boxing match, gets excited about it, plans on sneaking out to see it, and only
then notices that the match happened a month earlier.

Given the paths of characters and given a set of points where stationary
characters are, it becomes possible to expand further still this list of
collisions, thereby getting us a third dataset.

## Fabula and Sjužet

The first step in the visualization is to create an animation that plots out
the sjužet of the episode. The sjužet is the narrative organization of a text.
It stands in contrast to the fabula, which is the elements of the text in their
“real” historical time. A walk through the sjužet of the novel moves the map
and the paths line-by-line. As such, the map begins by tracing Conmee’s journey
before jumping to Dignam’s Court for Maginni’s intrusion, and so on. Then the
clock rolls back for the second section. It rolls back yet again for the third,
and so on. The narrative moves forward unceasingly, but the clock does not.

In a fabula visualization, the clock marches forward, irrespective of the order
of events on the page. Their order in time is all that matters. In fact, it
could be argued that a fabula visualization of this episode would begin with
the 8th Earl of Kildare, whose late 15th century rule of Ireland comes up in
conversation between Lambert and O’Molloy. But local to the hour of Bloomsday
the episode takes up, a fabula visualization underscores the simultaneity that
we miss when focussing on the collisions in the sjužet visualization.

## Data

How this all works…

## Bibliography

### Online resources and inspiration

* Forster, Chris. “[On Joyce’s ‘Wandering Rocks’ & Simultaneity](http://www.cforster.com/2010/08/on-joyces-wandering-rocks-simultaneity/).” Forster includes two visualizations, but sadly the commenter’s links to an animated visualization have rotted.

* Gunn, Ian, and Mark Wright. “[O, Rocks! she said. Tell us in plain words](http://hjs.ff.cuni.cz/archives/v7/essays/gunn.htm).” Includes a 3d vizualization of “Wandering Rocks,” where the *z* coordinate stands in for time.

* Idleworm. “[Dublin c. 840 – c. 1540](http://www.idleworm.com/history/medieval_dublin.shtml).” 

* Mappery. “[1608 Dublin Historical Map](http://www.mappery.com/map-of/1608-Dublin-Historical-Map).”

* Reeve, Jonathan. “[corpus-joyce-portrait-TEI](https://github.com/JonathanReeve/corpus-joyce-portrait-TEI).”

* Trustees of Boston College. “[Walking Ulysses](http://ulysses.bc.edu/).”

* Whong, Chris. “[NYC Taxis: A Day in the Life](http://chriswhong.github.io/nyctaxi/)”. Also, [Whong’s description of this site’s front end](http://chriswhong.com/open-data/taxi-techblog-2-leaflet-d3-and-other-frontend-fun/) has been useful.

* Wikipedia. “[The Civic Survey of Dublin and Environs (1922–23)](https://upload.wikimedia.org/wikipedia/commons/a/ad/Dublin_1922-23_Map_Suburbs_MatureTrams_wFaresTimes_Trains_EarlyBus_Canals_pubv2.jpg).” Includes tramlines.

* Wikipedia. “[Historical Maps of Dublin](https://en.wikipedia.org/wiki/Historical_Maps_of_Dublin).”

### Print resources consulted

* Adams, Robert Martin. _Surface and Symbol: The Consistency of James Joyce’s Ulysses_. New York: Oxford UP, 1962.

* Blamires, Harry. _The Bloomsday Book: A Guide through Joyce’s Ulysses_. London: Methuen, 1966.

* Ellmann, Richard. _James Joyce_. Oxford: Oxford UP, 1983.

* Gifford, Don. _Ulysses Annotated_. Berkeley, CA: U of California P, 1989.

* Gilbert, Stuart. _James Joyce’s Ulysses_. New York: Vintage, 1955.

* Gunn, Ian and Clive Hart. _James Joyce’s Dublin_. New York: Thames and Hudson, 2004.

* Hart, Clive and David Hayman. _James Joyce’s Ulysses: Critical Essays_. Berkeley, CA: U of California P., 1974.

* Huang Shan-Yun. “‘Wandering Temporalities’: Rethinking *Imagined Communities* through ‘Wandering Rocks.’” _JJQ_ (49.3–4), 2012. 589–610.

* Joyce, James. _Ulysses_. New York, Vintage, 1961.

* Joyce, James. _Ulysses: The Corrected Text_. New York, Vintage, 1986.

## The Rest

&copy; 2016 Moacir P. de Sá Pereira. Part of #nyudh.
