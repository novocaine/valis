define(['react', 'react-dom', 'jquery', 'lodash'],
(React, ReactDOM, $, _) => {
  /**
   * Implementation of a default vobject with no fancy custom gui
   */
  const SimpleVObjectComponent = React.createClass({
    propTypes: {
      patchModel: React.PropTypes.object.isRequired,
      patchComponent: React.PropTypes.object.isRequired,
      vobject: React.PropTypes.object.isRequired
    },

    componentDidMount() {
      this.makeDraggable();
    },

    onOutputMouseDown(e) {
      const patchElem = $(ReactDOM.findDOMNode(this)).parents('.patch');
      if (!patchElem.length) {
        throw new Error("couldn't find parent patch");
      }

      this.props.patchComponent.startDrawingDedge(this,
        parseInt($(e.currentTarget).attr('data-output-index'), 10),
        e.clientX,
        e.clientY);

      e.stopPropagation();
    },

    makeDraggable() {
      $(ReactDOM.findDOMNode(this)).draggable({
        drag: (event, ui) => {
          // move the patch
          this.props.patchModel.setVobjectPosition(this.props.vobject.id,
            ui.position.left,
            ui.position.top);

          // tell the parent patch to redraw it
          this.props.patchComponent.updateVobject(this);
        },
        stop: (event, ui) => {
          this.props.patchModel.setVobjectPosition(this.props.vobject.id,
              ui.position.left,
              ui.position.top);
        }
      }).addClass('draggable');
    },

    render() {
      const pos = this.props.patchModel.getVobjectPosition(this.props.vobject.id);
      const style = {
        position: 'absolute',
        top: pos.y,
        left: pos.x
      };

      return (
        <div className="vobject-simple" data-vobject-id={this.props.vobject.id}
          style={style}
        >
          <div className="inputs">
            {
              _.range(this.props.vobject.numInputs()).map((i) =>
                <span className="input" data-input-index={i} key={i}></span>
              )
            }
          </div>
          <div className="title">{this.props.vobject.constructor.vobjectClass}</div>
          <div className="outputs">
            {
              _.range(this.props.vobject.numOutputs()).map((i) =>
                (<span className="output" data-output-index={i}
                  onMouseDown={this.onOutputMouseDown} key={i}
                />)
              , this)
            }
          </div>
        </div>
      );
    }
  });

  const findVobjectElem = (vobjectId) => {
    return $(`[data-vobject-id=${vobjectId}]`);
  };

  return { SimpleVObjectComponent,
    // XXX: possibly not the right place for this, but only if we ever end up
    // with different classes of vobject
    findVobjectElem
  };
});
