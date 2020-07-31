#include <errno.h>
#include <node.h>
#include <nan.h>
#include "./i2c-dev.h"
#include "./sendbyte.h"
#include "./util.h"

static __s32 SendByte(int fd, __u8 byte) {
  return i2c_smbus_write_byte(fd, byte);
}

class SendByteWorker : public I2cAsyncWorker {
public:
  SendByteWorker(Nan::Callback *callback, int fd, __u8 byte)
    : I2cAsyncWorker(callback), fd(fd), byte(byte) {}
  ~SendByteWorker() {}

  void Execute() {
    __s32 ret = SendByte(fd, byte);
    if (ret == -1) {
      SetErrorNo(errno);
      SetErrorSyscall("sendByte");
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
  __u8 byte;
};

NAN_METHOD(SendByteAsync) {
  if (info.Length() < 3 || !info[0]->IsInt32() || !info[1]->IsInt32() || !info[2]->IsFunction()) {
    return Nan::ThrowError(Nan::ErrnoException(EINVAL, "sendByte",
      "incorrect arguments passed to sendByte(int fd, int byte, function cb)"));
  }

  int fd = Nan::To<int32_t>(info[0]).FromJust();
  __u8 byte = Nan::To<int32_t>(info[1]).FromJust();
  Nan::Callback *callback = new Nan::Callback(info[2].As<v8::Function>());

  Nan::AsyncQueueWorker(new SendByteWorker(callback, fd, byte));
}

NAN_METHOD(SendByteSync) {
  if (info.Length() < 2 || !info[0]->IsInt32() || !info[1]->IsInt32()) {
    return Nan::ThrowError(Nan::ErrnoException(EINVAL, "sendByteSync",
      "incorrect arguments passed to sendByteSync(int fd, int byte)"));
  }

  int fd = Nan::To<int32_t>(info[0]).FromJust();
  __u8 byte = Nan::To<int32_t>(info[1]).FromJust();

  __s32 ret = SendByte(fd, byte);
  if (ret == -1) {
    return Nan::ThrowError(Nan::ErrnoException(errno, "sendByteSync", ""));
  }
}

