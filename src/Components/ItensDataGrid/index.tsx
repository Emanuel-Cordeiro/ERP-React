import { useEffect, useState } from 'react';

import { useFieldArray, useFormContext } from 'react-hook-form';

import { DataGrid, GridColDef, GridEventListener } from '@mui/x-data-grid';
import { Button, MenuItem, Select, SelectChangeEvent } from '@mui/material';

import api from '../../Services/api';
import { RecipeProps } from '../../Pages/Recipes';
import { IGenericItem } from '../../Types/common';

interface ItensProps {
  item_id?: number;
  description: string;
  quantity: number;
  selectedItem?: number | '';
}

export function ItensDataGrid() {
  const [itensDataGridRows, setItensDataGridRows] = useState<ItensProps[]>([]);
  const [itensSelect, setItensSelect] = useState<IGenericItem[]>([]);
  const form = useFormContext<RecipeProps>();
  const fieldArray = useFieldArray({ control: form.control, name: 'itens' });

  function handleChange(event: SelectChangeEvent<number>, rowIndex: number) {
    const selectedId = event.target.value as number;
    const selectedIngredient = itensSelect.find(
      (item) => item.id === selectedId
    );

    const updatedItem = {
      ...fieldArray.fields[rowIndex],
      id: selectedIngredient?.id || 0,
      description: selectedIngredient?.description || '',
      quantity: 0,
      selectedItem: selectedId,
    };

    fieldArray.update(rowIndex, updatedItem);

    setItensDataGridRows((prevRows) =>
      prevRows.map((row, index) => (index === rowIndex ? updatedItem : row))
    );
  }

  const handleProcessRowUpdate = (newRow: ItensProps) => {
    const index = itensDataGridRows.length - 1;

    fieldArray.update(index, newRow);

    return newRow;
  };

  async function loadItensSelect() {
    const { data } = await api.get('Ingrediente');

    const obj = data.map((item: IGenericItem) => ({
      id: item.id,
      description: item.description,
    }));

    setItensSelect(obj);
  }

  function handleDeleteSingleItem(id: number) {
    const indexToRemove = itensDataGridRows.findIndex((item) => item.id === id);
    console.log(itensDataGridRows);
    if (indexToRemove === -1) return;

    fieldArray.remove(indexToRemove);

    setItensDataGridRows((prevRows) =>
      prevRows.filter((_, index) => index !== indexToRemove)
    );
  }

  const ingredientDataGridColumns: GridColDef<ItensProps>[] = [
    { field: 'id', headerName: 'Código', width: 70 },
    {
      field: 'description',
      headerName: 'Adicionar ingrediente',
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

  const addNewRow = () => {
    setItensDataGridRows((prevRows) => [
      ...prevRows,
      {
        id: 0,
        description: '',
        quantity: 0,
        selectedItem: '',
      },
    ]);
  };

  const handleKeyDown: GridEventListener<'cellKeyDown'> = (params, event) => {
    if (event.key === 'ArrowDown') {
      const isLastRow =
        params.id === itensDataGridRows[itensDataGridRows.length - 1].id;
      if (isLastRow && params.id !== 0) {
        addNewRow();
      }
    }
  };

  function loadDataGridItens() {
    const itens = form.getValues('itens') || [];

    const updatedItens = itens.map((item) => ({
      ...item,
      selectedItem: item.id,
    }));

    setItensDataGridRows(updatedItens);
  }

  useEffect(() => {
    loadDataGridItens();
    loadItensSelect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <DataGrid
      rows={itensDataGridRows}
      columns={ingredientDataGridColumns}
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
