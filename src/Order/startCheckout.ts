import { HttpModule } from '@whppt/api-express';

const startCheckout: HttpModule<{ status: number }> = {
  authorise({ $roles }, { user }) {
    return $roles.validate(user, []);
  },
  exec() {
    //   events: [
    //     startedOrder,
    // ]
    return Promise.resolve({ status: 200 });
  },
};

export default startCheckout;
