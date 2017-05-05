import ReactDOM from 'react-dom';
import React from 'react';
import { ReMainCarsten } from './reMainCarsten';
import { ReMain } from './reMain';
import { ReMainRaum113 } from './reMainRaum113';

if ( window.app === 'carsten' )
  ReactDOM.render( <ReMainCarsten />, document.getElementById( 'main' ) );
else if ( window.app === 'raum113' )
  ReactDOM.render( <ReMainRaum113 />, document.getElementById( 'main' ) );
else
  ReactDOM.render( <ReMain />, document.getElementById( 'main' ) );
