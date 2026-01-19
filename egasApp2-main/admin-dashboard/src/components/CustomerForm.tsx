import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useQuery } from "@tanstack/react-query";
import { productsService } from "@/services/products";

const formSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  tankSize: z.string().min(1, "Tank size is required"),
  phoneNo: z.string().min(1, "Phone number is required"),
  address: z.string().min(1, "Address is required"),
});

type FormData = z.infer<typeof formSchema>;

interface CustomerFormProps {
  initialData?: {
    firstName: string;
    lastName: string;
    tankSize: string;
    phoneNo: string;
    address: string;
  };
  onSubmit: (data: FormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
  open: boolean;
}

export function CustomerForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading,
  open,
}: CustomerFormProps) {


  const { data: products, isLoading: isLoadingProducts } = useQuery({
    queryKey: ["products"],
    queryFn: productsService.getProducts,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: initialData?.firstName || "",
      lastName: initialData?.lastName || "",
      tankSize: initialData?.tankSize || "",
      phoneNo: initialData?.phoneNo || "",
      address: initialData?.address || "",
    },
  });

  return (
    <Dialog open={open} onOpenChange={onCancel}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Edit Customer" : "Add Customer"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">
              First Name <span className="text-red-500">*</span>
            </label>
            <Input
              {...register("firstName")}
              placeholder="First name"
              className="rounded-lg"
            />
            {errors.firstName && (
              <span className="text-xs text-red-500">
                {errors.firstName.message}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">
              Last Name <span className="text-red-500">*</span>
            </label>
            <Input
              {...register("lastName")}
              placeholder="Last name"
              className="rounded-lg"
            />
            {errors.lastName && (
              <span className="text-xs text-red-500">
                {errors.lastName.message}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">
              Tank Size <span className="text-red-500">*</span>
            </label>
            <select
              disabled={isLoadingProducts}
              {...register("tankSize")}
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value={initialData?.tankSize}>{initialData?.tankSize}</option>
              {products?.map((size) => (
                <option key={size.id} value={size.weight}>
                  {size.weight}
                </option>
              ))}
            </select>
            {errors.tankSize && (
              <span className="text-xs text-red-500">
                {errors.tankSize.message}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <Input
              {...register("phoneNo")}
              placeholder="Phone number"
              className="rounded-lg"
            />
            {errors.phoneNo && (
              <span className="text-xs text-red-500">
                {errors.phoneNo.message}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">
              Address <span className="text-red-500">*</span>
            </label>
            <Input
              disabled={true}
              {...register("address")}
              placeholder="Address"
              className="rounded-lg"
            />
            {errors.address && (
              <span className="text-xs text-red-500">
                {errors.address.message}
              </span>
            )}
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Loading..." : initialData ? "Update" : "Add"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
