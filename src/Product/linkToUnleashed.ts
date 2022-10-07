import assert from 'assert';
import { HttpModule } from '@whppt/api-express';
import { Product } from './Models/Product';

const productLinkedToUnleashed: HttpModule<Product, void> = {
  authorise({ $identity }, { user }) {
    return $identity.isUser(user);
  },
  exec({ $database, createEvent }, productData) {
    assert(productData.domainId, 'Product requires a Domain Id.');
    assert(productData._id, 'Product requires a Product Id.');
    assert(productData.name, 'Product requires a Name.');
    assert(productData.productCode, 'Product requires a Product Code.');
    assert(productData.unleashed._id, 'Product requires an Unleashed ProductId.');

    return $database
      .then(({ document, startTransaction }) => {
        return document.fetch<Product>('products', productData._id).then(product => {
          assert(product && product._id, 'Product does not exsist');
          const events = [] as any;

          if (
            productData.unleashed.overrideProductCode ||
            productData.unleashed.overrideProductName ||
            productData.unleashed.overrideProductIsActive ||
            productData.unleashed.overrideProductFamily
          ) {
            product.productCode = productData.unleashed.overrideProductCode ? productData.productCode : product.productCode;
            product.name = productData.unleashed.overrideProductName ? productData.name : product.name;
            product.isActive = productData.unleashed.overrideProductIsActive ? productData.isActive : product.isActive;
            product.family = productData.unleashed.overrideProductFamily ? productData.family : product.family;

            console.log('🚀 ~  productData._id', productData._id);
            console.log('🚀 unleashedthen ~ productData._id', productData.unleashed._id);
            events.push(
              createEvent('ProductDetailsUpdatedViaUnleashed', {
                _id: productData._id,
                name: productData.unleashed.overrideProductCode ? productData.name : 'Not Updated',
                productCode: productData.unleashed.overrideProductName ? productData.productCode : 'Not Updated',
                isActive: productData.unleashed.overrideProductIsActive ? productData.isActive : 'Not Updated',
                family: productData.unleashed.overrideProductFamily ? productData.family : 'Not Updated',
              })
            );
          }

          if (product.unleashed._id !== productData.unleashed._id) {
            product.unleashed._id = productData.unleashed._id;
            events.push(createEvent('ProductLinkedToUnleashedProduct', { _id: productData._id, unleashedId: productData.unleashed._id }));
          }

          if (
            product.unleashed.overrideProductCode !== productData.unleashed.overrideProductCode ||
            product.unleashed.overrideProductName !== productData.unleashed.overrideProductName ||
            product.unleashed.overrideProductIsActive !== productData.unleashed.overrideProductIsActive ||
            product.unleashed.overrideProductFamily !== productData.unleashed.overrideProductFamily
          ) {
            product.unleashed.overrideProductCode = productData.unleashed.overrideProductCode;
            product.unleashed.overrideProductName = productData.unleashed.overrideProductName;
            product.unleashed.overrideProductIsActive = productData.unleashed.overrideProductIsActive;
            product.unleashed.overrideProductFamily = productData.unleashed.overrideProductFamily;

            events.push(
              createEvent('ProductUnleashedOverridesSet', {
                _id: productData._id,
                overrideProductCode: productData.unleashed.overrideProductCode,
                overrideProductName: productData.unleashed.overrideProductName,
                overrideProductIsActive: productData.unleashed.overrideProductIsActive,
                overrideProductFamily: productData.unleashed.overrideProductFamily,
              })
            );
          }

          if (!events.length) return Promise.resolve({ status: 200 });

          return startTransaction(session => {
            return document.saveWithEvents('products', product, events, { session }).then(() => {
              // return $salesforce.$Oauth().then((token: string) => {
              //   return $salesforce.$upsert(token, product._id, salesForceItem(product));
              // });
            });
          });
        });
      })
      .then(() => {});
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

export default productLinkedToUnleashed;
