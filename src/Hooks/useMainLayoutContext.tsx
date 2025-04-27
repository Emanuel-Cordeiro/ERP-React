import { useContext } from 'react';
import { MainLayoutContext } from '../Context/mainLayoutContext';

export default function useMainLayoutContext() {
  return useContext(MainLayoutContext);
}
