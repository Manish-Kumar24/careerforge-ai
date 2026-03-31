// D:\Project\ai-interview-tracker\apps\frontend\app\page.tsx

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-black px-6">

      <h1 className="text-4xl md:text-5xl font-bold text-center">
        AI Interview Tracker
      </h1>

      <p className="mt-4 text-gray-600 dark:text-gray-400 text-center max-w-xl">
        Track your interview preparation, practice DSA, and get AI-powered answers — all in one place.
      </p>

      <div className="mt-6 flex gap-4">
        <a
          href="/login"
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Get Started
        </a>

        <a
          href="/dashboard"
          className="px-6 py-2 border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          Dashboard
        </a>
      </div>

    </div>
  );
}