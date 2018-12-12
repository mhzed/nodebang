import 'should';

describe('test', function() {

  it('case1', function() {
      '1'.should.equal('1');
  })

  it('case2', async function() {
    (await Promise.resolve('1')).should.equal('1');
})

});
