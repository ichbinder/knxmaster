import React from 'react';
import ReactDOM from 'react-dom';

// öffnet ein Websocket zum Backend um so die erscanten ergebnisse von PA
// in die Webseite zu hollen
// const exampleSocket = new WebSocket( 'ws://playground.cm.htw-berlin.de:8020/api/getScanResoult' );
const exampleSocket = new WebSocket( 'ws://localhost:8020/api/getScanResoult' );

/**
  * Dies ist eine Module das in die Webseite reScanKnx geldaen wird.
  * Es dient dazu ein textarea zu einem LOG-Fenser zu machen auf dem die ergebnisse
  * des Scannes vom KNX-Bus ausgegeben wird. (Scannen von PA's)
**/
export default class Logger extends React.Component {
  constructor( props ) {
    super( props );
    this.state = {
      msg: '',
      stopStartLog: true
    };

    exampleSocket.onopen = () => {
      exampleSocket.send( 'Connectet' ); // Send the message 'Ping' to the server
    };
    this._handleLogChange = this._handleLogChange.bind( this );
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

  render() {
    exampleSocket.onmessage = ( value ) => {
      if ( this.state.stopStartLog ) {
        console.log( value.data );
        this.state.msg += `\n ${value.data}`;
        this.setState( this.state );
      }
    };

    return (
      <div className="scanLogger">
        <textarea
          value={this.state.msg}
          onChange={this._handleLogChange}
          ref="title"
          readOnly
        />
      </div>
    );
  }
}
