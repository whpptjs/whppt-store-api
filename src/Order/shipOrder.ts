import { HttpModule } from '@whppt/api-express';

const shipOrder: HttpModule<{ status: number }> = {
  authorise({ $roles }, { user }) {
    return $roles.validate(user, []);
  },
  exec() {
    //   events: [
    //     orderShipped,
    //     shippingEmailQueued,
    // ]
    return Promise.resolve({ status: 200 });
  },
};

export default shipOrder;
