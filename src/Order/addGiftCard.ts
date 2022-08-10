import { HttpModule } from '@whppt/api-express';

const addGiftCard: HttpModule<{ status: number }> = {
  authorise({ $roles }, { user }) {
    return $roles.validate(user, []);
  },
  exec() {
    //   events:[
    //     giftCardAddedToOrder
    // ]
    return Promise.resolve({ status: 200 });
  },
};

export default addGiftCard;
