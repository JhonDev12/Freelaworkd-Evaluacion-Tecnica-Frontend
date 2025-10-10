/**
 * @typedef {import('./Role').Role} Role
 */

/**
 * Representa el modelo de usuario retornado por la API Laravel.
 * Refleja los campos definidos en App\Models\User y sus relaciones cargadas.
 *
 * @typedef {Object} User
 * @property {number} id
 * @property {string} name
 * @property {string} email
 * @property {number} role_id
 * @property {Role} [role]
 * @property {string|null} [email_verified_at]
 * @property {string} created_at
 * @property {string} updated_at
 */
