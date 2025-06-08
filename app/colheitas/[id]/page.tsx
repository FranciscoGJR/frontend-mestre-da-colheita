"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { fetchApi } from "@/lib/api"

interface Cultura {
  id: number
  nome: string
}

interface Plantio {
  id: number
  id_cultura: number
}

interface ColheitaItem {
  id: number
  colheita_id: number
  qualidade: string
  quantidade: number
}

interface Colheita {
  id: number
  id_plantio: number
  id_usuario: number
  data_colheita: string
  observacoes: string
  foto_url: string
  itens: ColheitaItem[]
}

export default function DetalhesColheitaPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [colheita, setColheita] = useState<Colheita | null>(null)
  const [plantio, setPlantio] = useState<Plantio | null>(null)
  const [cultura, setCultura] = useState<Cultura | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Extrair o ID da colheita uma vez
  const colheitaId = params.id

  useEffect(() => {
    async function fetchData() {
      try {
        console.log(`Buscando colheita com ID: ${colheitaId}`)

        // Buscar dados da colheita
        const colheitaData = await fetchApi(`/colheitas/${colheitaId}`, {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
        })

        console.log("Dados da colheita recebidos:", colheitaData)
        setColheita(colheitaData)

        // Buscar dados do plantio relacionado
        if (colheitaData && colheitaData.id_plantio) {
          const plantioData = await fetchApi(`/plantios/${colheitaData.id_plantio}`, {
            method: "GET",
            headers: {
              Accept: "application/json",
            },
          })
          setPlantio(plantioData)

          // Buscar dados da cultura relacionada
          if (plantioData && plantioData.id_cultura) {
            const culturaData = await fetchApi(`/culturas/${plantioData.id_cultura}`, {
              method: "GET",
              headers: {
                Accept: "application/json",
              },
            })
            setCultura(culturaData)
          }
        }
      } catch (err) {
        console.error("Erro ao buscar dados:", err)
        if (err instanceof Error) {
          setError(`Erro ao carregar dados da colheita: ${err.message}`)
        } else {
          setError("Erro ao carregar dados da colheita. Tente novamente mais tarde.")
        }
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [colheitaId])

  const getTotalItens = (itens: ColheitaItem[]) => {
    return itens.reduce((total, item) => total + item.quantidade, 0)
  }

  if (loading) {
    return <div className="flex justify-center items-center h-64">Carregando...</div>
  }

  if (error || !colheita) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Erro</AlertTitle>
        <AlertDescription>{error || "Colheita não encontrada"}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button variant="ghost" onClick={() => router.back()} className="mr-4 text-white">
          <ArrowLeft className="h-4 w-4 mr-2 text-white" />
          Voltar
        </Button>
        <h1 className="text-3xl font-bold tracking-tight text-green-700">Detalhes da Colheita</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Colheita #{colheita.id}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Plantio</h3>
              <p className="text-lg">#{colheita.id_plantio}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Cultura</h3>
              <p className="text-lg">{cultura ? cultura.nome : "Não disponível"}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Data da Colheita</h3>
              <p className="text-lg">{new Date(colheita.data_colheita).toLocaleDateString("pt-BR")}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Total de Itens</h3>
              <p className="text-lg">{getTotalItens(colheita.itens)}</p>
            </div>
          </div>

          <div className="mt-4">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Itens Colhidos</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {colheita.itens.map((item, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-md
                    ${item.qualidade === "normal" ? "bg-slate-100 text-slate-800" : ""}
                    ${item.qualidade === "prata" ? "bg-gray-100 text-gray-800" : ""}
                    ${item.qualidade === "ouro" ? "bg-amber-100 text-amber-800" : ""}
                    ${item.qualidade === "iridio" ? "bg-purple-100 text-purple-800" : ""}
                  `}
                >
                  <div className="flex justify-between">
                    <span className="font-medium">
                      {item.qualidade.charAt(0).toUpperCase() + item.qualidade.slice(1)}
                    </span>
                    <span>{item.quantidade} unidades</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {colheita.observacoes && (
            <div className="mt-4">
              <h3 className="text-sm font-medium text-muted-foreground">Observações</h3>
              <p className="text-lg whitespace-pre-line">{colheita.observacoes}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
