define(['app/vobjects/vobject', 'app/util'],
(vobject, util) => {
  class BinaryOp extends vobject.VObject {
    constructor(operand) {
      super(operand);
      this.operand = operand;
    }

    numInputs() { return 2; }
    numOutputs() { return 1; }

    generate(context, inputs, outputs) {
      if (inputs[0] === undefined) {
        return [0];
      }

      const firstIsAa = util.isAudioArray(inputs[0]);
      const secondIsAa = util.isAudioArray(inputs[1]);

      if (firstIsAa && secondIsAa) {
        const result = context.getBuffer();
        for (let i = 0; i < inputs[0].length; i++) {
          result[i] = this.fn(inputs[0][i], inputs[1][i]);
        }
        return [result];
      }

      let aa;
      let scalar;

      if (secondIsAa) {
        aa = inputs[1];
        scalar = inputs[0];
      } else if (firstIsAa) {
        aa = inputs[0];
        scalar = inputs[1];
        if (scalar === undefined) {
          scalar = this.operand;
          if (scalar === undefined) {
            throw new Error('no operand found');
          }
        }
      } else {
        return [inputs[0] * inputs[1]];
      }

      const result = context.getBuffer();
      for (let i = 0; i < aa.length; i++) {
        result[i] = this.fn(aa[i], parseFloat(scalar));
      }

      return [result];
    }
  }

  class Mul extends BinaryOp {
    fn(a, b) { return a * b; }
  }

  Mul.vobjectClass = '*';
  Mul.vobjectSymbol = '*';

  class Add extends BinaryOp {
    fn(a, b) { return a + b; }
  }

  Add.vobjectClass = '+';
  Add.vobjectSymbol = '+';

  return { Mul, Add };
});
