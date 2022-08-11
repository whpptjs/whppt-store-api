import { HttpModule } from '@whppt/api-express';

const addProduct: HttpModule<
  { productId: string; quantity: number; orderId?: string | undefined },
  { _id: string; productOrder: { _id: string; quantity: number }[] }
> = {
  authorise({ $roles }, { user }) {
    return $roles.validate(user, []);
  },
  exec({ $id }, { productId, quantity, orderId }) {
    //   events:[
    //     createdOrder,
    //     productOrderAddedToOrder
    // ]
    return Promise.resolve({ _id: orderId || $id(), productOrder: [{ _id: productId, quantity }] });
  },
};

export default addProduct;
