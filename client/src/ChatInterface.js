import { useState, useRef, useEffect } from 'react';

const ChatInterface = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [customerId, setCustomerId] = useState(null);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null); // New ref for input element

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // Effect for initial focus and scroll behavior
    useEffect(() => {
        scrollToBottom();
        inputRef.current?.focus();
    }, [messages]);
    
    // Effect for scrolling on new messages
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const formatMessage = (message) => {
        // Reemplazar **texto** con <strong>texto</strong>
        let formattedMessage = message.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
        // Reemplazar * con viñetas (•)
        formattedMessage = formattedMessage.replace(/(\* )/g, '• ');
    
        // Reemplazar + con subviñetas (◦)
        formattedMessage = formattedMessage.replace(/(\+ )/g, '  ◦ ');
    
        // Reemplazar saltos de línea con <br />
        formattedMessage = formattedMessage.replace(/\n/g, '<br />');
    
        // Eliminar líneas que contengan "N/A" o estén vacías
        formattedMessage = formattedMessage
            .split('<br />')
            .filter(line => !line.includes('N/A') && line.trim() !== '')
            .join('<br />');
    
        return formattedMessage;
    };

    const sendMessage = async (text) => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch('http://localhost:3001/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: text,
                    customerId: customerId || undefined,
                }),
            });

            if (!response.ok) throw new Error('Error en la comunicación con el servidor');

            const data = await response.json();

            // Si no tenemos un customerId, lo guardamos
            if (!customerId && data.customerId) {
                setCustomerId(data.customerId);
            }

            // Formatear el mensaje antes de agregarlo
            const formattedResponse = formatMessage(data.response);

            // Agregamos el mensaje del usuario y la respuesta del bot
            setMessages(prev => [
                ...prev,
                { type: 'user', content: text },
                { type: 'bot', content: formattedResponse }
            ]);

        } catch (err) {
            setError('Hubo un error al enviar el mensaje. Por favor, intenta nuevamente.');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        sendMessage(input);
        setInput('');
        inputRef.current?.focus(); // Refocus input after sending message
    };

    return (
        <div className="flex flex-col h-screen max-w-2xl mx-auto bg-black">
            <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
                <div className="space-y-4">
                    <div className="text-center space-y-2">
                        <p className="text-gray-900">Hola, soy el bot de El Japonés</p>
                        <p className="text-gray-900">Para iniciar el chat escribí "hola"</p>
                        {customerId && (
                            <p className="text-sm font-medium text-red-500">
                                Tu número de pedido es: <span className="text-red-500">{customerId}</span>
                            </p>
                        )}
                    </div>

                    {messages.map((message, index) => (
                        <div
                            key={index}
                            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`max-w-[80%] rounded-lg p-3 ${message.type === 'user'
                                    ? 'bg-red-500 text-white'
                                    : 'bg-white border border-gray-200'
                                    }`}
                                dangerouslySetInnerHTML={{ __html: message.content }}
                            />
                        </div>
                    ))}

                    {loading && (
                        <div className="flex justify-start">
                            <div className="bg-white border border-gray-200 rounded-lg p-3">
                                Escribiendo...
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="text-center text-red-500 py-2">
                            {error}
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>
            </div>

            <form onSubmit={handleSubmit} className="p-4 border-t bg-white">
                <div className="flex gap-2">
                    <input
                        ref={inputRef} // Added ref to input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Escribe un mensaje..."
                        className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white text-black"
                        disabled={loading}
                    />
                    <button
                        type="submit"
                        disabled={loading || !input.trim()}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Enviar
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ChatInterface;