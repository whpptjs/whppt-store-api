import { HttpModule } from '@whppt/api-express';
import { Product } from './Models/Product';

const list: HttpModule<{ domainId: string; limit: string; currentPage: string; search: string }, { products: Product[]; total: number }> = {
  authorise() {
    return Promise.resolve();
  },
  exec({ $mongo: { $dbPub } }, { domainId, limit, currentPage, search }) {
    let query = {
      domainId,
    } as any;

    if (search) {
      query = {
        $and: [{ domainId }, { $or: [{ name: { $regex: search, $options: 'i' } }, { productCode: { $regex: search, $options: 'i' } }] }],
      };
    }

    return Promise.all([
      $dbPub
        .collection('products')
        .find<Product>(query)
        .skip(parseInt(limit) * parseInt(currentPage))
        .limit(parseInt(limit))
        .toArray(),
      $dbPub.collection('products').countDocuments(query),
    ]).then(([products, _total]) => {
      let total = _total as unknown as number;
      return { products, total };
      //  : { products: Product[]; total: number };
    });
  },
};
export default list;
