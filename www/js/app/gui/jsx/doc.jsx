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
          <Palette doc={this} />
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

  return {
    Doc: Doc
  }
});
