import React from 'react';
import axios from 'axios';
import Logger from './reLogger';

// die URL zur Backend RestAPI um mit /api/getAllGaOfDPT die GA abzurufen
axios.defaults.baseURL = 'http://playground.cm.htw-berlin.de:8020/';
// axios.defaults.baseURL = 'http://localhost:8020/';

/**
  * Dies ist die Webseite die es ermöglicht den KNX-Bus auf Busteilnehmer zu Scannen
**/
export class ScanKnx extends React.Component {
  constructor( props ) {
    super( props );
    this.state =
      { phyAddress: '',
        log: 'hallo' };

    this._handlePaChange = this._handlePaChange.bind( this );
    this._handleScanKnxChange = this._handleScanKnxChange.bind( this );
    this._handleLogChange = this._handleLogChange.bind( this );
  }

  componentDidMount() {

  }

  _handlePaChange( event ) {
    this.state.phyAddress = event.target.value;
    this.setState( this.state );
  }

  _handleScanKnxChange() {
    axios.post( '/api/scanKnx', { phyAddress: this.state.phyAddress } )
    .then( ( response ) => {
      console.log( 'testtest:', response );
      this.state.log = response.data;
      this.setState( this.state );
    } )
    .catch( ( error ) => {
      console.log( error );
    } );
  }

  _handleLogChange( event ) {
    this.state.log = event.target.value;
    this.setState( this.state );
  }

  render() {
    return (
      <div className="scanKnx" >
        <h3>KNX-Bus Scannen</h3>
        <label>
          Bitte geben Sie eine oder mehrere phykalische Adresse ein
          (z.B. 1.1.1 1.1.2 1.1.3-1.1.10):
        </label>
        <input
          type="text"
          value={this.state.pa}
          placeholder="z.B. 1.1.1"
          onChange={this._handlePaChange}
        />
        <p></p>
        <button className="btn" onClick={this._handleScanKnxChange}>Senden</button>
        <Logger msg={this.state.log} />
      </div>
    );
  }
}
