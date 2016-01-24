define(["lib/lodash"], function(_) {
  "use strict"

  var MAX_VOBJECT_OUTPUTS = 32;
  var MAX_VOBJECT_INPUTS = 32;

  var i = 0;

  var AudioArrayType = Float32Array;

  class Engine {
    constructor() {
      this.graph = new VObjectGraph();
      this.buffer_size = 8192;
      this.num_channels = 2;
    }

    start() {
      this.buffer_pool = new BufferPool(this.buffer_size);
      this.context = new (window.AudioContext || window.webkitAudioContext)(); 
      this.audio_node = this.context.createScriptProcessor(this.buffer_size, 0, 
        this.num_channels);
      this.audio_node.onaudioprocess = _.bind(this.onaudioprocess, this);
      this.output_edges = {};

      // if you dont do this, the callback stops getting fired after a while on
      // chrome .. yep .. wow .. such bug
      // https://code.google.com/p/chromium/issues/detail?id=82795
      window.onaudioprocess = this.audio_node.onaudioprocess;
      window.audio_node = this.audio_node;

      this.audio_node.connect(this.context.destination);
      this.running = true;
    }

    stop() {
      if (this.audio_node) {
        this.audio_node.disconnect(this.context.destination);
      }
      this.running = false;
    }
    
    onaudioprocess(e) {
      var ext_output_buffers = [];
      for (var i=0; i < e.outputBuffer.numberOfChannels; i++) {
        ext_output_buffers.push(e.outputBuffer.getChannelData(i));
      }

      // output buffers aren't necessarily zero when you get them from the system
      this.write_silence(ext_output_buffers);

      var ext_input_buffers = [];
      if (e.inputBuffer) {
        for (var i=0; i < e.inputBuffer.numberOfChannels; i++) {
          ext_input_buffers.push(e.inputBuffer.getChannelData(i));
        }
      }

      // time in samples since context init, is fractional (sigh)
      this.audio_process = new AudioProcess(
        this.context.currentTime * this.context.sampleRate, 
        this.context.sampleRate,
        ext_input_buffers,
        ext_output_buffers,
        this.graph, 
        this.buffer_pool);
      
      this.audio_process.run();
    }

    write_silence(ext_output_buffers) {
      for (var i=0; i < ext_output_buffers.length; i++) {
        var data = ext_output_buffers[i]; 
        for (var s=0; s < data.length; s++) {
          data[s] = 0;
        }
      }
    }
  }

  class AudioProcess {
    constructor(sample_time, 
        sample_rate,
        ext_input_buffers, 
        ext_output_buffers, 
        graph, 
        buffer_pool) 
    {
      this.sample_time = sample_time;
      this.sample_rate = sample_rate;
      this.ext_input_buffers = ext_input_buffers;
      this.ext_output_buffers = ext_output_buffers;
      this.buffer_pool = buffer_pool;
      this.graph = graph;
      this.input_buffers = {};
    }

    run() {
      // generate the graph's data for one sample
      var context = { 
        sample_time: this.sample_time,
        sample_rate: this.sample_rate,
        ext_input_buffers: this.ext_input_buffers,
        ext_output_buffers: this.ext_output_buffers,
        get_buffer: this.buffer_pool ? _.bind(this.buffer_pool.get_buffer, 
          this.buffer_pool) : null
      };

      var get_output = _.bind(function(vobject, output) {
        var inputs = {};
        for (var to_input in this.graph.dedges_to[vobject.id]) {
          var input_dedge = this.graph.dedges_to[vobject.id][to_input];
          inputs[to_input] = get_output(input_dedge.from, 
            input_dedge.from_output);
        }

        var result = vobject.generate(context, inputs, 
          this.graph.dedges[vobject.id]);

        if (result && result.length) {
          return result[output];
        } else {
          return null;
        }
      }, this);

      for (var vobject_id in this.graph.leaves) {
        get_output(this.graph.leaves[vobject_id], 0); 
      }
    }
  }

  class BufferPool {
    constructor(size) {
      this.heap = [];
      this.size = size;
    }

    get_buffer() {
      var buf = this.heap.pop();
      if (!buf) {
        return new AudioArrayType(this.size);
      }
      return buf;
    }

    get_buffers(n) {
      var result = [];
      while (n-- >= 0) {
        result.push(this.get_buffer());        
      }
      return result;
    }

    release_buffer(buf) {
      this.heap.push(buf);
    }

    release_buffers(bobj) {
      for (var k in bobj) {
        this.release_buffer(bobj[k]);
      }
    }
  }

  class DEdge {
    /**
     * A directed edge in a graph of VObjects
     *
     * @param from {VObject} the tail vobject
     * @param from_output {int} the output index on the tail vobject
     * @param to {VObject} the arrow vobject
     * #param to_output {int} the input index on the arrow vobject
     */
    constructor(from, from_output, to, to_input) {
      this.from = from;
      this.from_output = from_output;
      this.to = to;
      this.to_input = to_input;
    }
  }

  class VObjectGraph {
    constructor() {
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
      this.dedges = new Map();

      // lookup of vobject -> incoming dedges (will be in sync with
      // this.dedges)
      this.dedges_to = new Map();

      // list of vobjects in the graph
      this.vobjects = new Map();
    }

    add_vobject(vobject) {
      // initially, will be a leaf because it has no outputs
      this.leaves[vobject.id] = vobject;
      this.dedges[vobject.id] = {};
      this.vobjects[vobject.id] = vobject;
    }

    remove_vobject(vobject) {
      delete this.vobjects[vobject.id];

      // remove edges going from the object
      delete this.dedges[vobject.id];

      // remove edges going to the object
      for (var to_input in this.dedges_to[vobject.id]) {
        var dedge = this.dedges_to[vobject.id][to_input];
        delete this.dedges[dedge.from.id];
      }

      delete this.leaves[vobject.id];
    }

    add_dedge(from, from_output, to, to_input) {
      var output_edges = null;
      if (!from.id in this.dedges) {
        this.degdges[from.id] = {}
      } else {
        output_edges = this.dedges[from.id][from_output];
      }
      if (!output_edges) {
        output_edges = [];
        this.dedges[from.id][from_output] = output_edges;
      }

      var dedge = new DEdge(from, from_output, to, to_input);

      output_edges.push(dedge);

      if (!(to.id in this.dedges_to)) {
        this.dedges_to[to.id] = {};
      }
      this.dedges_to[to.id][to_input] = dedge;

      delete this.leaves[from.id];
    }

    remove_dedge(from, from_output, to, to_input) {
      var edges = this.dedges[from.id][from_output];
      for (var i=0; i < edges.length; i++) {
        if (edges[i].from === from && edges[i].from_output === from_output 
            && edges[i].to === to && edges[i].to_input === to_input) {
          edges.splice(i);
        }
      }

      // if theres no more edges from that output, delete the entry entirely
      if (!edges.length) {
        delete this.dedges[from.id][from_output];
      }

      delete this.dedges_to[to.id][to_input];

      // did from just become a leaf?
      var any_outputs = false;
      for (var i=0; i < this.dedges[from.id].length; i++) {
        if (this.dedges[from.id].length) {
          any_outputs = true;
          break;
        }
      }

      if (!any_outputs) {
        this.leaves[from.id] = from;
      }
    }

    iter_dedges(callback) {
      /* XXX: generator stuff in emca6 was still pretty flaky when writing this */
      for (var vid in this.dedges) {
        var outputs = this.dedges[vid];
        for (var o in outputs) {
          var dedges = outputs[o];
          for (var ei in dedges) {
            callback(dedges[ei]);
          }
        }
      }
    }
  }

  return {
    Engine: Engine,
    VObjectGraph: VObjectGraph,
    AudioProcess: AudioProcess,
    AudioArrayType: AudioArrayType
  }
});
