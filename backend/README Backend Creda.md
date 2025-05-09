
# 📘 Documentación del Backend de Creda

## 🌐 Entorno de desarrollo

* URL base: `http://localhost:5000`
* URL producción: `https://creda-development.up.railway.app`

Todas las rutas están agrupadas bajo los siguientes prefijos:

| Prefijo base    | Descripción                    |
| --------------- | ------------------------------ |
| `/api/managers` | Endpoints para administradores |
| `/api/clients`  | Endpoints para clientes        |

---

## 🔐 Rutas para Administradores (`/api/managers`)

### ▶️ POST `/create-manager`

**Descripción:** Crea un nuevo administrador y envía un enlace de verificación al email.

**Body esperado:**

```ts
interface CreateManager {
  manager_name: string;
  manager_email: string;
  manager_password: string;
  manager_verified: boolean; // Este campo es interno, no se envía desde el frontend
}
```

**Validaciones:**

* Todos los campos (`manager_name`, `manager_email`, `manager_password`) son obligatorios.
* La contraseña debe tener al menos 6 caracteres.
* El email debe ser válido.

**Respuestas posibles:**

* `200 OK`: Administrador creado exitosamente (respuesta enviada desde el controller).
* `400 Bad Request`: Campos faltantes o inválidos.

---

### ▶️ POST `/login-manager`

**Descripción:** Permite iniciar sesión a un administrador existente.

**Body esperado:**

```ts
interface LoginManager {
  manager_email: string;
  manager_password: string;
}
```

**Validaciones:**

* Ambos campos son obligatorios.
* El email debe ser válido.

**Respuestas posibles:**

* `200 OK`: Login exitoso, se devuelve un token u objeto asociado.
* `400 Bad Request`: Faltan campos o email inválido.

---

### ▶️ GET `/verify-email?manager_id=...`

**Descripción:** Verifica la cuenta de un administrador usando su ID desde el enlace de verificación.

**Query param:**

* `manager_id` (string): obligatorio.

**Respuestas posibles:**

* `200 OK`: Email verificado con éxito.
* `400 Bad Request`: `manager_id` ausente o inválido.

---

## 👤 Rutas para Clientes (`/api/clients`)

### ▶️ POST `/create-client`

**Descripción:** Crea un nuevo cliente para evaluar su perfil crediticio.

**Body esperado:**

```ts
interface CreateClient {
  client_id: string;
  client_score: number;
  client_credit_status: "good" | "bad";
}
```

**Validaciones:**

* Todos los campos son obligatorios.
* `client_credit_status` debe ser `"good"` o `"bad"`.

**Respuestas posibles:**

* `200 OK`: Cliente creado con éxito. Se puede devolver un ID u objeto adicional.
* `400 Bad Request`: Faltan campos o `client_credit_status` inválido.

---

### ▶️ GET `/get-client-data?client_id=...`

**Descripción:** Obtiene los datos del cliente mediante su ID.

**Query param:**

* `client_id` (string): obligatorio.

**Respuestas posibles:**

* `200 OK`: Datos del cliente obtenidos correctamente.
* `400 Bad Request`: `client_id` no enviado.

