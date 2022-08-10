import { HttpModule } from '@whppt/api-express';

const completeOrder: HttpModule<{ status: number }> = {
  authorise({ $roles }, { user }) {
    return $roles.validate(user, []);
  },
  exec() {
    //   events: [
    //     productsConfirmedToOrder,
    //     paymentDetailsAddedToContact,
    //     paymentDetailsAddedToOrder,
    //     paymentProcessedThroughStripe,
    //     giftCardUsed,
    //     checkoutCompleted,
    //     confirmationEmailQueued,
    // ]
    return Promise.resolve({ status: 200 });
  },
};

export default completeOrder;
