import assert from 'assert';
import { HttpModule } from '@whppt/api-express';
import { Product } from './Models/Product';

const changeImage: HttpModule<Product, void> = {
  authorise({ $identity }, { user }) {
    return $identity.isUser(user);
  },
  exec({ $database, createEvent }, productData) {
    assert(productData.domainId, 'Product requires a Domain Id.');
    assert(productData._id, 'Product requires a Product Id.');
    assert(productData.image, 'Product requires an Image.');
    assert(productData.image.desktop.galleryItemId, 'Product requires an Image.');
    return $database.then(({ document, startTransaction }) => {
      return document.fetch<Product>('products', productData._id).then(product => {
        assert(product, 'Product does not exsist');
        const event = createEvent('ProductImageDetailsChanged', { _id: productData._id, image: productData.image });
        Object.assign(product, productData);

        return startTransaction(session => {
          return document.saveWithEvents('products', product, [event], { session });
        }).then(() => {});
      });
    });
  },
};

export default changeImage;
