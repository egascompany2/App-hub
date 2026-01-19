import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { driversService } from "../services/drivers";
import { Button } from "./ui/button";
import { Driver } from "@/types/driver";

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  phoneNumber: string;
  address: string;
}

interface Props {
  onClose: () => void;
  onSuccess: () => void;
  driverToEdit?: Driver | null;
}

export function AddDriverModal({ onClose, onSuccess, driverToEdit }: Props) {
  const queryClient = useQueryClient();
  const formSchema = z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Invalid email address"),
    password: driverToEdit 
      ? z.string().min(8, "Password must be at least 8 characters").optional()
      : z.string().min(8, "Password must be at least 8 characters"),
    phoneNumber: z.string().min(10, "Invalid phone number"),
    address: z.string().min(1, "Address is required"),
  });

  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: driverToEdit ? {
      firstName: driverToEdit.name.split(' ')[0] || '',
      lastName: driverToEdit.name.split(' ')[1] || '',
      email: driverToEdit.email || '',
      phoneNumber: driverToEdit.phoneNo || '',
      address: driverToEdit.address || '',
    } : undefined
  });

  const addDriverMutation = useMutation({
    mutationFn: driversService.addDriver,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
      reset();
      onSuccess();
    }
  });

  const updateDriverMutation = useMutation({
    mutationFn: (data: FormData) => 
      driversService.updateDriver(driverToEdit!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
      reset();
      onSuccess();
    }
  });

  const onSubmit = (data: FormData) => {
    if (driverToEdit) {
      updateDriverMutation.mutate(data);
    } else {
      addDriverMutation.mutate(data as Required<FormData>);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-[800px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-normal">
            {driverToEdit ? 'Edit' : 'Add'} Delivery Personnel
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm">First Name</label>
              <input
                {...register("firstName")}
                className="w-full border rounded-lg px-3 py-2 mt-1"
              />
              {errors.firstName && (
                <span className="text-red-500 text-sm">{errors.firstName.message}</span>
              )}
            </div>

            <div>
              <label className="text-sm">Last Name</label>
              <input
                {...register("lastName")}
                className="w-full border rounded-lg px-3 py-2 mt-1"
              />
              {errors.lastName && (
                <span className="text-red-500 text-sm">{errors.lastName.message}</span>
              )}
            </div>

            <div>
              <label className="text-sm">Email</label>
              <input
                type="email"
                {...register("email")}
                className="w-full border rounded-lg px-3 py-2 mt-1"
              />
              {errors.email && (
                <span className="text-red-500 text-sm">{errors.email.message}</span>
              )}
            </div>

            <div>
              <label className="text-sm">Phone Number</label>
              <input
                {...register("phoneNumber")}
                className="w-full border rounded-lg px-3 py-2 mt-1"
              />
              {errors.phoneNumber && (
                <span className="text-red-500 text-sm">{errors.phoneNumber.message}</span>
              )}
            </div>

            {!driverToEdit && (
              <div>
                <label className="text-sm">Password</label>
                <input
                  type="password"
                  {...register("password")}
                  className="w-full border rounded-lg px-3 py-2 mt-1"
                />
                {errors.password && (
                  <span className="text-red-500 text-sm">{errors.password.message}</span>
                )}
              </div>
            )}

            <div>
              <label className="text-sm">Address</label>
              <input
                {...register("address")}
                className="w-full border rounded-lg px-3 py-2 mt-1"
              />
              {errors.address && (
                <span className="text-red-500 text-sm">{errors.address.message}</span>
              )}
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <Button 
              type="submit" 
              className="rounded-lg bg-black text-white px-6 py-3"
              disabled={addDriverMutation.isPending}
            >
              {driverToEdit ? 'Update' : 'Add'} Delivery Personnel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 