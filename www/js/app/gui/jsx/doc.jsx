/** @jsx React.DOM */
define(["lib/react", 
        "lib/jquery-ui", 
        "jquery",
        "app/gui/jsx/patch",
        "app/vobject_factory"],
function(React, jqueryui, $, patch_component, vobject_factory) {
  /**
   * The top-level 'document' component.
   */
  var Doc = React.createClass({
    propTypes: {
      patch_model: React.PropTypes.object.isRequired
    },     

    render: function() {
      return (
        <div className="doc">
          <div className="toolbar">
            <Palette doc={this} />
            <EnableAudio doc={this} />
          </div>
          <patch_component.PatchComponent ref="rootPatch" doc={this} 
            patch_model={this.props.patch_model} />
        </div>
      )
    }
  });

  /**
   * The tool palette, containing vobjects to drag into the patch.
   */
  var Palette = React.createClass({
    render: function() {

      return <ul className="palette"> {
        _.mapValues(vobject_factory.vobject_classes, 
          function(vclass, cname) {
            return <li className="palette-item" 
                       key={cname} data-classname={cname}>{cname}</li>;
          })
      } </ul>
    },

    componentDidMount: function() {
      $(this.getDOMNode()).find("li").each(_.bind(function(i, li) {
        $(li).draggable({
          opacity: 0.7,
          helper: "clone",
          revert: "invalid"
        })
      }, this));
    }
  });

  var EnableAudio = React.createClass({
    render: function() {
      return <button className="enable-audio" onClick={this.onClick}>{
        this.props.doc.props.patch_model.audio_enabled() ? 
          "Disable Audio" : "Enable Audio" 
      }</button>;
    },

    onClick: function() {
      this.props.doc.props.patch_model.enable_audio(
        !this.props.doc.props.patch_model.audio_enabled());
      this.setState({});
    }
  });

  return {
    Doc: Doc
  }
});
