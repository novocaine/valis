define(['lodash'], (_) => {
  const AudioArrayType = Float32Array;

  class Engine {
    constructor() {
      this.graph = new VObjectGraph();
      this.bufferSize = 8192;
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
    }

    stop() {
      if (this.audioNode) {
        this.audioNode.disconnect(this.context.destination);
      }
      this.running = false;
    }

    onaudioprocess(e) {
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
        this.bufferPool);

      this.audioProcess.run();
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
    constructor(sampleTime,
        sampleRate,
        extInputBuffers,
        extOutputBuffers,
        graph,
        bufferPool) {
      this.sampleTime = sampleTime;
      this.sampleRate = sampleRate;
      this.extInputBuffers = extInputBuffers;
      this.extOutputBuffers = extOutputBuffers;
      this.bufferPool = bufferPool;
      this.graph = graph;
      this.inputBuffers = {};
    }

    run() {
      // generate the graph's data for one sample
      const context = {
        sampleTime: this.sampleTime,
        sampleRate: this.sampleRate,
        extInputBuffers: this.extInputBuffers,
        extOutputBuffers: this.extOutputBuffers,
        getBuffer: this.bufferPool ? _.bind(this.bufferPool.getBuffer,
          this.bufferPool) : null
      };

      const getOutput = (vobject, output) => {
        const inputs = _.reduce(this.graph.dedgesTo[vobject.id],
          (memo, inputDedge, toInput) => {
            memo[toInput] = getOutput(inputDedge.from,
              inputDedge.fromOutput);
            return memo;
          }, {});

        const result = vobject.generate(context, inputs,
          this.graph.dedges[vobject.id]);

        if (result && result.length) {
          return result[output];
        }

        return null;
      };

      _.forOwn(this.graph.leaves, (vobject) =>
        getOutput(vobject, 0)
      );
    }
  }

  class BufferPool {
    /* simple pool that re-uses allocated buffers to avoid unnecessary
     * allocations and memory churn - maybe the allocator would do this
     * anyway, maybe it wouldn't */
    constructor(size) {
      this.heap = [];
      this.size = size;
    }

    getBuffer() {
      const buf = this.heap.pop();
      if (!buf) {
        return new AudioArrayType(this.size);
      }
      return buf;
    }

    releaseBuffer(buf) {
      this.heap.push(buf);
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
        delete this.dedges[dedge.from.id];
      });

      delete this.leaves[vobject.id];
    }

    addDedge(from, fromOutput, to, toInput) {
      let outputEdges = null;
      if (!(from.id in this.dedges)) {
        this.degdges[from.id] = {};
      } else {
        outputEdges = this.dedges[from.id][fromOutput];
      }
      if (!outputEdges) {
        outputEdges = [];
        this.dedges[from.id][fromOutput] = outputEdges;
      }

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
      const result = {};
      _.forOwn(this.dedges, (outputs) => {
        _.forOwn(outputs, (dedges) => {
          _.forOwn(dedges, (dedge, id) => {
            result[id] = dedge;
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
