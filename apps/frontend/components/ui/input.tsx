// apps\frontend\components\ui\input.tsx

export function Input({ className = "", ...props }) {
  return (
    <input
      className={`w-full px-3 py-2 rounded-lg border 
      border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 
      dark:bg-gray-900 dark:border-gray-700 dark:text-white 
      ${className}`}
      {...props}
    />
  );
}