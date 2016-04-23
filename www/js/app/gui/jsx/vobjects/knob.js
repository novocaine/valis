define(['react', 'react-dom', 'jquery', 'jquery.knob'],
(React, ReactDOM, $, _) => {
  const Knob = React.createClass({
    propTypes: {
      vobject: React.PropTypes.object.isRequired,
      min: React.PropTypes.number.isRequired,
      max: React.PropTypes.number.isRequired,
      propName: React.PropTypes.string.isRequired,
      width: React.PropTypes.number,
      height: React.PropTypes.number
    },

    getDefaultProps() {
      return {
        width: 50,
        height: 50
      };
    },

    componentDidMount() {
      $(ReactDOM.findDOMNode(this)).find('input').knob();
    },

    render() {
      return (
        <div className="knob">
          <label>
            <input type="text" value={this.getValue()}
              data-min={this.props.min}
              data-max={this.props.max}
              data-width={this.props.width}
              data-height={this.props.height} />

            <div>
              { this.props.propName }
            </div>
          </label>
        </div>
      );
    },

    getValue() {
      return this.props.vobject[this.props.propName];
    }
  });

  return Knob;
});
