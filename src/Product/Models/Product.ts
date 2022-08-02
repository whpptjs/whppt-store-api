export type Product = {
  _id: string;
  domainId: string;
  name: string;
  productCode: string;
  description: string;
  family: string;
  stockKeepingUnit: string;
  quantityUnitOfMeasure: string;
  varietal: string;
  vintage: string;
  bottleSize: string;
  isActive: boolean;
  unleashedProductId: string;
  createdAt: Date;
  updatedAt: Date;
};
