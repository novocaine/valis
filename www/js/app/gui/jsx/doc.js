define(['react',
        'react-dom',
        'jquery-ui',
        'jquery',
        'app/gui/jsx/patch',
        'app/vobject_factory',
        'lodash',
        'filesaver'],
(React, ReactDOM, jqueryui, $, patchComponent, vobjectFactory, _, filesaver) => {
  /**
   * The top-level 'document' component.
   */
  const Doc = React.createClass({
    propTypes: {
      patchModel: React.PropTypes.object.isRequired
    },

    render() {
      return (
        <div className="doc">
          <div className="toolbar">
            <Palette doc={this} />
            <ToJSON doc={this} />
            <EnableAudio doc={this} />
          </div>
          <patchComponent.PatchComponent ref="rootPatch" doc={this}
            patchModel={this.props.patchModel}
          />
        </div>
      );
    }
  });

  /**
   * The tool palette, containing vobjects to drag into the patch.
   */
  const Palette = React.createClass({
    render() {
      return (<ul className="palette"> {
        _.map(vobjectFactory.vobjectClasses, (vclass, cname) => {
          return (
              <li className="palette-item" key={cname} data-classname={cname}>
                {cname}
              </li>
            );
        })
      } </ul>);
    },

    componentDidMount() {
      // XXX: I think .draggable will break when we update Palette
      // (but we don't yet)
      $(ReactDOM.findDOMNode(this)).find('li').each((i, li) => {
        $(li).draggable({
          opacity: 0.7,
          helper: 'clone',
          revert: 'invalid'
        });
      });
    }
  });

  const ToJSON = React.createClass({
    propTypes: {
      doc: React.PropTypes.object.isRequired
    },

    render() {
      return (
        <button className="to-json" onClick={this.onClick}>{
          this.props.doc.props.patchModel.audioEnabled() ?
            'toJSON' : 'Enable Audio'
        }
        </button>);
    },

    onClick() {
      const json = JSON.stringify(this.props.doc.props.patchModel.toJSON());
      const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
      filesaver(blob, 'valis.json');
    }
  });

  const EnableAudio = React.createClass({
    propTypes: {
      doc: React.PropTypes.object.isRequired
    },

    render() {
      return (
        <button className="enable-audio" onClick={this.onClick}>{
          this.props.doc.props.patchModel.audioEnabled() ?
            'Disable Audio' : 'Enable Audio'
        }
        </button>);
    },

    onClick() {
      this.props.doc.props.patchModel.enableAudio(
        !this.props.doc.props.patchModel.audioEnabled());
      this.setState({});
    }
  });

  const render = (model) => {
    $('#splash-loading').hide();
    ReactDOM.render(<Doc patchModel={model} />,
      document.getElementById('doc'));
  };

  return {
    Doc,
    render
  };
});
