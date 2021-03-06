#include <errno.h>
#include <node.h>
#include <nan.h>
#include "./i2c-dev.h"
#include "./deviceid.h"
#include "./util.h"

static __s32 DeviceId(int fd, __u16 address) {
  return i2c_smbus_deviceid(fd, address);
}

class DeviceIdWorker : public I2cAsyncWorker {
public:
  DeviceIdWorker(Nan::Callback *callback, int fd, __u16 address)
    : I2cAsyncWorker(callback), fd(fd), address(address) {}
  ~DeviceIdWorker() {}

  void Execute() {
    id = DeviceId(fd, address);
    if (id == -1) {
      SetErrorNo(errno);
      SetErrorSyscall("deviceId");
    }
  }

  void HandleOKCallback() {
    Nan::HandleScope scope;

    v8::Local<v8::Value> argv[] = {
      Nan::Null(),
      Nan::New<v8::Integer>(id)
    };

    callback->Call(2, argv, async_resource);
  }

private:
  int fd;
  __u16 address;
  __s32 id;
};

NAN_METHOD(DeviceIdAsync) {
  if (info.Length() < 3 || !info[0]->IsInt32() || !info[1]->IsInt32() || !info[2]->IsFunction()) {
    return Nan::ThrowError(Nan::ErrnoException(EINVAL, "deviceId",
      "incorrect arguments passed to deviceId(int fd, int address, function cb)"));
  }

  int fd = Nan::To<int32_t>(info[0]).FromJust();
  __u16 address = Nan::To<int32_t>(info[1]).FromJust();
  Nan::Callback *callback = new Nan::Callback(info[2].As<v8::Function>());

  Nan::AsyncQueueWorker(new DeviceIdWorker(callback, fd, address));
}

NAN_METHOD(DeviceIdSync) {
  if (info.Length() < 2 || !info[0]->IsInt32() || !info[1]->IsInt32()) {
    return Nan::ThrowError(Nan::ErrnoException(EINVAL, "deviceIdSync",
      "incorrect arguments passed to deviceIdSync(int fd, int address)"));
  }

  int fd = Nan::To<int32_t>(info[0]).FromJust();
  __u16 address = Nan::To<int32_t>(info[1]).FromJust();

  __s32 ret = DeviceId(fd, address);
  if (ret == -1) {
    return Nan::ThrowError(Nan::ErrnoException(errno, "deviceIdSync", ""));
  }

  info.GetReturnValue().Set(Nan::New<v8::Integer>(ret));
}

