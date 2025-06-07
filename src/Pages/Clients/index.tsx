import { useEffect, useMemo, useState } from 'react';

import { AxiosError, isAxiosError } from 'axios';
import { Controller, useForm } from 'react-hook-form';

import { DataGrid, GridColDef, GridRowParams } from '@mui/x-data-grid';

import api from '../../Services/api';
import { ApiError } from '../../Types/common';
import Input from '../../Components/TextField';
import ButtonForm from '../../Components/ButtonForm';
import useMainLayoutContext from '../../Hooks/useMainLayoutContext';
import {
  GridContainer,
  PageContainer,
  PageTitle,
} from '../../Components/StyleComponents';

export interface ClientProps {
  id?: number;
  client_id?: number;
  name: string;
  address: string;
  number: string;
  district: string;
  city: string;
  phone: string;
}

const formDefault = {
  id: 0,
  name: '',
  address: '',
  number: '',
  district: '',
  city: '',
  phone: '',
};

export default function Clients() {
  const [isLoading, setIsLoading] = useState(false);
  const [isEditable, setIsEditable] = useState(false);
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [dataGridRows, setDataGridRows] = useState<ClientProps[]>([]);
  const [isLoadingButton, setIsLoadingButton] = useState(false);

  const {
    showToastMessage,
    setDialogInfo,
    setDialogHandleButtonAction,
    setShowDialog,
    handleFormError,
  } = useMainLayoutContext();

  const { handleSubmit, control, reset, getValues, formState } =
    useForm<ClientProps>({ defaultValues: formDefault });

  const dataGridColumns = useMemo<GridColDef<(typeof dataGridRows)[number]>[]>(
    () => [
      { field: 'id', headerName: 'Id', width: 10 },
      { field: 'client_id', headerName: 'Código', width: 70 },
      { field: 'name', headerName: 'Nome', width: 300 },
      { field: 'phone', headerName: 'Telefone', width: 130 },
      { field: 'address', headerName: 'Endereço', width: 200 },
      { field: 'number', headerName: 'Nr', width: 70 },
      { field: 'district', headerName: 'Bairro', width: 150 },
      { field: 'city', headerName: 'Cidade', width: 150 },
    ],
    []
  );

  // API communication
  async function loadClients(client_id?: number) {
    try {
      setIsLoading(true);

      const { data } = await api.get('Cliente');

      const rows = data.map((client: ClientProps, index: number) => ({
        id: index,
        client_id: client.client_id,
        name: client.name,
        number: client.number,
        address: client.address,
        district: client.district,
        city: client.city,
        phone: client.phone,
      }));

      setDataGridRows(rows);

      let clientGridIndex = rows.findIndex(
        (item: ClientProps) => item.client_id === client_id
      );

      if (clientGridIndex === -1) clientGridIndex = 0;

      reset({
        ...rows[clientGridIndex],
      });
    } catch (error) {
      showToastMessage('Erro: ' + error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleRegisterClient() {
    try {
      setIsLoadingButton(true);

      const formData = { ...getValues() };

      if (isNewRecord) delete formData.client_id;

      const { status, data } = await api.post('Cliente', formData);

      if (status === 200 || status === 201) {
        loadClients(data.id);
        setIsEditable(false);
        setIsNewRecord(false);
        showToastMessage(
          `Cadastro ${status === 201 ? 'realizado' : 'alterado'} com sucesso.`
        );
      }
    } catch (error) {
      showToastMessage('Erro: ' + error);
    } finally {
      setIsLoadingButton(false);
    }
  }

  async function handleDeleteClient() {
    const clientId = getValues('client_id');

    try {
      setIsLoadingButton(true);

      const res = await api.delete(`Cliente/${clientId}`);

      if (res.status === 204) {
        const selectedClientIndex = dataGridRows.findIndex(
          (client) => client.client_id === clientId
        );

        const updatedList = dataGridRows.filter(
          (item) => item.client_id !== clientId
        );

        setDataGridRows(updatedList);

        reset(updatedList[selectedClientIndex - 1] || formDefault);

        showToastMessage('Exclusão realizada com sucesso.');
      }
    } catch (error) {
      if (isAxiosError<ApiError>(error)) {
        const axiosError: AxiosError<ApiError> = error;

        const errorMessage = axiosError.response?.data?.error;

        showToastMessage('Erro: ' + errorMessage);
      } else {
        showToastMessage('Erro: ' + String(error));
      }
    } finally {
      setIsLoadingButton(false);
      setShowDialog(false);
    }
  }

  // Form handling in general
  function handleAskDeleteClient() {
    setDialogInfo({
      dialogTitle: 'Cadastro de Clientes',
      dialogText: 'Excluir esse cliente?',
      dialogButtonText: 'Excluir',
    });

    setDialogHandleButtonAction(() => handleDeleteClient);
    setShowDialog(true);
  }

  function handleAddClient() {
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
      const selectedClientIndex = dataGridRows.findIndex(
        (client) => client.client_id === getValues('client_id')
      );

      reset({
        ...dataGridRows[selectedClientIndex],
      });
    }

    setIsEditable(false);
    setIsNewRecord(false);
  }

  function handleRowClick(params: GridRowParams) {
    if (isEditable) return;

    const selectedClient = dataGridRows.find(
      (client) => client.id === params.row.id
    );

    reset({ ...selectedClient });
  }

  useEffect(() => {
    loadClients();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <PageTitle>Clientes</PageTitle>

      <PageContainer>
        <Controller
          name="client_id"
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
          name="name"
          control={control}
          rules={{ required: 'O nome é obrigatório.' }}
          render={({ field: { value, onChange } }) => (
            <Input
              id="clientName"
              label="Nome"
              width={470}
              value={value}
              setValue={onChange}
              disabled={!isEditable}
            />
          )}
        />

        <Controller
          name="phone"
          control={control}
          rules={{ required: 'O telefone é obrigatório.' }}
          render={({ field: { value, onChange } }) => (
            <Input
              id="phone"
              label="Telefone"
              width={150}
              value={value}
              setValue={onChange}
              disabled={!isEditable}
            />
          )}
        />
      </PageContainer>

      <PageContainer>
        <Controller
          name="address"
          control={control}
          rules={{ required: 'O endereço é obrigatório.' }}
          render={({ field: { value, onChange } }) => (
            <Input
              id="address"
              label="Endereço"
              width={300}
              value={value}
              setValue={onChange}
              disabled={!isEditable}
            />
          )}
        />

        <Controller
          name="number"
          control={control}
          rules={{ required: 'O número de entrega é obrigatório.' }}
          render={({ field: { value, onChange } }) => (
            <Input
              id="number"
              label="Nr"
              width={70}
              value={value}
              setValue={onChange}
              disabled={!isEditable}
            />
          )}
        />

        <Controller
          name="district"
          control={control}
          rules={{ required: 'O bairro é obrigatório.' }}
          render={({ field: { value, onChange } }) => (
            <Input
              id="district"
              label="Bairro"
              width={185}
              value={value}
              setValue={onChange}
              disabled={!isEditable}
            />
          )}
        />

        <Controller
          name="city"
          control={control}
          rules={{ required: 'A cidade é obrigatória.' }}
          render={({ field: { value, onChange } }) => (
            <Input
              id="city"
              label="Cidade"
              width={150}
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
            handleFunction={handleSubmit(handleRegisterClient, () =>
              handleFormError(formState)
            )}
            loading={isLoadingButton}
          />

          <ButtonForm title="Cancelar" handleFunction={handleCancelEdit} />
        </PageContainer>
      ) : (
        <PageContainer>
          <ButtonForm title="Incluir" handleFunction={handleAddClient} />

          <ButtonForm
            title="Alterar"
            handleFunction={() => setIsEditable(true)}
          />

          <ButtonForm
            title="Excluir"
            handleFunction={handleAskDeleteClient}
            loading={isLoadingButton}
          />
        </PageContainer>
      )}

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
