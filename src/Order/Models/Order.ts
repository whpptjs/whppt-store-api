export type Order = {
  _id: string;
  domainId: string;
  productOrders: ProductOrder[];
};

export type ProductOrder = {
  _id: string;
  quantity: number;
};
