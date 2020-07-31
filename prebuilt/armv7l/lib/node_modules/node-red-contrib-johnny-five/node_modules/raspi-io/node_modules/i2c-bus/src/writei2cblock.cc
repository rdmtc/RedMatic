#include <errno.h>
#include <node.h>
#include <nan.h>
#include "./i2c-dev.h"
#include "./writei2cblock.h"
#include "./util.h"

static __s32 WriteI2cBlock(int fd, __u8 cmd, __u8 length, const __u8 *block) {
  return i2c_smbus_write_i2c_block_data(fd, cmd, length, block);
}

class WriteI2cBlockWorker : public I2cAsyncWorker {
public:
  WriteI2cBlockWorker(
    Nan::Callback *callback,
    int fd,
    __u8 cmd,
    __u32 length,
    const __u8* block,
    v8::Local<v8::Object> &bufferHandle
  ) : I2cAsyncWorker(callback), fd(fd), cmd(cmd), length(length), block(block) {
    SaveToPersistent("buffer", bufferHandle);
  }

  ~WriteI2cBlockWorker() {}

  void Execute() {
    __s32 ret = WriteI2cBlock(fd, cmd, length, block);
    if (ret == -1) {
      SetErrorNo(errno);
      SetErrorSyscall("writeI2cBlock");
    }
  }

  void HandleOKCallback() {
    Nan::HandleScope scope;

    v8::Local<v8::Value> bufferHandle = GetFromPersistent("buffer");

    v8::Local<v8::Value> argv[] = {
      Nan::Null(),
      Nan::New<v8::Integer>(length),
      bufferHandle
    };

    callback->Call(3, argv, async_resource);
  }

private:
  int fd;
  __u8 cmd;
  __u32 length;
  const __u8* block;
};

NAN_METHOD(WriteI2cBlockAsync) {
  if (info.Length() < 5 ||
      !info[0]->IsInt32() ||
      !info[1]->IsInt32() ||
      !info[2]->IsUint32() ||
      !info[3]->IsObject() ||
      !info[4]->IsFunction()) {
    return Nan::ThrowError(Nan::ErrnoException(EINVAL, "writeI2cBlock",
      "incorrect arguments passed to writeI2cBlock"
      "(int fd, int cmd, int length, Buffer buffer, function cb)"));
  }

  int fd = Nan::To<int32_t>(info[0]).FromJust();
  __u8 cmd = Nan::To<int32_t>(info[1]).FromJust();
  __u32 length = Nan::To<uint32_t>(info[2]).FromJust();
  v8::Local<v8::Object> bufferHandle = info[3].As<v8::Object>();
  Nan::Callback *callback = new Nan::Callback(info[4].As<v8::Function>());

  const __u8* bufferData = (const __u8*) node::Buffer::Data(bufferHandle);
  size_t bufferLength = node::Buffer::Length(bufferHandle);

  if (length > I2C_SMBUS_I2C_BLOCK_MAX) {
    return Nan::ThrowError(Nan::ErrnoException(EINVAL, "writeI2cBlock",
      "writeI2cBlock can't write blocks with more than 32 bytes"));
  }

  if (length > bufferLength) {
    return Nan::ThrowError(Nan::ErrnoException(EINVAL, "writeI2cBlock",
      "buffer passed to writeI2cBlock contains less than 'length' bytes"));
  }

  Nan::AsyncQueueWorker(new WriteI2cBlockWorker(
    callback,
    fd,
    cmd,
    length,
    bufferData,
    bufferHandle
  ));
}

NAN_METHOD(WriteI2cBlockSync) {
  if (info.Length() < 4 ||
      !info[0]->IsInt32() ||
      !info[1]->IsInt32() ||
      !info[2]->IsUint32() ||
      !info[3]->IsObject()) {
    return Nan::ThrowError(Nan::ErrnoException(EINVAL, "writeI2cBlockSync",
      "incorrect arguments passed to writeI2cBlockSync"
      "(int fd, int cmd, int length, Buffer buffer)"));
  }

  int fd = Nan::To<int32_t>(info[0]).FromJust();
  __u8 cmd = Nan::To<int32_t>(info[1]).FromJust();
  __u32 length = Nan::To<uint32_t>(info[2]).FromJust();
  v8::Local<v8::Object> bufferHandle = info[3].As<v8::Object>();

  const __u8* bufferData = (const __u8*) node::Buffer::Data(bufferHandle);
  size_t bufferLength = node::Buffer::Length(bufferHandle);

  if (length > I2C_SMBUS_I2C_BLOCK_MAX) {
    return Nan::ThrowError(Nan::ErrnoException(EINVAL, "writeI2cBlockSync",
      "writeI2cBlockSync can't write blocks with more than 32 bytes"));
  }

  if (length > bufferLength) {
    return Nan::ThrowError(Nan::ErrnoException(EINVAL, "writeI2cBlockSync",
      "buffer passed to writeI2cBlockSync contains less than 'length' bytes"));
  }

  __s32 ret = WriteI2cBlock(fd, cmd, length, bufferData);
  if (ret == -1) {
    return Nan::ThrowError(Nan::ErrnoException(errno, "writeI2cBlockSync", ""));
  }
}

