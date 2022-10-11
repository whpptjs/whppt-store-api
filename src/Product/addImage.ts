import assert from 'assert';
import { HttpModule } from '@whppt/api-express';
import { Product, WhpptProductImageData } from './Models/Product';

export type ChangeProductImageArgs = {
  domainId: string;
  productId: string;
  featureImageId?: string;
  image: WhpptProductImageData;
};

const changeImage: HttpModule<ChangeProductImageArgs, void> = {
  authorise({ $identity }, { user }) {
    return $identity.isUser(user);
  },
  exec({ $database, createEvent }, { domainId, productId, image, featureImageId }) {
    assert(domainId, 'Product requires a Domain Id.');
    assert(productId, 'Product requires a Product Id.');

    assert(image._id, 'Product requires an Image.');
    assert(image.desktop.galleryItemId, 'Product requires at minimum a Desktop image.');
    return $database.then(({ document, startTransaction }) => {
      return document.fetch<Product>('products', productId).then(product => {
        assert(product, 'Product does not exsist');
        assert(!product.images.find(i => i._id === image._id), 'Product already has an exsiting id for that image.');

        const events = [createEvent('ProductImageAdded', { _id: productId, image })];
        Object.assign(product, { domainId, productId, images: product.images ? [...product.images, image] : [image] });

        if (!product.featureImageId) {
          events.push(createEvent('ProductFeatureImageSet', { _id: productId, featureImageId: image._id }));
          Object.assign(product, { domainId, productId, featureImageId: image._id });
        } else if (featureImageId && product.featureImageId !== featureImageId) {
          events.push(createEvent('ProductFeatureImageChanged', { _id: productId, featureImageId }));
          Object.assign(product, { domainId, productId, featureImageId });
        }

        return startTransaction(session => {
          return document.saveWithEvents('products', product, events, { session });
        }).then(() => {});
      });
    });
  },
};

export default changeImage;
