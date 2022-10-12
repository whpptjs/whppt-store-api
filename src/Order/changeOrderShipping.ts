import { HttpModule } from '@whppt/api-express';
import { Order, ShippingDetails } from './Models/Order';

const changeOrderShipping: HttpModule<{ orderId: string; shipping: ShippingDetails }, Order> = {
  authorise({ $roles }, { user }) {
    return $roles.validate(user, []);
  },
  exec({ $id, $mongo: { $dbPub, $saveToPubWithEvents, $startTransaction }, createEvent }, { orderId, shipping }) {
    return Promise.resolve({ status: 200 });
  },
};

export default changeOrderShipping;
