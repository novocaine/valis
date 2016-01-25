define(['app/vobjects/js', 'lodash'],
(JS, _) => {
  describe('js', () => {
    it('should run script', () => {
      const script = new JS('[42]');
      const result = script.generate(null, null, null);
      expect(_.isEqual(result, [42])).toEqual(true);
    });
  });
});
