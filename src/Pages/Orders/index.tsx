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
import SearchComponent from '../../Components/SearchComponent';
import useMainLayoutContext from '../../Hooks/useMainLayoutContext';
import OrderItensDataGrid from '../../Components/OrderItemsDataGrid';
import {
  GridContainer,
  PageContainer,
  PageTitle,
} from '../../Components/StyleComponents';

interface OrdemItemProps {
  id?: number;
  order_item_order: number;
  product_id: number;
  quantity: number;
  price: number;
  observation: string;
  description: string;
}

export interface OrderProps {
  id?: number;
  order_id?: number;
  client_id: number;
  client_name: string;
  delivery_date: string;
  observation: string;
  paid: boolean;
  itens: Array<OrdemItemProps>;
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
  const [isLoading, setIsLoading] = useState(false);
  const [isEditable, setIsEditable] = useState(false);
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [dataGridRows, setDataGridRows] = useState<OrderProps[]>([]);
  const [isLoadingButton, setIsLoadingButton] = useState(false);
  const [shouldDeleteItem, setShouldDeleteItem] = useState(false);

  const {
    showToastMessage,
    setDialogInfo,
    setDialogHandleButtonAction,
    setShowDialog,
    handleFormError,
  } = useMainLayoutContext();

  const form = useForm<OrderProps>({ defaultValues: formDefault });
  const { control, getValues, setValue, reset, handleSubmit, formState } = form;
  const fieldArray = useFieldArray({ control: form.control, name: 'itens' });

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

  // API Communication
  async function loadOrders(id?: number) {
    try {
      setIsLoading(true);

      const { data } = await api.get('Pedido');

      const rows = data.map((item: OrderProps) => ({
        id: item.order_id,
        order_id: item.order_id,
        client_id: item.client_id,
        client_name: item.client_id + ' - ' + item.client_name,
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

      let orderGridIndex = rows.findIndex(
        (item: OrderProps) => item.order_id === id
      );

      if (orderGridIndex === -1) orderGridIndex = 0;

      reset({ ...rows[orderGridIndex], client_id: rows[orderGridIndex].id });
    } catch (error) {
      showToastMessage('Erro: ' + error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleRegisterOrder() {
    try {
      setIsLoadingButton(true);

      let formData;

      if (isNewRecord) {
        formData = getValues();

        delete formData.order_id;
      } else {
        formData = getValues();
      }

      formData.client_id = parseInt(
        formData.client_name.substring(0, formData.client_name.indexOf('-')),
        10
      );

      formData.itens = getValues('itens').map((item, index) => ({
        product_id: item.product_id,
        order_item_order: index + 1,
        quantity: item.quantity,
        price: item.price,
        observation: item.observation,
        description: item.description,
      }));

      const formatedDate = getValues('delivery_date').replace(
        /(\d{2})\/(\d{2})\/(\d{4})/,
        '$3/$2/$1'
      );

      formData.delivery_date = formatedDate;

      const { data, status } = await api.post('Pedido', formData);

      if (status === 201) {
        loadOrders(data.id);
        setIsNewRecord(false);
        setIsEditable(false);
      }
    } catch (error) {
      showToastMessage('Erro: ' + error);
    } finally {
      setIsLoadingButton(false);
      showToastMessage('Cadastro realizado com sucesso.');
    }
  }

  async function handleDeleteOrder() {
    try {
      setIsLoadingButton(true);

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
      showToastMessage('Erro: ' + error);
    } finally {
      setIsLoadingButton(false);
      setShowDialog(false);
      showToastMessage('Exclusão realizada com sucesso.');
    }
  }

  async function handleEditOrder() {
    const id = getValues('order_id');

    try {
      setIsLoadingButton(true);
      setValue('itens', []);

      const { data } = await api.get(`Pedido/${id}`);

      const itens = data.itens;

      for (let i = 0; i < itens.length; i++) {
        fieldArray.append(itens[i]);
      }

      setIsEditable(true);
    } catch (error) {
      showToastMessage('Erro: ' + error);
    } finally {
      setIsLoadingButton(false);
    }
  }

  // Form handling
  function handleAskDeleteOrder() {
    setDialogInfo({
      dialogTitle: 'Cadastro de Pedidos',
      dialogText: 'Excluir esse Pedido?',
      dialogButtonText: 'Excluir',
    });

    setDialogHandleButtonAction(() => handleDeleteOrder);
    setShowDialog(true);
  }

  function handleAddOrder() {
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
        (item) => item.order_id === getValues('order_id')
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
              type="client"
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
            handleFunction={handleSubmit(handleRegisterOrder, () =>
              handleFormError(formState)
            )}
            loading={isLoadingButton}
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
            handleFunction={handleAskDeleteOrder}
            loading={isLoadingButton && shouldDeleteItem}
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
        )}
      </GridContainer>
    </FormProvider>
  );
}
