import { HttpModule } from '@whppt/api-express';

const cancelOrder: HttpModule<{ status: number }> = {
  authorise({ $roles }, { user }) {
    return $roles.validate(user, []);
  },
  exec() {
    //   events: [
    //     orderCancelled,
    //     paymentReversedThroughStripe
    //     cancelledOrderEmailQueued,
    // ]
    return Promise.resolve({ status: 200 });
  },
};

export default cancelOrder;
