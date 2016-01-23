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
    },

    componentDidMount: function() {
      this.makeDraggable();
    },

    componentDidUpdate: function() {
      var domNode = $(this.getDOMNode());
    },

    makeDraggable: function() {
      $(this.getDOMNode()).draggable({
        drag: _.bind(function(event, ui) {
          // move the patch
          /* this.setState({
            position: {
              x: ui.position.left,
              y: ui.position.top
            }
          });*/
          this.props.patch_model.set_vobject_position(this.props.vobject.id,
            ui.position.left,
            ui.position.top);

          // tell the parent patch to redraw it
          this.props.patch_component.updateVobject(this);
        }, this),
        stop: _.bind(function(event, ui) {
          this.props.patch_model.set_vobject_position(this.props.vobject.id,
              ui.position.left,
              ui.position.top);
        }, this),
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

      e.stopPropagation();
    },

    render: function() {
      var pos = this.props.patch_model.get_vobject_position(this.props.vobject.id);

      var style = {
        position: "absolute",
        top: pos.y,
        left: pos.x
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

  var find_vobject_elem = function(vobject_id) {
    return $("[data-vobject-id=" + vobject_id + "]");
  };

  return {
    SimpleVObjectComponent: SimpleVObjectComponent,
    // XXX: possibly not the right place for this, but only if we ever end up
    // with different classes of vobject
    find_vobject_elem: find_vobject_elem
  }
});
