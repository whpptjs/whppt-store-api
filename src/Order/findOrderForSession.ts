import { HttpModule } from '@whppt/api-express';

const findOrderForSession: HttpModule<{ status: number }> = {
  authorise({ $roles }, { user }) {
    return $roles.validate(user, []);
  },
  exec() {
    // const cart = findOneFromSessionId() || findOrderNotCompletedWithMostRecentUpdatedDate()
    // abandonOtherOrders()
    // return cart;
    return Promise.resolve({ status: 200 });
  },
};

export default findOrderForSession;
