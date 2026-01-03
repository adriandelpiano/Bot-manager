from flask import Flask, request, jsonify
from flask_cors import CORS

# Inicializar la aplicación Flask
app = Flask(__name__)

# Configurar CORS para permitir peticiones desde cualquier origen.
# Para producción, es mejor restringirlo a la URL de tu GitHub Pages.
CORS(app)

# Endpoint para recibir mensajes del frontend
@app.route('/api/message', methods=['POST'])
def handle_message():
    # Obtener el mensaje del cuerpo de la petición JSON
    data = request.get_json()
    user_message = data.get('message', '').lower()

    if not user_message:
        return jsonify({'reply': 'No he recibido ningún mensaje.'}), 400

    # Lógica simple de respuesta del bot
    bot_reply = ''
    if 'hola' in user_message:
        bot_reply = '¡Hola! Gracias por contactarme. ¿En qué puedo ayudarte?'
    elif 'precio' in user_message:
        bot_reply = 'Para información de precios, por favor contacta a un agente.'
    elif 'gracias' in user_message:
        bot_reply = '¡De nada! Estoy aquí para servirte.'
    else:
        bot_reply = 'He recibido tu mensaje. En breve te contactaré.'

    # Devolver la respuesta del bot en formato JSON
    return jsonify({'reply': bot_reply})

# Iniciar el servidor si el script se ejecuta directamente
if __name__ == '__main__':
    # Escucha en todas las interfaces de red en el puerto 5001
    app.run(host='0.0.0.0', port=5001, debug=True)
