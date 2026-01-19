import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Product } from '../services/products';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  weight: z.string().min(1, "Weight is required"),
  price: z.string().min(1, "Price is required").transform((val) => Number(val)),
});

type FormData = z.infer<typeof formSchema>;

interface ProductFormProps {
  initialData?: Product;
  onSubmit: (data: { name: string; weight: string; price: number }) => void;
  onCancel: () => void;
  isLoading?: boolean;
  open: boolean;
}

export function ProductForm({ initialData, onSubmit, onCancel, isLoading, open }: ProductFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || '',
      weight: initialData?.weight || '',
      price: initialData?.price || 0,
    }
  });

  const onFormSubmit = (data: FormData) => {
    onSubmit({
      name: data.name,
      weight: data.weight,
      price: Number(data.price)
    });
  };

  return (
    <Dialog open={open} onOpenChange={onCancel}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {initialData ? 'Edit Product' : 'Create Product'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">
              Name <span className="text-red-500">*</span>
            </label>
            <Input 
              {...register("name")}
              placeholder="Product name"
              className="rounded-lg"
            />
            {errors.name && (
              <span className="text-xs text-red-500">{errors.name.message}</span>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">
              Weight (Size) <span className="text-red-500">*</span>
            </label>
            <Input 
              {...register("weight")}
              placeholder="e.g., 5kg"
              className="rounded-lg"
            />
            {errors.weight && (
              <span className="text-xs text-red-500">{errors.weight.message}</span>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">
              Price <span className="text-red-500">*</span>
            </label>
            <Input 
              type="number"
              {...register("price")}
              min="0"
              className="rounded-lg"
            />
            {errors.price && (
              <span className="text-xs text-red-500">{errors.price.message}</span>
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
            <Button
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? 'Loading...' : initialData ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 