import { OriginCase, camelizeKeys } from '../object-helpers';

describe('object helpers', () => {
  describe('camelizeKeys', () => {
    const tests = [
      {
        assert: [{ hello_world: 'helloWorld' }],
        expected: { helloWorld: 'helloWorld' },
      },
      {
        assert: [
          {
            pizza: 'yum',
          },
        ],
        expected: {
          pizza: 'yum',
        },
      },
      {
        assert: [
          {
            dog_bark: 'woof',
            cool_recursion: {
              goat_yoga: 'bah',
              hello_cat: 'meow',
            },
          },
        ],
        expected: {
          dogBark: 'woof',
          coolRecursion: {
            goatYoga: 'bah',
            helloCat: 'meow',
          },
        },
      },
      {
        assert: [
          {
            cool_recursion: {
              goat_yoga: 'bah',
              more_animals: {
                dog_bark: 'woof',
                hello_cat: 'meow',
              },
            },
          },
        ],
        expected: {
          coolRecursion: {
            goatYoga: 'bah',
            moreAnimals: {
              dogBark: 'woof',
              helloCat: 'meow',
            },
          },
        },
      },
      {
        assert: [
          {
            this_many: 1,
            string: 'yay',
            is_this_an_object: {
              yes: true,
            },
            is_this_an_array: [1, 2, 3],
          },
        ],
        expected: {
          thisMany: 1,
          string: 'yay',
          isThisAnObject: {
            yes: true,
          },
          isThisAnArray: [1, 2, 3],
        },
      },
      {
        assert: [
          {
            cool_things: [1, true, { hello_world: 'helloWorld' }],
          },
        ],
        expected: {
          coolThings: [1, true, { helloWorld: 'helloWorld' }],
        },
      },
      {
        assert: [
          {
            really_long_key_that_was_hard_to_type_i_should_stop_doing_this: 'hello',
          },
        ],
        expected: {
          reallyLongKeyThatWasHardToTypeIShouldStopDoingThis: 'hello',
        },
      },
      {
        assert: [{ 'hello-world': 'helloWorld' }, OriginCase.Kabob],
        expected: { helloWorld: 'helloWorld' },
      },
      {
        assert: [
          {
            pizza: 'yum',
          },
          OriginCase.Kabob,
        ],
        expected: {
          pizza: 'yum',
        },
      },
      {
        assert: [
          {
            'dog-bark': 'woof',
            'cool-recursion': {
              'goat-yoga': 'bah',
              'hello-cat': 'meow',
            },
          },
          OriginCase.Kabob,
        ],
        expected: {
          dogBark: 'woof',
          coolRecursion: {
            goatYoga: 'bah',
            helloCat: 'meow',
          },
        },
      },
      {
        assert: [
          {
            'this-many': 1,
            string: 'yay',
            'is-this-an-object': {
              yes: true,
            },
            'is-this-an-array': [1, 2, 3],
          },
          OriginCase.Kabob,
        ],
        expected: {
          thisMany: 1,
          string: 'yay',
          isThisAnObject: {
            yes: true,
          },
          isThisAnArray: [1, 2, 3],
        },
      },
      {
        assert: [
          {
            'really-long-key-that-was-hard-to-type-i-should-stop-doing-this': 'hello',
          },
          OriginCase.Kabob,
        ],
        expected: {
          reallyLongKeyThatWasHardToTypeIShouldStopDoingThis: 'hello',
        },
      },
      {
        assert: [null],
        expected: null,
      },
    ];

    tests.forEach(({ assert, expected }, i: number) => {
      it(`should convert case of object #${i + 1} into camel case`, () => {
        expect(camelizeKeys<(typeof assert)[0]>(assert[0], assert[1] as OriginCase)).toEqual(expected);
      });
    });
  });
});
