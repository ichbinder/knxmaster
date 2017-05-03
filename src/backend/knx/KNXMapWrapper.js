import cmd from 'node-cmd';

/**
  * Diese Klasse ermöglicht es mit KnxMap zu komunizieren obwohl es ein Python
  * Programm ist. Dies kann dadurch ermöglicht werden weil das Programm als Konsolen
  * Programm aufgeruffen werden kann. Diese Kalassr Interpretiert die ergebnisse und gibt sie aus.
  * @param ipAddress die IP des KNX-Routers
  * @param der speicherord auf der Festplatte von KnxMap
**/
export default class KNXMapWrapper {
  constructor( ipAddress, knxmapPath = 'knxmap' ) {
    this.ip = ipAddress;
    this.knxmap = knxmapPath;
  }

  /**
    * Scant den Bus auf KNX-Busteilnehmer
    * @param pa physikalische Adresse die gescannt werden sollen.
    * @return die gefundenen Pas
  **/
  scanKNXBus( pa ) {
    return new Promise( ( resolve, reject ) => {
      console.log( `${this.knxmap} scan ${this.ip} ${pa}` );
      cmd.get( `${this.knxmap} scan ${this.ip} ${pa}`, ( data, err, stderr ) => {
        if ( err ) reject( `err: ${err} stderr: ${stderr}` );
        const tmp = data.split( 'Bus Devices:' )[1];
        if ( tmp )
          resolve( tmp.replace( / /g, '' ).split( /\n/ ).filter( Boolean ) );
        else
          resolve( null );
      } );
    } );
  }

  /**
    * Liest die Mask aus einem Busteilnehmer aus.
    * @param pa die pa von der die Mask ausgelesen werden soll.
    * @return die Mask der pa
  **/
  devDescriptorRead( pa ) {
    return new Promise( ( resolve, reject ) => {
      cmd.get( `${this.knxmap} apci ${this.ip} ${pa} DeviceDescriptor_Read`,
        ( data, err, stderr ) => {
          if ( err ) reject( `err: ${err} stderr: ${stderr}` );
          if ( stderr )
            resolve( stderr.replace( /\s/g, '' ).replace( /^b/g, '' ).replace( /'/g, '' ) );
          else
            resolve( null );
        } );
    } );
  }

  /**
    * Liest einen bestimten Memory Teil aus einem Busteilnehmer aus.
    * @param pa der Busteilnehmer der ausgelesen werden soll
    * @param memoryAddress der startpunkt von dem aus dem Memory ausgelesen werden soll
    * @param readCount wie viel Adressen sollen ausgelesen werden
    * @return gibt die speicheradresse inhalt als hex aus
  **/
  memoryRead( pa, memoryAddress, readCount = 1 ) {
    return new Promise( ( resolve, reject ) => {
      cmd.get(
        `${this.knxmap} apci ${this.ip} ${pa} Memory_Read \
        --memory-address ${memoryAddress} \
        --read-count ${readCount}`,
        ( data, err, stderr ) => {
          if ( err ) reject( `err: ${err} stderr: ${stderr}` );
          if ( stderr )
            resolve( stderr.replace( /\s/g, '' ).replace( /^b/g, '' ).replace( /'/g, '' ) );
          else
            resolve( null );
        } );
    } );
  }

  /**
    * Mit dieser Methode können die Eigenschaften eines KNX-Busteilnehmers ausgelesen werden
    * @param pa der Busteilnehmer der ausgelesen werden soll
    * @param pid property-id, bedeutet welche Eigenschaften soll ausgelesen werden
    * @param oid object-index welcher Teil der Eigenschaften soll ausgelesen werden
    * @param sid start-index startpunkt von dem aus dem Memory ausgelesen werden soll
    * @param elements wie viel speicheradressen sollen ausgelesen werden
    * @return gibt den ausgelesenden Wert zurück in hex
  **/
  propertyValueRead( pa, pid, oid = 0, sid = 1, elements = 1 ) {
    return new Promise( ( resolve, reject ) => {
      cmd.get(
        `${this.knxmap} apci ${this.ip} ${pa} PropertyValue_Read \
        --property-id ${pid} \
        --object-index ${oid} \
        --elements ${elements} \
        --start-index ${sid}`,
        ( data, err, stderr ) => {
          if ( err ) reject( `err: ${err} stderr: ${stderr}` );
          if ( stderr )
            resolve( stderr.replace( /\s/g, '' ).replace( /^b/g, '' ).replace( /'/g, '' ) );
          else
            resolve( null );
        } );
    } );
  }
}
