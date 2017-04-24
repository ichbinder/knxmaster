import express from 'express';

const router = new express.Router();

router
  .get( '/', ( req, res ) => {
    res.render( 'pIndex' );
  } )
  .get( '/apitsday', ( req, res ) => {
    res.render( 'pCarsten' );
  } );

module.exports = router;
