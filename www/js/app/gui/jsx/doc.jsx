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
    },

    /** 
     * invoked when a new vobject is dropped from the palette into the
     * document.
     *
     * this will get more complex when there's nested patches.
     */
    vobject_dropped: function(vobject_classname, position, offset) {
      var vobject = vobject_factory.create(vobject_classname);
      this.refs.rootPatch.vobject_dropped(vobject, position, offset);
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
            return <li key={cname} data-classname={cname}>{cname}</li>;
          })
      } </ul>
    },

    componentDidMount: function() {
      // register for drag onto the document's patch
      $(this.getDOMNode()).find("li").each(_.bind(function(i, li) {
        $(li).draggable({
          opacity: 0.7,
          helper: "clone",
          stop: _.bind(function(event, ui) {
            this.props.doc.vobject_dropped(ui.helper.attr("data-classname"),
              ui.position, ui.offset);
          }, this)
        })
      }, this));
    }
  });

  return {
    Doc: Doc
  }
});
