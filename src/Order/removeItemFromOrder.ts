import { HttpModule } from '@whppt/api-express';

const removeItemFromOrder: HttpModule<{ orderId: string; itemId: string }, Order> = {
  authorise({ $roles }, { user }) {
    return $roles.validate(user, []);
  },
  exec({ $id, $mongo: { $dbPub, $saveToPubWithEvents, $startTransaction }, createEvent }, { orderId, ItemId }) {
    return Promise.resolve({ status: 200 });
  },
};

export default removeItemFromOrder;
