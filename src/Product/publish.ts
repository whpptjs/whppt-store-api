import assert from 'assert';
import { HttpModule } from '@whppt/api-express';
import { Product } from './Models/Product';

const changeDetails: HttpModule<{ productId: string }, void> = {
  authorise({ $identity }, { user }) {
    return $identity.isUser(user);
  },
  exec({ $salesforce, $database, createEvent }, { productId }) {
    assert(productId, 'Product Id is required.');

    return $database
      .then(({ document, startTransaction }) => {
        return document.fetch<Product>('products', productId).then(product => {
          assert(product, 'Product does not exsist');
          const event = createEvent('ProductPublished', product);

          return startTransaction(session => {
            return Promise.all([
              document.saveWithEvents('products', product, [event], { session }),
              document.publish('products', product, { session }),
            ]).then(() => {
              return $salesforce.$Oauth().then((token: string) => {
                return $salesforce.$upsert(token, product._id, salesForceItem(product));
              });
            });
          });
        });
      })
      .then(() => {});
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
