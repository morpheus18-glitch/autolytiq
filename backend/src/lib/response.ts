export const ok = (res: any, data: unknown) => res.status(200).json(data);
export const created = (res: any, data: unknown) => res.status(201).json(data);
export const noContent = (res: any) => res.status(204).send();
