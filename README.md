# MealWars App


## Description

This app  is designed to help you make easier meal choices.

Two meals are generated for you and you choose your preference between them.

If a single meal beats different opponents five times then that meal should be your choice.

However if you choose a different meal then the cycle restarts. 

You are also given the option to customise the types of meals you want to show up.

(It is recommened that you do this, unless you fancy having to pick breakfast over dessert)

[Live Demo](https://rxthew.github.io/mealwars)


## Remarks 

All meals in this app are fetched from the [Meal Db](https://themealdb.com) database.

This app served to solidify my undertanding the `useEffect` and `useState` hooks. I learned many valuable lessons by consulting React's documentation.
The most prominent one which comes to mind involved handling stale references to state and props. This was particularly challenging when factoring
in the dependency list required by `useEffect` in certain instances. The ability to set the state via a callback was somewhat of a breakthrough, 
especially when the reference to state is being pulled from the outer lexical scope. The alternative is to implement the `useRef` hook. 

Another lesson I took on board was how React addressed changes to state, particularly during the diffing phase in the event where no change is detected 
between the original state and the change made and therefore React decides not to re-render. I solved this particular problem by attaching a unique id prop
to the component being changed, every time it is being changed as a signpost for the engine to use.

## Debugging Account

After finishing the basic logic of this app, I tended to other work and returned to it later. All I needed to do was handle some edge cases and do the
styling and it would be complete. Unfortunately, those edge cases were more difficult to handle than I anticipated. The first problem I had to deal with
was preventing the unlikely event that analogous meals are fetched (the app is about choice!). This involved some boilerplate but it did not prove to be
too much of a problem. 

The other edge case involved the situation where meal fetching fails. In this instance a message is provided to the user to refresh the browser window,
however I observed that there were instances when one meal was fetching and the other was not, so I wanted to ensure that both states were synchronised 
when a failure occurred. 

The problem was that some time before undertaking this task, I set up some cleanup functions and there were instances where they were being triggered after 
some effects were firing in the normal course of the program's workflow. Accounting for this proved to be easy, but before I discovered the culprit I was 
getting false negatives, which proved to be frustrating. 

One final hiccup occurred when I was doing basic cross-browser compatibility checks, I do not have testing equipment for these projects so I do not
expect them to work and render perfectly on all browsers, but I do a few basic checks and during a check I discovered that a particular Android phone was 
resizing the font for some buttons and that they were overflowing their containers.

I tried to reproduce the problem on different devices, but I could not. I found nothing helpful through search queries. I eventually realised that the
problem involved adjusting the phone's font-size from its settings and/or from the browser's settings (but strangely enough when I did the same thing 
with another Android phone with the same version of Chrome the problem would still not reproduce). Based on this new prior I tried making tweaks to the 
font, I read about the native element's default CSS values, and made calculated changes to no avail. 

Several deployments later, I borrowed the problematic phone and used remote dev tools to try and address the problem directly. It was still not 
straightforward, but one thing I noticed was that the `box-sizing`of the elements was set to `content-box`. I missed this because I took it for granted
that normalize.css resets this. I *had* previously looked at the stylesheet they generate - but I had been focussing on the values for the elements. 

The overflow problem was solved, but I was not satisfied. I wanted to know why some fonts were resizing and others weren't. What I eventually learned was 
that this was happening where buttons were nested inside a `<li>` element. I set `list-style` to `none` thinking that that was the only style property
associated with that element that I had to deal with, but there is a default `display: list-item` which remained unaccounted for and was causing this 
discrepancy, setting this to `block` solved the problem. I read the specification for curiosity's sake and it might have something to do with the distinction 
between block-level containers and block boxes. This still does nothing to explain why two phones with the same OS and the same browser were behaving differently,
so a full explanation eludes me. 







