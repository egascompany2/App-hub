import { useParams } from 'react-router-dom';
import { OrderDetails } from '../components/OrderDetails';

export function OrderDetailsPage() {
  const { id } = useParams<{ id: string }>();

  if (!id) {
    return <div>Order not found</div>;
  }

  return <OrderDetails orderId={id} />;
} 