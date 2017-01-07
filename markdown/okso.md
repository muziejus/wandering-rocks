## This Is Great and All, but So What?

>My task is to move, to shift systems (Barthes 10).

This is the hardest tab to write. Building this visualization involves
(involved) giving in to tendencies that I am trying to avoid in my scholarship.
Given that one of the goals was to learn the visualization/animation
technology, however, it could not have been otherwise.

Do these animations, despite being highly neat, actually tell us much _about_
“Wandering Rocks”? I think the answer is yes, but perhaps not for the what
might seem obvious reasons. I give below a few conversations between my inner
hater and myself, conversations that I think provide insight into the massive
and potentially unforeseen problems this kind of digital work creates.  Again,
these much more complicated than what one might expect to be initial responses
from digital skeptics. Those “OK, So?”s tend to be much easier to parry.

**Great, just what the world needs, another deep dive on James Freakin’
    Joyce.** There are lots of novels with fractured fabuly and sjužety.
    Similarly, there are lots of novels that provide extensive geographical
    detail, making mapping movements through a city possible. Why go back to
    such a canonical novel like _Ulysses_? Well, its very canonicity means that
    _a lot of the work has already been done_. Most of the geocoding for this
    section was just double-checking geolocations already performed by Don
    Gifford and Ian Gunn and Clive Hart. Additionally, the timings would have
    been impossible for me to include without Hart’s own walking around in
    Dublin pretending to be an old woman or onelegged sailor, stopwatch in
    hand.
    
Generally, I aim to make spatiotemporal investigations of many different kinds
of novels—not just simply obvious hits like The Novel of High Modernism. Yet
sometimes it’s worthwhile to build on a strong, already existing foundation of
scholarship _and_ interest. For example, the geographical “blunders” in the
episode have already been dissected by generations of Joyce scholars, meaning
when I stumbled upon them independently, I could rely on those scholars’
expertise and either accept that confidently or give reasons for rejecting it.
The novel’s canonicity  and popularity helps boost this project’s profile, I
hope. I think the ideas and troubles hinted at in how I talk about this project
are important to any scholars interested in digital scholarship that frames
spatiotemoporality for any novel (or perhaps any aesthetic text).  Because a
lot of people care about Joyce, perhaps this specific visualization will give
those ideas more visibility.

