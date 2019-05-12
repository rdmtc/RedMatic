#include <errno.h>
#include <node.h>
#include <nan.h>
#include "./i2c-dev.h"
#include "./writebyte.h"
#include "./util.h"

static __s32 WriteByte(int fd, __u8 cmd, __u8 byte) {
  return i2c_smbus_write_byte_data(fd, cmd, byte);
}

class WriteByteWorker : public I2cAsyncWorker {
public:
  WriteByteWorker(Nan::Callback *callback, int fd, __u8 cmd, __u8 byte)
    : I2cAsyncWorker(callback), fd(fd), cmd(cmd), byte(byte) {}
  ~WriteByteWorker() {}

  void Execute() {
    __s32 ret = WriteByte(fd, cmd, byte);
    if (ret == -1) {
      SetErrorNo(errno);
      SetErrorSyscall("writeByte");
    }
  }

  void HandleOKCallback() {
    Nan::HandleScope scope;

    v8::Local<v8::Value> argv[] = {
      Nan::Null()
    };

    callback->Call(1, argv, async_resource);
  }

private:
  int fd;
  __u8 cmd;
  __u8 byte;
};

NAN_METHOD(WriteByteAsync) {
  if (info.Length() < 4 || !info[0]->IsInt32() || !info[1]->IsInt32() || !info[2]->IsInt32() || !info[3]->IsFunction()) {
    return Nan::ThrowError(Nan::ErrnoException(EINVAL, "writeByte",
      "incorrect arguments passed to writeByte"
      "(int fd, int cmd, int byte, function cb)"));
  }

  int fd = Nan::To<int32_t>(info[0]).FromJust();
  __u8 cmd = Nan::To<int32_t>(info[1]).FromJust();
  __u8 byte = Nan::To<int32_t>(info[2]).FromJust();
  Nan::Callback *callback = new Nan::Callback(info[3].As<v8::Function>());

  Nan::AsyncQueueWorker(new WriteByteWorker(callback, fd, cmd, byte));
}

NAN_METHOD(WriteByteSync) {
  if (info.Length() < 3 || !info[0]->IsInt32() || !info[1]->IsInt32() || !info[2]->IsInt32()) {
    return Nan::ThrowError(Nan::ErrnoException(EINVAL, "writeByteSync",
      "incorrect arguments passed to writeByteSync(int fd, int cmd, int byte)"));
  }

  int fd = Nan::To<int32_t>(info[0]).FromJust();
  __u8 cmd = Nan::To<int32_t>(info[1]).FromJust();
  __u8 byte = Nan::To<int32_t>(info[2]).FromJust();

  __s32 ret = WriteByte(fd, cmd, byte);
  if (ret == -1) {
    return Nan::ThrowError(Nan::ErrnoException(errno, "writeByteSync", ""));
  }
}

