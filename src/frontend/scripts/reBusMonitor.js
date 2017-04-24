import React from 'react';
import ReactDOM from 'react-dom';

const socket = new WebSocket( 'ws://playground.cm.htw-berlin.de:8020/api/busMonitor' );

export default class BusMonitor extends React.Component {
  constructor( props ) {
    super( props );
    this.state = {
      msg: '',
      stopStartLog: true,
      filterSysGA: false
    };

    socket.onopen = () => {
      socket.send( 'Connectet' ); // Send the message 'Ping' to the server
    };
    this._handleLogChange = this._handleLogChange.bind( this );
    this._handleSysGaChange = this._handleSysGaChange.bind( this );
    this._handleMonOnOffChange = this._handleMonOnOffChange.bind( this );
  }

  componentWillMount() {
    this.state.stopStartLog = true;
  }

  componentDidUpdate() {
    const node = ReactDOM.findDOMNode( this.refs.title );
    node.scrollTop = node.scrollHeight;
  }

  componentWillUnmount() {
    this.state.stopStartLog = false;
  }

  _handleLogChange( event ) {
    this.state.msg = event.target.value;
    this.setState( this.state );
  }

  _handleSysGaChange( event ) {
    console.log( event.target.value );
    this.state.filterSysGA = event.target.checked;
    this.setState( this.state );
  }

  _handleMonOnOffChange() {
    if ( this.state.stopStartLog )
      this.state.stopStartLog = false;
    else
      this.state.stopStartLog = true;
    this.setState( this.state );
  }

  render() {
    socket.onmessage = ( value ) => {
      if ( this.state.stopStartLog ) {
        console.log( value.data );
        if ( this.state.filterSysGA ) {
          if ( value.data.search( /dest: 0\/*/i ) === -1 )
            this.state.msg += `\n ${value.data}`;
        } else {
          this.state.msg += `\n ${value.data}`;
        }
        this.setState( this.state );
      }
    };
    const buttonValue = { name: 'An', color: '#1385e5' };
    if ( !this.state.stopStartLog ) {
      buttonValue.name = 'Aus';
      buttonValue.color = '#0041d1';
    }
    return (
      <div className="scanKnx">
        <div className="monitorHeadline">
          <h3>KNX-Bus Monitor</h3>
          <div className="monitorHeadline">
            <p>System GA nicht anzeigen: </p>
            <input
              type="checkbox"
              value={this.state.filterSysGA}
              onChange={this._handleSysGaChange}
            />
          </div>
          <button
            className="btn"
            style={{ backgroundColor: buttonValue.color }}
            onClick={this._handleMonOnOffChange}
          >
              Monitor {buttonValue.name}
          </button>
        </div>
        <div className="scanLogger">
          <textarea
            value={this.state.msg}
            onChange={this._handleLogChange}
            ref="title"
            readOnly
          />
        </div>
      </div>
    );
  }
}
