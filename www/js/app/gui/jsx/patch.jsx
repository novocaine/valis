/** @jsx React.DOM */
define(["lib/react", 
        "lib/lodash", 
        "app/gui/jsx/vobjects/simple", 
        "app/vobject_factory"],
function(React, lodash, simple, vobject_factory) {
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
            <DrawingDedgeLine ref="drawingDedgeLine" />
            {
              _.bind(function() { 
                var result = [];
                this.props.patch_model.graph.iter_dedges(_.bind(function(dedge) {
                  result.push(
                    <DEdge dedge={dedge} patch_model={this.props.patch_model} />);
                }, this));
                return result;
              }, this)()
            }
          </svg>
        </div>
      )
    },

    renderVObject: function(patch_model, vobject) {
      return (
        <simple.SimpleVObjectComponent 
          vobject={vobject} 
          key={vobject.id} 
          patch_model={patch_model} 
          patch_component={this} />
      );
    },

    componentDidMount: function() {
      $(this.getDOMNode()).droppable({
        accept: ".palette-item",
        drop: _.bind(function(event, ui) {
          var vobject = vobject_factory.create(ui.helper.attr("data-classname"));
          var domNode = $(this.getDOMNode());
          var offset = domNode.offset();
          this.props.patch_model.add_vobject(vobject, 
                                             ui.position.left - offset.left,
                                             ui.position.top - offset.top);
          // trigger re-render
          this.setState({});
        }, this)
      });
    },

    startDrawingDedge: function(fromVobjectComponent, fromOutputNum, clientX, clientY) {
      // create line svg in parent patch svg
      var line = this.refs.drawingDedgeLine;

      // convert to co-ordinates within this div
      var offset = $(line.getDOMNode()).offset();
      var x = clientX - offset.left;
      var y = clientY - offset.top;

      var domNode = $(this.getDOMNode());
      // attach patch-wide mousemove
      domNode.on("mousemove", function(emm) {
        line.setState({ 
          startX: x,
          startY: y,
          drawToX: emm.clientX - offset.left,
          drawToY: emm.clientY - offset.top,
          visible: true
        });
        return false;
      });

      domNode.on("mouseup", _.bind(function(e) {
        domNode.off("mousemove");
        line.setState({
          visible: false
        });

        // dropped on an input?
        var elem = $(document.elementFromPoint(e.clientX, e.clientY));
        if (!elem.length) {
          return;
        }

        var input = elem.closest("[data-input-index]");
        if (!input.length) {
          return;
        }
        
        var vobjectElem = elem.closest("[data-vobject-id]");
        if (!vobjectElem.length) {
          return;
        }

        var toVobject = this.props.patch_model.graph.vobjects[
          parseInt(vobjectElem.attr("data-vobject-id"), 10)];
        var toInput = parseInt(input.attr("data-input-index"), 10);

        this.props.patch_model.graph.add_dedge(
          fromVobjectComponent.props.vobject, 
          fromOutputNum,
          toVobject,
          toInput);
        this.setState({});
      }, this));
    }
  });

  /**
   * The line being drawn while user draws a new dedge
   */
  var DrawingDedgeLine = React.createClass({
    getInitialState: function() { 
      return { visible: false };
    }, 

    render: function() {
      var style = {
        visibility: this.state.visible ? "visible" : "hidden",
        strokeWidth: 1,
        stroke: "rgb(0, 0, 0)"
      };

      return <line x1={this.state.startX} 
              y1={this.state.startY} 
              x2={this.state.drawToX}
              y2={this.state.drawToY} 
              style={style} />
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
        x: vobject_from_pos.x + this.props.dedge.from_output * DEdge.output_x_padding,
        y: vobject_from_pos.y + vobject_from_pos.dy
      };

      // calculate arrow pos
      var vobject_to = this.props.dedge.to;
      vobject_to_pos = this.props.patch_model.vobject_positions[
        vobject_to.id];
      var arrow_pos = {
        x: vobject_to_pos.x + this.props.dedge.to_input * DEdge.input_x_padding,
        y: vobject_to_pos.y
      };

      var style = {
        strokeWidth: 1,
        stroke: "rgb(0, 0, 0)"
      };

      return (
        <line x1={tail_pos.x} 
          y1={tail_pos.y} 
          x2={arrow_pos.x}
          y2={arrow_pos.y} 
          style={style} />
      );
    }
  });

  return {
    PatchComponent: PatchComponent
  }
});
