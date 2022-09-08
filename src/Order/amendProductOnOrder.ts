import { HttpModule } from '@whppt/api-express';
import remove from 'lodash/remove';
import assert from 'assert';
import { Order } from './Models/Order';

const addProduct: HttpModule<{ productId: string; quantity: number; orderId?: string | undefined }, Order> = {
  authorise({ $roles }, { user }) {
    return $roles.validate(user, []);
  },
  exec({ $id, $mongo: { $dbPub, $saveToPubWithEvents, $startTransaction }, createEvent }, { productId, quantity, orderId }) {
    assert(productId, 'Product Id is required.');
    assert(quantity, 'Product quantity is required.');
    const quantityAsNumber = Number(quantity);

    return $dbPub
      .collection('orders')
      .findOne<Order>({ _id: orderId })
      .then(loadedOrder => {
        const order = {
          ...loadedOrder,
          _id: (loadedOrder && loadedOrder._id) || $id(),
          items: (loadedOrder && loadedOrder.items) || [],
        } as Order;
        const events = [] as any[];
        if (!loadedOrder || !loadedOrder._id) events.push(createEvent('CreatedOrder', order));
        const productAlreadyOnOrder = order.items.find(i => i.productId === productId);
        if (!productAlreadyOnOrder && quantityAsNumber === 0) {
          return {} as Order;
        } else if (!productAlreadyOnOrder) {
          const productOrder = { _id: $id(), productId, quantity: quantityAsNumber };
          events.push(createEvent('ProductOrderAddedToOrder', { _id: order._id, productOrder }));
          Object.assign(order.items, [...order.items, productOrder]);
        } else if (quantityAsNumber === 0) {
          Object.assign(
            order.items,
            remove(order.items, (i: any) => i._id !== productAlreadyOnOrder._id)
          );
          events.push(
            createEvent('ProductOrderRemovedFromOrder', {
              _id: order._id,
              productOrderId: productAlreadyOnOrder._id,
              productId: productAlreadyOnOrder.productId,
            })
          );
        } else if (productAlreadyOnOrder.quantity < quantityAsNumber) {
          productAlreadyOnOrder.quantity = quantityAsNumber;
          events.push(
            createEvent('ProductQuantityIncreased', {
              _id: order._id,
              productOrderId: productAlreadyOnOrder._id,
              productId: productAlreadyOnOrder.productId,
              quantity: quantityAsNumber,
            })
          );
        } else if (productAlreadyOnOrder.quantity > quantityAsNumber) {
          productAlreadyOnOrder.quantity = quantityAsNumber;

          events.push(
            createEvent('ProductQuantityReduced', {
              _id: order._id,
              productOrderId: productAlreadyOnOrder._id,
              productId: productAlreadyOnOrder.productId,
              quantity: quantityAsNumber,
            })
          );
        }
        if (events.length === 0) return order;

        return $startTransaction(session => {
          return $saveToPubWithEvents('orders', order, events, { session });
        }).then(() => order);
      });
  },
};

export default addProduct;
