<h1>InstaClone</h1>

![InstaCloneLogo](https://github.com/Manuel080696/PruebasManu/blob/main/logo_final2.png)

<h2>Rutas aplicadas</h2>

<ul>
  <li>Users</li>
  <ul>
    <li>POST - "newUserController" ✔️</li>
    <li>GET - "getUserController" ✔️</li>
    <li>POST - "loginController" ✔️</li>
    <li>DEL - "deleteUserController" ✔️</li>
    <li>PATCH - "updateUserController" ✔️</li>
  </ul>
  <li>Photos</li>
    <ul>
      <li>GET - "getAllPhotosController" ✔️</li>
      <li>POST - "newPhotoController" ✔️ </li>
      <li>GET - "searchPhotoController" ✔️ </li>
      <li>GET - "getPhotoControllerSingle" ✔️ </li>
      <li>DEL - "deletePhotoController" ✔️ </li>
  </ul>
  <li>Likes</li>
  <ul>
    <li>POST - "newLikesController" ✔️ </li>
  </ul>
  <li>Comments</li>
  <ul>
    <li>POST - "postCommentController" ✔️ </li>
    <li>DEL - "unCommentController" ✔️ </li>
</ul>
  

<h2>Manual de uso</h2>
<ol>
  <li>Este es el backend, del proyecto de InstaClone, para inicializar el proyecto lo primero que deberemos hacer es crear la base de datos e iniciarla, para ello deberemos de seguir los siguientes pasos:
	<ol>
		<li><article><p>Vamos al repositorio y le damos a code, y copiaremos la clave HTTPS o SSH</p>
		<img src="https://github.com/Manuel080696/PruebasManu/blob/main/claveHTTPSSSH.png?raw=true"/></article></li>
		<p/>
      <li><p>Deberemos elegir la carpeta donde deseamos crear nuestro repositorio. Para este ejemplo, usaremos <a href="https://git-scm.com/">git</a> para windows. Una vez situados en el directorio deseado, haremos click derecho y pulsaremos en la opción "Git Bash Here". Esto iniciará la consola de comandos de git, una vez situados en la cosnola introduciremos el siguiente comando "git clone claveHTTPS o claveSSH":</p>
      <img src="https://github.com/Manuel080696/PruebasManu/blob/main/gitCloneRepositorio.png?raw=true"/>
      </li>
      <p/>
		<li>Una vez tengamos el repositorio descargado, deberemos ejecutarlo mediante algun compilador de código. En este ejemplo usaremos <a href="https://code.visualstudio.com/">visual studio code</a>, simplemente en la misma consola de git usada en el ejemplo anterior, primero accederemos a la carpeta mediante "cd PROYECTO_HACKABOSS_CLON_INSTAGRAM/". Y por último iniciaremos visual mediante el comando "code ."
    <img src="https://github.com/Manuel080696/PruebasManu/blob/main/gitCodeVisual.png?raw=true"/>
    </li>
        <p/>
    <li>Deberemos renombrar el ".env.example" y a ".env", y en el colocar los datos de <a href="https://www.mysql.com/products/workbench/">workbench de sql</a>, la dirección del host, la clave <a href="https://sendgrid.com/">sendgrid</a> y su correo, el puerto que queremos elegir, clave secreta, etc: 
    <img src="https://github.com/Manuel080696/PruebasManu/blob/main/envBackEnd.png"/>
    </li>
          <p/>
    <li>Una vez realizados todos estos pasos, solo nos quedará iniciar el terminal de visual, instalar los modulos npm mediante el comando "npm i" y después. Crear la base de datos, mediante "node .\src\database\createDB.js". Y simplemente, ejecutarla mediante el comando "npm run".
      <img src="https://github.com/Manuel080696/PruebasManu/blob/main/insalacionDelBack.png?raw=true"/>
    </li>
            <p/>
</ol>
</li>
  <p></p>
  <li>Para los usuarios más avanzados que quieran hacer pruebas mediante postman, aquí os dejo la colección de rutas <a href="https://github.com/Manuel080696/PruebasManu/blob/main/InstaClone.postman_collection.json">PostmanCollectionInstaClone</a>
  </li>
  <p></p>
  <li>Para crear un usuario, debe tener obligatoriamente:
  <ul>
    <li>Nombre</li>
    <li>Apellido</li>
    <li>Nombre de Usuario</li>
    <li>Email (único)</li>
    <li>Contraseña</li>
    </ul>
  </li>
  <p></p>
  <li>Para loggearlo, deberemos de introducir:</li>
  <ul>
    <li>Email</li>
    <li>Contraseña</li>
  </ul>
  <p></p>
  <li>Esto nos dará un token, el cual se guardará automáticamente en la variable TOKEN, que podremos ver más adelante en los controllers de photos, likes y comments, aúnque no siempre su uso será obligatorio. (se usará para obtener información por si el usuario está loggeado o no, y mostrarle sus likes en las publicaciones)</li>
  <p></p>
  <li>El controller "getAllPhotosController", simplemente nos mostrará todos los post de la red social</li>
  <p></p>
  <li>"newPhotoController" nos servirá para subir un post, se hace a través de form-data y sus datos obligatorios serán:
  <ul>
    <li>Place -- text</li>
    <li>Description -- text</li>
    <li>Image -- file</li>
    </ul>
  </li>
  <p></p>
  <li>"shearchPhotoController" nos servirá para buscar todas las fotos de la red social, por palabras contenidas en su descripción, esta palabra se la pasaremos a través del body, en un JSON con la propiedad:
    <ul>
      <li>"Search": "palabra a buscar"</li>
    </ul>
  </li>
  <p></p>
  <li>"getPhotoControllerSingle" sirve para coger una sola foto mediante el ID, pasado a través del parametro, justo después de "photos/:id", es decir "photos/4". Veremos en headers, el nombrado anteriormente Authorization, el cuál usaremos para saber si el usuario está loggeado o no, y pueda ver su like en dicha publicación si lo ha dado.</li>
  <p></p>
  <li>"deletePhotoController" sirve para eliminar el post, si el usuario es el que lo ha creado, de la siguiente forma:</li>
   <ul>
     <li>"photos/:photoId", es decir "/photos/4"</li>
  </ul>
  <p></p>
  <li>"newLikeController" sirve para dar like a las diferentes publicaciones, indicadas en el params de la siguiente forma: "photos/4/like", así le darémos like a la photo con el id 4, si le damos like a algo que ya tenía un like, quitaremos dicho like</li>
  <p></p>
  <li>"postCommentController" para subir un comentario a una foto indicada en el params, algo parecido a el de "newLikeController" pero esta vez solo cambiando el like por comment "photos/4/comment", pero además, deberemos indicar que es lo que queremos comentar mediante un JSON con la propiedad:</li>
    <ul>
      <li> "comment": "Comentario"</li>
    </ul>
  <p></p>
  <li>"unCommentController" sirve para eliminar un comentario si ese comentario te pertenece, para ello deberemos indicar tanto la foto como el comentario que deseamos eliminar mediante params, de la siguiente forma:</li>
  <ul>
    <li> "photos/4/uncomment/5" -- De esta forma eliminaremos el comentario con la id 5 de la foto con el id 4 </li>
  </ul>
</ol>

<h2>Sumario de errores y dudas, durante esta semana de trabajo</h2>

<h4>06/05/2023 -- Librerías core y npm a usar</h4>

  <h5>-Core</h5>
    <p>fs/promise: File system, para leer y escribir las imágenes, y los datos requreidos en la base de datos. writeFile, readFile, etc...</p>
    <p>  Nota: trabajamos con el asíncrono, porque la base de datos también será asíncrona. </p>
    <p>path: Para normalizar los directorios de los archivos, para los distintos sistemas operativos. path.join(__dirname, "archivo")</p>
    
  <h4>-NPM</h4>
    <p>express: Para facilitar a la hora de inicializar el servidor y por su middleware de json. app.use(express.json())</p>
    <p>sharp: Para las imágenes, es lo principal para trabajar con imágenes.</p>
    <p>bcrypt: Para la proteccicón de los password de los usuarios, mediante la encriptación de la misma al enviarse al servidor.</p>
    <p>mysql2/promise: Para la creación la conexión a la base de datos mediante un pool de conexiones. (los datos iran en el .env, para más seguridad)</p>
    <p>dotenv: Para poder pasarle los valores a el pool de conexiones y demás variantes de datos sensibles, desde el archivo .env</p>
    <p>jsonwebtoken: Para darle un token de permanencia al usuario con la sesión iniciada durante un tiempo determinado</p>
    <p>joi: Para limitar mediante una reestricción la entrada de valores de campo de texto o de imágenes, en los diferentes envíos de los usuarios:</p>
    <p>&nbsp;-Ejemplo: Un password, string de como mínimo 8 carácteres y 16 como máximo.</p>
    
    
<h4>08/05/2023 -- Creación de la base de datos en SQL, después la pasamos a NODE.js creando una estructura base. Determinamos los controllers que necesitabamos para: users, photos y likes. Determinamos quién haría cada parte en grupo, y desarrollamos una metodología de trabajo</h4>

<h4>09/05/2023 -- Acabamos los controllers de users, y comenzamos con los controllers de photos. Creando también las funciones de cada uno de los controllers, siendo estas, consultas a la base de datos, estando todas ellas en la carpeta db</h4>

<h4>10/05/2023 -- Se terminó de arreglar los controllers de photos, y se agregó otra ruta : "/photos/:id". Usamos para la búsqueda de photos por las palabras de dicha descripción, entregada la palabra por el usuario, através de req.body. Creamos el controller de newLike con sus funciones en db</h4>
