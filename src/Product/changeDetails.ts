import assert from 'assert';
import { omit } from 'lodash';
import { HttpModule } from '@whppt/api-express';
import { Product } from './Models/Product';

const changeDetails: HttpModule<Product, void> = {
  authorise({ $identity }, { user }) {
    return $identity.isUser(user);
  },
  exec({ $database, createEvent }, productData) {
    assert(productData.domainId, 'Product requires a Domain Id.');
    assert(productData._id, 'Product requires a Product Id.');
    assert(productData.name, 'Product requires a Name.');
    assert(productData.productCode, 'Product requires a Product Code.');

    return $database.then(({ document, startTransaction }) => {
      return document.fetch<Product>('products', productData._id).then(product => {
        assert(product, 'Product does not exsist');
        const event = createEvent('ProductDetailsChanged', productData);
        Object.assign(product, omit(productData, ['unleashed']));
        return startTransaction(session => {
          return document.saveWithEvents('products', product, [event], { session }).then(() => {});
        }).then(() => {});
      });
    });
  },
};

// const salesForceItem = (item: Product) => {
//   return {
//     Name: item.name,
//     ProductCode: item.productCode,
//     Description: item.description,
//     Family: item.family,
//     StockKeepingUnit: item.stockKeepingUnit,
//     QuantityUnitOfMeasure: item.quantityUnitOfMeasure,
//     Varietal__c: item.varietal,
//     Vintage__c: item.vintage,
//     Bottle_Size__c: item.bottleSize,
//     IsActive: item.isActive,
//   };
// };

export default changeDetails;