**Friend, _Ulysses_ takes place in Dublin in 1904. You have a 2017 basemap.**
    This is a valid concern, but perhaps not as valid as it is clever. And it
    is certainly one that merely putting a c. 1904
    [georectified](http://support.esri.com/other-resources/gis-dictionary/term/georectification)
    basemap underneath the dots and lines would not solve.  Johanna Drucker
    encourages data-handling humanists to reconsider the value of
    georectification, especially with historical maps, because the process
    merely “reconciles spatial data and maps… with a given standard, such as
    Google maps” (76–77). Georectification is the imposition of a specific, GIS
    kind of thinking on data (or “capta,” to use Drucker’s term) that were not
    generated with GIS in mind. Drucker instead issues the following challenge:
    “the greater intellectual challenge is to create spatial representations
    without referencing a pre-existing ground,” which I think anyone in my position should always keep in mind (77).
    
The information within “Wandering Rocks” takes a troubling trip to your
computer screen: I _capture_ a chunk and identify it as a datum (or captum). I
then spatiotemporally locate it through consulting some combination of Gifford,
Gunn and Hart, Wikipedia, and Google. Following a conversion, perhaps with
Google’s help, to Cartesian coordinates based on a measurement of the Earth’s
shape from 1984, I line those coordinates up with a contemporary map of Dublin,
making the risky guess that, as far as downtown is concerned, streets have not
changed their shape all that much. Then Leaflet and D3, two software packages,
combine to recalculate those coordinates into coordinates on an SVG plane that
you see as little exploding dots. Every step adds new assumptions about how
space and time work and move the capta further from their source. Furthermore,
as soon as the jump is made to the digital, a _faux-precision_ emerges, where,
for example, something like the immense idea of “America” is reduced to a teeny
exploding dot with its center in Kansas. These issues remain _unsolved_, and
this project _fails_ Drucker’s challenge. But adding a georectified historical
map would be an even bigger blunder—an attempt to fix these problems that
probably actually doesn’t.

**You took preëxisting information and just added color and made it bounce.**
    Drucker distinguishes between information visualizations that produce the
    knowledge they draw and those that merely display information (3). It seems
    at first inarguable that this visualization does only the latter. Any new
    insights into “Wandering Rocks” seem destined to evoke the small surprise
    of the merely interesting: “surprising—but not that surprising” (Ngai 145).
    We get, then, the delayed, automatic judgment of “isn’t it _interesting_
    that Boylan’s section is the first to intrude on Conmee’s command of the
    fabula from the of the episode?” It strikes me that moving that glimmer of
    interestingness somewhere else requires a deeper look. Or perhaps more
    rereading. 
    
As far as deeper looks are concerned, I have an idea for a different form of
visualizing the tension between fabula and sjužet (hint: a two-dimentional
(time|plot)line); that visualization, however, would be exclusively temporal,
thereby violating the canonical rule of spatiotemporal thinking, in a Bill
Murray singing voice: “Spacetime, nothing but spacetime.” The progress explicit
in any fabula or sjužet lures us into thinking of them as strictly temporal
terms—did it start with Bergson?—and it’s all too easy to treat them
exclusively as such.  But we have to avoid that.

Still, on the other hand, the aesthetic of the merely interesting does have
“the capacity to produce new knowledge” (Ngai 171). Maybe there’s a way through below.

**OK, but this all still boils down to being just a chance to play with
    JavaScript, no?** Play! Isn’t that the point? Roland Barthes again:

> Rereading draws the text out of its internal chronology (“this happens
> _before_ or _after_ that”) and recaptures a mythic time (without _before_ or
> _after_); rereading is no longer consumption, but play (that play which is
> the return of the different). If then, a deliberate contradiction in terms,
> we _immediately_ reread the text, it is in order to obtain, as though under
> the effect of a drug (that of recommencement, of different), not the _real_
> text, but a plural text: the same and new (16).

That sense of “mythic time” is especially appealing to me here. One way to read
it would be to think of it as erasing time from the picture into the “Messianic
time, a simultaneity of past and future in an instantaneous present” (Anderson
24). For Benedict Anderson, however, this time is replaced by the Benjaminian
“homogenous, empty time” that is “measured by clock and calendar” (Anderson 24;
Benjamin 264). This new, empty time (and space), relies on external frames of
reference (the one time, the one space) and is, of course, explicitly tied to
the rise of the novel (Watt 21–27). 

Instead, to me, that “without _before_ or _after_” signals that there is no
_one_ spatiotemporality in the text.  The emptiness of the framing, homogenized
time, is challenged by “Wandering Rocks” on its own. That challenge becomes
_more acute_ through the play of this visualization, which relies on—yet
undoes—the centrality of a ticking clock to the episode. Clocks and their
mechanicity are, of course, vital to “Wandering Rocks.” Frank Budgen calls
Joyce an “engineer” in plotting the episode, and Stuart Gilbert focuses on the
ticks and tocks of the clocks and other “references to mechanical movement”
scattered throughout the episode (Budgen 123; Gilbert 234). The episode begins,
after all, with Conmee’s checking his own watch and seeing that he has enough
time to get to Artane. But then it closes with Artifoni finally catching a tram
and boarding it, such that the last moment of the episode provides the breath
catching pause of just-in-timeness (in contrast to Hitchcock’s being out of
time in missing his bus at the start of _North by Northwest_) that suggests
that the framing clock is not enough.

Conmee’s leisurely having all the time in the world is a promise made by the
regulating ticks of a clock outside the frame. But the text reveals it to be an
empty promise.  Gilbert describes how the sections of “Wandering Rocks”
“interlock like a system of cog-wheels or the linked segments of an endless
chain [that] may be described as ‘mechanical’,” but that system of cog-wheels
breaks down throughout for the characters inhabiting the world in _Ulysses_
(235). Kernan, the Ulsterman probably most excited to see the cavalcade, just
misses it. Master Dignam misses by several weeks the boxing match he’d just
found out about. And for all the just-in-time success of the tram’s closing its
door right behind Artifoni, he has still been chasing it or its follower for
about five kilometers, having missed it at College Green and not boarded at
Merrion Square. Considering this, the fabula is no longer a meticulous machine
moving like clockwork, and Budgen and Gilbert’s insisting on putting Joyce
central to the episode recasts the author not as expert machine builder or
systems designer but as, instead, a mischievous puppeteer, the deus
persistently torturing these minor characters by letting the machine tick past
them. Joyce cackles with enjoyment over the delays, the misses.

This visualization is not about Joyce’s omnipotence rendered wicked, however.
It is about the spatiotemporalities within “Wandering Rocks.” The sjužet’s
recombinating of the fabula already confounds the time “measured by clock and
calendar,” because now time is measured alongside lines of prose alongside
distance. Flipping back to the fabula causes a new rereading. Stepping forward
and backward another. Clicking on dots another. The text is always the same,
but now it is plural. New. Interesting?  Maybe even more.
