import { HttpModule } from '@whppt/api-express';
import { Product } from './Models/Product';

// export class Product extends AggRoot {
//   _id: string;
//   name: String;
//   productCode: String;
//   description: String;
//   family: String;
//   stockKeepingUnit: String;
//   quantityUnitOfMeasure: String;
//   varietal: String;
//   vintage: String;
//   bottleSize: String;
//   isActive: String;
// }

const save: HttpModule<{ domainId: string; product: Product }, Product> = {
  authorise() {
    return Promise.resolve();
  },
  exec({ $salesforce, $mongo: { $dbPub, $startTransaction }, $id, EventSession }, { domainId, product }) {
    product._id = product._id || $id();
    product.domainId = product.domainId || domainId;

    // return EventSession().then(({ callAction, getEvents }) => {});
    return $startTransaction(session => {
      return $dbPub.collection('products').updateOne({ _id: product._id }, { $set: product }, { upsert: true, session });
    }).then(() => product);
  },
};

export default save;
// return $salesforce.$Oauth().then(token => {
//   const _product = salesForceItem(product);
//   return $salesforce.$upsert(token, product._id, _product);
// });
