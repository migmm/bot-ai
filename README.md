# Sistema de Gestión para Restaurante de Sushi

Este proyecto es un sistema de gestión para un restaurante de sushi, diseñado para manejar diversas funcionalidades como la gestión de menús, promociones, horarios, feriados, pedidos, y un chatbot para interactuar con los clientes. El sistema está construido utilizando Node.js, Express, y MongoDB como base de datos.

<img align="center" src="assets/logo.png" alt="Logo"/>

## Estructura del Proyecto

El proyecto está organizado en diferentes carpetas y archivos para mantener un código limpio y modular. A continuación, se describe la estructura principal:

## Funcionalidades Principales

### 1. **Gestión de Información del Negocio**

-   **Obtener información del negocio**: `GET /api/business-info`
-   **Actualizar información del negocio**: `PUT /api/business-info/:id`

### 2. **Gestión de Menú**

-   **Obtener el menú**: `GET /api/menu`
-   **Agregar un ítem al menú**: `POST /api/menu`

### 3. **Gestión de Promociones**

-   **Obtener promociones**: `GET /api/promos`
-   **Agregar una promoción**: `POST /api/promos`

### 4. **Gestión de Horarios**

-   **Obtener horarios**: `GET /api/schedule`
-   **Agregar un horario**: `POST /api/schedule/:id`
-   **Actualizar horarios**: `PUT /api/schedule/:id`

### 5. **Gestión de Feriados**

-   **Obtener feriados**: `GET /api/holidays`
-   **Agregar un feriado**: `POST /api/holidays`

### 6. **Gestión de Pedidos**

-   **Crear un pedido**: `POST /api/orders`
-   **Obtener un pedido por ID de cliente**: `GET /api/orders/:customerId`
-   **Actualizar el estado de un pedido**: `PUT /api/orders/:id`
-   **Obtener todas las órdenes**: `GET /api/orders`

### 7. **Chatbot**

-   **Enviar un mensaje al chatbot**: `POST /api/chat`
-   **Obtener el historial de chat**: `GET /api/chat/:customerId`

## Ejecutar el proyecto de forma local

1. **Clonar el Repositorio**

Primero, clona el repositorio desde GitHub (o desde donde tengas alojado el proyecto) usando el siguiente comando:

```bash
git clone https://github.com/migmm/bot-ai.git
```

Reemplaza https://github.com/migmm/bot-ai.git con la URL de tu repositorio. 

2. **Instalar Dependencias**

Navega a la carpeta del proyecto y ejecuta el siguiente comando para instalar las dependencias necesarias:

```bash
cd bot-ai
npm install
```

Esto instalará todas las dependencias listadas en el archivo package.json, como Express, Mongoose, Axios, etc. 



### 1. **Variables de Entorno**

Hay dos archivos .env, uno para el frontend y otro para el backend

Para el frontend crear un .env dentro de client basandose en el  `.env.sample`
    Define las siguientes variables:
-   `REACT_APP_API_URL`: la url del backend 
    Este env es solo para pruebas ya que en el build en producción se crea en la carpeta public del backend para ser servido desde express. 

Para el backend crea un archivo `.env` en la raíz del proyecto basado en el archivo `.env.sample`.
-   Define las siguientes variables:
    -   `LLM_API_URL`: URL de la API del modelo de lenguaje.
    -   `LLM_API_KEY`: Clave de API para el modelo de lenguaje.
    -   `LLM_MODEL`: Modelo de lenguaje a utilizar.
    -   `TEMPERATURE`: Parámetro de temperatura para el modelo de lenguaje.
    -   `MAX_TOKENS`: Número máximo de tokens permitidos en la respuesta.
    -   `LOCALES`: Configuración regional (ej. `es-AR`).
    -   `CLASSIFICATION_PROMPT`: Prompt inicial para clasificar las consultas.
    -   `SYSTEM_PROMPT`: Prompt del sistema para generar respuestas.
    -   `MONGODB_URI`: URI de conexión a MongoDB.
    -   `PORT`: Puerto en el que correrá el servidor.

### Prompts

Este sistema usa dos prompts, uno para clasificar la orden y otro para los mensajes y flujo del chatbot.

1. Prompt de Clasificación (CLASSIFICATION_PROMPT)

Este prompt se utiliza para clasificar la intención del cliente a partir de su mensaje. El modelo de lenguaje (LLM) analiza el mensaje del cliente y lo clasifica en una de las categorías predefinidas, como:

    Horarios: Si el cliente pregunta por los horarios de atención.
    Promociones: Si el cliente pregunta por promociones vigentes.
    Pedidos: Si el cliente quiere hacer un pedido.
    Menú: Si el cliente solicita ver el menú.
    Información del negocio: Si el cliente pregunta por la dirección, teléfono, etc.

