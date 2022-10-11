import assert from 'assert';
import { HttpModule } from '@whppt/api-express';
import { Product } from './Models/Product';

export type ChangeProductImageArgs = {
  domainId: string;
  productId: string;
  imageId: string;
};

const changeImage: HttpModule<ChangeProductImageArgs, void> = {
  authorise({ $identity }, { user }) {
    return $identity.isUser(user);
  },
  exec({ $database, createEvent }, { domainId, productId, imageId }) {
    assert(domainId, 'Product requires a Domain Id.');
    assert(productId, 'Product requires a Product Id.');

    assert(imageId, 'Image Id is required.');
    return $database.then(({ document, startTransaction }) => {
      return document.fetch<Product>('products', productId).then(product => {
        assert(product, 'Product does not exsist');

        const events = [createEvent('ProductImageRemoved', { _id: productId, imageId })];
        Object.assign(product, { domainId, productId, images: product.images.filter(_image => _image._id !== imageId) });

        const nextFeatureImage = product.images[0];
        if (product.featureImageId === imageId && nextFeatureImage) {
          events.push(createEvent('ProductFeatureImageChanged', { _id: productId, featureImageId: nextFeatureImage._id }));
          Object.assign(product, { domainId, productId, featureImageId: nextFeatureImage._id });
        }

        return startTransaction(session => {
          return document.saveWithEvents('products', product, events, { session });
        }).then(() => {});
      });
    });
  },
};

export default changeImage;
