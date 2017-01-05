## This Is Great and All, but So What?

>My task is to move, to shift systems (Barthes 10)

This is the hardest tab to write. Building this visualization
involves (involved) giving in to tendencies that I am trying to avoid in my
scholarship. Given that one of the goals was to learn the underlying
technology, however, it could not have been otherwise.

The difficulty of writing this section stems from the fact that the animations
provided by the JavaScript underlying this project, while super neat and cool,
possibly do not actually tell us much _about_ “Wandering Rocks.” At least, on
first blush, it’s not apparent to me that this is the case. Why?

* **Oh, just what the world needs, another deep dive on James Freakin’ Joyce.**
There are lots of novels with fractured fabuly and sjužety (if we’re sticking
to the Russian…). Similarly, there are lots of novels that provide extensive
geographical detail, making mapping movements through a city possible. Why go
back to such a canonical novel like _Ulysses_? Well, its very canonicity means
that _a lot of the work has already been done_. Most of the geocoding for this
section was just double-checking the work already done by Gifford and Gunn and
Hart. Additionally, the timings would have been impossible for me to include
without Hart’s own walking around in Dublin pretending to be an old woman or
onelegged sailor, stopwatch in hand. I aim to make my spatiotemporal
investigations of novels move past just the obvious hits like The Novel of High
Modernism, but sometimes it’s worthwhile to build on a strong, already existing
foundation. For example, the two geographical “blunders” (“Metropolitan Hall”
and “Royal Canal Bridge”) have already been dissected by generations of Joyce
scholars, meaning when I stumbled upon them, I could rely on their expertise
and either accept or reject it. Finally, its canonicity helps with its profile.
I think the ideas and troubles hinted at in how I talk about this project can
help frame how we look at spatiotemoporality for any novel (or perhaps
aesthetic text).

* **Friend, _Ulysses_ takes place in Dublin in 1904. You have a 2017
basemap.** This is a valid concern, and it is one that merely putting a c.
1904 georectified basemap underneath the dots and lines would not really solve.
Drucker has been encouraging data-handling humanists to consider the value of
georectification, as doing so merely “reconciles spatial data and maps… with a
given standard, such as Google maps”(76–77). Georectification is the imposition of a
specific, GIS kind of thinking on data (or “capta,” to use Drucker’s term) that
does not exist with GIS in mind. As Drucker continues, “the greater
intellectual challenge is to create spatial representations without referencing
a pre-existing ground”(77). The information in _Ulysses_ takes a
troubling trip to your computer screen: it _captured_ and identified as a datum
(or captum) by me. I then spatiotemporally locate it through consulting some
combination of Gifford, Gunn and Hart, Wikipedia, and Google. I then convert
all of that, perhaps with Google’s help, to Cartesian coordinates based on a
measurement of the Earth’s shape from 1984. Then I line those coordinates up
with a contemporary map of Dublin, making the risky guess that, as far as
downtown is concerned, streets have not changed their shape all that much. Then
Leaflet and D3, two software packages, combine to recalculate those coordinates
into the little exploding dots you see. Every step adds new assumptions about
how space and time work and move the capta farther from its source.
Furthermore, as soon as the jump is made to the digital, a faux-precision
dominates, where, for example, something like the immense idea of “America” is
reduced to a teeny exploding dot with its center in Kansas. These issues remain
_unsolved_, and this project _fails_ Drucker’s challenge.

* **You took preëxisting information and just added color and made it bounce.**
Drucker distinguishes between information visualizations that produce the
knowledge they draw and those that merely display information (3). It
seems inarguable that this visualization does the latter only. Any new insights
into “Wandering Rocks” seem destined for the bin marked “merely interesting”
(Ngai). As in, “isn’t it _interesting_ that Boylan’s section is the first
to intrude on Conmee’s command of the fabula from the of the episode?” That is,
perhaps, interesting. It also may just be a cool story, bro. Moving that
glimmer of interestingness somewhere else requires a deeper look into the
structure of the episode, a look simply unavailable to this visualization. I
have an idea for a different form of visualizing the tension between fabula and
sjužet (hint: a two-dimentional (time|plot)line), but that visualization would
be exclusively temporal, thereby violating the canonical rule of spatiotemporal
thinking, in a Bill Murray singing voice: “Spacetime, nothing but spacetime.”
Fabula and sjužet seem to be strictly temporal terms, and it’s all too easy to
treat them exclusively as such. But, then, that’s what we’re doing: taking the
all too easy route.