Este prompt es crucial porque determina el flujo de la conversación y qué acción tomará el chatbot.

2. Prompt del Sistema (SYSTEM_PROMPT)

Este prompt es el corazón del chatbot. Define cómo el modelo de lenguaje debe comportarse y qué tipo de respuestas debe generar. Incluye:

    Contexto del negocio: Información sobre el restaurante, como el nombre, dirección, horarios, etc.
    Instrucciones para generar respuestas: Cómo debe responder el chatbot en función de la clasificación de la consulta.
    Formato de las respuestas: Cómo estructurar la información para que sea clara y útil para el cliente.

Este prompt asegura que el chatbot responda de manera coherente y útil, adaptándose a las necesidades del cliente.


4. **Inicializar la Base de Datos**

Ejecuta el siguiente comando para inicializar la base de datos con datos de prueba:

Para iniciar el servidor, ejecuta:
```bash
npm run seed
```

Este comando ejecutará el script seed.js, que insertará los datos iniciales (menú, horarios, feriados, etc.) en la base de datos.


1. **Iniciar el Servidor**
   - Para iniciar el servidor, ejecuta:
     ```bash
     npm run start
     ```
   - El servidor estará disponible en `http://localhost:3001`.

## Flujo de Trabajo para Pedir un Plato

El flujo de trabajo para pedir un plato en este sistema se divide en varios pasos, que involucran la interacción del cliente con el chatbot, la selección de ítems del menú, la confirmación del pedido y la creación de la orden en la base de datos. A continuación, se describe el proceso paso a paso:

1. El Cliente Inicia el Chat

El cliente envía un mensaje al chatbot para solicitar información sobre el menú o para realizar un pedido. Por ejemplo:

    Mensaje del cliente: "hola"

2. Clasificación de la Consulta

El chatbot utiliza el servicio de clasificación (classifyQuery) para determinar el tipo de consulta. En este caso, el chatbot identifica que el cliente quiere hacer un pedido.

3. Mostrar el Menú

El chatbot responde con el menú disponible, utilizando la función handleProductosQuery del servicio queryHandlers.js. Esta función obtiene los ítems del menú desde la base de datos y los formatea para mostrarlos al cliente.

    Respuesta del chatbot:

    ¡Bienvenido! Tu número de pedido es: XSKY3Z. ¡Hola! ¿En qué puedo ayudarte? 1. Ver el menú 2. Ver promociones 3. Consultar horarios 4. Hacer un pedido 5. Consultar información del local.

4. Selección de Ítems

El cliente selecciona los ítems que desea pedir. Por ejemplo:

    Mensaje del cliente: "1"

El chatbot utiliza la función handleAgregarItemQuery para procesar el mensaje y agregar los ítems seleccionados al pedido temporal del cliente.

    Respuesta del chatbot:

        
            
¡Excelente elección! Nuestro menú se organiza por categorías para que puedencontrar lo que estás buscando con facilidad. Aquí te presentamos nuestras opciones: 
Appetizer
Edamame: $4.5
Gyoza: $6
Agedashi Tofu: $5.50 
Sushi Classic Roll
California Roll: $8
Salmon Roll: $9
...
¿Te gustaría hacer un pedido? (Sí/No)
1. Selección de Ítems

El cliente selecciona los ítems que desea pedir. Por ejemplo:

    Mensaje del cliente: "Quiero un California Roll"

El chatbot utiliza la función handleAgregarItemQuery para procesar el mensaje y agregar los ítems seleccionados al pedido temporal del cliente.

    Respuesta del chatbot:

    Se agregó California Roll al pedido.

1. Confirmación del Pedido

El chatbot pregunta al cliente si desea confirmar el pedido:

    Respuesta del chatbot:

    ¿Deseas confirmar tu pedido? Responde "Sí" o "Confirmar".

Si el cliente confirma el pedido, el chatbot utiliza la función handlePedidosQuery para crear la orden en la base de datos.

    Mensaje del cliente: "Sí, confirmar."

1. Creación de la Orden

El chatbot crea la orden en la base de datos utilizando el modelo Order. La función handlePedidosQuery realiza lo siguiente:

    Verifica que el cliente haya agregado ítems al pedido.

    Calcula el total del pedido.

    Guarda la orden en la base de datos.

    Limpia los ítems temporales del pedido.

    Respuesta del chatbot:
    Copy

    ¡Pedido confirmado! Tu ID de pedido es 12345 y el total es $27.98.

