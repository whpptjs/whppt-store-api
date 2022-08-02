import assert from 'assert';
import { HttpModule } from '@whppt/api-express';
import { Product } from './Models/Product';

const changeDetails: HttpModule<Product> = {
  authorise() {
    return Promise.resolve();
  },
  exec({ $salesforce, $mongo: { $dbPub, $saveToPubWithEvents, $startTransaction }, createEvent }, createProductData) {
    assert(createProductData.domainId, 'Product requires a Domain Id.');
    assert(createProductData._id, 'Product requires a Product Id.');
    assert(createProductData.name, 'Product requires a Name.');
    assert(createProductData.productCode, 'Product requires a Product Code.');

    return $dbPub
      .collection('products')
      .findOne<Product>({
        _id: createProductData._id,
      })
      .then(product => {
        assert(product, 'Product does not exsist');
        const event = createEvent('ProductDetailsChanged', createProductData);
        Object.assign(product, createProductData);

        return $startTransaction(session => {
          return $saveToPubWithEvents('products', product, [event], { session }).then(() => {
            return $salesforce.$Oauth().then((token: string) => {
              return $salesforce.$upsert(token, product._id, salesForceItem(product));
            });
          });
        });
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
