import assert from 'assert';
import { HttpModule } from '@whppt/api-express';
import { Product, WhpptProductImageData } from './Models/Product';
import { WhpptImageData } from '@whppt/next';

export type ChangeProductImageArgs = {
  domainId: string;
  productId: string;
  featureImageId?: string;
  image: WhpptImageData;
};

const changeImage: HttpModule<ChangeProductImageArgs, WhpptProductImageData> = {
  authorise({ $identity }, { user }) {
    return $identity.isUser(user);
  },
  exec({ $database, createEvent, $id }, { domainId, productId, image, featureImageId }) {
    assert(domainId, 'Product requires a Domain Id.');
    assert(productId, 'Product requires a Product Id.');

    assert(image.desktop.galleryItemId, 'Product requires at minimum a Desktop image.');
    return $database.then(({ document, startTransaction }) => {
      return document.fetch<Product>('products', productId).then(product => {
        assert(product, 'Product does not exsist');
        const newImage = {
          ...image,
          _id: $id.newId(),
        } as WhpptProductImageData;
        const events = [createEvent('ProductImageAdded', { _id: productId, image: newImage })];
        Object.assign(product, { domainId, productId, images: product.images ? [...product.images, newImage] : [newImage] });

        if (!product.featureImageId) {
          events.push(createEvent('ProductFeatureImageSet', { _id: productId, featureImageId: newImage._id }));
          Object.assign(product, { domainId, productId, featureImageId: newImage._id });
        } else if (featureImageId && product.featureImageId !== featureImageId) {
          events.push(createEvent('ProductFeatureImageChanged', { _id: productId, featureImageId }));
          Object.assign(product, { domainId, productId, featureImageId });
        }

        return startTransaction(session => {
          return document.saveWithEvents('products', product, events, { session });
        }).then(() => newImage);
      });
    });
  },
};

export default changeImage;
