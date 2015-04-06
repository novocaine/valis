/** @jsx React.DOM */
define(["lib/react", "app/gui/jsx/util", "jquery"], 
function(React, util, $) {
  /**
   * Implementation of a default vobject with no fancy custom gui
   */
  var SimpleVObjectComponent = React.createClass({
    propTypes: {
      patch_model: React.PropTypes.object.isRequired,
      patch_component: React.PropTypes.object.isRequired,
      vobject: React.PropTypes.object.isRequired
    },

    componentWillMount: function() {
      this.setState({
        position: this.props.patch_model.vobject_positions[this.props.vobject.id]
      });
    },

    componentDidMount: function() {
      this.makeDraggable();
      var domNode = $(this.getDOMNode());
      this.props.patch_model.set_vobject_size(this.props.vobject.id,
                                              domNode.outerWidth(true), 
                                              domNode.outerHeight(true));
    },

    componentDidUpdate: function() {
      var domNode = $(this.getDOMNode());
      this.props.patch_model.set_vobject_size(this.props.vobject.id,
                                              domNode.outerWidth(true), 
                                              domNode.outerHeight(true));
    },

    makeDraggable: function() {
      $(this.getDOMNode()).draggable({
        drag: _.bind(function(event, ui) {
          this.setState({
            position: {
              x: ui.position.left,
              y: ui.position.top
            }
          });
        }, this),
        stop: _.bind(function(event, ui) {
          this.setState({
            position: {
              x: ui.position.left,
              y: ui.position.top
            }
          });
        }, this)
      }).addClass("draggable");
    },

    onOutputMouseDown: function(e) {
      var patchElem = $(this.getDOMNode()).parents(".patch");
      if (!patchElem.length) {
        throw new Error("couldn't find parent patch");
      }

      this.props.patch_component.startDrawingDedge(this, 
        parseInt($(e.currentTarget).attr("data-output-index"), 10),
        e.clientX, 
        e.clientY);
      return false;
    },

    render: function() {
      if (!this.state) return; 

      var style = {
        position: "absolute",
        top: this.state.position.y,
        left: this.state.position.x
      };

      return <div className="vobject-simple" data-vobject-id={this.props.vobject.id} 
              style={style}>
        <div className="inputs">
          { 
            _.range(this.props.vobject.num_inputs()).map(function(i) {
              return <span className="input" data-input-index={i}></span>
            })
          }
        </div>
        <div className="title">{this.props.vobject.constructor.vobject_class}</div>
        <div className="outputs">
          {
            _.range(this.props.vobject.num_outputs()).map(function(i) {
              return <span className="output" data-output-index={i}
                        onMouseDown={this.onOutputMouseDown}></span>
            }, this)
          }
        </div>
      </div>
    }
  });

  return {
    SimpleVObjectComponent: SimpleVObjectComponent
  }
});
