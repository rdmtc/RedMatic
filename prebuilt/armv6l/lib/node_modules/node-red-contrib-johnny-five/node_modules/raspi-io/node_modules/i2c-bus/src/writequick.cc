#include <errno.h>
#include <node.h>
#include <nan.h>
#include "./i2c-dev.h"
#include "./writequick.h"
#include "./util.h"

static __s32 WriteQuick(int fd, __u8 bit) {
  return i2c_smbus_write_quick(fd, bit);
}

class WriteQuickWorker : public I2cAsyncWorker {
public:
  WriteQuickWorker(Nan::Callback *callback, int fd, __u8 bit)
    : I2cAsyncWorker(callback), fd(fd), bit(bit) {}
  ~WriteQuickWorker() {}

  void Execute() {
    __s32 ret = WriteQuick(fd, bit);
    if (ret == -1) {
      SetErrorNo(errno);
      SetErrorSyscall("writeQuick");
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
  __u8 bit;
};

NAN_METHOD(WriteQuickAsync) {
  if (info.Length() < 3 || !info[0]->IsInt32() || !info[1]->IsInt32() || !info[2]->IsFunction()) {
    return Nan::ThrowError(Nan::ErrnoException(EINVAL, "writeQuick",
      "incorrect arguments passed to writeQuick(int fd, int bit, function cb)"));
  }

  int fd = Nan::To<int32_t>(info[0]).FromJust();
  __u8 bit = Nan::To<int32_t>(info[1]).FromJust();
  Nan::Callback *callback = new Nan::Callback(info[2].As<v8::Function>());

  Nan::AsyncQueueWorker(new WriteQuickWorker(callback, fd, bit));
}

NAN_METHOD(WriteQuickSync) {
  if (info.Length() < 2 || !info[0]->IsInt32() || !info[1]->IsInt32()) {
    return Nan::ThrowError(Nan::ErrnoException(EINVAL, "writeQuickSync",
      "incorrect arguments passed to writeQuickSync(int fd, int bit)"));
  }

  int fd = Nan::To<int32_t>(info[0]).FromJust();
  __u8 bit = Nan::To<int32_t>(info[1]).FromJust();

  __s32 ret = WriteQuick(fd, bit);
  if (ret == -1) {
    return Nan::ThrowError(Nan::ErrnoException(errno, "writeQuickSync", ""));
  }
}

