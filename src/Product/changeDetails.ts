import assert from 'assert';
import { HttpModule } from '@whppt/api-express';
import { Product } from './Models/Product';

const changeDetails: HttpModule<Product, { status: number }> = {
  authorise() {
    return Promise.resolve();
  },
  exec({ $salesforce, $mongo: { $dbPub, $saveToPubWithEvents, $startTransaction }, createEvent }, productData) {
    assert(productData.domainId, 'Product requires a Domain Id.');
    assert(productData._id, 'Product requires a Product Id.');
    assert(productData.name, 'Product requires a Name.');
    assert(productData.productCode, 'Product requires a Product Code.');

    return $dbPub
      .collection('products')
      .findOne<Product>({
        _id: productData._id,
      })
      .then(product => {
        assert(product, 'Product does not exsist');
        const event = createEvent('ProductDetailsChanged', productData);
        Object.assign(product, productData);

        return $startTransaction(session => {
          return $saveToPubWithEvents('products', product, [event], { session }).then(() => {
            return $salesforce.$Oauth().then((token: string) => {
              return $salesforce.$upsert(token, product._id, salesForceItem(product));
            });
          });
        }).then(() => ({ status: 200 }));
      });
  },
};

const salesForceItem = (item: Product) => {
  return {
    Name: item.name,
    ProductCode: item.productCode,
    Description: item.description,
    Family: item.family,
    StockKeepingUnit: item.stockKeepingUnit,
    QuantityUnitOfMeasure: item.quantityUnitOfMeasure,
    Varietal__c: item.varietal,
    Vintage__c: item.vintage,
    Bottle_Size__c: item.bottleSize,
    IsActive: item.isActive,
  };
};

export default changeDetails;
