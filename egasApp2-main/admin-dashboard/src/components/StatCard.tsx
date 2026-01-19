interface StatCardProps {
  title: string;
  value: string | number;
}

export function StatCard({ title, value }: StatCardProps) {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <h3 className="text-sm text-gray-600 mb-2">{title}</h3>
      <p className="text-3xl font-semibold">{value}</p>
    </div>
  );
}