7. Respuesta Final

El chatbot informa al cliente que el pedido ha sido confirmado y proporciona el ID del pedido y el total.
Cómo Funciona el Código

A continuación, se explica cómo funciona el código detrás de este flujo de trabajo:
1. Clasificación de la Consulta

El chatbot utiliza la función classifyQuery para determinar el tipo de consulta. Esta función envía el mensaje del cliente al modelo de lenguaje (LLM) para clasificarlo.
javascript
Copy
```javascript
const classifyQuery = async (message) => {
    const classificationPrompt = config.classificationPrompt.replace('{{MESSAGE}}', message);
    const response = await callLLM([
        { role: 'system', content: classificationPrompt },
        { role: 'user', content: message },
    ]);
    return response.trim().toLowerCase();
};
```
2. Manejo de la Selección de Ítems

La función handleAgregarItemQuery procesa el mensaje del cliente para identificar los ítems solicitados y los agrega al pedido temporal.
javascript
Copy
```javascript
export const handleAgregarItemQuery = async (message, customerId, chatHistory) => {
    const menuItems = await Menu.find();
    const itemNames = menuItems.map(item => item.name.toLowerCase());

    const itemRequest = message.toLowerCase();
    const itemMatch = itemNames.find(item => itemRequest.includes(item));

    if (itemMatch) {
        const item = menuItems.find(menuItem => menuItem.name.toLowerCase() === itemMatch);
        chatHistory[customerId].orderItems.push({
            name: item.name,
            quantity: 1,
            price: item.price
        });
        return `Se agregó ${item.name} al pedido.`;
    } else {
        return "No se pudo agregar el ítem al pedido. Por favor, intenta de nuevo.";
    }
};

```
3. Confirmación y Creación del Pedido

La función handlePedidosQuery maneja la confirmación del pedido y la creación de la orden en la base de datos.

```javascript
export const handlePedidosQuery = async (message, customerId, chatHistory) => {
    if (message.toLowerCase().includes("confirmar") || message.toLowerCase().includes("listo")) {
        try {
            const items = chatHistory[customerId].orderItems;

            if (items.length === 0) {
                return "No has agregado ningún ítem al pedido. Por favor, agrega ítems antes de confirmar.";
            }

            const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

            const newOrder = new Order({
                customerId,
                items,
                total,
                status: "Pending",
                createdAt: new Date()
            });

            await newOrder.save();

            chatHistory[customerId].orderItems = [];

            return `Tu pedido ha sido confirmado con éxito. Tu ID es ${newOrder._id} y el total es $${total}.`;
        } catch (error) {
            console.error("Error al crear el pedido:", error);
            return "Hubo un problema al confirmar tu pedido. Por favor, inténtalo de nuevo más tarde.";
        }
    } else {
        const menuFromDB = await Menu.find();
        const menuList = menuFromDB.map(item =>
            `- ${item.name}: $${item.price}\n  Descripción: ${item.description}\n`
        ).join('\n');

        return `Aquí está nuestro menú:\n${menuList}\n\nPuedes agregar ítems diciendo "Quiero un [nombre del ítem]".`;
    }    
};
```

4. Interacción con el Modelo de Lenguaje (LLM)

El chatbot utiliza la función callLLM para interactuar con el modelo de lenguaje y generar respuestas contextuales.

```javascript
export const callLLM = async (messages) => {
    try {
        const response = await axios.post(
            config.llmApiUrl,
            {
                model: config.llmModel,
                messages: messages,
                temperature: config.temperature,
                max_tokens: config.maxTokens,
            },
            {
                headers: {
                    Authorization: `Bearer ${config.llmApiKey}`,
                },
            }
        );

        return response.data.choices[0].message.content;
    } catch (error) {
        console.error("Error calling LLM API:", error);
        return "Hubo un error al procesar tu solicitud. Inténtalo de nuevo más tarde.";
    }
};
```

Resumen del Flujo

    El cliente inicia el chat y solicita hacer un pedido.

    El chatbot clasifica la consulta y muestra el menú.

    El cliente selecciona los ítems.

    El chatbot agrega los ítems al pedido temporal.

    El cliente confirma el pedido.

    El chatbot crea la orden en la base de datos y responde con el ID del pedido y el total.

Este flujo de trabajo está diseñado para ser intuitivo y eficiente, permitiendo a los clientes realizar pedidos de manera rápida y sencilla.

