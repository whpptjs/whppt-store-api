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
  unleashed: UnleashedOverride;
  createdAt: Date;
  updatedAt: Date;
};

export type UnleashedOverride = {
  _id: string;
  overrideProductCode: boolean;
  overrideProductName: boolean;
  overrideProductIsActive: boolean;
  overrideProductFamily: boolean;
};
