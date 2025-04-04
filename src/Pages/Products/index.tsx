import { useEffect, useState } from 'react';

import { Controller, useForm } from 'react-hook-form';

import { DataGrid, GridColDef, GridRowParams } from '@mui/x-data-grid';

import api from '../../Services/api';
import Input from '../../Components/TextField';
import ButtonForm from '../../Components/ButtonForm';
import DialogComponent from '../../Components/DialogComponent';
import ToastMessage from '../../Components/ToastMessage';

interface IProductProps {
  id?: number;
  product_id?: number;
  description: string;
  price: number;
  unity: string;
  stock: number;
  cost: number;
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
  const { control, getValues, reset, handleSubmit, formState } =
    useForm<IProductProps>({ defaultValues: formDefault });
  const [isEditable, setIsEditable] = useState(false);
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [shouldDeleteItem, setShouldDeleteItem] = useState(false);
  const [toastErrorMessage, setToastErrorMessage] = useState('');
  const [dataGridRows, setDataGridRows] = useState<IProductProps[]>([]);

  const dataGridColumns: GridColDef<(typeof dataGridRows)[number]>[] = [
    { field: 'id', headerName: 'Código', width: 70 },
    { field: 'description', headerName: 'Descrição', width: 300 },
    { field: 'price', headerName: 'Preço', width: 100 },
    { field: 'unity', headerName: 'Unidade', width: 100 },
    { field: 'cost', headerName: 'Custo', width: 100 },
    { field: 'stock', headerName: 'Estoque', width: 100 },
  ];

  function handleRowClick(params: GridRowParams) {
    const selectedItem = dataGridRows.find((item) => item.id === params.row.id);

    reset({ ...selectedItem });
  }

  async function loadProducts() {
    try {
      const { data } = await api.get('Produto');

      const rows = data.map((item: IProductProps) => ({
        id: item.id,
        product_id: item.id,
        description: item.description,
        unity: item.unity,
        price: item.price,
        cost: item.cost,
        stock: item.stock,
      }));

      setDataGridRows(rows);

      reset({ ...rows[0], product_id: rows[0].product_id });
    } catch (error) {
      showErrorMessage(String(error));
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

      setShouldDeleteItem(false);
    } catch (error) {
      showErrorMessage(error);
    }
  }

  async function handleRegisterProduct() {
    try {
      let formData;

      if (isNewRecord) {
        formData = { ...getValues() };

        delete formData.product_id;
      } else {
        formData = { ...getValues(), product_id: getValues('product_id') };
      }

      const { status } = await api.post('Produto', formData);

      if (status === 200 || status === 201) {
        loadProducts();
        setIsEditable(false);
        setIsNewRecord(false);
      }
    } catch (error) {
      showErrorMessage(error);
    }
  }

  function handleAddProduct() {
    reset(formDefault);

    setIsNewRecord(true);
    setIsEditable(true);
  }

  function handleCancelEdit() {
    const selectedItemIndex = dataGridRows.findIndex(
      (item) => item.id === getValues('id')
    );

    reset({
      ...dataGridRows[selectedItemIndex],
    });

    setIsEditable(false);
    setIsNewRecord(false);
  }

  function handleFormError() {
    const error = Object.values(formState.errors)[0];

    showErrorMessage(String(error!.message));
  }

  function showErrorMessage(error: unknown) {
    setToastErrorMessage(String(error));

    setTimeout(() => setToastErrorMessage(''), 5000);
  }

  useEffect(() => {
    loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <h1 style={{ marginLeft: '250px', color: 'var(--font)' }}>Produtos</h1>

      <div
        style={{
          marginLeft: '250px',
          display: 'flex',
          flex: 1,
        }}
      >
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
          name="price"
          control={control}
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
          name="unity"
          control={control}
          render={({ field: { value, onChange } }) => (
            <Input
              id="unity"
              label="Unidade"
              width={90}
              value={value}
              setValue={onChange}
              disabled={!isEditable}
            />
          )}
        />

        <Controller
          name="cost"
          control={control}
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
      </div>

      <div
        style={{
          marginLeft: '250px',
          display: 'flex',
          flex: 1,
        }}
      >
        {isEditable ? (
          <>
            <ButtonForm
              title="Gravar"
              handleFunction={handleSubmit(
                handleRegisterProduct,
                handleFormError
              )}
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
              handleFunction={() => setShouldDeleteItem(true)}
            />
          </>
        )}
      </div>

      <div
        style={{
          marginLeft: '250px',
          display: 'flex',
          flex: 1,
          marginTop: '20px',
        }}
      >
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
      </div>

      <DialogComponent
        title="Cadastro de Produtos"
        text="Excluir esse produto?"
        handleButtonAction={handleDeleteProduct}
        handleButtonText="Excluir"
        state={shouldDeleteItem}
        setState={setShouldDeleteItem}
      />

      <ToastMessage message={toastErrorMessage} />
    </>
  );
}
