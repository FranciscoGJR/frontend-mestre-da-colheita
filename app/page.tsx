"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Bell } from "lucide-react"
import { fetchApi } from "@/lib/api"

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

interface Alerta {
  mensagem: string
  tipo: string
}

interface Cultura {
  id: number
  nome: string
  tempo_crescimento: number
}

interface DashboardData {
  plantios: Plantio[]
  alertas: Alerta[]
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [culturas, setCulturas] = useState<Cultura[]>([])

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const [dashboardData, culturasData] = await Promise.all([
          fetchApi("/dashboard"),
          fetchApi("/culturas")
        ])
        setData(dashboardData)
        setCulturas(culturasData)
      } catch (err) {
        setError("Erro ao carregar o dashboard. Tente novamente mais tarde.")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboard()
  }, [])

  // Utilitário para nome da cultura
  function getNomeCultura(id_cultura: number) {
    const cultura = culturas.find(c => c.id === id_cultura)
    return cultura ? cultura.nome : `Cultura ID: ${id_cultura}`
  }

  // Busca tempo de crescimento
  function getTempoCrescimento(id_cultura: number) {
    const cultura = culturas.find(c => c.id === id_cultura)
    return cultura ? cultura.tempo_crescimento : 0
  }

  // Soma dias à data
  function addDays(dateStr: string, days: number) {
    const date = new Date(dateStr)
    date.setDate(date.getDate() + days)
    return date
  }

  // Data de colheita dinâmica
  function getDataColheita(plantio: Plantio) {
    const dias = getTempoCrescimento(plantio.id_cultura)
    return addDays(plantio.data_plantio, dias)
  }

  // Status dinâmico
  function getStatusDinamico(plantio: Plantio) {
    const dataColheita = getDataColheita(plantio)
    const hoje = new Date()
    if (dataColheita <= hoje) {
      return "Pronto para colher"
    } else {
      return "Crescendo"
    }
  }

  // Alertas dinâmicos
  function getAlertasProntosParaColher(plantios: Plantio[]) {
    return plantios
      .filter(p => getStatusDinamico(p) === "Pronto para colher")
      .map(p => ({
        mensagem: `Plantio de ${getNomeCultura(p.id_cultura).toLowerCase()} está pronto para colher!`,
        tipo: "pronto"
      }))
  }

  if (loading) {
    return <div className="flex justify-center items-center h-64">Carregando...</div>
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Erro</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  // Gera alertas dinâmicos com base na data de colheita
  const alertasDinamicos = data?.plantios ? getAlertasProntosParaColher(data.plantios) : []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-green-700">Dashboard</h1>
      </div>

      {alertasDinamicos.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-green-700">Alertas</h2>
          {alertasDinamicos.map((alerta, index) => (
            <Alert key={index} className="border-amber-500 bg-amber-50">
              <Bell className="h-4 w-4 text-amber-600" />
              <AlertTitle className="text-amber-800">Atenção</AlertTitle>
              <AlertDescription className="text-amber-700">
                {alerta.mensagem}
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-green-700">Plantios Ativos</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {data?.plantios && data.plantios.length > 0 ? (
            data.plantios.map((plantio) => {
              const dataColheita = getDataColheita(plantio)
              const status = getStatusDinamico(plantio)
              return (
                <Card key={plantio.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">
                      {`#${plantio.id} Plantio de ${getNomeCultura(plantio.id_cultura).toLowerCase()}`}
                    </CardTitle>
                    <CardDescription>
                      {getNomeCultura(plantio.id_cultura)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Status:</span>
                        <Badge className={status === "Pronto para colher" ? "bg-green-600" : "bg-amber-600"}>
                          {status}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Localização:</span>
                        <span>{plantio.localizacao || "Não especificada"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Sementes:</span>
                        <span>{plantio.quantidade_sementes}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Plantado em:</span>
                        <span>{new Date(plantio.data_plantio).toLocaleDateString("pt-BR")}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Data de Colheita:</span>
                        <span>{dataColheita.toLocaleDateString("pt-BR")}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })
          ) : (
            <p className="col-span-full text-center text-muted-foreground">Nenhum plantio encontrado.</p>
          )}
        </div>
      </div>
    </div>
  )
}
