export type CargoType = {
  nombre: string;
  tips: string;
};

export type UpdateCargoInput = {
  id: number;
  cargo: CargoType;
};

export type UpdateCargoResponse = {
  ok: Boolean;
  message: string;
  cargo?: CargoType;
};

export type DeleteCargoInput = {
  id: number;
};

export type CargoList = {
  id: number;
  nombre: string;
  tips: string;
  updatedAt: Date;
};
