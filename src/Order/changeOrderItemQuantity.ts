import { HttpModule } from '@whppt/api-express';
import assert from 'assert';
import { Order } from './Models/Order';

const addProduct: HttpModule<{ productId: string; quantity: number; orderId?: string | undefined }, void> = {
  authorise({ $roles }, { user }) {
    return $roles.validate(user, []);
  },
  exec({ $id, $database, createEvent }, { productId, quantity, orderId }) {
    assert(productId, 'Product Id is required.');
    assert(quantity, 'Product quantity is required.');
    const quantityAsNumber = Number(quantity);
    assert(quantityAsNumber > 0, 'Product quantity must be higher than 0.');

    return $database
      .then(({ document, startTransaction }) => {
        return document.query<Order>('orders', { filter: { _id: orderId } }).then(loadedOrder => {
          const order = {
            ...loadedOrder,
            _id: (loadedOrder && loadedOrder._id) || $id.newId(),
            items: (loadedOrder && loadedOrder.items) || [],
          } as Order;

          const events = [] as any[];

          const productAlreadyOnOrder = order.items.find(i => i.productId === productId);

          if (!productAlreadyOnOrder) {
            const productOrder = { _id: $id.newId(), productId, quantity: quantityAsNumber };
            events.push(createEvent('OrderItemAddedToOrder', { _id: order._id, productOrder }));
            Object.assign(order.items, [...order.items, productOrder]);
          } else if (productAlreadyOnOrder.quantity < quantityAsNumber) {
            productAlreadyOnOrder.quantity = quantityAsNumber;
            events.push(
              createEvent('OrderItemQuantityIncreased', {
                _id: order._id,
                productOrderId: productAlreadyOnOrder._id,
                productId: productAlreadyOnOrder.productId,
                quantity: quantityAsNumber,
              })
            );
          } else if (productAlreadyOnOrder.quantity > quantityAsNumber) {
            productAlreadyOnOrder.quantity = quantityAsNumber;

            events.push(
              createEvent('OrderItemQuantityReduced', {
                _id: order._id,
                productOrderId: productAlreadyOnOrder._id,
                productId: productAlreadyOnOrder.productId,
                quantity: quantityAsNumber,
              })
            );
          }

          if (events.length === 0) return order;

          return startTransaction(session => {
            return document.saveWithEvents('orders', order, events, { session });
          });
        });
      })
      .then(() => {});
  },
};

export default addProduct;
