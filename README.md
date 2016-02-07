# VALIS

[![Build Status](https://travis-ci.org/novocaine/valis.svg?branch=master)](https://travis-ci.org/novocaine/valis)

MAX/MSP/PD-alike modular audio programming environment for the browser. 

In progress - this isn't useful to a general audience yet.

## Demos

Only tested on Chrome 47 on OS X, YMMV with other browsers and platforms ..

[Generative Sine Waves](http://novocaine.github.io/valis/?patch=https://raw.githubusercontent.com/novocaine/valis/master/demos/generative.json) (plays sound on entering the page)

[Monosynth with MIDI Input](http://novocaine.github.io/valis/?patch=https://raw.githubusercontent.com/novocaine/valis/master/demos/midi.json) (connect a keyboard before loading the page, then play some notes)

[Empty workspace](http://novocaine.github.io/valis)

## Current Features

* Drag/drop modular programming similar to PD / MAX, with similar minimalist
  component philosophy
* (very) minimal set of builtins presently
* Write new modules using ES2015, react, and hot reloading
* JS oriented duck typing between modules

## Stack

* HTML Web Audio API - just the minimum boilerplate of one ScriptProcessorNode
  so the application can output audio. All audio processing is done in pure JS.
* ECMAScript 2015 using babel.js.
* react.js frontend.
* Karma tests (you do need a real browser to perform web audio based tests).

## TODOs

### Bugs

* The new connection drawing stuff can't handle it when the window is scrolled
* Resizing of text boxes doesn't stick, and entering arguments is crappy in general
* Never tested on anything but Chrome on OS X

### Features 

* Ability to delete nodes
* Ability to change buffer size
* Subpatches
* Hot reloading while editing module code
* Some way of sharing extension vobjects between authors
* Bit less primitive save/loading - persist patches to disk via BrowserFS or similar, and be able to load from URL
* Some sort of compatibility with Pure Data patches
* Investigate transpiling Pure Data modules using emscripten and duct tape?
* Keyboard shortcuts

### Codebase / refactors

Still some dated stuff around as the project was setup in the JS stone-age (2014).

* grunt seems to be slow / not actually a real build tool by design - build speeds
  vary wildly as it does massive amounts of unnecessary I/O for a few dumb reasons.
  How is anyone actually using this for transpiled projets? gulp? scons?? GNU make???
* Migrate to webpack/browserify, currently runtime dependencies are being
  managed manually by copying into www/js/lib
* There's no optimized build at moment as the r.js deployment broke and it needs to be
  migrated to something else anyway.
* Move CSS to LESS
* Move away from AMD / require.js to ES2015 modules.
* DRY up creation of new vobjects a little bit.
* Do less rendering in react when anything changes - maybe adopt something like
  flux?

### Documentation 

* Everything, there isn't any

### Optimizations

Currently hardly any optimization has been done, the code focuses on simplicity
and ease of implementation of modules. But here's the hitlist that should at
least be done for the framework and core modules:

* Try moving audio rendering to a web worker to avoid dropouts during GUI operation.
* More copying of buffer data using [copyWithin](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray/copyWithin) rather than just naively doing the copies in JS. One would expect the browser can directly use SIMD etc to blaze it. This only really helps straight copy situations like in the DAC, delay, not sure it's all that big a deal?
* [simd.js](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/SIMD) once [Chrome supports it](https://bugs.chromium.org/p/v8/issues/detail?id=4124).
* Culling the audio processing graph for things that aren't connected. This is
  tricky because nodes could have other side-effects - maybe some sort of
  opt-in flag?
* Fixed buffer allocation - currently we just new() when we need them. Not sure
  if this is necessarily all that helpful. Maybe the browser's heap works well if the
  allocations are following a repeated pattern as we do when processing audio.
* Some on-the-fly calcs could be stored for later rather than being repeated at
  each generate().
* Some sort of profiling harness specific to VALIS would be great.
