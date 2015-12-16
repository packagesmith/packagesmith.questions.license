import chai from 'chai';
import chaiSpies from 'chai-spies';
chai.use(chaiSpies).should();
import licenseQuestion from '../src/';
import fileSystem from 'fs-promise';
describe('licenseQuestion', () => {

  it('returns an object with expected keys', () => {
    licenseQuestion()
      .should.be.an('object')
      .with.keys([ 'name', `message`, `default`, 'validate', `when` ]);
  });

  describe('default', () => {

    it('is "MIT"', () => {
      licenseQuestion().default.should.equal('MIT');
    });

    it('can be overridden with `defaultLicense` argument', () => {
      licenseQuestion({ defaultLicense: 'foobar' }).default.should.equal('foobar');
    });

  });

  describe('validate', () => {

    it('returns true for valid spdx licenses', () => {
      licenseQuestion().validate('NCSA').should.equal(true);
      licenseQuestion().validate('MIT').should.equal(true);
      licenseQuestion().validate('AFL-3.0').should.equal(true);
      licenseQuestion().validate('RPL-1.5').should.equal(true);
      licenseQuestion().validate('Vim').should.equal(true);
      licenseQuestion().validate('Vim').should.equal(true);
    });

    it('returns error string for invalid spdx licenses', () => {
      licenseQuestion().validate('foo').should.equal('foo is not a valid SPDX license!');
      licenseQuestion().validate('AFL--1').should.equal('AFL--1 is not a valid SPDX license!');
    });

  });

  describe('when function', () => {
    let whenFunction = null;
    beforeEach(() => {
      whenFunction = licenseQuestion().when;
      fileSystem.readFile = chai.spy(() => '{"foo":"bar"}');
    });

    it('returns false if `license` is in answers object', async function() {
      (await whenFunction({ license: 'foo' }, '/foo/bar')).should.equal(false);
      fileSystem.readFile.should.not.have.been.called();
    });

    it('reads package.json if license is not in answers', async function() {
      (await whenFunction({}, '/foo/bar'));
      fileSystem.readFile.should.have.been.called(1).with.exactly('/foo/bar/package.json', 'utf8');
    });

    it('returns false and mutates answers if `license` is in package.json', async function() {
      const answers = {};
      fileSystem.readFile = chai.spy(() => '{"license":"bar"}');
      (await whenFunction(answers, '/foo/bar')).should.equal(false);
      answers.should.have.property('license', 'bar');
    });

    it('returns true if `license` is not in package.json', async function() {
      const answers = {};
      (await whenFunction(answers, '/foo/bar')).should.equal(true);
      answers.should.not.have.property('license');
    });

    it('returns true if reading package.json causes error', async function() {
      const answers = {};
      fileSystem.readFile = chai.spy(() => {
        throw new Error('foo');
      });
      (await whenFunction(answers, '/foo/bar')).should.equal(true);
      answers.should.not.have.property('license');
    });

  });

});
