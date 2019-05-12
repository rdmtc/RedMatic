var util = require('util');
var alphaChars = require('./alphaChars');
var numChars = require('./numChars');
var padend = require('lodash.padend');

function Backpack(io, options){

  if(io.io){
    //allow j5 board to be passed in
    this.io = io.io;
  }else{
    this.io = io;
  }

  options = options || {};

  this.options = options;

  this.address = options.address || 0x70;

  this.io.i2cConfig(0);
  this.io.i2cWrite(this.address, [0x21]); // turn on oscillator
  this.io.i2cWrite(this.address, [0x81]); // disp on
  this.setBrightness(options.brightness || 0xF); // 0x0 to 0xF);
}


Backpack.prototype.setBrightness = function(brightness) {
    this.io.i2cWrite(this.address, [0xE0 | brightness]);
};

Backpack.prototype.clearDisplay = function() {
    this.io.i2cWrite(this.address, 0, [0,0,0,0,0,0,0,0]);
};


/*** 8x8 Matrix backpack *********************************/

function Matrix8x8(io, options){
  Backpack.apply(this, arguments);
}

util.inherits(Matrix8x8, Backpack);

Matrix8x8.prototype.clearDisplay = function() {
    this.io.i2cWrite(this.address, 0, [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]);
};

Matrix8x8.prototype.drawBitmap = function(data) {
  var splitBits = [];
  data.forEach(function(i){
    splitBits.push(i & 0xFF);
    splitBits.push(i >> 8);
  });
  this.io.i2cWrite(this.address, 0, this.rotateBuffer(splitBits));
};

Matrix8x8.prototype.rotateBuffer = function(buf){
  var tempBuf = [];
  buf.forEach( function(value) {
    //Then shift last bit over if switched on it'll switch on 2^7
      var rotated = (value >> 1) | (value << 7);
      //Casting the 16-bit integer to 8-bit
      var eightBitArray = new Uint8Array([rotated]);
      //return the 8-bit value
     tempBuf.push(eightBitArray[0]); 
  })

  return tempBuf;
};


/*** 8x16 Matrix backpack *********************************/

function Matrix8x16(io, options){
  Backpack.apply(this, arguments);
}


util.inherits(Matrix8x16, Backpack);


Matrix8x16.prototype.drawBitmap = function(data) {
  //render the thing

};



/*** 8x8 Bi-Color Matrix backpack *********************************/

function BicolorMatrix(io, options){
  Backpack.apply(this, arguments);
}


util.inherits(BicolorMatrix, Backpack);


BicolorMatrix.prototype.drawBitmap = function(data) {
  //render the thing
};




/*** Alphanumeric 4 character backpack *********************************/

function AlphaNum4(io, options){
  Backpack.apply(this, arguments);
}


util.inherits(AlphaNum4, Backpack);


AlphaNum4.prototype.writeText = function(str) {
  var desiredBits = padend(str, 4, ' ').substring(0, 4).split('').map(function(c){
    return alphaChars[c.charCodeAt(0)] || 0;
  });
  var output = [];
  desiredBits.forEach(function(i){
    output.push(i & 0xFF);
    output.push(i >> 8);
  });
  this.io.i2cWrite(this.address, 0, output);
};


/*** 7-segment display x 4 backpack *********************************/

function SevenSegment(io, options){
  Backpack.apply(this, arguments);

}


util.inherits(SevenSegment, Backpack);

SevenSegment.prototype.clearDisplay = function() {
    this.io.i2cWrite(this.address, 0, [0,0,0,0,0,0,0,0,0,0]);
};



SevenSegment.prototype.writeText = function(str) {
  str = String(str);
  var preOutput = [];
  str = str.toLowerCase();
  var splits = padend(str, 4, ' ').split('');
  var currObj = {};
  var hasColon = false;
  for (var i = 0; i < splits.length; i++) {
    if (splits[i] == ':') {
      hasColon = true;
    } else if (splits[i] == '.') {

      if(preOutput[preOutput.length - 1]){
        preOutput[preOutput.length - 1].hasPeriod = true;
      }

    } else {
      currObj.character = splits[i];
      preOutput.push(currObj);
      currObj = {};
    }
  };
  var finalOutput = [0,0,0,0,0,0,0,0,0,0];
  if (preOutput[0]) {
   finalOutput[0] = (numChars[preOutput[0].character] || 0) + (preOutput[0].hasPeriod ? 128 : 0);
  }

  if(preOutput[1]) {
    finalOutput[2] = (numChars[preOutput[1].character] || 0) + (preOutput[1].hasPeriod ? 128 : 0);
  }

  if(hasColon){
    finalOutput[4] = 255;
  }

  if(preOutput[2]) {
    finalOutput[6] = (numChars[preOutput[2].character] || 0) + (preOutput[2].hasPeriod ? 128 : 0);
  }

  if(preOutput[3]) {
    finalOutput[8] = (numChars[preOutput[3].character] || 0) + (preOutput[3].hasPeriod ? 128 : 0);
  }

  this.io.i2cWrite(this.address, 0, finalOutput);
};


/*** Bargraph 24 backpack *********************************/

function Bargraph24(io, options){
  Backpack.apply(this, arguments);
}


util.inherits(Bargraph24, Backpack);

function flipByte(b){
 var bits = [];
 var total = 0;
 for(var i = 0; i < 8; i++){
   bits.unshift((b >> i) & 1);
 }
 bits.forEach(function(bit, idx){
   total += (bit << idx);
 });

 return total;
}

Bargraph24.prototype.drawBitmap = function(rm, gm) {
  if (Array.isArray(rm)){
    gm = rm[1];
    rm = rm[0];
  }
  var output = new Array(6);
  output = output.map(flipByte);
  // first bytes
  output[0] = ((rm >> 20) << 4) + ((rm >> 8) & 0xF);
  output[1] = ((gm >> 20) << 4) + ((gm >> 8) & 0xF);
  // second bytes
  output[2] = (((rm >> 12) & 0xF) << 4) + ((rm >> 4) & 0xF);
  output[3] = (((gm >> 12) & 0xF) << 4) + ((gm >> 4) & 0xF);
  // thrid bytes
  output[4] = (((rm >> 4) & 0xF) << 4) + (rm & 0xF);
  output[5] = (((gm >> 4) & 0xF) << 4) + (gm & 0xF);

  this.io.i2cWrite(this.address, 0, output);
};

Bargraph24.prototype.drawGraph = function(data) {
  //render the thing
};



module.exports = {
  Backpack: Backpack,
  Matrix8x8: Matrix8x8,
  Matrix8x16: Matrix8x16,
  AlphaNum4: AlphaNum4,
  SevenSegment: SevenSegment,
  Bargraph24: Bargraph24
}


