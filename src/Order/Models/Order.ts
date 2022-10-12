import { Product } from 'src/Product/Models/Product';

export type Order = {
  _id: string;
  domainId: string;
  items: OrderItem[];
  billingAddress: Address;
  shippingAddress: Address;
  contactId: string;
  discountIds: string;
  shipping: AusPostShipping;
  orderStatus: 'pending' | 'pending';
  payment: Payment;
  createdAt: Date;
  updatedAt: Date;
};

export type OrderItem = {
  _id: string;
  productId?: string;
  quantity: number;
  product?: Product;
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

export type InformationDetails = {
  email: string;
  phone: string;
  emailNews: boolean;
};

export type AddressDetails = {
  number: string;
  street: string;
  suburb: string;
  city: string;
  state: string;
  country: string;
  postCode: string;
};

export type ShippingDetails = {
  firstName: string;
  lastName: string;
  company: string;
  contact: string;
  address: AddressDetails;
  express: boolean;
  shippingCost: number;
};

export type BillingDetails = {
  contact: string;
  address: AddressDetails;
  discountCode: string;
  useSameAsShipping: boolean;
  express: boolean;
};

export type PaymentDetails = {
  contact: string;
  express: boolean;
};
