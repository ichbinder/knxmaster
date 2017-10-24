import React from 'react';
import axios from 'axios';
import Jalousie from './reJalousie';
import Tick from './reJalousieTick';

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
      name: 'test'
    };
  }

  render() {
    return (
      <div className="content">
        <div className="headline">
          <h2>APITs-Day</h2>
        </div>
        <div className="raum113">
          <h3>Jalousie</h3>
          <div className="jalousie-ordnung">
            <div>
              Lings
              <p></p>
              <Jalousie openCloseGa="2/1/19" tickGa="2/1/20" name="Jalousie" />
              Tick
              <Tick tickGa="2/1/20" name="Jalousie Tick" />
            </div>
            <div>
              Rechts
              <p></p>
              <Jalousie openCloseGa="2/1/19" tickGa="2/1/20" name="Jalousie" />
              Tick
              <Tick tickGa="2/1/20" name="Jalousie Tick" />
            </div>
          </div>
        </div>
      </div>
    );
  }
}
