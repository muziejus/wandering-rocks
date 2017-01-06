## This Is Great and All, but So What?

>My task is to move, to shift systems (Barthes 10)

This is the hardest tab to write. Building this visualization
involves (involved) giving in to tendencies that I am trying to avoid in my
scholarship. Given that one of the goals was to learn the underlying
technology, however, it could not have been otherwise.

The issue is that the animations provided by the JavaScript driving this project,
while super neat and cool, possibly do not actually tell us much _about_
“Wandering Rocks.” This initial concern is amplified by the following
reactions.

**Oh, just what the world needs, another deep dive on James Freakin’ Joyce.**
    There are lots of novels with fractured fabuly and sjužety (if we’re
    sticking to the Russian…). Similarly, there are lots of novels that provide
    extensive geographical detail, making mapping movements through a city
    possible. Why go back to such a canonical novel like _Ulysses_? Well, its
    very canonicity means that _a lot of the work has already been done_. Most
    of the geocoding for this section was just double-checking the work already
    done by Don Gifford and Ian Gunn and Clive Hart. Additionally, the timings
    would have been impossible for me to include without Hart’s own walking
    around in Dublin pretending to be an old woman or onelegged sailor,
    stopwatch in hand. 
    
Generally, I aim to make my spatiotemporal investigations of novels move past
just the obvious hits like The Novel of High Modernism, but sometimes it’s
worthwhile to build on a strong, already existing foundation of scholarship
_and_ interest. For example, the geographical “blunders” in the episode have
already been dissected by generations of Joyce scholars, meaning when I
stumbled upon them independently, I could rely on those scholars’ expertise and
either accept or reject it. Finally, the novel’s canonicity  and popularity
helps boost its profile. I think the ideas and troubles hinted at in how I talk
about this project could help many scholars interested in digital scholarship
frame spatiotemoporality for any novel (or perhaps aesthetic text). Because a
lot of people care about Joyce, perhaps this specific visualization will give
those ideas more visibility.

