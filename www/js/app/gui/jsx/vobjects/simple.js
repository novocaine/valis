define(['react', 'react-dom', 'jquery', 'lodash',
        'lib/react-textarea-autosize/TextareaAutosize'],
(React, ReactDOM, $, _, Textarea) => {
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

    onDoubleClick(e) {
      this.showPropertiesPage();
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
          <span className="vobject-class"
            dangerouslySetInnerHTML={ { __html: this.props.vobject.constructor.vobjectSymbol } }
          />
          <Textarea className="args" rows={1} onBlur={this.onChangeArgs}
            defaultValue={this.props.vobject.args.join()}
          />
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
    },

    onChangeArgs(e) {
      const args = this.props.vobject.constructor.processArgString(e.target.value);
      if (_.isEqual(this.props.vobject.args, args)) {
        return;
      }
      this.props.patchModel.updateVobjectArgs(this.props.vobject, args);
      // re-render so that all vobject refs gets updated
      this.props.patchComponent.setState({});
    },
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
