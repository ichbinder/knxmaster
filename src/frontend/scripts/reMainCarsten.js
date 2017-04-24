import React from 'react';
import axios from 'axios';

axios.defaults.baseURL = 'http://playground.cm.htw-berlin.de:8020/';


export class ReMainCarsten extends React.Component {
  constructor( props ) {
    super( props );
    this.state =
    {
      dpt: 'DPT1',
      groupAddr: '2/0/50',
      value: '1'
    };
    this._handleBtn1Change = this._handleBtn1Change.bind( this );
    this._handleBtn2Change = this._handleBtn2Change.bind( this );
  }

  _handleBtn1Change() {
    axios.post( '/api/writeDpt',
      {
        ga: this.state.groupAddr,
        value: '1',
        dpt: this.state.dpt
      } )
      .then( ( response ) => {
        console.log( response );
        this.setState( this.state );
      } )
      .catch( ( error ) => {
        console.log( error );
      } );
  }

  _handleBtn2Change() {
    axios.post( '/api/writeDpt',
      {
        ga: this.state.groupAddr,
        value: '0',
        dpt: this.state.dpt
      } )
      .then( ( response ) => {
        console.log( response );
        this.setState( this.state );
      } )
      .catch( ( error ) => {
        console.log( error );
      } );
  }

  render() {
    return (
      <div className="content">
        <div className="headline">
          <h2>APITs-Day</h2>
        </div>
        <div className="apitsday">
          <button
            className="btn"
            onClick={this._handleBtn1Change}
          >
            Jalousien Raum 001 Runter
          </button>
          <button
            className="btn"
            onClick={this._handleBtn2Change}
          >
            Jalousien Raum 001 Hoch
          </button>
        </div>
      </div>
    );
  }
}
