import assert from 'assert';
import { HttpModule } from '@whppt/api-express';
import { Product } from './Models/Product';

const createProductFromUnleashed: HttpModule<Product> = {
  authorise() {
    return Promise.resolve();
  },
  exec({ $mongo: { $dbPub, $saveToPubWithEvents, $startTransaction }, $id, createEvent }, createProductData) {
    assert(createProductData.domainId, 'Product requires a Domain Id.');
    assert(createProductData.name, 'Product requires a Name.');
    assert(createProductData.productCode, 'Product requires a Product Code.');
    assert(createProductData.unleashed._id, 'Product requires a Unleashed Id.');

    return $dbPub
      .collection('products')
      .findOne<Product>({
        name: createProductData.name,
        productCode: createProductData.productCode,
        domainId: createProductData.domainId,
      })
      .then(product => {
        assert(!product, `Product already exsits with Code: ${createProductData.productCode} and Name ${createProductData.name}`);
        createProductData._id = $id();
        const event = createEvent('CreateProductWithUnleashed', createProductData);
        const newProduct = Object.assign({}, createProductData);
        return $startTransaction(session => {
          return $saveToPubWithEvents('products', newProduct, [event], { session });
        }).then(() => newProduct);
      });
  },
};

export default createProductFromUnleashed;