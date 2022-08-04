import { HttpModule } from '@whppt/api-express';
import { UnleashedProduct } from './Models/UnleashedProduct';

const { flatMap } = require('lodash');

const updateListFromUnleashed: HttpModule<{}> = {
  authorise() {
    return Promise.resolve();
  },
  exec({ $id, $unleashed, $logger, $mongo: { $save, $startTransaction } }) {
    $logger.info(`Getting products from unleashed`);

    return $unleashed
      .$get('Products?pageSize=50', 'pageSize=50')
      .then((results: { Items: UnleashedProduct[] }) => {
        console.log('🚀 ', results);
        const getProductsPromises = [];
        // for (let i = 0; i < results.Pagination.NumberOfPages; i++) {
        getProductsPromises.push($unleashed.$get(`Products/Page/${1}?pageSize=50`, 'pageSize=50'));
        // }
        // for (let i = 0; i < results.Pagination.NumberOfPages; i++) {
        //   getProductsPromises.push(
        //     $unleashed.$get(`Products/Page/${i + 1}?pageSize=50`, 'pageSize=50')
        //   );
        // }
        return Promise.all(getProductsPromises).then(allResults => {
          const allProducts = flatMap(allResults, (item: { Items: UnleashedProduct[] }) => item.Items);
          $logger.info(`${allProducts.length} Products from unleashed`);

          return $startTransaction(async (session: any) => {
            const _promises = allProducts.map((r: UnleashedProduct) => {
              return $save('unleashed', { ...r, _id: r._id || r.Guid || $id() }, { session });
            });
            return Promise.all(_promises);
          });
        });
      })
      .then(() => ({
        status: 200,
      }));
  },
};
export default updateListFromUnleashed;
