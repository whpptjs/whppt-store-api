import { HttpModule } from '@whppt/api-express';
import { Product } from 'src/Product/Models/Product';
import { Order } from './Models/Order';

const findOrderForSession: HttpModule<{ orderId: string }, { products: Product[] } & Order> = {
  authorise({ $roles }, { user }) {
    return $roles.validate(user, []);
  },
  exec({ $mongo: { $db, $dbPub } }, { orderId }) {
    const query = orderId ? { _id: orderId } : { status: { $ne: 'completed' } };

    return $db
      .collection<Order>('orders')
      .findOne(query)
      .then(order => {
        const productIds = order.items.map(i => i.productId);
        return $dbPub
          .collection('products')
          .find({ _id: { $in: productIds } })
          .toArray()
          .then(products => {
            return { ...order, products };
          });
      });
  },
};

export default findOrderForSession;
