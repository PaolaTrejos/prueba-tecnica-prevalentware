import dynamic from 'next/dynamic';
import 'swagger-ui-react/swagger-ui.css';

const SwaggerUI = dynamic(() => import('swagger-ui-react'), { ssr: false });

export default function ApiDocsPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto py-6 px-4">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">Documentación de la API</h1>
                    <p className="mt-2 text-gray-600">
                        Especificación OpenAPI 3.0 para la API de Gestión de Ingresos y Egresos
                    </p>
                </div>
                <div className="bg-white rounded-lg shadow">
                    <SwaggerUI url="/api/docs" />
                </div>
            </div>
        </div>
    );
}
