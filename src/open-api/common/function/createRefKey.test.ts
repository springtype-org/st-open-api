import { createRefKey } from './createRefKey';

describe('create ref key', () => {
  it('ref key with / in the end', () => {
    expect(createRefKey('#/components/schema/', 'MilkProduct')).toStrictEqual('#/components/schema/MilkProduct');

    expect(createRefKey('#/components/schema/', 'ElasticsearchClusterPlansInfo')).toStrictEqual(
      '#/components/schema/ElasticsearchClusterPlansInfo',
    );
  });
  it('ref key without / in the end', () => {
    expect(createRefKey('#/components/schema', 'MilkProduct')).toStrictEqual('#/components/schema/MilkProduct');

    expect(createRefKey('#/components/schema', 'ElasticsearchClusterPlansInfo')).toStrictEqual(
      '#/components/schema/ElasticsearchClusterPlansInfo',
    );
  });
});
