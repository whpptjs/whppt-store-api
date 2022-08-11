import { HttpModule } from '@whppt/api-express';

const updateCartProducts: HttpModule<{ status: number }> = {
  authorise({ $roles }, { user }) {
    return $roles.validate(user, []);
  },
  exec() {
    //   events:[
    //     productQuantityReduced,
    //     productQuantityIncreased,
    // ]
    return Promise.resolve({ status: 200 });
  },
};

export default updateCartProducts;
