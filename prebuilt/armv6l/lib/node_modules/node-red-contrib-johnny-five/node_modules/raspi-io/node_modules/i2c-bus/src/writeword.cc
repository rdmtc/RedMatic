#include <errno.h>
#include <node.h>
#include <nan.h>
#include "./i2c-dev.h"
#include "./writeword.h"
#include "./util.h"

static __s32 WriteWord(int fd, __u8 cmd, __u16 word) {
  return i2c_smbus_write_word_data(fd, cmd, word);
}

class WriteWordWorker : public I2cAsyncWorker {
public:
  WriteWordWorker(Nan::Callback *callback, int fd, __u8 cmd, __u16 word)
    : I2cAsyncWorker(callback), fd(fd), cmd(cmd), word(word) {}
  ~WriteWordWorker() {}

  void Execute() {
    __s32 ret = WriteWord(fd, cmd, word);
    if (ret == -1) {
      SetErrorNo(errno);
      SetErrorSyscall("writeWord");
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
  __u16 word;
};

NAN_METHOD(WriteWordAsync) {
  if (info.Length() < 4 || !info[0]->IsInt32() || !info[1]->IsInt32() || !info[2]->IsInt32() || !info[3]->IsFunction()) {
    return Nan::ThrowError(Nan::ErrnoException(EINVAL, "writeWord",
      "incorrect arguments passed to writeWord"
      "(int fd, int cmd, int word, function cb)"));
  }

  int fd = Nan::To<int32_t>(info[0]).FromJust();
  __u8 cmd = Nan::To<int32_t>(info[1]).FromJust();
  __u16 word = Nan::To<int32_t>(info[2]).FromJust();
  Nan::Callback *callback = new Nan::Callback(info[3].As<v8::Function>());

  Nan::AsyncQueueWorker(new WriteWordWorker(callback, fd, cmd, word));
}

NAN_METHOD(WriteWordSync) {
  if (info.Length() < 3 || !info[0]->IsInt32() || !info[1]->IsInt32() || !info[2]->IsInt32()) {
    return Nan::ThrowError(Nan::ErrnoException(EINVAL, "writeWordSync",
      "incorrect arguments passed to writeWordSync"
      "(int fd, int cmd, int word)"));
  }

  int fd = Nan::To<int32_t>(info[0]).FromJust();
  __u8 cmd = Nan::To<int32_t>(info[1]).FromJust();
  __u16 word = Nan::To<int32_t>(info[2]).FromJust();

  __s32 ret = WriteWord(fd, cmd, word);
  if (ret == -1) {
    return Nan::ThrowError(Nan::ErrnoException(errno, "writeWordSync", ""));
  }
}

