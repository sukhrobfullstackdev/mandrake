import { isValidEmail, isValidJSON, isValidURL } from '@lib/utils/validators';

describe('@utils/validators', () => {
  it('should validate an email', () => {
    let output = isValidEmail('foo');
    expect(output).toEqual(false);

    output = isValidEmail('foo@bar.com');
    expect(output).toEqual(true);
  });

  it('should validate json', () => {
    let output = isValidJSON('foo');
    expect(output).toEqual(false);

    output = isValidJSON({ foo: 'bar' });
    expect(output).toEqual(true);
  });

  it('should validate a url', () => {
    let output = isValidURL('foo');
    expect(output).toEqual(false);

    output = isValidURL('http://www.foo.com');
    expect(output).toEqual(true);
  });
});
