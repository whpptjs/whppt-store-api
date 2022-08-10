import { HttpModule } from '@whppt/api-express';

const removeProduct: HttpModule<{ status: number }> = {
  authorise({ $roles }, { user }) {
    return $roles.validate(user, []);
  },
  exec() {
    //   events:[
    //     productOrderRemovedFromOrder
    // ]
    return Promise.resolve({ status: 200 });
  },
};

export default removeProduct;
