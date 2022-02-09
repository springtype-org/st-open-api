import { createComponentReference } from './createComponentReference';

describe('create component reference', () => {
  it('test camelCase', () => {
    expect(createComponentReference('MilkProduct', '#/components/schema')).toStrictEqual({
      className: 'MilkProduct',
      fileName: 'milk-product',
      refKey: '#/components/schema/MilkProduct',
    });

    expect(createComponentReference('ElasticsearchClusterPlansInfo', '#/components/schema')).toStrictEqual({
      className: 'ElasticsearchClusterPlansInfo',
      fileName: 'elasticsearch-cluster-plans-info',
      refKey: '#/components/schema/ElasticsearchClusterPlansInfo',
    });
  });

  it('test lower snakeCase', () => {
    expect(createComponentReference('milk_product', '#/components/schema')).toStrictEqual({
      className: 'MilkProduct',
      fileName: 'milk-product',
      refKey: '#/components/schema/milk_product',
    });

    expect(createComponentReference('elasticsearch_cluster_plans_info', '#/components/schema')).toStrictEqual({
      className: 'ElasticsearchClusterPlansInfo',
      fileName: 'elasticsearch-cluster-plans-info',
      refKey: '#/components/schema/elasticsearch_cluster_plans_info',
    });
  });

  it('test upper snakeCase', () => {
    expect(createComponentReference('MILK_PRODUCT', '#/components/schema')).toStrictEqual({
      className: 'MilkProduct',
      fileName: 'milk-product',
      refKey: '#/components/schema/MILK_PRODUCT',
    });

    expect(createComponentReference('ELASTICSEARCH_CLUSTER_PLANS_INFO', '#/components/schema')).toStrictEqual({
      className: 'ElasticsearchClusterPlansInfo',
      fileName: 'elasticsearch-cluster-plans-info',
      refKey: '#/components/schema/ELASTICSEARCH_CLUSTER_PLANS_INFO',
    });
  });

  it('test lower kebabCase', () => {
    expect(createComponentReference('milk-product', '#/components/schema')).toStrictEqual({
      className: 'MilkProduct',
      fileName: 'milk-product',
      refKey: '#/components/schema/milk-product',
    });

    expect(createComponentReference('elasticsearch-cluster-plans-info', '#/components/schema')).toStrictEqual({
      className: 'ElasticsearchClusterPlansInfo',
      fileName: 'elasticsearch-cluster-plans-info',
      refKey: '#/components/schema/elasticsearch-cluster-plans-info',
    });
  });

  it('test upper kebabCase', () => {
    expect(createComponentReference('MILK-PRODUCT', '#/components/schema')).toStrictEqual({
      className: 'MilkProduct',
      fileName: 'milk-product',
      refKey: '#/components/schema/MILK-PRODUCT',
    });

    expect(createComponentReference('ELASTICSEARCH-CLUSTER-PLANS-INFO', '#/components/schema')).toStrictEqual({
      className: 'ElasticsearchClusterPlansInfo',
      fileName: 'elasticsearch-cluster-plans-info',
      refKey: '#/components/schema/ELASTICSEARCH-CLUSTER-PLANS-INFO',
    });
  });

  it('test any case', () => {
    expect(createComponentReference('elasticsearch_clusterPlans-info', '#/components/schema')).toStrictEqual({
      className: 'ElasticsearchClusterPlansInfo',
      fileName: 'elasticsearch-cluster-plans-info',
      refKey: '#/components/schema/elasticsearch_clusterPlans-info',
    });
  });
});
