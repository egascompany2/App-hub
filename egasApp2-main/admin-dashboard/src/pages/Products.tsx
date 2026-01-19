/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ProductForm } from '../components/ProductForm';
import { productsService, Product } from '../services/products';
import { formatDate } from '../utils/date';
import { toast } from 'react-hot-toast';
import SkeletonWrapper from '@/components/SkeletonWrapper';

export function Products() {
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const queryClient = useQueryClient();

  const { data: products, isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: productsService.getProducts
  });

  const createMutation = useMutation({
    mutationFn: productsService.createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setShowForm(false);
      toast.success('Product created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || error.message);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Product> }) => 
      productsService.updateProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setEditingProduct(null);
      toast.success('Product updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update product');
    }
  });

  const handleCreateProduct = (data: { name: string; weight: string; price: number }) => {
    createMutation.mutate(data);
  };

  const handleEditProduct = (data: { name: string; weight: string; price: number }) => {
    if (!editingProduct) return;
    updateMutation.mutate({ 
      id: editingProduct.id, 
      data 
    });
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setShowForm(true);
  };


  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-[40px]">
        <h1 className="text-2xl font-semibold">Products</h1>
        <button 
          onClick={() => setShowForm(true)}
          className="bg-primary text-white px-4 py-2 rounded-lg text-sm"
        >
          Create Product
        </button>
      </div>
    
      <SkeletonWrapper isLoading={isLoading}>
        <div className="bg-white rounded-lg shadow-sm">
          <table className="w-full">
            <thead className="border-b border-gray-200">
            <tr>
              <th className="w-4 p-4">
                <input type="checkbox" className="rounded" />
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Product</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Weight</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Price</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Date created</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Status</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {products?.map((product) => (
              <tr key={product.id}>
                <td className="p-4">
                  <input type="checkbox" className="rounded" />
                </td>
                <td className="px-4 py-3 text-sm">{product.name}</td>
                <td className="px-4 py-3 text-sm">{product.weight}</td>
                <td className="px-4 py-3 text-sm">{product.price}</td>
                <td className="px-4 py-3 text-sm">{formatDate(product.dateCreated)}</td>
                <td className="px-4 py-3 text-sm">
                  <span className="text-primary text-sm">
                    {product.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm">
                  <button 
                    onClick={() => handleEdit(product)}
                    className="text-primary hover:text-blue-800"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      </SkeletonWrapper>
      <ProductForm
        open={showForm || !!editingProduct}
        initialData={editingProduct || undefined}
        onSubmit={editingProduct ? handleEditProduct : handleCreateProduct}
        onCancel={() => {
          console.log('Cancel clicked');
          setShowForm(false);
          setEditingProduct(null);
        }}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
}