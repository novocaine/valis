define(['react',
        'react-dom',
        'lodash',
        'app/gui/jsx/vobjects/simple',
        'app/vobject_factory',
        'jquery'],
(React, ReactDOM, _, simple, vobjectFactory, $) => {
  const PatchComponent = React.createClass({
    propTypes: {
      patchModel: React.PropTypes.object.isRequired
    },

    render() {
      return (
        <div className="patch">
          <div className="vobjects">
            {
              _.map(this.props.patchModel.graph.vobjects, (vobject) =>
                <simple.SimpleVObjectComponent
                  vobject={vobject}
                  key={vobject.id}
                  patchModel={this.props.patchModel}
                  patchComponent={this} />
              )
            }
          </div>
          <svg>
            <DrawingDedgeLine ref="drawingDedgeLine" />
            {
                _.map(this.props.patchModel.graph.getAllDedges(), (dedge) =>
                    <DEdge dedge={dedge} patchModel={this.props.patchModel}
                      patchComponent={this} key={dedge.id()} />
                )
            }
          </svg>
        </div>
      );
    },

    componentDidMount() {
      $(ReactDOM.findDOMNode(this)).droppable({
        accept: '.palette-item',
        drop: (event, ui) => {
          const vobject = vobjectFactory.create(ui.helper.attr('data-classname'));
          const domNode = $(ReactDOM.findDOMNode(this));
          const offset = domNode.offset();
          this.props.patchModel.addVobject(vobject,
            ui.position.left - offset.left,
            ui.position.top - offset.top);
          // trigger re-render
          this.setState({});
          // focus args of the new object, XXX: seems to break into react's dom
          $(`[data-vobject-id=${vobject.id}] textarea`).focus();
        }
      });
    },

    startDrawingDedge(fromVobjectComponent, fromOutputNum, clientX, clientY) {
      const line = this.refs.drawingDedgeLine;

      // convert clientX, clientY from window co-ordinates to patch
      // co-ordinates
      const domNode = $(ReactDOM.findDOMNode(this));
      const offset = domNode.offset();
      const startX = clientX - offset.left;
      const startY = clientY - offset.top;

      // attach patch-wide mousemove
      domNode.on('mousemove', (emm) => {
        line.setState({
          startX,
          startY,
          drawToX: emm.clientX - offset.left,
          drawToY: emm.clientY - offset.top,
          visible: true
        });
        return false;
      });

      domNode.one('mouseup', (e) => {
        domNode.off('mousemove');
        line.setState({
          visible: false
        });

        // dropped on an input?
        const elem = $(document.elementFromPoint(e.clientX, e.clientY));
        if (!elem.length) {
          return;
        }

        const input = elem.closest('[data-input-index]');
        if (!input.length) {
          return;
        }

        const vobjectElem = elem.closest('[data-vobject-id]');
        if (!vobjectElem.length) {
          return;
        }

        const toVobject = this.props.patchModel.graph.vobjects[
          parseInt(vobjectElem.attr('data-vobject-id'), 10)];
        const toInput = parseInt(input.attr('data-input-index'), 10);

        this.props.patchModel.graph.addDedge(
          fromVobjectComponent.props.vobject,
          fromOutputNum,
          toVobject,
          toInput);
        this.setState({});
      });
    },

    updateVobject(vobjectComponent) {
      // redraw the edges attached to this vobject (maybe it moved)
      // XXX for now ..
      this.forceUpdate();
    }
  });

  /**
   * The line being drawn while user draws a new dedge
   */
  const DrawingDedgeLine = React.createClass({
    getInitialState() {
      return { visible: false };
    },

    render() {
      const style = {
        visibility: this.state.visible ? 'visible' : 'hidden',
        strokeWidth: 1,
        stroke: 'rgb(0, 0, 0)'
      };

      return (<line x1={this.state.startX}
        y1={this.state.startY}
        x2={this.state.drawToX}
        y2={this.state.drawToY}
        style={style} />);
    }
  });

  const DEdge = React.createClass({
    // hard-coded sizing metrics to avoid having to do lookups against the
    // live elements. TODO - maybe we could look this up once then cache them?
    statics: {
      outputXPadding: 30,
      outputXLeftMargin: 28,
      inputXPadding: 30,
      inputXLeftMargin: 28,
      vobjectHeight: 44
    },

    propTypes: {
      dedge: React.PropTypes.object.isRequired,
      patchModel: React.PropTypes.object.isRequired,
      patchComponent: React.PropTypes.object.isRequired
    },

    render() {
      // calculate tail pos
      const vobjectFrom = this.props.dedge.from;
      const vobjectFromPos = this.props.patchModel.vobjectPositions[
        vobjectFrom.id];

      const tailPos = {
        x: vobjectFromPos.x + DEdge.outputXLeftMargin + (
          this.props.dedge.fromOutput * DEdge.outputXPadding),
        y: vobjectFromPos.y + DEdge.vobjectHeight
      };

      // calculate arrow pos
      const vobjectTo = this.props.dedge.to;
      const vobjectToPos = this.props.patchModel.vobjectPositions[
        vobjectTo.id];

      const arrowPos = {
        x: vobjectToPos.x + DEdge.inputXLeftMargin + (
          this.props.dedge.toInput * DEdge.inputXPadding),
        y: vobjectToPos.y
      };

      return (
        <line className="dedge" x1={tailPos.x}
          y1={tailPos.y}
          x2={arrowPos.x}
          y2={arrowPos.y}
          onClick={this.onClick}/>
      );
    },

    onClick() {
      // delete
      this.props.patchModel.graph.removeDedge(
        this.props.dedge.from,
        this.props.dedge.fromOutput,
        this.props.dedge.to,
        this.props.dedge.toInput);

      this.props.patchComponent.forceUpdate();
    }
  });

  return { PatchComponent };
});
