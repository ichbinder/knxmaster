import React from 'react';
import axios from 'axios';
import Slider from 'rc-slider';

// axios.defaults.baseURL = 'http://playground.cm.htw-berlin.de:8020/';
axios.defaults.baseURL = 'http://localhost:8020/';

/**
  * dies ist eine Test webseite um die Jalousien von Raum 001 im Gebäude zu steuern.
**/
export class ReMainRaum113 extends React.Component {
  constructor( props ) {
    super( props );
    this.state =
    {
      marks:
      {
        0: { style: { color: 'black' }, label: 'Zu' },
        1: { style: { color: 'black' }, label: 'STOP' },
        2: { style: { color: 'black' }, label: 'Auf' }
      },
      responseOnOffLeft: {
        pa: '',
        value: ''
      },
      responseOnOffRight: {
        pa: '',
        value: ''
      }
    };
    this._handleJLingsChange = this._handleJLingsChange.bind( this );
  }

  _handleJLingsChange( value ) {
    const telegramm = {
      ga: '2/1/19',
      value: 1,
      dpt: 'DPT1'
    };
    if ( Object.keys( this.state.marks )[value] === '1' ) {
      telegramm.ga = '2/1/20';
    } else if ( Object.keys( this.state.marks )[value] === '2' ) {
      telegramm.value = 0;
    }
    axios.post( '/api/writeDpt', telegramm )
    .then( ( response ) => {
      this.state.responseOnOffLeft.pa = response.data.pa;
      this.state.responseOnOffLeft.value = response.data.value.data[0];
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
        <div className="raum113">
          <Slider
            vertical
            min={0}
            max={2}
            marks={this.state.marks}
            step={null}
            defaultValue={1}
            onAfterChange={this._handleJLingsChange}
            included={false}
          />
        </div>
      </div>
    );
  }
}
