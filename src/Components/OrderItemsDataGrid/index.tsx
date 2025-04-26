import { useCallback, useEffect, useState } from 'react';

import { useFieldArray, useFormContext } from 'react-hook-form';

import { DataGrid, GridColDef, GridEventListener } from '@mui/x-data-grid';
import { Button, MenuItem, Select, SelectChangeEvent } from '@mui/material';

import api from '../../Services/api';
import { IOrderProps } from '../../Pages/Orders';

interface IItensProps {
  id?: number;
  order_item_order: number;
  product_id: number;
  item_id?: number;
  description: string;
  quantity: number;
  price: number;
  observation: string;
  selectedItem?: number | '';
}

interface ISelectItemProps {
  id?: number;
  product_id: number;
  description: string;
  price: number;
  quantity: number;
}

const ProductSelectCell = ({
  value,
  rowId,
  options,
  onChange,
}: {
  value: number | '';
  rowId: number | string;
  options: ISelectItemProps[];
  onChange: (event: SelectChangeEvent<number>, rowIndex: number) => void;
}) => {
  return (
    <Select
      id={`select-${rowId}`}
      value={value}
      onChange={(event) => onChange(event, Number(rowId) - 1)}
      displayEmpty
      sx={{
        width: 300,
        left: -10,
        color: 'var(--font)',
        borderColor: 'var(--font)',
      }}
    >
      {options.map((item) => (
        <MenuItem key={item.id} value={item.id}>
          {item.description}
        </MenuItem>
      ))}
    </Select>
  );
};

export default function OrderItemsDataGrid() {
  const [itemRows, setItemsRows] = useState<IItensProps[]>([]);
  const [selectOptions, setSelectOptions] = useState<ISelectItemProps[]>([]);
  const form = useFormContext<IOrderProps>();
  const fieldArray = useFieldArray({ control: form.control, name: 'itens' });

  const itemDataGridColumns: GridColDef<IItensProps>[] = [
    { field: 'product_id', headerName: 'Código', width: 70 },
    {
      field: 'description',
      headerName: 'Produto',
      width: 300,
      renderCell: (params) => (
        <ProductSelectCell
          value={params.row.selectedItem ?? ''}
          rowId={params.id}
          options={selectOptions}
          onChange={handleChange}
        />
      ),
    },
    {
      field: 'quantity',
      headerName: 'Quantidade',
      width: 120,
      editable: true,
    },
    {
      field: 'price',
      headerName: 'Preço',
      width: 60,
      editable: true,
    },
    {
      field: 'observation',
      headerName: 'Observação',
      width: 250,
      editable: true,
    },
    {
      field: 'delete',
      headerName: 'Excluir',
      width: 85,
      renderCell: (params) => (
        <Button
          onClick={() =>
            handleDeleteSingleItem(parseInt(String(params.id), 10))
          }
          sx={{
            backgroundColor: '#ffc6c6',
            color: 'red',
            fontWeight: 'bold',
          }}
        >
          x
        </Button>
      ),
    },
  ];

  //api communication
  const loadItensSelect = useCallback(async () => {
    try {
      const { data } = await api.get('Produto');

      const obj = data.map((item: ISelectItemProps) => ({
        id: item.id,
        product_id: item.id,
        description: item.description,
        price: item.price,
        quantity: item.quantity,
      }));

      setSelectOptions(obj);
    } catch (error) {
      console.error(error);
    }
  }, []);

  //grid handling events
  const handleChange = useCallback(
    //TESTE: Incluir um produto coloca ele no grid corretamente
    (event: SelectChangeEvent<number>, rowIndex: number) => {
      const selectedId = event.target.value as number;
      const selectedIngredient = selectOptions.find(
        (item) => item.id === selectedId
      );
      console.log('hdnlech');
      const updatedItem = {
        id: rowIndex + 1,
        selectedItem: selectedId,
        product_id: selectedIngredient?.product_id || 0,
        description: selectedIngredient?.description || '',
        price: selectedIngredient?.price || 0,
        quantity: 1,
        observation: '',
        order_item_order: rowIndex,
      };

      fieldArray.remove(rowIndex);
      fieldArray.insert(rowIndex, updatedItem);

      setItemsRows((prevRows) =>
        prevRows.map((row, index) => (index === rowIndex ? updatedItem : row))
      );
    },
    [fieldArray, selectOptions]
  );

  const handleProcessRowUpdate = useCallback(
    (newRow: IItensProps) => {
      const index = newRow.id || 0;

      fieldArray.update(index - 1, newRow);

      const newItens = form.getValues('itens').map((item, index) => ({
        ...item,
        id: index,
      }));
      console.log(newItens);
      setItemsRows(newItens);

      return newRow;
    },
    [fieldArray, form]
  );

  const addNewRow = useCallback(() => {
    // TESTE: Incluir gera uma nova linha OK
    setItemsRows((prevRows) => [
      ...prevRows,
      {
        id: prevRows.length + 1 || 0,
        product_id: 0,
        description: '',
        quantity: 0,
        selectedItem: '',
        order_item_order: 0,
        price: 0,
        observation: '',
      },
    ]);
  }, []);

  const handleKeyDown: GridEventListener<'cellKeyDown'> = (params, event) => {
    if (event.key === 'ArrowDown') {
      const isLastRow = params.id === itemRows[itemRows.length - 1].id;

      if (isLastRow && params.id !== 0) {
        addNewRow();
      }
    }
  };

  // form handling events
  function loadDataGridItens() {
    const itens = form.getValues('itens') || [];

    const updatedItens = itens.map((item, index) => ({
      ...item,
      id: index,
      selectedItem: item.product_id,
    }));

    setItemsRows(updatedItens);
  }

  const handleDeleteSingleItem = useCallback(
    (id: number) => {
      const indexToRemove = itemRows.findIndex((item) => item.id === id);

      if (indexToRemove === -1) return;

      fieldArray.remove(indexToRemove);

      setItemsRows((prevRows) =>
        prevRows.filter((_, index) => index !== indexToRemove)
      );
    },
    [fieldArray, itemRows]
  );

  useEffect(() => {
    loadItensSelect();
    loadDataGridItens();
    addNewRow();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <DataGrid
      rows={itemRows}
      columns={itemDataGridColumns}
      getRowId={(row) => row.id!}
      initialState={{
        pagination: {
          paginationModel: {
            pageSize: 5,
          },
        },
      }}
      pageSizeOptions={[5]}
      disableRowSelectionOnClick
      onCellKeyDown={handleKeyDown}
      processRowUpdate={handleProcessRowUpdate}
      sx={{
        '& .MuiDataGrid-columnHeaders': {
          color: 'black',
          fontSize: '16px',
          fontWeight: 'bold',
        },
        '& .MuiDataGrid-cell': {
          color: 'var(--font)',
        },
        '& .MuiTablePagination-toolbar': {
          color: 'var(--font)',
        },
      }}
    />
  );
}
