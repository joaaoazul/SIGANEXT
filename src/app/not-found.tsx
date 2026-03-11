import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-8xl font-bold text-emerald-500 mb-4">404</div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Página não encontrada</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8">
          A página que procuras não existe ou foi movida.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/dashboard"
            className="btn-primary justify-center"
          >
            Ir para o Dashboard
          </Link>
          <Link
            href="/login"
            className="btn-secondary justify-center"
          >
            Página de Login
          </Link>
        </div>
      </div>
    </div>
  );
}
