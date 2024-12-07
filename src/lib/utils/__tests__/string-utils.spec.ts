import { camelToSnakeCase, getIndeterminateArticle, snakeToCamelCase } from '../string-utils';

describe('string-helpers', () => {
  describe('camelToSnakeCase', () => {
    const tests = [
      {
        assert: 'testWord',
        expected: 'test_word',
      },
      {
        assert: 'welcomeToTheJungle',
        expected: 'welcome_to_the_jungle',
      },
      {
        assert: 'easy',
        expected: 'easy',
      },
      {
        assert: 'thisIsAReallyLongWord',
        expected: 'this_is_a_really_long_word',
      },
      {
        assert: 'correctId',
        expected: 'correct_id',
      },
      {
        assert: 'weirdID',
        expected: 'weird_i_d',
      },
      {
        assert: 'thisCrazyLabelIsEvenLongerAndForSureAnEdgeCase',
        expected: 'this_crazy_label_is_even_longer_and_for_sure_an_edge_case',
      },
      {
        assert: '',
        expected: '',
      },
    ];

    tests.forEach(({ assert, expected }) => {
      it(`should convert ${assert} into ${expected}`, () => {
        expect(camelToSnakeCase(assert)).toBe(expected);
      });
    });
  });

  describe('snakeToCamelCase', () => {
    const tests = [
      {
        assert: 'test_word',
        expected: 'testWord',
      },
      {
        assert: 'welcome_to_the_jungle',
        expected: 'welcomeToTheJungle',
      },
      {
        assert: 'easy',
        expected: 'easy',
      },
      {
        assert: 'this_is_a_really_long_word',
        expected: 'thisIsAReallyLongWord',
      },
      {
        assert: 'this_crazy_label_is_even_longer_and_for_sure_an_edge_case',
        expected: 'thisCrazyLabelIsEvenLongerAndForSureAnEdgeCase',
      },
      {
        assert: '',
        expected: '',
      },
    ];

    tests.forEach(({ assert, expected }) => {
      it(`should convert ${assert} into ${expected}`, () => {
        expect(snakeToCamelCase(assert)).toBe(expected);
      });
    });
  });

  describe('getIndeterminateArticle', () => {
    const tests = [
      {
        assert: 'pencil',
        expected: 'a',
      },
      {
        assert: 'envelope',
        expected: 'an',
      },
    ];

    tests.forEach(({ assert, expected }) => {
      it(`should convert ${assert} into ${expected}`, () => {
        expect(getIndeterminateArticle(assert)).toBe(expected);
      });
    });
  });
});
