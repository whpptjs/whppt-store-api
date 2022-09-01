import { HttpModule } from '@whppt/api-express';

const getFilters: HttpModule<{ collections: string[]; styles: string[]; vintages: string[] }> = {
  authorise() {
    return Promise.resolve();
  },
  exec({ $mongo: { $dbPub } }) {
    return Promise.all([
      $dbPub.collection('products').distinct('family'),
      $dbPub.collection('products').distinct('style'),
      $dbPub.collection('products').distinct('vintage'),
    ]).then(([collections, styles, vintages]) => {
      return { collections, styles, vintages };
    });
  },
};
export default getFilters;
