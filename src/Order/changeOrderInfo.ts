import { InformationDetails, Order } from './Models/Order';
import { HttpModule } from '@whppt/api-express';

const changeOrderInfo: HttpModule<{ orderId: string; information: InformationDetails }, Order> = {
  authorise({ $roles }, { user }) {
    return $roles.validate(user, []);
  },
  exec({ $id, $mongo: { $dbPub, $saveToPubWithEvents, $startTransaction }, createEvent }, { orderId, information }) {
    return Promise.resolve({ status: 200 });
  },
};

export default changeOrderInfo;
