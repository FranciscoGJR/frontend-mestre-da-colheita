"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Pencil } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { fetchApi } from "@/lib/api"

interface Cultura {
  id: number
  nome: string
}

interface Plantio {
  id: number
  id_cultura: number
  quantidade_sementes: number
  data_plantio: string
  estacao_plantio: string
  localizacao: string
  status: string
  observacoes: string
}

export default function DetalhesPlantioPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [plantio, setPlantio] = useState<Plantio | null>(null)
  const [cultura, setCultura] = useState<Cultura | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const plantioData = await fetchApi(`/plantios/${params.id}`)
        setPlantio(plantioData)
        console.log(`Dados do plantio carregados:`, plantioData)

        // Buscar a cultura correspondente
        if (plantioData && plantioData.id_cultura) {
          const culturaData = await fetchApi(`/culturas/${plantioData.id_cultura}`)
          console.log(`Dados da cultura carregados:`, culturaData)
          setCultura(culturaData)
        }
      } catch (err) {
        setError("Erro ao carregar dados do plantio. Tente novamente mais tarde.")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [params.id])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pronto para colher":
        return "bg-green-600"
      case "Crescendo":
        return "bg-amber-600"
      default:
        return "bg-slate-600"
    }
  }

  if (loading) {
    return <div className="flex justify-center items-center h-64">Carregando...</div>
  }

  if (error || !plantio) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Erro</AlertTitle>
        <AlertDescription>{error || "Plantio não encontrado"}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Button variant="ghost" onClick={() => router.back()} className="mr-4  text-white">
            <ArrowLeft className="h-4 w-4 mr-2  text-white" />
            Voltar
          </Button>
          <h1 className="text-3xl font-bold tracking-tight text-green-700">Detalhes do Plantio</h1>
        </div>
        <Button
          onClick={() => router.push(`/plantios/editar/${plantio.id}`)}
          className="bg-green-600 hover:bg-green-700"
        >
          <Pencil className="mr-2 h-4 w-4" />
          Editar
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>Plantio #{plantio.id}</span>
            <Badge className={getStatusColor(plantio.status)}>{plantio.status}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Cultura</h3>
              <p className="text-lg">{cultura ? cultura.nome : `ID: ${plantio.id_cultura}`}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Quantidade de Sementes</h3>
              <p className="text-lg">{plantio.quantidade_sementes}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Data de Plantio</h3>
              <p className="text-lg">{new Date(plantio.data_plantio).toLocaleDateString("pt-BR")}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Estação de Plantio</h3>
              <p className="text-lg">
                {cultura && (cultura as any).estacao
                  ? (cultura as any).estacao
                  : "Não especificada"}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Localização</h3>
              <p className="text-lg">{plantio.localizacao || "Não especificada"}</p>
            </div>
          </div>

          {plantio.observacoes && (
            <div className="mt-4">
              <h3 className="text-sm font-medium text-muted-foreground">Observações</h3>
              <p className="text-lg whitespace-pre-line">{plantio.observacoes}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
