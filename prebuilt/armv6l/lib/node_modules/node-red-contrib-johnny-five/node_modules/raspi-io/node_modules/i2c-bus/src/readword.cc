#include <errno.h>
#include <node.h>
#include <nan.h>
#include "./i2c-dev.h"
#include "./readword.h"
#include "./util.h"

static __s32 ReadWord(int fd, __u8 cmd) {
  return i2c_smbus_read_word_data(fd, cmd);
}

class ReadWordWorker : public I2cAsyncWorker {
public:
  ReadWordWorker(Nan::Callback *callback, int fd, __u8 cmd)
    : I2cAsyncWorker(callback), fd(fd), cmd(cmd) {}
  ~ReadWordWorker() {}

  void Execute() {
    word = ReadWord(fd, cmd);
    if (word == -1) {
      SetErrorNo(errno);
      SetErrorSyscall("readWord");
    }
  }

  void HandleOKCallback() {
    Nan::HandleScope scope;

    v8::Local<v8::Value> argv[] = {
      Nan::Null(),
      Nan::New<v8::Integer>(word)
    };

    callback->Call(2, argv, async_resource);
  }

private:
  int fd;
  __u8 cmd;
  __s32 word;
};

NAN_METHOD(ReadWordAsync) {
  if (info.Length() < 3 || !info[0]->IsInt32() || !info[1]->IsInt32() || !info[2]->IsFunction()) {
    return Nan::ThrowError(Nan::ErrnoException(EINVAL, "readWord",
      "incorrect arguments passed to readWord(int fd, int cmd, function cb)"));
  }

  int fd = Nan::To<int32_t>(info[0]).FromJust();
  __u8 cmd = Nan::To<int32_t>(info[1]).FromJust();
  Nan::Callback *callback = new Nan::Callback(info[2].As<v8::Function>());

  Nan::AsyncQueueWorker(new ReadWordWorker(callback, fd, cmd));
}

NAN_METHOD(ReadWordSync) {
  if (info.Length() < 2 || !info[0]->IsInt32() || !info[1]->IsInt32()) {
    return Nan::ThrowError(Nan::ErrnoException(EINVAL, "readWordSync",
      "incorrect arguments passed to readWordSync(int fd, int cmd)"));
  }

  int fd = Nan::To<int32_t>(info[0]).FromJust();
  __u8 cmd = Nan::To<int32_t>(info[1]).FromJust();

  __s32 word = ReadWord(fd, cmd);
  if (word == -1) {
    return Nan::ThrowError(Nan::ErrnoException(errno, "readWordSync", ""));
  }

  info.GetReturnValue().Set(Nan::New<v8::Integer>(word));
}

