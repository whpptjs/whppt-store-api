import { HttpModule } from '@whppt/api-express';
import { Product } from './Models/Product';

const list: HttpModule<{ domainId: string; limit: string; currentPage: string }, { products: Product[]; total: number }> = {
  authorise() {
    return Promise.resolve();
  },
  exec({ $mongo: { $dbPub } }, { domainId, limit, currentPage }) {
    const query = {
      domainId,
    };

    return Promise.all([
      $dbPub
        .collection('products')
        .find<Product>(query)
        .skip(parseInt(limit) * parseInt(currentPage))
        .limit(parseInt(limit))
        .toArray(),
      $dbPub.collection('products').countDocuments(query),
    ]).then(([products, total]) => {
      return { products, total };
    });
  },
};
export default list;
