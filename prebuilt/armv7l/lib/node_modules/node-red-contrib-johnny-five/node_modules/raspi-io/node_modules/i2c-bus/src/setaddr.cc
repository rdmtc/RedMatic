#include <errno.h>
#include <node.h>
#include <nan.h>
#include "./i2c-dev.h"
#include "./setaddr.h"
#include "./util.h"

static int SetAddr(int fd, int addr, bool forceAccess) {
  return ioctl(fd, forceAccess ? I2C_SLAVE_FORCE : I2C_SLAVE, addr);
}

class SetAddrWorker : public I2cAsyncWorker {
public:
  SetAddrWorker(Nan::Callback *callback, int fd, int addr, bool forceAccess)
    : I2cAsyncWorker(callback), fd(fd), addr(addr), forceAccess(forceAccess) {}
  ~SetAddrWorker() {}

  void Execute() {
    if (SetAddr(fd, addr, forceAccess) == -1) {
      SetErrorNo(errno);
      SetErrorSyscall("setAddr");
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
  int addr;
  bool forceAccess;
};

NAN_METHOD(SetAddrAsync) {
  if (info.Length() < 4 || !info[0]->IsInt32() || !info[1]->IsInt32() || !info[2]->IsBoolean() || !info[3]->IsFunction()) {
    return Nan::ThrowError(Nan::ErrnoException(EINVAL, "setAddr",
      "incorrect arguments passed to setAddr(int fd, int addr, bool forceAccess, function cb)"));
  }

  int fd = Nan::To<int32_t>(info[0]).FromJust();
  int addr = Nan::To<int32_t>(info[1]).FromJust();
  bool forceAccess = Nan::To<bool>(info[2]).FromJust();
  Nan::Callback *callback = new Nan::Callback(info[3].As<v8::Function>());

  Nan::AsyncQueueWorker(new SetAddrWorker(callback, fd, addr, forceAccess));
}

NAN_METHOD(SetAddrSync) {
  if (info.Length() < 3 || !info[0]->IsInt32() || !info[1]->IsInt32() || !info[2]->IsBoolean()) {
    return Nan::ThrowError(Nan::ErrnoException(EINVAL, "setAddrSync",
      "incorrect arguments passed to setAddrSync(int fd, int addr, bool forceAccess)"));
  }

  int fd = Nan::To<int32_t>(info[0]).FromJust();
  int addr = Nan::To<int32_t>(info[1]).FromJust();
  bool forceAccess = Nan::To<bool>(info[2]).FromJust();

  if (SetAddr(fd, addr, forceAccess) != 0) {
    return Nan::ThrowError(Nan::ErrnoException(errno, "setAddrSync", ""));
  }
}

