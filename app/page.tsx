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

interface DashboardData {
  plantios: Plantio[]
  alertas: Alerta[]
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const data = await fetchApi("/dashboard")
        setData(data)
      } catch (err) {
        setError("Erro ao carregar o dashboard. Tente novamente mais tarde.")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboard()
  }, [])

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-green-700">Dashboard</h1>
      </div>

      {data?.alertas && data.alertas.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-green-700">Alertas</h2>
          {data.alertas.map((alerta, index) => (
            <Alert key={index} className="border-amber-500 bg-amber-50">
              <Bell className="h-4 w-4 text-amber-600" />
              <AlertTitle className="text-amber-800">Atenção</AlertTitle>
              <AlertDescription className="text-amber-700">{alerta.mensagem}</AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-green-700">Plantios Ativos</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {data?.plantios && data.plantios.length > 0 ? (
            data.plantios.map((plantio) => (
              <Card key={plantio.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Plantio #{plantio.id}</CardTitle>
                  <CardDescription>Cultura ID: {plantio.id_cultura}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Status:</span>
                      <Badge className={plantio.status === "Pronto para colher" ? "bg-green-600" : "bg-amber-600"}>
                        {plantio.status}
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
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <p className="col-span-full text-center text-muted-foreground">Nenhum plantio encontrado.</p>
          )}
        </div>
      </div>
    </div>
  )
}
