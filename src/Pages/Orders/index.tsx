import { useEffect, useState } from 'react';

import {
  Controller,
  FormProvider,
  useFieldArray,
  useForm,
} from 'react-hook-form';

import { Switch } from '@mui/material';
import { DataGrid, GridColDef, GridRowParams } from '@mui/x-data-grid';

import api from '../../Services/api';
import Input from '../../Components/TextField';
import ButtonForm from '../../Components/ButtonForm';
import ToastMessage from '../../Components/ToastMessage';
import DialogComponent from '../../Components/DialogComponent';
import SearchComponent from '../../Components/SearchComponent';
import OrderItensDataGrid from '../../Components/OrderItensDataGrid';
import {
  GridContainer,
  PageContainer,
  PageTitle,
} from '../../Components/StyleComponents';

interface IOrdemItemProps {
  order_item_order: number;
  product_id: number;
  quantity: number;
  price: number;
  observation: string;
  description: string;
}

export interface IOrderProps {
  id?: number;
  order_id?: number;
  client_id: number;
  client_name: string;
  delivery_date: string;
  observation: string;
  paid: boolean;
  itens: Array<IOrdemItemProps>;
}

const formDefault = {
  order_id: 0,
  client_id: 0,
  client_name: '',
  delivery_date: new Date().toLocaleDateString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }),
  observation: '',
  paid: false,
  itens: [],
};

export default function Orders() {
  const form = useForm<IOrderProps>({ defaultValues: formDefault });
  const { control, getValues, reset, handleSubmit, formState } = form;
  const fieldArray = useFieldArray({ control: form.control, name: 'itens' });

  const [isEditable, setIsEditable] = useState(false);
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [shouldDeleteItem, setShouldDeleteItem] = useState(false);
  const [toastErrorMessage, setToastErrorMessage] = useState('');
  const [dataGridRows, setDataGridRows] = useState<IOrderProps[]>([]);

  const dataGridColumns: GridColDef<(typeof dataGridRows)[number]>[] = [
    { field: 'id', headerName: 'Código', width: 70 },
    { field: 'client_name', headerName: 'Cliente', width: 300 },
    {
      field: 'delivery_date',
      headerName: 'Entrega',
      width: 110,
      editable: true,
    },
  ];

  async function loadOrders() {
    try {
      const { data } = await api.get('Pedido');

      const rows = data.map((item: IOrderProps) => ({
        id: item.order_id,
        order_id: item.order_id,
        client_id: item.client_id,
        client_name: item.client_name,
        delivery_date: new Date(item.delivery_date).toLocaleDateString(
          'pt-BR',
          {
            timeZone: 'America/Sao_Paulo',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          }
        ),
        observation: item.observation,
        paid: item.paid,
      }));

      setDataGridRows(rows);

      if (rows.length > 0) {
        reset({
          ...formDefault,
          ...rows[0],
        });
      }
    } catch (error) {
      showErrorMessage(error);
    }
  }

  async function handleDeleteOrder() {
    try {
      const id = getValues('order_id');

      const { status } = await api.delete(`Pedido/${id}`);

      if (status === 200) {
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

  async function handleEditOrder() {
    const id = getValues('order_id');

    try {
      const { data } = await api.get(`Pedido/${id}`);

      const itens = data.itens;

      for (let i = 0; i < itens.length; i++) {
        fieldArray.append(itens[i]);
      }

      setIsEditable(true);
    } catch (error) {
      showErrorMessage(error);
    }
  }

  async function handleRegisterOrder() {
    try {
      let formData;

      if (isNewRecord) {
        formData = getValues();

        delete formData.order_id;
      } else {
        formData = getValues();
      }

      const { data, status } = await api.post('Pedido', formData);
      console.log(data + status);
    } catch (error) {
      showErrorMessage(error);
    }
  }

  function handleAddOrder() {
    reset(formDefault);

    setIsNewRecord(true);
    setIsEditable(true);
  }

  function handleCancelEdit() {
    const selectedItemIndex = dataGridRows.findIndex(
      (item) => item.order_id === getValues('order_id')
    );

    reset({
      ...dataGridRows[selectedItemIndex],
    });

    setIsEditable(false);
    setIsNewRecord(false);
  }

  function handleFormError() {
    const error = Object.values(formState.errors)[0];

    setToastErrorMessage(String(error!.message));
  }

  function handleRowClick(params: GridRowParams) {
    const selectedItem = dataGridRows.find((item) => item.id === params.row.id);

    reset({ ...selectedItem });
  }

  function showErrorMessage(error: unknown) {
    setToastErrorMessage(String(error));

    setTimeout(() => setToastErrorMessage(''), 5000);
  }

  useEffect(() => {
    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <FormProvider {...form}>
      <PageTitle>Pedidos</PageTitle>

      <PageContainer>
        <Controller
          name="order_id"
          control={control}
          render={({ field: { value, onChange } }) => (
            <Input
              id="order_id"
              label="Número"
              width={100}
              value={value}
              setValue={onChange}
              disabled
            />
          )}
        />

        <Controller
          name="client_name"
          control={control}
          render={({ field: { value, onChange } }) => (
            <SearchComponent
              id="client_name"
              label="Cliente"
              width={500}
              disabled={!isEditable}
              value={value}
              setValue={onChange}
            />
          )}
        />

        <Controller
          name="delivery_date"
          control={control}
          render={({ field: { value, onChange } }) => (
            <Input
              id="delivery_date"
              label="Data de Entrega"
              width={130}
              value={value}
              setValue={onChange}
              disabled={!isEditable}
            />
          )}
        />

        <Controller
          name="paid"
          control={control}
          render={({ field: { value, onChange } }) => (
            <div
              style={{
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Switch
                checked={value}
                onClick={onChange}
                disabled={!isEditable}
              />
              <h5 style={{ color: 'var(--font)' }}>Pedido Pago</h5>
            </div>
          )}
        />
      </PageContainer>

      <PageContainer>
        <Controller
          name="observation"
          control={control}
          render={({ field: { value, onChange } }) => (
            <Input
              id="observation"
              label="Observação"
              width={760}
              value={value}
              setValue={onChange}
              disabled={!isEditable}
            />
          )}
        />
      </PageContainer>

      {isEditable ? (
        <PageContainer>
          <ButtonForm
            title="Gravar"
            handleFunction={handleSubmit(handleRegisterOrder, handleFormError)}
          />

          <ButtonForm title="Cancelar" handleFunction={handleCancelEdit} />
        </PageContainer>
      ) : (
        <PageContainer>
          <ButtonForm title="Incluir" handleFunction={handleAddOrder} />

          <ButtonForm
            title="Alterar"
            handleFunction={async () => await handleEditOrder()}
          />

          <ButtonForm
            title="Excluir"
            handleFunction={() => setShouldDeleteItem(true)}
          />
        </PageContainer>
      )}

      <GridContainer>
        {isEditable ? (
          <OrderItensDataGrid />
        ) : (
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
        )}
      </GridContainer>

      <DialogComponent
        title="Cadastro de Pedidos"
        text="Excluir esse pedido?"
        handleButtonAction={handleDeleteOrder}
        handleButtonText="Excluir"
        state={shouldDeleteItem}
        setState={setShouldDeleteItem}
      />

      <ToastMessage message={toastErrorMessage} />
    </FormProvider>
  );
}
