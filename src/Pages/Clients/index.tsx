import { useCallback, useEffect, useRef, useState } from 'react';

import { Controller, useForm } from 'react-hook-form';

import { DataGrid, GridColDef, GridRowParams } from '@mui/x-data-grid';
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

import api from '../../Services/api';
import Input from '../../Components/TextField';
import ButtonForm from '../../Components/ButtonForm';

interface GeneralProps {
  name: string;
  address: string;
  number: string;
  district: string;
  city: string;
  phone: string;
}

interface ClientProps extends GeneralProps {
  client_id?: number;
}

interface GridProps extends GeneralProps {
  id: number;
}

const formDefault = {
  client_id: 0,
  name: '',
  address: '',
  number: '',
  district: '',
  city: '',
  phone: '',
};

export default function Clients() {
  const [isEditable, setIsEditable] = useState(false);
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [shouldDeleteClient, setShouldDeleteClient] = useState(false);
  const [snackBarErrorMessage, setSnackBarErrorMessage] = useState('');
  const [dataGridRows, setDataGridRows] = useState<GridProps[]>([]);
  const didFetch = useRef(false);

  const { handleSubmit, control, reset, getValues, formState } =
    useForm<ClientProps>({});

  const dataGridColumns: GridColDef<(typeof dataGridRows)[number]>[] = [
    { field: 'id', headerName: 'Código', width: 70 },
    { field: 'name', headerName: 'Nome', width: 300 },
    { field: 'phone', headerName: 'Telefone', width: 130 },
    { field: 'address', headerName: 'Endereço', width: 200 },
    { field: 'number', headerName: 'Nr', width: 70 },
    { field: 'district', headerName: 'Bairro', width: 150 },
    { field: 'city', headerName: 'Cidade', width: 150 },
  ];

  const loadClients = useCallback(async () => {
    try {
      const { data } = await api.get('Cliente');

      const rows = data.map((client: ClientProps) => ({
        id: client.client_id,
        name: client.name,
        number: client.number,
        address: client.address,
        district: client.district,
        city: client.city,
        phone: client.phone,
      }));

      setDataGridRows(rows);

      reset({ ...rows[0], client_id: rows[0].id });
    } catch (error) {
      showErrorMessage(String(error));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleRegisterClient() {
    try {
      const formData = { ...getValues() };

      if (isNewRecord) delete formData.client_id;

      const { status } = await api.post('Cliente', formData);
      if (status === 201) {
        loadClients();
        setIsEditable(false);
        setIsNewRecord(false);
      }
    } catch (error) {
      showErrorMessage(error);
    }
  }

  async function handleDeleteClient() {
    const id = getValues('client_id');

    try {
      const res = await api.delete(`Cliente/${id}`);

      if (res.status === 201) {
        const updatedList = dataGridRows.filter((item) => item.id !== id);

        setDataGridRows(updatedList);

        const selectedClientIndex = dataGridRows.findIndex(
          (client) => client.id === getValues('client_id')
        );

        reset({
          ...updatedList[selectedClientIndex - 1],
          client_id: updatedList[selectedClientIndex - 1].id,
        });
      }

      setShouldDeleteClient(false);
    } catch (error) {
      showErrorMessage(error);
    }
  }

  function handleAddClient() {
    reset(formDefault);

    setIsNewRecord(true);
    setIsEditable(true);
  }

  function handleCancelEdit() {
    const selectedClientIndex = dataGridRows.findIndex(
      (client) => client.id === getValues('client_id')
    );

    reset({
      ...dataGridRows[selectedClientIndex],
      client_id: dataGridRows[selectedClientIndex].id,
    });

    setIsEditable(false);
  }

  function handleRowClick(params: GridRowParams) {
    const selectedClient = dataGridRows.find(
      (client) => client.id === params.row.id
    );

    reset({ ...selectedClient, client_id: selectedClient!.id });
  }

  function showErrorMessage(error: unknown) {
    setSnackBarErrorMessage(String(error));

    setTimeout(() => setSnackBarErrorMessage(''), 5000);
  }

  function handleFormError() {
    const error = Object.values(formState.errors)[0];

    showErrorMessage(String(error.message));
  }

  useEffect(() => {
    if (!didFetch.current) {
      loadClients();
      didFetch.current = true;
    }
  }, [loadClients]);

  return (
    <>
      <h1 style={{ marginLeft: '250px', color: 'var(--font)' }}>Clientes</h1>

      <div
        style={{
          marginLeft: '250px',
          display: 'flex',
          flex: 1,
        }}
      >
        <Controller
          name="client_id"
          control={control}
          render={({ field: { value, onChange } }) => (
            <Input
              id="client_id"
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
              width={500}
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
      </div>
      <div
        style={{
          marginLeft: '250px',
          display: 'flex',
          flex: 1,
        }}
      >
        <Controller
          name="address"
          control={control}
          rules={{ required: 'O endereço é obrigatório.' }}
          render={({ field: { value, onChange } }) => (
            <Input
              id="address"
              label="Endereço"
              width={500}
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
              width={250}
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
              width={250}
              value={value}
              setValue={onChange}
              disabled={!isEditable}
            />
          )}
        />
      </div>

      {isEditable ? (
        <div
          style={{
            marginLeft: '250px',
            display: 'flex',
            flex: 1,
          }}
        >
          <ButtonForm
            title="Gravar"
            handleFunction={handleSubmit(handleRegisterClient, handleFormError)}
          />

          <ButtonForm title="Cancelar" handleFunction={handleCancelEdit} />
        </div>
      ) : (
        <div
          style={{
            marginLeft: '250px',
            display: 'flex',
            flex: 1,
          }}
        >
          <ButtonForm title="Incluir" handleFunction={handleAddClient} />

          <ButtonForm
            title="Alterar"
            handleFunction={() => setIsEditable(true)}
          />

          <ButtonForm
            title="Excluir"
            handleFunction={() => setShouldDeleteClient(true)}
          />
        </div>
      )}

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

        <Dialog open={shouldDeleteClient}>
          <DialogTitle>Cadastro de Clientes</DialogTitle>
          <DialogContent>
            <DialogContentText>Excluir esse cliente?</DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShouldDeleteClient(false)}>Não</Button>
            <Button onClick={handleDeleteClient} autoFocus>
              Excluir
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </>
  );
}
