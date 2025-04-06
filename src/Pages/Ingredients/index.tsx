import { useEffect, useState } from 'react';

import { Controller, useForm } from 'react-hook-form';

import { DataGrid, GridColDef, GridRowParams } from '@mui/x-data-grid';

import api from '../../Services/api';
import Input from '../../Components/TextField';
import ButtonForm from '../../Components/ButtonForm';
import ToastMessage from '../../Components/ToastMessage';
import DialogComponent from '../../Components/DialogComponent';
import {
  GridContainer,
  PageContainer,
  PageTitle,
} from '../../Components/StyleComponents';

interface IIngredientProps {
  id?: number;
  ingredient_id?: number;
  description: string;
  unity: string;
  cost: number;
  stock: number;
}

const formDefault = {
  id: 0,
  description: '',
  unity: '',
  cost: 0,
  stock: 0,
};

export default function Ingredients() {
  const [isEditable, setIsEditable] = useState(false);
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [shouldDeleteItem, setShouldDeleteItem] = useState(false);
  const [toastErrorMessage, setToastErrorMessage] = useState('');
  const [dataGridRows, setDataGridRows] = useState<IIngredientProps[]>([]);
  const { control, getValues, reset, handleSubmit, formState } =
    useForm<IIngredientProps>({});

  const dataGridColumns: GridColDef<(typeof dataGridRows)[number]>[] = [
    { field: 'id', headerName: 'Código', width: 70 },
    { field: 'description', headerName: 'Descrição', width: 300 },
    { field: 'unity', headerName: 'Unidade', width: 100 },
    { field: 'cost', headerName: 'Custo', width: 100 },
    { field: 'stock', headerName: 'Estoque', width: 100 },
  ];

  function handleRowClick(params: GridRowParams) {
    const selectedIngredient = dataGridRows.find(
      (ingredient) => ingredient.id === params.row.id
    );

    reset({
      ...selectedIngredient,
    });
  }

  function showErrorMessage(error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);

    setToastErrorMessage(msg);
    setTimeout(() => setToastErrorMessage(''), 5000);
  }

  function handleFormError() {
    const error = Object.values(formState.errors)[0];

    showErrorMessage(String(error!.message));
  }

  function handleAddClient() {
    reset(formDefault);

    setIsNewRecord(true);
    setIsEditable(true);
  }

  function handleCancelEdit() {
    const selectedIngredientIndex = dataGridRows.findIndex(
      (ingredient) => ingredient.ingredient_id === getValues('ingredient_id')
    );

    reset({
      ...dataGridRows[selectedIngredientIndex],
    });

    setIsEditable(false);
    setIsNewRecord(false);
  }

  async function loadIngredients(id?: number) {
    try {
      const { data } = await api.get('Ingrediente');

      const rows = data.map((ingredient: IIngredientProps) => ({
        id: ingredient.ingredient_id,
        ingredient_id: ingredient.ingredient_id,
        description: ingredient.description,
        unity: ingredient.unity,
        cost: ingredient.cost,
        stock: ingredient.stock,
      }));

      setDataGridRows(rows);

      let ingredientIndexInGrid = rows.findIndex(
        (item: IIngredientProps) => item.ingredient_id === id
      );

      if (ingredientIndexInGrid === -1) ingredientIndexInGrid = 0;

      reset({
        ...rows[ingredientIndexInGrid],
        ingredient_id: rows[ingredientIndexInGrid].ingredient_id,
      });
    } catch (error) {
      showErrorMessage(String(error));
    }
  }

  async function handleRegisterIngredient() {
    let formData;

    if (isNewRecord) {
      formData = { ...getValues() };

      delete formData.ingredient_id;
    } else {
      formData = { ...getValues(), ingredient_id: getValues('id') };
    }

    try {
      const { status, data } = await api.post('Ingrediente', formData);

      if (status === 200 || status === 201) {
        loadIngredients(data.id);
        setIsEditable(false);
        setIsNewRecord(false);
      }
    } catch (error) {
      showErrorMessage(error);
    }
  }

  async function handleDeleteIngredient() {
    const id = getValues('ingredient_id');

    try {
      const res = await api.delete(`Ingrediente/${id}`);

      if (res.status === 201) {
        const updatedList = dataGridRows.filter((item) => item.id !== id);

        setDataGridRows(updatedList);

        const selectedIngredientIndex = dataGridRows.findIndex(
          (ingredient) =>
            ingredient.ingredient_id === getValues('ingredient_id')
        );

        reset({
          ...updatedList[selectedIngredientIndex - 1],
        });
      }

      setShouldDeleteItem(false);
    } catch (error) {
      showErrorMessage(error);
    }
  }

  useEffect(() => {
    loadIngredients();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <PageTitle>Ingredientes</PageTitle>

      <PageContainer>
        <Controller
          name="id"
          control={control}
          render={({ field: { value, onChange } }) => (
            <Input
              id="id"
              label="Código"
              width={100}
              value={value}
              setValue={onChange}
              disabled
            />
          )}
        />

        <Controller
          name="description"
          control={control}
          rules={{ required: 'A descrição é obrigatória.' }}
          render={({ field: { value, onChange } }) => (
            <Input
              id="description"
              label="Descrição"
              width={500}
              value={value}
              setValue={onChange}
              disabled={!isEditable}
            />
          )}
        />

        <Controller
          name="unity"
          control={control}
          rules={{ required: 'A unidade é obrigatória.' }}
          render={({ field: { value, onChange } }) => (
            <Input
              id="unity"
              label="Unidade"
              width={80}
              value={value}
              setValue={onChange}
              disabled={!isEditable}
            />
          )}
        />

        <Controller
          name="cost"
          control={control}
          rules={{ min: { value: 1, message: 'Custo não pode ser zero' } }}
          render={({ field: { value, onChange } }) => (
            <Input
              id="cost"
              label="Custo"
              width={90}
              value={value}
              setValue={onChange}
              disabled={!isEditable}
            />
          )}
        />

        <Controller
          name="stock"
          control={control}
          render={({ field: { value, onChange } }) => (
            <Input
              id="stock"
              label="Estoque"
              width={90}
              value={value}
              setValue={onChange}
              disabled={!isEditable}
            />
          )}
        />
      </PageContainer>

      <PageContainer>
        {isEditable ? (
          <>
            <ButtonForm
              title="Gravar"
              handleFunction={handleSubmit(
                handleRegisterIngredient,
                handleFormError
              )}
            />

            <ButtonForm title="Cancelar" handleFunction={handleCancelEdit} />
          </>
        ) : (
          <>
            <ButtonForm title="Incluir" handleFunction={handleAddClient} />

            <ButtonForm
              title="Alterar"
              handleFunction={() => setIsEditable(true)}
            />

            <ButtonForm
              title="Excluir"
              handleFunction={() => setShouldDeleteItem(true)}
            />
          </>
        )}
      </PageContainer>

      <GridContainer>
        <DataGrid
          rows={dataGridRows}
          columns={dataGridColumns}
          initialState={{
            pagination: {
              paginationModel: {
                pageSize: 5,
              },
            },
          }}
          pageSizeOptions={[5]}
          disableRowSelectionOnClick
          onRowClick={handleRowClick}
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
      </GridContainer>

      <ToastMessage message={toastErrorMessage} />

      <DialogComponent
        title="Cadastro de Ingredientes"
        text="Excluir esse ingrediente?"
        handleButtonAction={handleDeleteIngredient}
        handleButtonText="Excluir"
        state={shouldDeleteItem}
        setState={setShouldDeleteItem}
      />
    </>
  );
}
