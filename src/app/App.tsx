import { QueryProvider } from './providers/QueryProvider';
import { HomePage } from '@/pages';

/**
 * Корневой компонент приложения.
 *
 * @returns {JSX.Element} дерево провайдеров и страниц
 */
export function App() {
  return (
    <QueryProvider>
      <HomePage />
    </QueryProvider>
  );
}
