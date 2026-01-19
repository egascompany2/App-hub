/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { customersService } from '../services/customers';
import { formatDate } from '../utils/date';
import { EmptyState } from '../components/EmptyState';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useNavigate } from 'react-router-dom';
import SkeletonWrapper from '@/components/SkeletonWrapper';
import { CustomerForm } from '@/components/CustomerForm';
import { toast } from 'react-hot-toast';
import { ConfirmationModal } from '@/components/ConfirmationModal';
// import { FiUsers } from 'react-icons/fi';

export function Customers() {
  const [showForm, setShowForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<any>(null);
  const [customerToDelete, setCustomerToDelete] = useState<any>(null);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: customers, isLoading } = useQuery({
    queryKey: ['customers'],
    queryFn: customersService.getCustomers
  });

  const editMutation = useMutation({
    mutationFn: (data: any) => customersService.updateCustomer(editingCustomer.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      setShowForm(false);
      setEditingCustomer(null);
      toast.success('Customer updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (customerId: string) => customersService.deleteCustomer(customerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast.success('Customer deleted successfully');
      setCustomerToDelete(null);
    },
    onError: (error: any) => {
      toast.error(error.message);
    }
  });

  const handleEdit = (customer: any) => {
    setEditingCustomer({
      id: customer.id,
      firstName: customer.name.split(' ')[0] || '',
      lastName: customer.name.split(' ')[1] || '',
      tankSize: customer.tankSize,
      phoneNo: customer.phoneNo,
      address: customer.address
    });
    setShowForm(true);
  };

  const handleDelete = (customer: any) => {
    setCustomerToDelete(customer);
  };

  const confirmDelete = () => {
    if (customerToDelete) {
      deleteMutation.mutate(customerToDelete.id);
    }
  };

  if (!isLoading && !customers?.length) {
    return (
      <div className="p-6">
        <EmptyState
          // icon={<FiUsers className="w-12 h-12 text-gray-400" />}
          title="No customers yet"
          description="There are no customers in the system yet."
        />
      </div>
    );
  }

  return (
    <SkeletonWrapper isLoading={isLoading}>
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-[40px]">
        <h1 className="text-2xl font-semibold">Customers</h1>
      </div>

      <div className="bg-white rounded-lg shadow-sm">
        <table className="w-full">
          <thead className="border-b border-gray-200">
            <tr>
              <th className="w-4 p-4">
                <input type="checkbox" className="rounded" />
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">No</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Name</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Tank size</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Phone No</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Address</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Date Created</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {customers?.map((customer, index) => (
              <tr key={customer.id}>
                <td className="p-4">
                  <input type="checkbox" className="rounded" />
                </td>
                <td className="px-4 py-3 text-sm">{index + 1}</td>
                <td className="px-4 py-3 text-sm">{customer.name}</td>
                <td className="px-4 py-3 text-sm">{customer.tankSize}</td>
                <td className="px-4 py-3 text-sm">{customer.phoneNo}</td>
                <td className="px-4 py-3 text-sm">{customer.address}</td>
                <td className="px-4 py-3 text-sm">{formatDate(customer.dateCreated)}</td>
                <td className="px-4 py-3 text-sm">
                <div className="flex items-center gap-1">
                    <Button onClick={() => navigate(`/customers/${customer.id}`)} variant="link" className="p-0 h-5 hover:bg-gray-50">
                      <img src="/icons/eye.svg" alt="View order" />
                    </Button>
                    <Popover>
                      <PopoverTrigger>
                        <Button variant="link" className="p-0 h-5 hover:bg-gray-50">
                          <img src="/icons/more.svg" alt="Edit order" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="p-3 flex flex-col gap-2 w-fit">
                      <span 
                        onClick={() => handleEdit(customer)} 
                        className="text-sm cursor-pointer text-primary"
                      >
                        Edit
                      </span>
                       <span 
                        onClick={() => handleDelete(customer)}
                        className="text-sm cursor-pointer text-red-600"
                      >
                        Delete
                      </span>
                      </PopoverContent>
                    </Popover>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <CustomerForm
          open={showForm}
          initialData={editingCustomer}
          onSubmit={(data) => editMutation.mutate(data)}
          onCancel={() => {
            setShowForm(false);
            setEditingCustomer(null);
          }}
          isLoading={editMutation.isPending}
        />
      )}

      {customerToDelete && (
        <ConfirmationModal
          isOpen={!!customerToDelete}
          title="Delete Customer"
          description={`Are you sure you want to delete ${customerToDelete.name}? This action cannot be undone.`}
          confirmText="Delete"
          variant="destructive"
          onConfirm={confirmDelete}
          onClose={() => setCustomerToDelete(null)}
        />
      )}
    </div>
    </SkeletonWrapper>
  );
}
