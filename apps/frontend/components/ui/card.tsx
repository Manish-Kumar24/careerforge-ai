// filepath: components/ui/card.tsx

export function Card({ children }) {
  return (
    <div className="border rounded-xl p-4 shadow">
      {children}
    </div>
  );
}