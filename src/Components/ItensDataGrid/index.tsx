import { useCallback, useEffect, useState } from 'react';

import { useFieldArray, useFormContext } from 'react-hook-form';

import { DataGrid, GridColDef, GridEventListener } from '@mui/x-data-grid';
import { Button, MenuItem, Select, SelectChangeEvent } from '@mui/material';

import api from '../../Services/api';
import { RecipeProps } from '../../Pages/Recipes';

interface IItensProps {
  id: number;
  ingredient_id?: number;
  description: string;
  quantity: number;
  selectedItem?: number | '';
}

interface ISelectItemProps {
  id?: number;
  ingredient_id: number;
  description: string;
  quantity: number;
}

export default function ItensDataGrid() {
  const [itensDataGridRows, setItensDataGridRows] = useState<IItensProps[]>([]);
  const [itensSelect, setItensSelect] = useState<ISelectItemProps[]>([]);
  const form = useFormContext<RecipeProps>();
  const fieldArray = useFieldArray({ control: form.control, name: 'itens' });

  const itemDataGridColumns: GridColDef<IItensProps>[] = [
    { field: 'ingredient_id', headerName: 'Código', width: 70 },
    {
      field: 'description',
      headerName: 'Adicionar',
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
          {itensSelect.map((item) => (
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
    const { data } = await api.get('Ingrediente');

    const obj = data.map((item: ISelectItemProps) => ({
      id: item.ingredient_id,
      ingredient_id: item.ingredient_id,
      description: item.description,
    }));

    setItensSelect(obj);
  }

  //grid handling events
  function handleChange(event: SelectChangeEvent<number>, rowIndex: number) {
    const selectedId = event.target.value as number;
    const existingIndex = itensDataGridRows.findIndex(
      (item) => item.ingredient_id === selectedId
    );

    if (existingIndex !== -1) {
      const updatedRows = [...itensDataGridRows];

      updatedRows[existingIndex].quantity =
        Number(updatedRows[existingIndex].quantity) + 1;

      setItensDataGridRows(updatedRows);

      fieldArray.update(existingIndex, updatedRows[existingIndex]);
    } else {
      const selectedIngredient = itensSelect.find(
        (item) => item.id === selectedId
      );

      const updatedItem = {
        ...fieldArray.fields[rowIndex],
        id: rowIndex + 1,
        ingredient_id: selectedIngredient?.ingredient_id || 0,
        description: selectedIngredient?.description || '',
        quantity: 1,
        selectedItem: selectedId,
      };

      fieldArray.remove(rowIndex);
      fieldArray.insert(rowIndex, updatedItem);

      setItensDataGridRows((prevRows) =>
        prevRows.map((row, index) => (index === rowIndex ? updatedItem : row))
      );
    }
  }

  const handleProcessRowUpdate = useCallback(
    (newRow: IItensProps) => {
      fieldArray.update(newRow.id - 1, newRow);

      const formItens = form.getValues('itens').map((item, index) => ({
        id: index + 1,
        ingredient_id: item.ingredient_id,
        description: item.description,
        quantity: item.quantity,
        selectedItem: item.ingredient_id,
      }));

      setItensDataGridRows(formItens);
      return newRow;
    },
    [fieldArray, form]
  );

  const addNewRow = useCallback(() => {
    setItensDataGridRows((prevRows) => [
      ...prevRows,
      {
        id: prevRows.length + 1 || 0,
        description: '',
        quantity: 1,
        selectedItem: '',
      },
    ]);
  }, []);

  const handleKeyDown: GridEventListener<'cellKeyDown'> = (params, event) => {
    if (event.key === 'ArrowDown') {
      const isLastRow =
        params.id === itensDataGridRows[itensDataGridRows.length - 1].id;

      if (
        isLastRow &&
        itensDataGridRows[itensDataGridRows.length - 1].ingredient_id
      ) {
        addNewRow();
      }
    }
  };

  // form handling events
  function loadDataGridItens() {
    const itens = form.getValues('itens') || [];

    const updatedItens = itens.map((item, index) => ({
      ...item,
      id: index + 1,
      selectedItem: item.ingredient_id,
    }));

    setItensDataGridRows(updatedItens);
  }

  function handleDeleteSingleItem(id: number) {
    const indexToRemove = itensDataGridRows.findIndex((item) => item.id === id);

    if (indexToRemove === -1) return;

    fieldArray.remove(indexToRemove);

    setItensDataGridRows((prevRows) =>
      prevRows.filter((_, index) => index !== indexToRemove)
    );
  }

  useEffect(() => {
    loadItensSelect();
    loadDataGridItens();
    addNewRow();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <DataGrid
      rows={itensDataGridRows}
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
