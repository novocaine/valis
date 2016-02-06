define([],
() => {
  class Message {
    constructor(sampleTime, data) {
      this.sampleTime = sampleTime;
      this.data = data;
    }
  }

  return Message;
});
