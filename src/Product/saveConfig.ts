import { HttpModule } from '@whppt/api-express';
import { Product } from './Models/Product';

export type SaveConfigParams = {
  key: string;
  value: any;
  productId: string;
};

export const saveConfig: HttpModule<SaveConfigParams, void> = {
  authorise({ $identity }, { user }) {
    return $identity.isUser(user);
  },
  exec({ $database }, { productId, key, value }) {
    return $database.then(({ document }) => {
      return document.fetch<Product>('products', productId).then(product => {
        product.config ? (product.config[key] = value) : (product.config = { [key]: value });
        return document.save('products', product).then(() => {});
      });
    });
  },
};

export default saveConfig;
