import { HttpModule } from '@whppt/api-express';
import { UnleashedProduct } from './Models/UnleashedProduct';

const list: HttpModule<UnleashedProduct[]> = {
  authorise() {
    return Promise.resolve();
  },
  exec({ $mongo: { $db } }) {
    return $db
      .collection('unleashed')
      .find({})
      .project({
        _id: 1,
        IsSellable: 1,
        ProductCode: 1,
        ProductDescription: 1,
        ProductGroup: 1,
        UnitOfMeasure: 1,
      })
      .toArray()
      .then(items => items as UnleashedProduct[]);
  },
};
export default list;
