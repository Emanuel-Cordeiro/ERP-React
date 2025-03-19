import { Controller, useForm } from 'react-hook-form';
import Input from '../../Components/TextField';
import { useEffect, useState } from 'react';
import { DataGrid, GridColDef, GridRowParams } from '@mui/x-data-grid';
import api from '../../Services/api';
import ButtonForm from '../../Components/ButtonForm';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Slide,
  Snackbar,
} from '@mui/material';

interface ProductProps {
  id?: number;
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
    useForm<ProductProps>({});
  const [isEditable, setIsEditable] = useState(false);
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [shouldDeleteItem, setShouldDeleteItem] = useState(false);
  const [snackBarErrorMessage, setSnackBarErrorMessage] = useState('');
  const [dataGridRows, setDataGridRows] = useState<ProductProps[]>([]);

  const dataGridColumns: GridColDef<(typeof dataGridRows)[number]>[] = [
    { field: 'id', headerName: 'Código', width: 70 },
    { field: 'description', headerName: 'Descrição', width: 300 },
    { field: 'price', headerName: 'Preço', width: 100 },
    { field: 'unity', headerName: 'Unidade', width: 100 },
    { field: 'cost', headerName: 'Custo', width: 100 },
    { field: 'stock', headerName: 'Estoque', width: 100 },
  ];

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

  async function handleRegisterProduct() {
    try {
      const formData = { ...getValues() };

      if (isNewRecord) delete formData.id;

      const { status, statusText } = await api.post('Produto', formData);

      if (status === 201) {
        loadProducts();

        setIsEditable(false);
        setIsNewRecord(false);
      }

      if (status === 500) {
        console.log(statusText);
      }
    } catch (error) {
      showErrorMessage(error);
    }
  }

  async function loadProducts() {
    const { data } = await api.get('Produto');

    const rows = data.map((item: ProductProps) => ({
      id: item.id,
      description: item.description,
      unity: item.unity,
      price: item.price,
      cost: item.cost,
      stock: item.stock,
    }));

    setDataGridRows(rows);

    reset(rows[0]);
  }

  useEffect(() => {
    loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleRowClick(params: GridRowParams) {
    const selectedItem = dataGridRows.find((item) => item.id === params.row.id);

    reset({ ...selectedItem });
  }

  function showErrorMessage(error: unknown) {
    setSnackBarErrorMessage(String(error));

    setTimeout(() => setSnackBarErrorMessage(''), 5000);
  }

  function handleFormError() {
    const error = Object.values(formState.errors)[0];

    showErrorMessage(String(error!.message));
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

      <Snackbar
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        open={snackBarErrorMessage !== ''}
        message={snackBarErrorMessage}
        TransitionComponent={Slide}
        ContentProps={{
          sx: {
            backgroundColor: 'red',
            flex: 1,
          },
        }}
      />

      <Dialog open={shouldDeleteItem}>
        <DialogTitle>Cadastro de Produtos</DialogTitle>
        <DialogContent>
          <DialogContentText>Excluir esse produto?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShouldDeleteItem(false)}>Não</Button>
          <Button onClick={handleDeleteProduct} autoFocus>
            Excluir
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
