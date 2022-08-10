import { HttpModule } from '@whppt/api-express';

const addProduct: HttpModule<{ status: number }> = {
  authorise({ $roles }, { user }) {
    return $roles.validate(user, []);
  },
  exec() {
    //   events:[
    //     createdOrder,
    //     productOrderAddedToOrder
    // ]
    return Promise.resolve({ status: 200 });
  },
};

export default addProduct;
