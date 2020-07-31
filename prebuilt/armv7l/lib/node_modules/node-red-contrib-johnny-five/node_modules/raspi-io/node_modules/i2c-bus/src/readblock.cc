#include <errno.h>
#include <node.h>
#include <nan.h>
#include "./i2c-dev.h"
#include "./readblock.h"
#include "./util.h"

static __s32 ReadBlock(int fd, __u8 cmd, __u8 *block) {
  return i2c_smbus_read_block_data(fd, cmd, block);
}

class ReadBlockWorker : public I2cAsyncWorker {
public:
  ReadBlockWorker(
    Nan::Callback *callback,
    int fd,
    __u8 cmd,
    __u8* block,
    v8::Local<v8::Object> &bufferHandle
  ) : I2cAsyncWorker(callback), fd(fd), cmd(cmd), block(block), bytesRead(0) {
    SaveToPersistent("buffer", bufferHandle);
  }

  ~ReadBlockWorker() {}

  void Execute() {
    bytesRead = ReadBlock(fd, cmd, block);
    if (bytesRead == -1) {
      SetErrorNo(errno);
      SetErrorSyscall("readBlock");
    }
  }

  void HandleOKCallback() {
    Nan::HandleScope scope;

    v8::Local<v8::Value> bufferHandle = GetFromPersistent("buffer");

    v8::Local<v8::Value> argv[] = {
      Nan::Null(),
      Nan::New<v8::Integer>(bytesRead),
      bufferHandle
    };

    callback->Call(3, argv, async_resource);
  }

private:
  int fd;
  __u8 cmd;
  __u8* block;
  __s32 bytesRead;
};

NAN_METHOD(ReadBlockAsync) {
  if (info.Length() < 4 ||
      !info[0]->IsInt32() ||
      !info[1]->IsInt32() ||
      !info[2]->IsObject() ||
      !info[3]->IsFunction()) {
    return Nan::ThrowError(Nan::ErrnoException(EINVAL, "readBlock",
      "incorrect arguments passed to readBlock"
      "(int fd, int cmd, Buffer buffer, function cb)"));
  }

  int fd = Nan::To<int32_t>(info[0]).FromJust();
  __u8 cmd = Nan::To<int32_t>(info[1]).FromJust();
  v8::Local<v8::Object> bufferHandle = info[2].As<v8::Object>();
  Nan::Callback *callback = new Nan::Callback(info[3].As<v8::Function>());

  __u8* bufferData = (__u8*) node::Buffer::Data(bufferHandle);
  size_t bufferLength = node::Buffer::Length(bufferHandle);

  if (bufferLength < 1) {
    return Nan::ThrowError(Nan::ErrnoException(EINVAL, "readBlock",
      "buffer passed to readBlock has no space for reading data"));
  }

  Nan::AsyncQueueWorker(new ReadBlockWorker(
    callback,
    fd,
    cmd,
    bufferData,
    bufferHandle
  ));
}

NAN_METHOD(ReadBlockSync) {
  if (info.Length() < 3 ||
      !info[0]->IsInt32() ||
      !info[1]->IsInt32() ||
      !info[2]->IsObject()) {
    return Nan::ThrowError(Nan::ErrnoException(EINVAL, "readBlockSync",
      "incorrect arguments passed to readBlockSync"
      "(int fd, int cmd, Buffer buffer)"));
  }

  int fd = Nan::To<int32_t>(info[0]).FromJust();
  __u8 cmd = Nan::To<int32_t>(info[1]).FromJust();
  v8::Local<v8::Object> bufferHandle = info[2].As<v8::Object>();

  __u8* bufferData = (__u8*) node::Buffer::Data(bufferHandle);
  size_t bufferLength = node::Buffer::Length(bufferHandle);

  if (bufferLength < 1) {
    return Nan::ThrowError(Nan::ErrnoException(EINVAL, "readBlockSync",
      "buffer passed to readBlockSync has no space for reading data"));
  }

  __s32 bytesRead = ReadBlock(fd, cmd, bufferData);
  if (bytesRead == -1) {
    return Nan::ThrowError(Nan::ErrnoException(errno, "readBlockSync", ""));
  }

  info.GetReturnValue().Set(Nan::New<v8::Integer>(bytesRead));
}

