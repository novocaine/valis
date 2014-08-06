/** @jsx React.DOM */
define(["lib/react", "app/gui/jsx/util"], function(React, util) {
  /**
   * Implementation of a default vobject with no fancy custom gui
   */
  var SimpleVObjectComponent = React.createClass({
    propTypes: {
      patch_model: React.PropTypes.object.isRequired,
      vobject: React.PropTypes.object.isRequired
    },

    componentWillMount: function() {
      this.setState({
        position: this.props.patch_model.vobject_positions[this.props.vobject.id]
      });
    },

    render: function() {
      if (!this.state) return; 

      var style = {
        position: "absolute",
        top: this.state.position.top,
        left: this.state.position.left
      };

      return <div className="vobject-simple" style={style}>
        <div className="inputs">
          { 
            _.range(this.props.vobject.num_inputs()).map(function() {
              return <span className="input"></span>
            })
          }
        </div>
        <div className="title">{this.props.vobject.constructor.vobject_class}</div>
        <span className="outputs">
          {
            _.range(this.props.vobject.num_outputs()).map(function() {
              return <span className="output"></span>
            })
          }
        </span>
      </div>
    }
  });

  return {
    SimpleVObjectComponent: SimpleVObjectComponent
  }
});
