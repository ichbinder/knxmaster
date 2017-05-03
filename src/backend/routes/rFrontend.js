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
  } );

module.exports = router;
