import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { driversService } from '../services/drivers';
import { format } from 'date-fns';
import { Button } from '../components/ui/button';
import { Checkbox } from '../components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';
import { useState } from 'react';
import { AddDriverModal } from '@/components/AddDriverModal';
import { EmptyState } from '@/components/EmptyState';
import SkeletonWrapper from '@/components/SkeletonWrapper';
import { Driver } from '@/types/driver';
// import { AddDriverModal } from '../components /AddDriverModal';

export function DeliveryPersonnel() {
  const [selectedDrivers, setSelectedDrivers] = useState<string[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [driverToEdit, setDriverToEdit] = useState<Driver | null>(null);
  const queryClient = useQueryClient();

  const { data: drivers, isLoading } = useQuery({
    queryKey: ['drivers'],
    queryFn: driversService.getDrivers
  });

  const deleteMutation = useMutation({
    mutationFn: driversService.deleteDriver,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
    }
  });

  const handleSelectDriver = (driverId: string) => {
    setSelectedDrivers(prev => 
      prev.includes(driverId) 
        ? prev.filter(id => id !== driverId)
        : [...prev, driverId]
    );
  };

  const handleEdit = (driver: Driver) => {
    setDriverToEdit(driver);
    setShowAddModal(true);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-semibold">Delivery Personnel</h1>
        <Button onClick={() => setShowAddModal(true)} className="bg-black text-white">
          Add Delivery Personnel
        </Button>
      </div>
      <SkeletonWrapper isLoading={isLoading}>
      <div className="bg-white rounded-lg">
        <table className="w-full">
          <thead className="bg-[#EDEDED]">
            <tr>
              <th className="p-4 text-left">
                <Checkbox />
              </th>
              <th className="p-4 text-left text-[12px]">No</th>
              <th className="p-4 text-left text-[12px]">Name</th>
              <th className="p-4 text-left text-[12px]">Phone No</th>
              <th className="p-4 text-left text-[12px]">Address</th>
              <th className="p-4 text-left text-[12px]">Date Created</th>
              <th className="p-4 text-left text-[12px]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {drivers && drivers.length === 0 && <EmptyState title="No drivers found" />}
            {drivers && drivers.length > 0 && drivers.map((driver) => (
              <tr key={driver.id}>
                <td className="p-4">
                  <Checkbox 
                    checked={selectedDrivers.includes(driver.id)}
                    onCheckedChange={() => handleSelectDriver(driver.id)}
                  />
                </td>
                <td className="p-4">{driver.no}</td>
                <td className="p-4">{driver.name}</td>
                <td className="p-4">{driver.phoneNo}</td>
                <td className="p-4">{driver.address}</td>
                <td className="p-4">{format(new Date(driver.dateCreated), 'MM/dd/yyyy')}</td>
                <td className="p-4">
                  <div className="flex items-center gap-1">
                    {/* <Button onClick={() => navigate(`/driver/${driver.id}`)} variant="link" className="p-0 h-5 hover:bg-gray-50">
                      <img src="/icons/eye.svg" alt="View order" />
                    </Button> */}
                  <Popover>
                    <PopoverTrigger>
                      <img src="/icons/more.svg" alt="More options" />
                    </PopoverTrigger>
                    <PopoverContent className="p-2 bg-white w-[100px]">
                      <button 
                        onClick={() => deleteMutation.mutate(driver.id)}
                        className="text-sm text-red-600 w-full text-left px-2 py-1 hover:bg-gray-50 rounded"
                      >
                        Delete
                      </button>
                      <button 
                        onClick={() => handleEdit(driver)}
                        className="text-sm text-black w-full text-left px-2 py-1 hover:bg-gray-50 rounded"
                      >
                        Edit
                      </button> 
                    </PopoverContent>
                  </Popover>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      </SkeletonWrapper>
      {showAddModal && (
        <AddDriverModal 
          onClose={() => {
            setShowAddModal(false);
            setDriverToEdit(null);
          }}
          onSuccess={() => {
            setShowAddModal(false);
            setDriverToEdit(null);
            queryClient.invalidateQueries({ queryKey: ['drivers'] });
          }}
          driverToEdit={driverToEdit || undefined}
        />
      )}
    </div>
  );
}