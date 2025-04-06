import { ChildrenProps } from '../../Types/common';

export const PageContainer = ({ children }: ChildrenProps) => (
  <div style={{ marginLeft: '250px', flex: 1 }}>{children}</div>
);

export const GridContainer = ({ children }: ChildrenProps) => (
  <div style={{ marginLeft: '250px', flex: 1, marginTop: 20 }}>{children}</div>
);

export const PageTitle = ({ children }: ChildrenProps) => (
  <h1 style={{ marginLeft: '250px', color: 'var(--font)' }}>{children}</h1>
);
