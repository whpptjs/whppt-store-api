import { HttpModule } from '@whppt/api-express';
import assert from 'assert';
import { Order } from './Models/Order';

const addProduct: HttpModule<{ productId: string; quantity: number; orderId?: string | undefined }, Order> = {
  authorise({ $roles }, { user }) {
    return $roles.validate(user, []);
  },
  exec({ $id, $mongo: { $dbPub, $saveToPubWithEvents, $startTransaction }, createEvent }, { productId, quantity, orderId, ...a }) {
    console.log('🚀 ~ file: addProduct.ts ~ line 10 ~ exec ~ orderId', orderId);
    console.log('🚀 ~ file: addProduct.ts ~ line 10 ~ exec ~ quantity', quantity);
    console.log('🚀 ~ file: addProduct.ts ~ line 10 ~ exec ~ a', a);
    console.log('🚀 ~ file: addProduct.ts ~ line 10 ~ exec ~ productId', productId);
    assert(productId, 'Product Id is required.');
    assert(quantity, 'Product quantity is required.');

    return $dbPub
      .collection('orders')
      .findOne<Order>({ _id: orderId })
      .then(loadedOrder => {
        const order = {
          ...loadedOrder,
          _id: (loadedOrder && loadedOrder._id) || $id(),
          items: (loadedOrder && loadedOrder.items) || [],
        } as Order;

        const productAlreadyOnOrder = order.items.find(i => i.productId === productId);
        assert(!productAlreadyOnOrder, 'Product already on the order.');

        const events = [] as any[];
        if (!loadedOrder || !loadedOrder._id) events.push(createEvent('CreatedOrder', order));
        const productOrder = { _id: $id(), productId, quantity };
        Object.assign(order.items, [...order.items, productOrder]);
        events.push(createEvent('ProductOrderAddedToOrder', { _id: order._id, productOrder }));

        return $startTransaction(session => {
          return $saveToPubWithEvents('orders', order, events, { session });
        }).then(() => order);
      });
  },
};

export default addProduct;
