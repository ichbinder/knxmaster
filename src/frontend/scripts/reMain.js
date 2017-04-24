import React from 'react';
import axios from 'axios';
import { GroupAddr } from './reGroupAddrEditor';
import { ScanKnx } from './reScanKnx';
import BusMonitor from './reBusMonitor';

axios.defaults.baseURL = 'http://localhost:8005/';


export class ReMain extends React.Component {
  constructor( props ) {
    super( props );
    this.state =
    {
      response: {},
      btn1: '#0041d1',
      btn2: '#1385e5',
      btn3: '#1385e5',
      content: 'ScanKnx'
    };
    this._handleBtn1Change = this._handleBtn1Change.bind( this );
    this._handleBtn2Change = this._handleBtn2Change.bind( this );
    this._handleBtn3Change = this._handleBtn3Change.bind( this );
  }

  _handleBtn1Change() {
    this.state.btn1 = '#0041d1';
    this.state.btn2 = '#1385e5';
    this.state.btn3 = '#1385e5';
    this.state.content = 'ScanKnx';
    this.setState( this.state );
  }

  _handleBtn2Change() {
    this.state.btn1 = '#1385e5';
    this.state.btn2 = '#0041d1';
    this.state.btn3 = '#1385e5';
    this.state.content = 'GroupAddr';
    this.setState( this.state );
  }

  _handleBtn3Change() {
    this.state.btn1 = '#1385e5';
    this.state.btn2 = '#1385e5';
    this.state.btn3 = '#0041d1';
    this.state.content = 'BusMonitor';
    this.setState( this.state );
  }

  _selectContentRender() {
    if ( this.state.content === 'ScanKnx' ) {
      return <ScanKnx />;
    } else if ( this.state.content === 'GroupAddr' ) {
      return <GroupAddr />;
    } else if ( this.state.content === 'BusMonitor' ) {
      return <BusMonitor />;
    }
    return 'Fehler, keine DPT gefunden';
  }

  render() {
    return (
      <div className="content">
        <div className="headline">
          <h2>KNX Analyse</h2>
        </div>
        <div className="menuDiv">
          <nav className="menu">
            <button
              className="btn"
              onClick={this._handleBtn1Change}
              style={{ backgroundColor: this.state.btn1 }}
            >
              Scan KNX-Bus
            </button>
            <button
              className="btn"
              onClick={this._handleBtn2Change}
              style={{ backgroundColor: this.state.btn2 }}
            >
              API Erstellen
            </button>
            <button
              className="btn"
              onClick={this._handleBtn3Change}
              style={{ backgroundColor: this.state.btn3 }}
            >
              KNX-Busmonitor
            </button>
          </nav>
        </div>
        {this._selectContentRender()}
      </div>
    );
  }
}
