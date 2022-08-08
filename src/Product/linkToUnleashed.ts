import assert from 'assert';
import { HttpModule } from '@whppt/api-express';
import { Product } from './Models/Product';

const productLinkedToUnleashed: HttpModule<Product, { status: number }> = {
  authorise() {
    return Promise.resolve();
  },
  exec({ $salesforce, $mongo: { $dbPub, $saveToPubWithEvents, $startTransaction }, createEvent }, productData) {
    assert(productData.domainId, 'Product requires a Domain Id.');
    assert(productData._id, 'Product requires a Product Id.');
    assert(productData.name, 'Product requires a Name.');
    assert(productData.productCode, 'Product requires a Product Code.');
    assert(productData.unleashed._id, 'Product requires an Unleashed ProductId.');

    return $dbPub
      .collection('products')
      .findOne<Product>({
        _id: productData._id,
      })
      .then(product => {
        assert(product, 'Product does not exsist');

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
        console.log('🚀 ~ file: linkToUnleashed.ts ~ line 76 ~ exec ~ events', events);

        return $startTransaction(session => {
          return $saveToPubWithEvents('products', product, events, { session }).then(() => {
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

export default productLinkedToUnleashed;
