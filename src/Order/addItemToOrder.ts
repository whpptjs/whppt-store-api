import { HttpModule } from '@whppt/api-express';
import { Order } from './Models/Order';

const addItemToOrder: HttpModule<{ orderId: string; productId: string; quantity: number }, Order> = {
  authorise({ $roles }, { user }) {
    return $roles.validate(user, []);
  },
  exec({ $id, $mongo: { $dbPub, $saveToPubWithEvents, $startTransaction }, createEvent }, { orderId, productId, quantity }) {
    return Promise.resolve({ status: 200 });
  },
};

export default addItemToOrder;
