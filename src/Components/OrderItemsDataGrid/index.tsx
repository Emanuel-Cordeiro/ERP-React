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

export default function OrderItemsDataGrid() {
  const [itemRows, setItemsRows] = useState<IItensProps[]>([]);
  const [selectOptions, setSelectOptions] = useState<ISelectItemProps[]>([]);
  const form = useFormContext<IOrderProps>();
  const fieldArray = useFieldArray({ control: form.control, name: 'itens' });

  const itemDataGridColumns: GridColDef<IItensProps>[] = [
    { field: 'id', headerName: 'Código', width: 70 },
    {
      field: 'description',
      headerName: 'Produto',
      width: 300,
      renderCell: (params) => (
        <Select
          id={`select-${params.id}`}
          value={params.row.selectedItem ?? ''}
          onChange={(event) =>
            handleChange(
              event,
              params.api.getRowIndexRelativeToVisibleRows(params.id)
            )
          }
          displayEmpty
          sx={{
            width: 300,
            left: -10,
            color: 'var(--font)',
            borderColor: 'var(--font)',
          }}
        >
          {selectOptions.map((item) => (
            <MenuItem key={item.id} value={item.id}>
              {item.description}
            </MenuItem>
          ))}
        </Select>
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
  async function loadItensSelect() {
    //TESTE: Preenche corretamente os produtos
    try {
      const { data } = await api.get('Produto');

      const obj = data.map((item: ISelectItemProps, index: number) => ({
        id: index,
        product_id: item.id,
        description: item.description,
        price: item.price,
        quantity: item.quantity,
      }));

      setSelectOptions(obj);
    } catch (error) {
      console.error(error);
    }
  }

  //grid handling events
  const handleChange = useCallback(
    //TESTE: Incluir um produto coloca ele no grid corretamente
    (event: SelectChangeEvent<number>, rowIndex: number) => {
      const selectedId = event.target.value as number;
      const selectedIngredient = selectOptions.find(
        (item) => item.id === selectedId
      );

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
      const index = itemRows.length - 1;
      console.log(newRow);
      fieldArray.update(index, newRow);

      return newRow;
    },
    [fieldArray, itemRows]
  );

  const addNewRow = useCallback(() => {
    // TESTE: Incluir gera uma nova linha OK
    setItemsRows((prevRows) => [
      ...prevRows,
      {
        id: 0,
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

    const updatedItens = itens.map((item) => ({
      ...item,
      id: item.order_item_order,
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
