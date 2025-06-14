import { useEffect, useState } from 'react';

import { Controller, useForm } from 'react-hook-form';

import { DataGrid, GridColDef, GridRowParams } from '@mui/x-data-grid';

import api from '../../Services/api';
import Input from '../../Components/TextField';
import ButtonForm from '../../Components/ButtonForm';
import { SelectInput } from '../../Components/SelectInput';
import SearchComponent from '../../Components/SearchComponent';
import useMainLayoutContext from '../../Hooks/useMainLayoutContext';
import {
  GridContainer,
  PageContainer,
  PageTitle,
} from '../../Components/StyleComponents';

interface ProductProps {
  id?: number;
  product_id?: number;
  description: string;
  price: number;
  unity: string;
  stock: number;
  cost: number;
  recipe_id: string;
  recipe_description: string;
}

const formDefault = {
  id: 0,
  description: '',
  price: 0,
  unity: '',
  stock: 0,
  cost: 0,
};

export default function Products() {
  const [isLoading, setIsLoading] = useState(false);
  const [isEditable, setIsEditable] = useState(false);
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [dataGridRows, setDataGridRows] = useState<ProductProps[]>([]);
  const [isLoadingButton, setIsLoadingButton] = useState(false);

  const {
    showToastMessage,
    setDialogInfo,
    setDialogHandleButtonAction,
    setShowDialog,
    handleFormError,
  } = useMainLayoutContext();

  const { control, getValues, reset, handleSubmit, formState } =
    useForm<ProductProps>({ defaultValues: formDefault });

  const dataGridColumns: GridColDef<(typeof dataGridRows)[number]>[] = [
    { field: 'id', headerName: 'Código', width: 70 },
    { field: 'description', headerName: 'Descrição', width: 300 },
    { field: 'price', headerName: 'Preço', width: 100 },
    { field: 'unity', headerName: 'Unidade', width: 100 },
    { field: 'cost', headerName: 'Custo', width: 100 },
    { field: 'stock', headerName: 'Estoque', width: 100 },
  ];

  // API Communication
  async function loadProducts(id?: number) {
    try {
      setIsLoading(true);

      const { data } = await api.get('Produto');

      const rows = data.map((item: ProductProps, index: number) => ({
        id: index + 1,
        product_id: item.product_id,
        description: item.description,
        unity: item.unity,
        price: item.price,
        cost: item.cost,
        stock: item.stock,
        recipe_id: item.recipe_id + ' - ' + item.recipe_description,
      }));

      setDataGridRows(rows);

      let productIndexInGrid = rows.findIndex(
        (item: ProductProps) => item.product_id === id
      );

      if (productIndexInGrid === -1) productIndexInGrid = 0;

      reset({
        ...rows[productIndexInGrid],
        product_id: rows[productIndexInGrid].product_id,
      });
    } catch (error) {
      showToastMessage('Erro: ' + error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleRegisterProduct() {
    let formData;

    if (isNewRecord) {
      formData = { ...getValues() };

      delete formData.product_id;
    } else {
      formData = { ...getValues(), product_id: getValues('product_id') };
    }

    formData.recipe_id = formData.recipe_id.substring(
      0,
      formData.recipe_id.indexOf(' -')
    );

    try {
      setIsLoadingButton(true);

      const { status, data } = await api.post('Produto', formData);

      if (status === 200 || status === 201) {
        loadProducts(data.id);
        setIsEditable(false);
        setIsNewRecord(false);
        showToastMessage('Cadastro realizado com sucesso.');
      }
    } catch (error) {
      showToastMessage('Erro: ' + error);
    } finally {
      setIsLoadingButton(false);
    }
  }

  async function handleDeleteProduct() {
    const id = getValues('id');

    try {
      const res = await api.delete(`Produto/${id}`);

      if (res.status === 201) {
        const updatedList = dataGridRows.filter((item) => item.id !== id);

        setDataGridRows(updatedList);

        const selectedItemIndex = dataGridRows.findIndex(
          (item) => item.id === getValues('id')
        );

        reset({
          ...updatedList[selectedItemIndex - 1],
        });
      }
    } catch (error) {
      showToastMessage('Erro: ' + error);
    } finally {
      setIsLoadingButton(false);
      setShowDialog(false);
      showToastMessage('Exclusão realizada com sucesso.');
    }
  }

  // Form handling in general
  function handleAskDeleteProduct() {
    setDialogInfo({
      dialogTitle: 'Cadastro de Produtos',
      dialogText: 'Excluir esse Produto?',
      dialogButtonText: 'Excluir',
    });

    setDialogHandleButtonAction(() => handleDeleteProduct);
    setShowDialog(true);
  }

  function handleAddProduct() {
    reset(formDefault);

    setIsNewRecord(true);
    setIsEditable(true);
  }

  function handleCancelEdit() {
    if (isNewRecord) {
      reset({
        ...dataGridRows[0],
      });
    } else {
      const selectedItemIndex = dataGridRows.findIndex(
        (item) => item.id === getValues('id')
      );

      reset({
        ...dataGridRows[selectedItemIndex],
      });
    }

    setIsEditable(false);
    setIsNewRecord(false);
  }

  function handleRowClick(params: GridRowParams) {
    const selectedItem = dataGridRows.find((item) => item.id === params.row.id);

    reset({ ...selectedItem });
  }

  useEffect(() => {
    loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <PageTitle>Produtos</PageTitle>

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
            <SelectInput
              label="Unidade"
              id="unity"
              width={78}
              value={value}
              setValue={onChange}
              disabled={!isEditable}
            />
          )}
        />
      </PageContainer>

      <PageContainer>
        <Controller
          name="recipe_id"
          control={control}
          render={({ field: { value, onChange } }) => (
            <SearchComponent
              id="recipe_id"
              type="recipe"
              label="Receita"
              width={415}
              disabled={!isEditable}
              value={value}
              setValue={onChange}
            />
          )}
        />

        <Controller
          name="price"
          control={control}
          rules={{ min: { value: 1, message: 'Preço não pode ser zero' } }}
          render={({ field: { value, onChange } }) => (
            <Input
              id="price"
              label="Preço"
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
          rules={{ min: { value: 1, message: 'Estoque não pode ser zero' } }}
          render={({ field: { value, onChange } }) => (
            <Input
              id="stock"
              label="Estoque"
              width={78}
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
              handleFunction={handleSubmit(handleRegisterProduct, () =>
                handleFormError(formState)
              )}
              loading={isLoadingButton}
            />

            <ButtonForm title="Cancelar" handleFunction={handleCancelEdit} />
          </>
        ) : (
          <>
            <ButtonForm title="Incluir" handleFunction={handleAddProduct} />

            <ButtonForm
              title="Alterar"
              handleFunction={() => setIsEditable(true)}
            />

            <ButtonForm
              title="Excluir"
              handleFunction={handleAskDeleteProduct}
              loading={isLoadingButton}
            />
          </>
        )}
      </PageContainer>

      <GridContainer>
        <DataGrid
          rows={dataGridRows}
          columns={dataGridColumns}
          loading={isLoading}
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
    </>
  );
}
