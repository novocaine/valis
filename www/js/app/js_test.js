define(["vobjects/js"], 
  function(JS) {
  describe("js", function() {
    it('should run script', function() {
      var script = new JS("[42]"); 
      var result = script.generate(null, null, null);
      expect(_.isEqual(result, [42])).toEqual(true);
    });
  });
});
