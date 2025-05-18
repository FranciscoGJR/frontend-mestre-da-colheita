// Configuração centralizada para a API
export const API_BASE_URL = "http://localhost:8080/api/v1"

// Função auxiliar para fazer requisições à API
export async function fetchApi(endpoint: string, options?: RequestInit) {
  const url = `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    })

    if (!response.ok) {
      // Tentar obter mensagem de erro do corpo da resposta
      let errorMessage = `Erro na requisição: ${response.status}`
      try {
        const errorData = await response.json()
        if (errorData.message) {
          errorMessage = `Erro: ${errorData.message}`
        }
      } catch (e) {
        // Se não conseguir obter o JSON, usa a mensagem padrão
      }
      throw new Error(errorMessage)
    }

    // Para requisições DELETE que retornam 204 No Content
    if (response.status === 204) {
      return null
    }

    return await response.json()
  } catch (error) {
    console.error("Erro na API:", error)
    throw error
  }
}
