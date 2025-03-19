import { ReactNode } from 'react';

export interface ChildrenProps {
  children: ReactNode;
}

export interface IGenericItem {
  id: number;
  description: string;
}
