define(['lodash'], (_) => {
  const AudioArrayType = Float32Array;

  class Engine {
    constructor() {
      this.graph = new VObjectGraph();
      this.bufferSize = 512;
      this.numChannels = 2;
    }

    start() {
      this.bufferPool = new BufferPool(this.bufferSize);
      this.context = new (window.AudioContext || window.webkitAudioContext)();
      this.audioNode = this.context.createScriptProcessor(this.bufferSize, 0,
        this.numChannels);
      this.audioNode.onaudioprocess = _.bind(this.onaudioprocess, this);
      this.outputEdges = {};

      // if you dont do this, the callback stops getting fired after a while on
      // chrome .. yep .. wow .. such bug
      // https://code.google.com/p/chromium/issues/detail?id=82795
      window.onaudioprocess = this.audioNode.onaudioprocess;
      window.audioNode = this.audioNode;

      this.audioNode.connect(this.context.destination);
      this.running = true;

      this.prevOutputValues = {};
    }

    stop() {
      if (this.audioNode) {
        this.audioNode.disconnect(this.context.destination);
      }
      this.running = false;
    }

    onaudioprocess(e) {
      const domTimestamp = window.performance ? window.performance.now() : null;
      const extOutputBuffers = [];
      for (let i = 0; i < e.outputBuffer.numberOfChannels; i++) {
        extOutputBuffers.push(e.outputBuffer.getChannelData(i));
      }

      // output buffers aren't necessarily zero when you get them from the system
      this.writeSilence(extOutputBuffers);

      const extInputBuffers = [];
      if (e.inputBuffer) {
        for (let i = 0; i < e.inputBuffer.numberOfChannels; i++) {
          extInputBuffers.push(e.inputBuffer.getChannelData(i));
        }
      }

      // time in samples since context init, is fractional (sigh)
      this.audioProcess = new AudioProcess(
        this.context.currentTime * this.context.sampleRate,
        this.context.sampleRate,
        extInputBuffers,
        extOutputBuffers,
        this.graph,
        this.bufferPool,
        domTimestamp,
        this.bufferSize);

      this.prevOutputValues = this.audioProcess.run(this.prevOutputValues);
    }

    writeSilence(extOutputBuffers) {
      for (let i = 0; i < extOutputBuffers.length; i++) {
        const data = extOutputBuffers[i];
        for (let s = 0; s < data.length; s++) {
          data[s] = 0;
        }
      }
    }
  }

  class AudioProcess {
    // has the lifetime of one onaudioprocess callback
    constructor(sampleTime,
        sampleRate,
        extInputBuffers,
        extOutputBuffers,
        graph,
        bufferPool,
        domTimestamp,
        bufferSize) {
      this.sampleTime = Math.round(sampleTime);
      this.sampleRate = sampleRate;
      this.extInputBuffers = extInputBuffers;
      this.extOutputBuffers = extOutputBuffers;
      this.bufferPool = bufferPool;
      this.graph = graph;
      this.inputBuffers = {};
      this.domTimestamp = domTimestamp;
      this.bufferSize = bufferSize;
    }

    run(prevOutputValues) {
      // Generate the graph's data for one sample.
      //
      // prevOutputValues is the outputValues of the previous run(), used for
      // handling feedback loops.
      const context = {
        sampleTime: this.sampleTime,
        sampleRate: this.sampleRate,
        extInputBuffers: this.extInputBuffers,
        extOutputBuffers: this.extOutputBuffers,
        getBuffer: this.bufferPool ? _.bind(this.bufferPool.getBuffer,
          this.bufferPool) : null,
        domTimestamp: this.domTimestamp,
        bufferSize: this.bufferSize
      };

      // recording of all outputs generated during this traversal; returned to
      // the caller who then passes it forward as prevOutputValues to the next
      // run
      const outputValues = {};

      // tracks which objects have been visited during this traversal
      const visited = {};

      const getOutput = (vobject, output) => {
        const outputPath = `${vobject.id}[${output}]`;

        // check in cache
        const cachedResult = _.get(outputValues, outputPath, undefined);

        // TODO - so we're not caching when a vobject returns falsy or [] ..
        if (cachedResult !== undefined) {
          return cachedResult;
        }

        // check if we have a circularity
        if (visited[vobject.id]) {
          // feedback loop, provide val from previous run
          return _.get(prevOutputValues, outputPath, undefined);
        }
        visited[vobject.id] = true;

        // eagerly evaluate arguments
        const inputs = _.reduce(this.graph.dedgesTo[vobject.id],
          (memo, inputDedge, toInput) => {
            const result = getOutput(inputDedge.from,
              inputDedge.fromOutput);
            if (result !== undefined) {
              memo[toInput] = result;
            }
            return memo;
          }, {});

        // do actual work of this vobject
        const result = vobject.generate(context, inputs,
          this.graph.dedges[vobject.id]);

        // cache output values
        outputValues[vobject.id] = result;

        if (result && result.length) {
          return result[output];
        }

        return undefined;
      };

      _.forOwn(this.graph.leaves, (vobject) =>
        getOutput(vobject, 0)
      );

      return outputValues;
    }
  }

  class BufferPool {
    constructor(size) {
      this.heap = [];
      this.size = size;
    }

    getBuffer() {
      /* just use the JS engine's heap for now, could optimize this to try to
       * re-use them later */
      return new AudioArrayType(this.size);
    }
  }

  class DEdge {
    /**
     * A directed edge in a graph of VObjects
     *
     * @param from {VObject} the tail vobject
     * @param fromOutput {int} the output index on the tail vobject
     * @param to {VObject} the arrow vobject
     * #param toOutput {int} the input index on the arrow vobject
     */
    constructor(from, fromOutput, to, toInput) {
      this.from = from;
      this.fromOutput = fromOutput;
      this.to = to;
      this.toInput = toInput;
    }

    id() {
      return `${this.from.id},${this.fromOutput},${this.to.id},${this.toInput}`;
    }
  }

  class VObjectGraph {
    constructor() {
      // TODO - these can all be made maps
      this.leaves = {};

      // one way map of vobject -> outgoing dedges
      //
      // {
      //   (from vobject id): {
      //      (from output index): [Dedge]
      //   }
      // }
      //
      // i.e. you can have multiple edges from each output
      this.dedges = {};

      // lookup of vobject -> incoming dedges (will be in sync with
      // this.dedges)
      this.dedgesTo = {};

      // list of vobjects in the graph
      this.vobjects = {};
    }

    addVobject(vobject) {
      // initially, will be a leaf because it has no outputs
      this.leaves[vobject.id] = vobject;
      this.dedges[vobject.id] = {};
      this.vobjects[vobject.id] = vobject;
    }

    removeVobject(vobject) {
      delete this.vobjects[vobject.id];

      // remove edges going from the object
      delete this.dedges[vobject.id];

      // remove edges going to the object
      _.forOwn(this.dedgesTo[vobject.id], (dedge) => {
        const newEdges = _.filter(this.dedges[dedge.from.id][dedge.fromOutput],
          (iterDedge) => {
            return iterDedge.to !== vobject;
          });
        if (newEdges.length === 0) {
          delete this.dedges[dedge.from.id][dedge.fromOutput];
          if (_.keys(this.dedges[dedge.from.id]).length === 0) {
            delete this.dedges[dedge.from.id];
          }
        } else {
          this.dedges[dedge.from.id][dedge.fromOutput] = newEdges;
        }
      });
      delete this.dedgesTo[vobject.id];
      delete this.leaves[vobject.id];
    }

    replaceVobject(vobject, newVobject) {
      this.addVobject(newVobject);
      _.forOwn(this.dedgesTo[vobject.id], (dedge) => {
        // TODO: what if the number of inputs changes?
        this.addDedge(dedge.from, dedge.fromOutput, newVobject, dedge.toInput);
      });
      _.forOwn(this.dedges[vobject.id], (edges) => {
        _.forOwn(edges, (dedge) => {
          // TODO: what if the number of outputs changes?
          this.addDedge(newVobject, dedge.fromOutput, dedge.to, dedge.toInput);
        });
      });
      this.removeVobject(vobject);
    }

    addDedge(from, fromOutput, to, toInput) {
      if (!(from.id in this.dedges)) {
        this.dedges[from.id] = {};
      }
      if (!this.dedges[from.id][fromOutput]) {
        this.dedges[from.id][fromOutput] = [];
      }
      const outputEdges = this.dedges[from.id][fromOutput];
      const dedge = new DEdge(from, fromOutput, to, toInput);
      outputEdges.push(dedge);

      if (!(to.id in this.dedgesTo)) {
        this.dedgesTo[to.id] = {};
      }
      this.dedgesTo[to.id][toInput] = dedge;

      delete this.leaves[from.id];
    }

    removeDedge(from, fromOutput, to, toInput) {
      const edges = this.dedges[from.id][fromOutput];
      for (let i = 0; i < edges.length; i++) {
        if (edges[i].from === from && edges[i].fromOutput === fromOutput
            && edges[i].to === to && edges[i].toInput === toInput) {
          edges.splice(i);
        }
      }

      // if theres no more edges from that output, delete the entry entirely
      if (!edges.length) {
        delete this.dedges[from.id][fromOutput];
      }

      delete this.dedgesTo[to.id][toInput];

      // did from just become a leaf?
      let anyOutputs = false;
      for (let i = 0; i < this.dedges[from.id].length; i++) {
        if (this.dedges[from.id].length) {
          anyOutputs = true;
          break;
        }
      }

      if (!anyOutputs) {
        this.leaves[from.id] = from;
      }
    }

    // XXX - is there a syntax for making this a generator??
    getAllDedges() {
      const result = [];
      _.forOwn(this.dedges, (outputs) => {
        _.forOwn(outputs, (dedges) => {
          _.each(dedges, (dedge) => {
            result.push(dedge);
          });
        });
      });
      return result;
    }
  }

  return {
    Engine, VObjectGraph, AudioProcess, AudioArrayType
  };
});
