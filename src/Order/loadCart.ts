import { HttpModule } from '@whppt/api-express';

const loadCart: HttpModule<{ status: number }> = {
  authorise({ $roles }, { user }) {
    return $roles.validate(user, []);
  },
  exec() {
    // return loaded order

    return Promise.resolve({ status: 200 });
  },
};

export default loadCart;
