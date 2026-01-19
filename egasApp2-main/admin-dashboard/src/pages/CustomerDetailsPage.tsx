import { CustomerDetails } from '@/components/CustomerDetails';
import { useParams } from 'react-router-dom';

export function CustomerDetailsPage() {
  const { id } = useParams();

  if (!id) {
    return <div>Customer not found</div>;
  }

  return <CustomerDetails userId={id} />;
}
