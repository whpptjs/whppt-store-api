export type Order = {
  _id: string;
  domainId: string;
  items: OrderItem[];
  billingAddress: Address;
  shippingAddress: Address;
  contactId: string;
  discountIds: string;
  shipping: AusPostShipping;
  status: 'pending' | 'pending';
  payment: Payment;
};

export type OrderItem = {
  _id: string;
  productId: string;
  quantity: number;
};

export type Payment = {
  _id: string;
};
export type AusPostShipping = {
  _id: string;
};
export type Address = {
  _id: string;
};

export type Contact = {
  _id: string;
  firstName: string;
  lastName: string;
  address: Address;
};
export type Member = {
  _id: string;
  loyaltyLevel: string;
  contactId: string;
  amountSpent: number;
};
