#include <errno.h>
#include <node.h>
#include <nan.h>
#include "./i2c-dev.h"
#include "./i2cfuncs.h"
#include "./util.h"

static __s32 I2cFuncs(int fd, unsigned long *i2cfuncs) {
  return ioctl(fd, I2C_FUNCS, i2cfuncs);
}

class I2cFuncsWorker : public I2cAsyncWorker {
public:
  I2cFuncsWorker(Nan::Callback *callback, int fd)
    : I2cAsyncWorker(callback), fd(fd) {}
  ~I2cFuncsWorker() {}

  void Execute() {
    __s32 ret = I2cFuncs(fd, &i2cfuncs);
    if (ret == -1) {
      SetErrorNo(errno);
      SetErrorSyscall("i2cFuncs");
    }
  }

  void HandleOKCallback() {
    Nan::HandleScope scope;

    v8::Local<v8::Value> argv[] = {
      Nan::Null(),
      Nan::New<v8::Uint32>(static_cast<unsigned int>(i2cfuncs))
    };

    callback->Call(2, argv, async_resource);
  }

private:
  int fd;
  unsigned long i2cfuncs;
};

NAN_METHOD(I2cFuncsAsync) {
  if (info.Length() < 2 || !info[0]->IsInt32() || !info[1]->IsFunction()) {
    return Nan::ThrowError(Nan::ErrnoException(EINVAL, "i2cFuncs",
      "incorrect arguments passed to i2cFuncs(int fd, function cb)"));
  }

  int fd = Nan::To<int32_t>(info[0]).FromJust();
  Nan::Callback *callback = new Nan::Callback(info[1].As<v8::Function>());

  Nan::AsyncQueueWorker(new I2cFuncsWorker(callback, fd));
}

NAN_METHOD(I2cFuncsSync) {
  if (info.Length() < 1 || !info[0]->IsInt32()) {
    return Nan::ThrowError(Nan::ErrnoException(EINVAL, "i2cFuncsSync",
      "incorrect arguments passed to i2cFuncsSync(int fd)"));
  }

  int fd = Nan::To<int32_t>(info[0]).FromJust();

  unsigned long i2cfuncs;
  __s32 ret = I2cFuncs(fd, &i2cfuncs);
  if (ret == -1) {
    return Nan::ThrowError(Nan::ErrnoException(errno, "i2cFuncsSync", ""));
  }

  info.GetReturnValue().Set(Nan::New<v8::Uint32>(static_cast<unsigned int>(i2cfuncs)));
}

