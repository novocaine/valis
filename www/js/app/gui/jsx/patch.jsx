/** @jsx React.DOM */
define(["lib/react", "lib/lodash", "app/gui/jsx/vobjects/simple"],
function(React, lodash, simple) {
  var PatchComponent = React.createClass({
    propTypes: {
      patch_model: React.PropTypes.object.isRequired
    },

    render: function() {
      
      return (
        <div className="patch">
          <div className="vobjects"> 
            {
              _.mapValues(this.props.patch_model.graph.vobjects, function(vobject) {
                return this.renderVObject(this.props.patch_model, vobject);
              }, this)
            }
          </div>
          <svg> 
            {
              _.map(this.props.patch_model.graph.iter_dedges, function(dedge) {
                return <DEdge dedge={dedge} patch_model={patch_model} />
              })
            }
          </svg>
        </div>
      )
    },

    renderVObject: function(patch_model, vobject) {
      return (
        <simple.SimpleVObjectComponent vobject={vobject} 
          key={vobject.id} patch_model={patch_model} />
      );
    },

    vobject_dropped: function(vobject, position, offset) {
      this.props.patch_model.add_vobject(vobject, position);
      // trigger re-render
      this.setState({});
    }
  });

  var DEdge = React.createClass({
    statics: {
      output_x_padding: 10,
      input_x_padding: 10
    }, 

    propTypes: {
      dedge: React.PropTypes.object.isRequired,
      patch_model: React.PropTypes.object.isRequired
    },

    render: function() {
      // calculate tail pos
      var vobject_from = this.props.dedge.from;
      vobject_from_pos = this.props.patch_model.vobject_positions[
        vobject_from.id];
      var tail_pos = {
        x: vobject_from_pos.x + this.props.from_output * this.output_x_padding,
        y: vobject_from_pos.y
      };

      // calculate arrow pos
      var vobject_to = this.props.dedge.to;
      vobject_to_pos = this.props.patch_model.vobject_positions[
        vobject_to.id];
      var arrow_pos = {
        x: vobject_to_pos.x + this.props.to_input * this.input_x_padding,
        y: vobject_to_pos.y
      };

      return (
        <path d={ "M " + tail_pos.x + " " + tail_pos.y + 
                  " L " + arrow_pos.x + " " + arrow_pos.y } />
      );
    }
  });

  return {
    PatchComponent: PatchComponent
  }
});
