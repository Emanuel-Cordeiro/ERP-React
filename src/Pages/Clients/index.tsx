import { useEffect, useRef, useState } from 'react';

import { Button } from '@mui/material';
import { DataGrid, GridColDef, GridRowParams } from '@mui/x-data-grid';

import api from '../../Services/api';
import Input from '../../Components/TextField';

interface GeneralProps {
  name: string;
  address: string;
  number: string;
  district: string;
  city: string;
  phone: string;
}

interface ClientProps extends GeneralProps {
  client_id: number;
}

interface GridProps extends GeneralProps {
  id: number;
}

export default function Clients() {
  const [clientId, setClientId] = useState(0);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [number, setNumber] = useState('');
  const [district, setDistrict] = useState('');
  const [city, setCity] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  const [isEditable, setIsEditable] = useState(false);

  const [dataGridRows, setDataGridRows] = useState<GridProps[]>([]);

  const dataGridColumns: GridColDef<(typeof dataGridRows)[number]>[] = [
    { field: 'id', headerName: 'Código', width: 70 },
    { field: 'name', headerName: 'Nome', width: 300 },
    { field: 'phoneNumber', headerName: 'Telefone', width: 130 },
    { field: 'address', headerName: 'Endereço', width: 200 },
    { field: 'number', headerName: 'Nr', width: 70 },
    { field: 'district', headerName: 'Bairro', width: 150 },
    { field: 'city', headerName: 'Cidade', width: 150 },
  ];

  async function loadClients() {
    const { data } = await api.get('Cliente');

    const rows = data.map((dataObject: ClientProps) => ({
      id: dataObject.client_id,
      name: dataObject.name,
      number: dataObject.number,
      address: dataObject.address,
      district: dataObject.district,
      city: dataObject.city,
      phoneNumber: dataObject.phone,
    }));

    setDataGridRows(rows);
  }

  async function handleRegisterClient() {
    const newClient = {
      name,
      address,
      number,
      district,
      city,
      phone: phoneNumber,
    };

    const res = await api.post('Cliente', newClient);

    console.log(res);

    setDataGridRows((prev) => [
      ...prev,
      { ...newClient, id: Number(clientId) },
    ]);
  }

  async function handleDeleteClient(id: number) {
    const res = await api.delete(`Cliente/${id}`);

    if (res.status === 201) {
      const updatedList = dataGridRows.filter((item) => item.id !== id);

      setDataGridRows(updatedList);
    }
  }

  const didFetch = useRef(false);

  useEffect(() => {
    if (!didFetch.current) {
      loadClients();
      didFetch.current = true;
    }
  }, []);

  function handleRowClick(params: GridRowParams) {
    setClientId(params.row.id);
    setName(params.row.name);
    setAddress(params.row.address);
    setNumber(params.row.number);
    setDistrict(params.row.district);
    setCity(params.row.city);
    setPhoneNumber(params.row.phoneNumber);
  }

  return (
    <>
      <h1 style={{ marginLeft: '250px', color: 'black' }}>Clientes</h1>

      <div
        style={{
          marginLeft: '250px',
          display: 'flex',
          flex: 1,
        }}
      >
        <Input
          id="cliendId"
          label="Código"
          width={100}
          value={clientId}
          setValue={setClientId}
          disabled
        />
        <Input
          id="clientName"
          label="Nome"
          width={500}
          value={name}
          setValue={setName}
          disabled={!isEditable}
        />
        <Input
          id="phoneNumber"
          label="Telefone"
          width={150}
          value={phoneNumber}
          setValue={setPhoneNumber}
          disabled={!isEditable}
        />
      </div>
      <div
        style={{
          marginLeft: '250px',
          display: 'flex',
          flex: 1,
        }}
      >
        <Input
          id="addressId"
          label="Endereço"
          width={500}
          value={address}
          setValue={setAddress}
          disabled={!isEditable}
        />
        <Input
          id="addressNumber"
          label="Nr"
          width={70}
          value={number}
          setValue={setNumber}
          disabled={!isEditable}
        />
        <Input
          id="district"
          label="Bairro"
          width={250}
          value={district}
          setValue={setDistrict}
          disabled={!isEditable}
        />
        <Input
          id="city"
          label="Cidade"
          width={250}
          value={city}
          setValue={setCity}
          disabled={!isEditable}
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
          <Button
            onClick={handleRegisterClient}
            sx={{ marginRight: 2 }}
            variant="contained"
          >
            Gravar
          </Button>

          <Button
            onClick={() => setIsEditable(false)}
            sx={{ marginRight: 2 }}
            variant="contained"
          >
            Cancelar
          </Button>
        </div>
      ) : (
        <div
          style={{
            marginLeft: '250px',
            display: 'flex',
            flex: 1,
          }}
        >
          <Button
            onClick={handleRegisterClient}
            sx={{ marginRight: 2 }}
            variant="contained"
          >
            Incluir
          </Button>

          <Button
            onClick={() => setIsEditable(true)}
            sx={{ marginRight: 2 }}
            variant="contained"
          >
            Alterar
          </Button>

          <Button
            onClick={() => handleDeleteClient(clientId)}
            sx={{ marginRight: 2 }}
            variant="contained"
          >
            Excluir
          </Button>
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
        />
      </div>
    </>
  );
}
