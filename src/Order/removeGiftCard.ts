import { HttpModule } from '@whppt/api-express';

const removeGiftCard: HttpModule<{ status: number }> = {
  authorise({ $roles }, { user }) {
    return $roles.validate(user, []);
  },
  exec() {
    //   events:[
    //     giftCardRemovedFromOrder
    // ]
    return Promise.resolve({ status: 200 });
  },
};

export default removeGiftCard;
