import swaggerJSDoc from 'swagger-jsdoc';

const swaggerDefinition = {
    openapi: '3.0.0',
    info: {
        title: 'API de Gestión de Ingresos y Egresos',
        version: '1.0.0',
        description: 'API para la gestión de transacciones financieras (ingresos y egresos) con autenticación y control de acceso basado en roles.',
    },
    servers: [
        {
            url: 'http://localhost:3000',
            description: 'Servidor de desarrollo',
        },
        {
            url: 'https://tu-app.vercel.app',
            description: 'Servidor de producción',
        },
    ],
    components: {
        securitySchemes: {
            cookieAuth: {
                type: 'apiKey',
                in: 'cookie',
                name: 'better-auth.session_token',
                description: 'Cookie de sesión de Better Auth',
            },
        },
        schemas: {
            Transaction: {
                type: 'object',
                properties: {
                    id: {
                        type: 'string',
                        description: 'ID único de la transacción',
                    },
                    description: {
                        type: 'string',
                        description: 'Descripción de la transacción',
                        maxLength: 500,
                    },
                    amount: {
                        type: 'integer',
                        description: 'Monto de la transacción (en pesos colombianos)',
                        minimum: 1,
                    },
                    type: {
                        type: 'string',
                        enum: ['INGRESO', 'EGRESO'],
                        description: 'Tipo de transacción',
                    },
                    date: {
                        type: 'string',
                        format: 'date-time',
                        description: 'Fecha de la transacción',
                    },
                    userId: {
                        type: 'string',
                        description: 'ID del usuario que creó la transacción',
                    },
                    createdAt: {
                        type: 'string',
                        format: 'date-time',
                        description: 'Fecha de creación del registro',
                    },
                    updatedAt: {
                        type: 'string',
                        format: 'date-time',
                        description: 'Fecha de última actualización',
                    },
                },
            },
            User: {
                type: 'object',
                properties: {
                    id: {
                        type: 'string',
                        description: 'ID único del usuario',
                    },
                    name: {
                        type: 'string',
                        description: 'Nombre del usuario',
                        minLength: 2,
                        maxLength: 100,
                    },
                    email: {
                        type: 'string',
                        format: 'email',
                        description: 'Email del usuario',
                    },
                    phone: {
                        type: 'string',
                        nullable: true,
                        description: 'Teléfono del usuario',
                        pattern: '^[\\d\\s\\-\\+\\(\\)]{7,20}$',
                    },
                    role: {
                        type: 'string',
                        enum: ['USER', 'ADMIN'],
                        description: 'Rol del usuario',
                    },
                    image: {
                        type: 'string',
                        nullable: true,
                        description: 'URL de la imagen de perfil',
                    },
                    createdAt: {
                        type: 'string',
                        format: 'date-time',
                        description: 'Fecha de creación del usuario',
                    },
                    _count: {
                        type: 'object',
                        properties: {
                            transactions: {
                                type: 'integer',
                                description: 'Número de transacciones del usuario',
                            },
                        },
                    },
                },
            },
            ReportSummary: {
                type: 'object',
                properties: {
                    totalIngresos: {
                        type: 'integer',
                        description: 'Total de ingresos',
                    },
                    totalEgresos: {
                        type: 'integer',
                        description: 'Total de egresos',
                    },
                    saldoActual: {
                        type: 'integer',
                        description: 'Saldo actual (ingresos - egresos)',
                    },
                    porMes: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                mes: {
                                    type: 'string',
                                    description: 'Mes en formato YYYY-MM',
                                },
                                ingresos: {
                                    type: 'integer',
                                    description: 'Total de ingresos del mes',
                                },
                                egresos: {
                                    type: 'integer',
                                    description: 'Total de egresos del mes',
                                },
                            },
                        },
                    },
                },
            },
            Error: {
                type: 'object',
                properties: {
                    error: {
                        type: 'string',
                        description: 'Mensaje de error',
                    },
                },
            },
        },
    },
    security: [
        {
            cookieAuth: [],
        },
    ],
};

const options = {
    swaggerDefinition,
    apis: ['./pages/api/**/*.ts'],
};

export const swaggerSpec = swaggerJSDoc(options);
