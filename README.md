# VALIS

MAX/MSP/PD-alike modular audio programming environment for the browser. 

In progress.

## Building Traceur

This project relies on traceur from github, so you need to build that before
you can build valis. 

The easiest way to do this seems to be

```
cd node_modules/traceur
make clean 
make
make bin/traceur-runtime.js
```
