import { createComponentReference } from './createComponentReference';
import { getTestConfiguration } from '../../component/schemas/property/createArrayProperty.test';

describe('create component reference', () => {
  it('test camelCase', () => {
    expect(
      createComponentReference('MilkProduct', 'INTERFACE', '#/components/schema', getTestConfiguration()),
    ).toStrictEqual({
      name: 'MilkProduct',
      fileName: 'MilkProduct',
      refKey: '#/components/schema/MilkProduct',
    });

    expect(
      createComponentReference(
        'ElasticsearchClusterPlansInfo',
        'INTERFACE',
        '#/components/schema',
        getTestConfiguration(),
      ),
    ).toStrictEqual({
      name: 'ElasticsearchClusterPlansInfo',
      fileName: 'ElasticsearchClusterPlansInfo',
      refKey: '#/components/schema/ElasticsearchClusterPlansInfo',
    });
  });

  it('test lower snakeCase', () => {
    expect(
      createComponentReference('milk_product', 'INTERFACE', '#/components/schema', getTestConfiguration()),
    ).toStrictEqual({
      name: 'MilkProduct',
      fileName: 'MilkProduct',
      refKey: '#/components/schema/milk_product',
    });

    expect(
      createComponentReference(
        'elasticsearch_cluster_plans_info',
        'INTERFACE',
        '#/components/schema',
        getTestConfiguration(),
      ),
    ).toStrictEqual({
      name: 'ElasticsearchClusterPlansInfo',
      fileName: 'ElasticsearchClusterPlansInfo',
      refKey: '#/components/schema/elasticsearch_cluster_plans_info',
    });
  });

  it('test upper snakeCase', () => {
    expect(
      createComponentReference('MILK_PRODUCT', 'INTERFACE', '#/components/schema', getTestConfiguration()),
    ).toStrictEqual({
      name: 'MilkProduct',
      fileName: 'MilkProduct',
      refKey: '#/components/schema/MILK_PRODUCT',
    });

    expect(
      createComponentReference(
        'ELASTICSEARCH_CLUSTER_PLANS_INFO',
        'INTERFACE',
        '#/components/schema',
        getTestConfiguration(),
      ),
    ).toStrictEqual({
      name: 'ElasticsearchClusterPlansInfo',
      fileName: 'ElasticsearchClusterPlansInfo',
      refKey: '#/components/schema/ELASTICSEARCH_CLUSTER_PLANS_INFO',
    });
  });

  it('test lower kebabCase', () => {
    expect(
      createComponentReference('milk-product', 'INTERFACE', '#/components/schema', getTestConfiguration()),
    ).toStrictEqual({
      name: 'MilkProduct',
      fileName: 'MilkProduct',
      refKey: '#/components/schema/milk-product',
    });

    expect(
      createComponentReference(
        'elasticsearch-cluster-plans-info',
        'INTERFACE',
        '#/components/schema',
        getTestConfiguration(),
      ),
    ).toStrictEqual({
      name: 'ElasticsearchClusterPlansInfo',
      fileName: 'ElasticsearchClusterPlansInfo',
      refKey: '#/components/schema/elasticsearch-cluster-plans-info',
    });
  });

  it('test upper kebabCase', () => {
    expect(
      createComponentReference('MILK-PRODUCT', 'INTERFACE', '#/components/schema', getTestConfiguration()),
    ).toStrictEqual({
      name: 'MilkProduct',
      fileName: 'MilkProduct',
      refKey: '#/components/schema/MILK-PRODUCT',
    });

    expect(
      createComponentReference(
        'ELASTICSEARCH-CLUSTER-PLANS-INFO',
        'INTERFACE',
        '#/components/schema',
        getTestConfiguration(),
      ),
    ).toStrictEqual({
      name: 'ElasticsearchClusterPlansInfo',
      fileName: 'ElasticsearchClusterPlansInfo',
      refKey: '#/components/schema/ELASTICSEARCH-CLUSTER-PLANS-INFO',
    });
  });

  it('test any case', () => {
    expect(
      createComponentReference(
        'elasticsearch_clusterPlans-info',
        'INTERFACE',
        '#/components/schema',
        getTestConfiguration(),
      ),
    ).toStrictEqual({
      name: 'ElasticsearchClusterPlansInfo',
      fileName: 'ElasticsearchClusterPlansInfo',
      refKey: '#/components/schema/elasticsearch_clusterPlans-info',
    });
  });
});
