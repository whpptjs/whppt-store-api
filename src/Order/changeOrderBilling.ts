import { HttpModule } from '@whppt/api-express';
import { BillingDetails, Order } from './Models/Order';

const changeOrderBilling: HttpModule<{ orderId: string; billing: BillingDetails }, Order> = {
  authorise({ $roles }, { user }) {
    return $roles.validate(user, []);
  },
  exec({ $id, $mongo: { $dbPub, $saveToPubWithEvents, $startTransaction }, createEvent }, { orderId, billing }) {
    return Promise.resolve({ status: 200 });
  },
};

export default changeOrderBilling;
