export function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-NG', {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric'
  });
} 