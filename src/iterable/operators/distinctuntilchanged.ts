import { IterableX } from '../iterablex';
import { identity } from '../../util/identity';
import { comparer as defaultComparer } from '../../util/comparer';
import { MonoTypeOperatorFunction } from '../../interfaces';
import { DistinctOptions } from './distinctoptions';

export class DistinctUntilChangedIterable<TSource, TKey> extends IterableX<TSource> {
  private _source: Iterable<TSource>;
  private _keySelector: (value: TSource) => TKey;
  private _comparer: (x: TKey, y: TKey) => boolean;

  constructor(
    source: Iterable<TSource>,
    keySelector: (value: TSource) => TKey,
    comparer: (first: TKey, second: TKey) => boolean
  ) {
    super();
    this._source = source;
    this._keySelector = keySelector;
    this._comparer = comparer;
  }

  *[Symbol.iterator]() {
    let currentKey = <TKey>{};
    let hasCurrentKey = false;
    for (const item of this._source) {
      const key = this._keySelector(item);
      let comparerEquals = false;
      if (hasCurrentKey) {
        comparerEquals = this._comparer(currentKey, key);
      }
      if (!hasCurrentKey || !comparerEquals) {
        hasCurrentKey = true;
        currentKey = key;
        yield item;
      }
    }
  }
}

/**
 * Returns an async-iterable sequence that contains only distinct contiguous elements according to the optional keySelector and comparer.
 *
 * @export
 * @template TSource The type of the elements in the source sequence.
 * @template TKey The type of the discriminator key computed for each element in the source sequence.
 * @param {DistinctOptions<TSource, TKey>} [options] The optional options for adding a key selector and comparer.
 * @returns {MonoTypeOperatorFunction<TSource>} An operator that returns an async-iterable that contains only distinct contiguous items.
 */
export function distinctUntilChanged<TSource, TKey>(
  options?: DistinctOptions<TSource, TKey>
): MonoTypeOperatorFunction<TSource> {
  return function distinctUntilChangedOperatorFunction(
    source: Iterable<TSource>
  ): IterableX<TSource> {
    const opts = options || ({} as DistinctOptions<TSource, TKey>);
    if (!opts.comparer) {
      opts.comparer = defaultComparer;
    }
    if (!opts.keySelector) {
      opts.keySelector = identity;
    }
    const { ['keySelector']: keySelector, ['comparer']: comparer } = opts;
    return new DistinctUntilChangedIterable<TSource, TKey>(source, keySelector!, comparer!);
  };
}
