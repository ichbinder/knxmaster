import express from 'express';

const router = new express.Router();

router
  /**
    * Rendern von dem Frontend
  **/
  .get( '/', ( req, res ) => {
    res.render( 'pIndex' );
  } )
  /**
    * Rendern von dem Frontend
  **/
  .get( '/apitsday', ( req, res ) => {
    res.render( 'pCarsten' );
  } )
  .get( '/raum113', ( req, res ) => {
    res.render( 'pRaum113' );
  } );

module.exports = router;
