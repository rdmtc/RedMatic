#include <node.h>
#include <nan.h>
#include "./i2cfuncs.h"
#include "./deviceid.h"
#include "./readbyte.h"
#include "./readword.h"
#include "./readblock.h"
#include "./readi2cblock.h"
#include "./receivebyte.h"
#include "./sendbyte.h"
#include "./setaddr.h"
#include "./writebyte.h"
#include "./writeword.h"
#include "./writeblock.h"
#include "./writei2cblock.h"
#include "./writequick.h"
#include "./i2c-dev.h"

static void ExportInt(
  Nan::ADDON_REGISTER_FUNCTION_ARGS_TYPE target,
  const char* name,
  int value
) {
  Nan::Set(target,
    Nan::New<v8::String>(name).ToLocalChecked(),
    Nan::New<v8::Integer>(value)
  );
}

NAN_MODULE_INIT(InitAll) {
  Nan::Export(target, "i2cFuncsAsync", I2cFuncsAsync);
  Nan::Export(target, "i2cFuncsSync", I2cFuncsSync);

  Nan::Export(target, "deviceIdAsync", DeviceIdAsync);
  Nan::Export(target, "deviceIdSync", DeviceIdSync);

  Nan::Export(target, "readByteAsync", ReadByteAsync);
  Nan::Export(target, "readByteSync", ReadByteSync);

  Nan::Export(target, "readWordAsync", ReadWordAsync);
  Nan::Export(target, "readWordSync", ReadWordSync);

  Nan::Export(target, "readBlockAsync", ReadBlockAsync);
  Nan::Export(target, "readBlockSync", ReadBlockSync);

  Nan::Export(target, "readI2cBlockAsync", ReadI2cBlockAsync);
  Nan::Export(target, "readI2cBlockSync", ReadI2cBlockSync);

  Nan::Export(target, "receiveByteAsync", ReceiveByteAsync);
  Nan::Export(target, "receiveByteSync", ReceiveByteSync);

  Nan::Export(target, "sendByteAsync", SendByteAsync);
  Nan::Export(target, "sendByteSync", SendByteSync);

  Nan::Export(target, "setAddrAsync", SetAddrAsync);
  Nan::Export(target, "setAddrSync", SetAddrSync);

  Nan::Export(target, "writeByteAsync", WriteByteAsync);
  Nan::Export(target, "writeByteSync", WriteByteSync);

  Nan::Export(target, "writeWordAsync", WriteWordAsync);
  Nan::Export(target, "writeWordSync", WriteWordSync);

  Nan::Export(target, "writeBlockAsync", WriteBlockAsync);
  Nan::Export(target, "writeBlockSync", WriteBlockSync);

  Nan::Export(target, "writeI2cBlockAsync", WriteI2cBlockAsync);
  Nan::Export(target, "writeI2cBlockSync", WriteI2cBlockSync);

  Nan::Export(target, "writeQuickAsync", WriteQuickAsync);
  Nan::Export(target, "writeQuickSync", WriteQuickSync);

  ExportInt(target, "I2C_FUNC_I2C", I2C_FUNC_I2C);
  ExportInt(target, "I2C_FUNC_10BIT_ADDR", I2C_FUNC_10BIT_ADDR);
  ExportInt(target, "I2C_FUNC_PROTOCOL_MANGLING", I2C_FUNC_PROTOCOL_MANGLING);
  ExportInt(target, "I2C_FUNC_SMBUS_PEC", I2C_FUNC_SMBUS_PEC);
  ExportInt(target, "I2C_FUNC_SMBUS_BLOCK_PROC_CALL", I2C_FUNC_SMBUS_BLOCK_PROC_CALL);
  ExportInt(target, "I2C_FUNC_SMBUS_QUICK", I2C_FUNC_SMBUS_QUICK);
  ExportInt(target, "I2C_FUNC_SMBUS_READ_BYTE", I2C_FUNC_SMBUS_READ_BYTE);
  ExportInt(target, "I2C_FUNC_SMBUS_WRITE_BYTE", I2C_FUNC_SMBUS_WRITE_BYTE);
  ExportInt(target, "I2C_FUNC_SMBUS_READ_BYTE_DATA", I2C_FUNC_SMBUS_READ_BYTE_DATA);
  ExportInt(target, "I2C_FUNC_SMBUS_WRITE_BYTE_DATA", I2C_FUNC_SMBUS_WRITE_BYTE_DATA);
  ExportInt(target, "I2C_FUNC_SMBUS_READ_WORD_DATA", I2C_FUNC_SMBUS_READ_WORD_DATA);
  ExportInt(target, "I2C_FUNC_SMBUS_WRITE_WORD_DATA", I2C_FUNC_SMBUS_WRITE_WORD_DATA);
  ExportInt(target, "I2C_FUNC_SMBUS_PROC_CALL", I2C_FUNC_SMBUS_PROC_CALL);
  ExportInt(target, "I2C_FUNC_SMBUS_READ_BLOCK_DATA", I2C_FUNC_SMBUS_READ_BLOCK_DATA);
  ExportInt(target, "I2C_FUNC_SMBUS_WRITE_BLOCK_DATA", I2C_FUNC_SMBUS_WRITE_BLOCK_DATA);
  ExportInt(target, "I2C_FUNC_SMBUS_READ_I2C_BLOCK", I2C_FUNC_SMBUS_READ_I2C_BLOCK);
  ExportInt(target, "I2C_FUNC_SMBUS_WRITE_I2C_BLOCK", I2C_FUNC_SMBUS_WRITE_I2C_BLOCK);
}

NODE_MODULE(i2c, InitAll)

// Hack to speed up compilation.
// Originally all the cc files included below were listed in the sources
// section of binding.gyp. Including them here rather than compiling them
// individually, which is what happens if they're listed in binding.gyp,
// reduces the build time from 36s to 15s on a BBB.
#include "./i2cfuncs.cc"
#include "./deviceid.cc"
#include "./readbyte.cc"
#include "./readword.cc"
#include "./readblock.cc"
#include "./readi2cblock.cc"
#include "./receivebyte.cc"
#include "./sendbyte.cc"
#include "./setaddr.cc"
#include "./writebyte.cc"
#include "./writeword.cc"
#include "./writeblock.cc"
#include "./writei2cblock.cc"
#include "./writequick.cc"