**Friend, _Ulysses_ takes place in Dublin in 1904. You have a 2017 basemap.**
    This is a valid concern. But it is also one that merely putting a c. 1904
    [georectified](http://support.esri.com/other-resources/gis-dictionary/term/georectification)
    basemap underneath the dots and lines would not really solve.  Johanna
    Drucker has been encouraging data-handling humanists to consider the value
    of georectification, especially with historical maps, as the process merely
    “reconciles spatial data and maps… with a given standard, such as Google
    maps”(76–77). Georectification is the imposition of a specific, GIS kind of
    thinking on data (or “capta,” to use Drucker’s term) that were not generated
    with GIS in mind. As Drucker continues, “the greater intellectual challenge
    is to create spatial representations without referencing a pre-existing
    ground”(77). 
    
The information within the novel _Ulysses_ takes a troubling trip to your
computer screen: I _capture_ a chunk and identify it as a datum (or captum). I
then spatiotemporally locate it through consulting some combination of Gifford,
Gunn and Hart, Wikipedia, and Google. Following a conversion, perhaps with
Google’s help, to Cartesian coordinates based on a measurement of the Earth’s
shape from 1984, I line those coordinates up with a contemporary map of Dublin,
making the risky guess that, as far as downtown is concerned, streets have not
changed their shape all that much. Then Leaflet and D3, two software packages,
combine to recalculate those coordinates into coordinates on an SVG plane that
you see as little exploding dots. Every step adds new assumptions about how
space and time work and move the capta farther from its source.  Furthermore,
as soon as the jump is made to the digital, a _faux-precision_ dominates, where,
for example, something like the immense idea of “America” is reduced to a teeny
exploding dot with its center in Kansas. These issues remain _unsolved_, and
this project _fails_ Drucker’s challenge.

**You took preëxisting information and just added color and made it bounce.**
    Drucker distinguishes between information visualizations that produce the
    knowledge they draw and those that merely display information (3). It seems
    at first inarguable that this visualization does only the latter. Any new
    insights into “Wandering Rocks” seem destined to evoke the small surprise
    of the merely interesting: “surprising—but not that surprising” (Ngai 145).
    We have the delayed judgment of “isn’t it _interesting_ that Boylan’s
    section is the first to intrude on Conmee’s command of the fabula from the
    of the episode?” It strikes me that moving that glimmer of interestingness
    somewhere else requires a deeper look into the structure of the episode. 
    
I have an idea for a different form of visualizing the tension between fabula
and sjužet (hint: a two-dimentional (time|plot)line), but that visualization
would be exclusively temporal, thereby violating the canonical rule of
spatiotemporal thinking, in a Bill Murray singing voice: “Spacetime, nothing
but spacetime.” Fabula and sjužet lure us into thinking of them as strictly
temporal terms—was it Bergson?—and it’s all too easy to treat them exclusively
as such. On the other hand, the aesthetic of the merely interesting does have
“the capacity to produce new knowledge” (Ngai 171). We’re just still in that
interstitial space of deferment.

**OK, but this all still boils down to being just a chance to play with
    JavaScript, no?** Play! Isn’t that the point? Roland Barthes again:

> Rereading draws the text out of its internal chronology (“this happens
> _before_ or _after_ that”) and recaptures a mythic time (without _before_ or
> _after_); rereading is no longer consumption, but play (that play which is
> the return of the different). If then, a deliberate contradiction in terms,
> we _immediately_ reread the text, it is in order to obtain, as though under
> the effect of a drug (that of recommencement, of different), not the _real_
> text, but a plural text: the same and new (16)

That sense of “mythic time” is especially appealing to me here, not because it
it erases time from the picture into the “Messianic time, a simultaneity of
past and future in an instantaneous present,” but, rather, because it insists
on multiple—plural—spatiotemporalities inside the text all at once (Anderson
24). The Benjaminian “homogenous, empty time” that Benedict Anderson notes is
“measured by clock and calendar” is challenged by “Wandering Rocks” on its own
and that challenge is made _more acute_ through the play of this visualization
(Benjamin 264; Anderson 24). The mechanicity of clocks are vital to “Wandering
Rocks.” As Frank Budgen notes, Joyce was like an “engineer” plotting the
episode (123). Stuart Gilbert focuses on the ticks and tocks of the clocks and
other “references to mechanical movement” scattered throughout the episode
(Gilbert 234). It starts, after all, with Conmee’s checking his watch and
seeing he has enough time to get to Artane. But then it closes with Artifoni
finally catching a tram and boarding it… the last bit of saving in contrast to,
say, Hitchcock’s being out of time in missing his bus at the start of _North by
Northwest_.

But Conmee’s leisure of all the time in the world, that “empty, homogenous
time” promised by the regulating ticks of a clock outside the frame, gives an
empty promise. Gilbert describes how the sections of “Wandering Rocks”
“interlock like a system of cog-wheels or the linked segments of an endless
chain [that] may be described as ‘mechanical’, for all the vital humanity of
the fragments of Dublin life portrayed,” but that ticking “like clockwork”
still can’t prevent several missed chances. Kernan, the Ulsterman probably most
excited to see the cavalcade, just misses it. Boylan and Bloom practically
cross paths. And for all the just-in-time success of the tram’s closing its
door right behind Artifoni, note that he has been chasing it for about five
kilometers, having missed it at College Green and again at Merrion Square.  In
Budgen’s description, Joyce becomes a puppeteer, the deus persistently
torturing these minor characters with absolute knowledge of how the machina is
ticking and enjoying the delays, the misses.

This visualization is not about Joyce’s omnipotence, however. It is about the
spatiotemporalities within “Wandering Rocks.” The sjužet’s recombinating of the
fabula already confounds the time “measured by clock and calendar,” because now
what is measured are lines of prose. But then flipping back to the fabula
causes a new rereading. Stepping forward and backward another. Clicking on dots
another. The text is always the same, but now it is plural. New. Interesting?
Maybe even more.
