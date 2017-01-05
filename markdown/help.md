## Help!

### The main controls

<ul>
  <li>
    <input type="checkbox" checked data-toggle="toggle" data-on="Fabula" data-onstyle="info" data-off="Sjužet" data-offstyle="success"> 
    sets the mode of the system. “Fabula” means that the play button will move the clock forward. “Sjužet” mode means that the button will move the narrative forward.
  </li>
  <li>
    <button type="button" class="btn btn-info navbar-btn">
      <span class="glyphicon glyphicon-play"></span>
    </button> is the Play button that starts the visualization (though not here).
  </li>
  <li>
    <button type="button" class="btn btn-info navbar-btn">
      <span class="glyphicon glyphicon-pause"></span>
    </button> is the Pause button that pauses the visualization (though not here).
  </li>
  <li>
    <div class="btn-group">
      <button type="button" class="btn btn-info navbar-btn">
        <span class="glyphicon glyphicon-step-backward"></span>
      </button>
      <button type="button" class="btn btn-info navbar-btn">
        <span class="glyphicon glyphicon-step-forward"></span>
      </button>
    </div> move the visualization back and forward either in time (“Fabula”) or in narrative (“Sjužet”).
  </li>
  <li>
    <input type="checkbox" data-toggle="toggle" data-on="🇮🇪✝️ &amp; 🇬🇧🐴 " data-onstyle="primary" data-off="No Paths" data-offstyle="danger">
    toggles the view of Conmee’s and the cavalcade’s paths through Dublin.
  </li>
</ul>

### Once the animation is running…

Dots will begin to appear on both maps and the episode text in the bottom left
will start to get highlighted and scroll. The color of the dots and highlights
are coordinated with this legend:

<center>
  <div class="btn-group">
    <button class="btn legend legend-instance" disabled="disabled" id="legend_instance">Exterior</button> 
    <button class="btn legend legend-inset" disabled="disabled" id="legend_inset">Interior</button> 
    <button class="btn legend legend-collision" disabled="disabled" id="legend_collision">Collision</button> 
  </div>
</center>

**Exterior** refers to places that characters happen upon in the episode. They
are all in Dublin. **Interior** refers to places that either characters or
the narrator mentions, but aren’t places at which the characters are at the
time. They are in Dublin, Ireland more generally, and even other places.
“Interior” is like “interior monologue.” Finally, **Collisions** are
moments when two entities (a character and another character, or a book, or
a smell) interact.

**Clicking** on a dot or a place in the text will pause the animation and reset
it from that point. The dots are petulant, however. Once they’re not the
center of attention, they no longer respond to clicks. The text is always
more forgiving. Of course, hitting the step-back button can revive dots that
have already faded away.

### And the timeline-looking thing?

At the top is a visualization of the whole episode at once. When in “Fabula”
mode, it shows the events distributed among the 19 sections, in narrative
order. When in “Sjužet” mode, it shows all of the events in chronological
order. A little line jumps around to show where in the plotline or timeline one
is at any given moment. In other words, the line always shows the opposite mode
of the main mode for the rest of the visualization. It does not respond to clicks.

