define(["lib/lodash"], function(_) {
  "use strict"

  var MAX_VOBJECT_OUTPUTS = 32;
  var MAX_VOBJECT_INPUTS = 32;

  var i = 0;

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
      this.blocked = {};
      this.ready = [];
    }

    are_inputs_ready(vobject) {
      var num_active_inputs = this.graph.num_active_inputs[vobject];
      if (!num_active_inputs) {
        return true;
      }

      return (this.input_buffers[vobject.id] &&
              this.input_buffers[vobject.id].count === 
                num_active_inputs);
    }

    process_vobject(vobject) {
      // do we have all the input buffers waiting?
      if (!this.are_inputs_ready(vobject)) {
        // we don't, put it on the blocked list
        this.blocked[vobject.id] = true;
        return;
      }

      // create a buffer for each active output
      var output_buffers = {};
      for (var output_index in this.graph.dedges[vobject.id]) {
        var output_type = vobject.get_output_type(output_index);

        if (output_type === "stream") {
          // supply buffer to vobject
          output_buffers[output_index] = this.buffer_pool.get_buffer();                
        } else {
          // vobject will assign (or not, if its not sending a control
          // message this frame)
          output_buffers[output_index] = null;
        }
      }

      var input_buffers = this.input_buffers[vobject.id];
      var context = { 
        sample_time: this.sample_time,
        sample_rate: this.sample_rate,
        ext_input_buffers: this.ext_input_buffers,
        ext_output_buffers: this.ext_output_buffers,
        input_buffers: input_buffers && input_buffers.buffers, 
        output_buffers: output_buffers
      };

      vobject.process(context);

      if (input_buffers) {
        for (var k in input_buffers.buffers) {
          var b = input_buffers[k];
          if (!(b instanceof ControlMessage)) { 
            this.buffer_pool.release_buffer(input_buffers[k]);
          }
        }
      }

      delete this.input_buffers[vobject.id];

      // okay, write out the data to the input buffers of the head vobjects
      for (var output=0; output < vobject.num_outputs(); output++) {
        // get edges to head vobjects from this output
        var output_edges = this.graph.dedges[vobject.id][output];
        if (!output_edges) {
          return;
        }
      
        // send outputs to head vobjects
        for (var i=0; i < output_edges.length; i++) {
          var edge = output_edges[i];
          if (!this.input_buffers[edge.to.id]) {
            this.input_buffers[edge.to.id] = {};
            // store count because we don't want to manually count the entries
            // in an object..sigh
            this.input_buffers[edge.to.id].count = 0;
            this.input_buffers[edge.to.id].buffers = {};
          }

          // don't copy, just transfer ref
          var b = output_buffers[output];
          if (!((b instanceof Float32Array) || (b instanceof ControlMessage))) {
            throw new Error("Invalid output emitted by vobject");
          }

          this.input_buffers[edge.to.id].buffers[edge.to_input] = b;
          this.input_buffers[edge.to.id].count++;

          // check if the vobject is now unblocked and wake it if so, it now
          // has enough data to be processed
          if (this.are_inputs_ready(edge.to)) {
            delete this.blocked[edge.to.id];
            this.ready.push(edge.to);
          }
        }
      }
    }

    run() {
      // process all the sources, this will put all their ready children in the ready
      // list to begin with; there has to be at least one that can proceed
      for (var source_id in this.graph.sources) {
        this.process_vobject(this.graph.sources[source_id]);
      }

      while (true) {
        // ideally this would pick a ready vobject that would allow unblocking 
        // the largest number of other vobjects so that waiting input buffers
        // can be released - this would reduce the size of the working set. 
        var vobject = this.ready.pop();
        if (!vobject) {
          break;
        }
        this.process_vobject(vobject);
      }

      if (this.blocked.length > 0) {
        throw new Error("Feedback loops not supported");
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
        return new Float32Array(this.size);
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
      // maps vobject id -> vobject. a 'source' is a node of the graph with
      // no incoming edges i.e. purely a producer of output
      this.sources = {};

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

      // tracks the number of inputs that have a connected dedge for each vobject
      // this is used by the engine to deduce when a vobject's input buffers
      // have been filled and it is ready to process
      this.num_active_inputs = {};

      // this is just here so its quick to iterate over all the vobjects
      // (and look them up if need be)
      this._vobjects = {};
    }

    add_vobject(vobject) {
      // initially, will be a source because it has no inputs
      this.sources[vobject.id] = vobject;
      this.dedges[vobject.id] = {};
      this._vobjects[vobject.id] = vobject;
    }

    remove_vobject(vobject) {
      delete this.sources[vobject.id];
      delete this._vobjects[vobject.id];

      // for all outgoing dedges going from this object, reduce
      // the number of active inputs on the target vobjects by 1
      var outputs = this.dedges[vobject.id];
      for (var o in outputs) {
        var dedges = outputs[o];
        for (var ei in dedges) {
          var dedge = dedges[ei];
          this.num_active_inputs[dedge.to.id] -= 1;
        }
      }

      // remove edges going from the object
      delete this.dedges[vobject.id];

      // remove edges going to the object
      for (var from_vid in this.dedges) {
        var outputs = this.dedges[from_vid];
        var del_outputs = [];
        for (var o in outputs) {
          var dedges = outputs[o];
          var deletes = []
          for (var ei in dedges) {
            var dedge = dedges[ei];
            if (dedge.to === vobject) {
              deletes.push(ei);              
            }
          }

          if (deletes.length === dedges.length) {
            // no more edges left from that output, remove the entry
            // for the output
            del_outputs.push(o);
          } else {
            for (var i=0; i < deletes.length; i++) {
              delete dedges[deletes[i]];
            }
          }
        }

        for (var d=0; d < del_outputs.length; d++) {
          delete outputs[o];
        }
      }
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

      output_edges.push(new DEdge(from, from_output, to, to_input));

      var nai = this.num_active_inputs[to.id] || 0;
      this.num_active_inputs[to.id] = nai + 1;

      // remove arrow vobject from sources list now that its no longer a 
      // source
      delete this.sources[to.id];
    }

    remove_dedge(from, from_output, to, to_input) {
      var edges = this.dedges[from.id][from_output]
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

      this.num_active_inputs[to.id] -= 1;

      var has_inputs = false;
      // if 'to' no longer has any inputs pointing at it, add it back to 
      // the sources list
      for (var from_vid in this.dedges) {
        var outputs = this.dedges[from_vid];
        var del_outputs = [];
        for (var o in outputs) {
          var dedges = outputs[o];
          for (var ei in dedges) {
            if (dedge.to === to) {
              has_inputs = true;
            }
          }

          if (has_inputs) { 
            break;
          }
        }

        if (has_inputs) {
          break;
        }
      }

      if (!has_inputs) {
        this.sources[to.id] = to;        
      }
    }

    num_active_inputs(vobject) {
      // 'active' in the sense that theres one edge connected (you 
      // can only have max one edge connected to an input)
      return this.dedges_to[vobject.id].length;
    }

    num_active_outputs(vobject) {
      var edge_map = this.dedges[vobject.id];
      var sum = 0;
      for (k in edge_map) {
        sum++;
      }
      return sum;
    }

    iter_dedges() {
      /* generator - can't really see how to use the * syntax in a class? */
      return _.bind(function*() {
        var outputs = this.dedges[vobject.id];
        for (var o in outputs) {
          var dedges = outputs[o];
          for (var ei in dedges) {
            yield ei;
          }
        }
      }, this)();
    }

    get vobjects() {
      return this._vobjects;
    }
  }

  return {
    Engine: Engine,
    VObjectGraph: VObjectGraph
  }
});
