import { useEffect, useState } from 'react'

// La URL base se fija al compilar (VITE_API_URL). Por defecto: /api
const API = import.meta.env.VITE_API_URL ?? '/api'

export default function App() {
  const [tareas, setTareas] = useState([])
  const [titulo, setTitulo] = useState('')
  const [error, setError] = useState(null)

  async function cargar() {
    try {
      const res = await fetch(`${API}/tareas`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setTareas(await res.json())
      setError(null)
    } catch (e) {
      setError(`No se pudo contactar la API (${e.message})`)
    }
  }

  useEffect(() => {
    cargar()
  }, [])

  async function agregar(e) {
    e.preventDefault()
    if (!titulo.trim()) return
    await fetch(`${API}/tareas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ titulo, completada: false }),
    })
    setTitulo('')
    cargar()
  }

  async function alternar(t) {
    await fetch(`${API}/tareas/${t.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ titulo: t.titulo, completada: !t.completada }),
    })
    cargar()
  }

  async function eliminar(id) {
    await fetch(`${API}/tareas/${id}`, { method: 'DELETE' })
    cargar()
  }

  return (
    <main className="app">
      <h1>Tareas</h1>
      <p className="sub">Frontend React → Nginx → API Spring Boot → MySQL, todo en contenedores.</p>

      <form onSubmit={agregar} className="form">
        <input
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          placeholder="Nueva tarea"
          maxLength={120}
        />
        <button type="submit">Agregar</button>
      </form>

      {error && <p className="error">{error}</p>}

      <ul className="lista">
        {tareas.map((t) => (
          <li key={t.id} className={t.completada ? 'hecha' : ''}>
            <label>
              <input type="checkbox" checked={t.completada} onChange={() => alternar(t)} />
              <span>{t.titulo}</span>
            </label>
            <button className="borrar" onClick={() => eliminar(t.id)} aria-label="Eliminar">
              ✕
            </button>
          </li>
        ))}
      </ul>
      {tareas.length === 0 && !error && <p className="vacio">No hay tareas todavía.</p>}
    </main>
  )
}
