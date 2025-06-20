"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { fetchApi } from "@/lib/api"

interface ColheitaItem {
  id: number
  colheita_id: number
  qualidade: string
  quantidade: number
}

interface Colheita {
  id: number
  id_plantio: number
  data_colheita: string
  observacoes: string
  itens: ColheitaItem[]
}

export default function RelatoriosPage() {
  const [lucroTotal, setLucroTotal] = useState(0)
  const [lucroPorMes, setLucroPorMes] = useState<{ mes: string, valor: number }[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchRelatorio() {
      try {
        const [colheitas, culturas] = await Promise.all([
          fetchApi("/colheitas"),
          fetchApi("/culturas"),
        ])

        // Cria um mapa para lookup rápido de cultura por id
        const culturaMap = new Map<number, any>()
        culturas.forEach((c: any) => culturaMap.set(c.id, c))

        const lucroPorMesMap: Record<string, number> = {}
        let total = 0

        colheitas.forEach((colheita: any) => {
          const mes = colheita.data_colheita.slice(0, 7) // "YYYY-MM"
          let soma = 0

          colheita.itens.forEach((item: any) => {
            const cultura = culturaMap.get(colheita.id_plantio)
            if (!cultura) return

            // Define o preço conforme a qualidade
            let preco = 0
            switch (item.qualidade?.toLowerCase()) {
              case "normal":
                preco = cultura.preco_normal
                break
              case "prata":
                preco = cultura.preco_prata
                break
              case "ouro":
                preco = cultura.preco_ouro
                break
              case "iridio":
                preco = cultura.preco_iridio
                break
              default:
                preco = cultura.preco_normal
            }
            soma += item.quantidade * preco
          })

          lucroPorMesMap[mes] = (lucroPorMesMap[mes] || 0) + soma
          total += soma
        })

        const lucroPorMesArr = Object.entries(lucroPorMesMap)
          .map(([mes, valor]) => ({ mes, valor }))
          .sort((a, b) => a.mes.localeCompare(b.mes))

        setLucroTotal(total)
        setLucroPorMes(lucroPorMesArr)
      } catch (err) {
        setError("Erro ao carregar relatório. Tente novamente mais tarde.")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchRelatorio()
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

  // Formata o mês para "MM/YYYY"
  const formatMes = (mes: string) => {
    const [ano, mesNum] = mes.split("-")
    return `${mesNum}/${ano}`
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-green-700">Relatórios</h1>
      </div>

      <div className="grid gap-2">
        <Card className="pb-2">
          <CardHeader>
            <CardTitle className="text-center">Lucro Total</CardTitle>
          </CardHeader>
          <CardContent className="py-2 h-12 flex items-center justify-center">
            <div className="text-center text-4xl font-bold text-green-700">
              {lucroTotal}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Lucro por Mês</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={lucroPorMes}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" tickFormatter={formatMes} />
                <YAxis />
                <Tooltip formatter={(value) => `${value}`} labelFormatter={formatMes} />
                <Bar dataKey="valor" fill="#15803d" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
