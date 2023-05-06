# PROYECTO_HACKABOSS_CLON_INSTAGRAM

06/05/2023 -- Librerías core y npm a usar

  -Core
    fs/promise: File system, para leer y escribir las imágenes, y los datos requreidos en la base de datos. writeFile, readFile, etc...
      Nota: trabajamos con el asíncrono, porque la base de datos también será asíncrona.
    path: Para normalizar los directorios de los archivos, para los distintos sistemas operativos. path.join(__dirname, "archivo")
    
    
  -NPM
    express: Para facilitar a la hora de inicializar el servidor y por su middleware de json. app.use(express.json())
    sharp: Para las imágenes, es lo principal para trabajar con imágenes.
    uuidv4: Para la proteccicón de los password de los usuarios, mediante la encriptación de la misma al enviarse al servidor.
    mysql2/promise: Para la creación la conexión a la base de datos mediante un pool de conexiones. (los datos iran en el .env, para más seguridad)
    dotenv: Para poder pasarle los valores a el pool de conexiones y demás variantes de datos sensibles, desde el archivo .env
    jsonwebtoken: Para darle un token de permanencia al usuario con la sesión iniciada durante un tiempo determinado
    joi: Para limitar mediante una reestricción la entrada de valores de campo de texto o de imágenes, en los diferentes envíos de los usuarios:
      Ejemplo: Un password, string de como mínimo 8 carácteres y 16 como máximo.
      
    Este no lo tengo del todo claro
    sgMail: Por si el usuario se olvida de su contraseña, reenviarle un correo con un código de seguridad a su correo, para que pueda restaurar la contraseña.
    
    
