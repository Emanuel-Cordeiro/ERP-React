import { Controller, useForm } from 'react-hook-form';
import Input from '../../Components/TextField';
import { useState } from 'react';
import { Switch } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { ItensDataGrid } from '../../Components/ItensDataGrid';
import api from '../../Services/api';

interface IOrdemItemProps {
  order_item_order: number;
  product_id: number;
  quantity: number;
  price: number;
  observation: string;
}

interface IOrderProps {
  order_id: string;
  client: string;
  delivery_date: string;
  observation: string;
  paid: boolean;
  itens: Array<IOrdemItemProps>;
}

export default function Orders() {
  const form = useForm<IOrderProps>({});
  const { control, getValues, reset, handleSubmit, formState } = form;
  const [isEditable, setIsEditable] = useState(false);
  const [dataGridRows, setDataGridRows] = useState<IOrderProps[]>([]);

  const dataGridColumns: GridColDef<(typeof dataGridRows)[number]>[] = [
    { field: 'id', headerName: 'Código', width: 70 },
    { field: 'description', headerName: 'Descrição', width: 300 },
    { field: 'cost', headerName: 'Custo', width: 100, editable: true },
  ];

  async function loadOrders() {
    const { data } = await api.get('Receita');

    const rows = data.map((item: IOrderProps) => ({
      id: item.order_id,
      description: item.description,
      cost: item.cost,
    }));

    setDataGridRows(rows);

    reset(rows[0]);
  }
  return (
    <>
      <h1 style={{ marginLeft: '250px', color: 'var(--font)' }}>Pedidos</h1>

      <div
        style={{
          marginLeft: '250px',
          display: 'flex',
          flex: 1,
        }}
      >
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
          name="client"
          control={control}
          render={({ field: { value, onChange } }) => (
            <Input
              id="client"
              label="Cliente"
              width={500}
              value={value}
              setValue={onChange}
              disabled={!isEditable}
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
              <Switch checked={value} onClick={onChange} />
              <h5 style={{ color: 'var(--font)' }}>Pedido Pago</h5>
            </div>
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
      </div>

      <div
        style={{
          marginLeft: '250px',
          display: 'flex',
          flex: 1,
          marginTop: '20px',
        }}
      >
        {isEditable ? (
          <ItensDataGrid />
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
            // onRowClick={handleRowClick}
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
      </div>
    </>
  );
}
