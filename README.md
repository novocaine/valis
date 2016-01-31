# VALIS

MAX/MSP/PD-alike modular audio programming environment for the browser. 

In progress - move along.

## Features

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

## TODO

* Migrate to webpack/browserify, currently runtime dependencies are being
  managed manually by copying into www/js/lib
* Hot reloading while editing module code
* Live editing built-ins
* Persist patches to disk via BrowserFS or similar
* Subpatches
* Some sort of compatibility with Pure Data patches
* Investigate transpiling Pure Data modules using emscripten and duct tape
