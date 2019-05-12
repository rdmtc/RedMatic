#include <errno.h>
#include <node.h>
#include <nan.h>
#include "./i2c-dev.h"
#include "./receivebyte.h"
#include "./util.h"

static __s32 ReceiveByte(int fd) {
  return i2c_smbus_read_byte(fd);
}

class ReceiveByteWorker : public I2cAsyncWorker {
public:
  ReceiveByteWorker(Nan::Callback *callback, int fd)
    : I2cAsyncWorker(callback), fd(fd) {}
  ~ReceiveByteWorker() {}

  void Execute() {
    byte = ReceiveByte(fd);
    if (byte == -1) {
      SetErrorNo(errno);
      SetErrorSyscall("receiveByte");
    }
  }

  void HandleOKCallback() {
    Nan::HandleScope scope;

    v8::Local<v8::Value> argv[] = {
      Nan::Null(),
      Nan::New<v8::Integer>(byte)
    };

    callback->Call(2, argv, async_resource);
  }

private:
  int fd;
  __s32 byte;
};

NAN_METHOD(ReceiveByteAsync) {
  if (info.Length() < 2 || !info[0]->IsInt32() || !info[1]->IsFunction()) {
    return Nan::ThrowError(Nan::ErrnoException(EINVAL, "receiveByte",
      "incorrect arguments passed to receiveByte(int fd, function cb)"));
  }

  int fd = Nan::To<int32_t>(info[0]).FromJust();
  Nan::Callback *callback = new Nan::Callback(info[1].As<v8::Function>());

  Nan::AsyncQueueWorker(new ReceiveByteWorker(callback, fd));
}

NAN_METHOD(ReceiveByteSync) {
  if (info.Length() < 1 || !info[0]->IsInt32()) {
    return Nan::ThrowError(Nan::ErrnoException(EINVAL, "receiveByteSync",
      "incorrect arguments passed to receiveByteSync(int fd)"));
  }

  int fd = Nan::To<int32_t>(info[0]).FromJust();

  __s32 byte = ReceiveByte(fd);
  if (byte == -1) {
    return Nan::ThrowError(Nan::ErrnoException(errno, "receiveByteSync", ""));
  }

  info.GetReturnValue().Set(Nan::New<v8::Integer>(byte));
}

