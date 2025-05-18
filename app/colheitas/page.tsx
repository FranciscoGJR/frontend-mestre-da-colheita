"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus } from "lucide-react"
import { useRouter } from "next/navigation"
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
  data_colheita: string
  observacoes: string
  itens: ColheitaItem[]
}

export default function ColheitasPage() {
  const [colheitas, setColheitas] = useState<Colheita[]>([])
  const [plantios, setPlantios] = useState<Plantio[]>([])
  const [culturas, setCulturas] = useState<Cultura[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    async function fetchData() {
      try {
        const [colheitasData, plantiosData, culturasData] = await Promise.all([
          fetchApi("/colheitas"),
          fetchApi("/plantios"),
          fetchApi("/culturas"),
        ])
        setColheitas(colheitasData)
        setPlantios(plantiosData)
        setCulturas(culturasData)
      } catch (err) {
        setError("Erro ao carregar dados. Tente novamente mais tarde.")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const getNomeCultura = (idPlantio: number) => {
    const plantio = plantios.find((p) => p.id === idPlantio)
    if (!plantio) return "Desconhecida"

    const cultura = culturas.find((c) => c.id === plantio.id_cultura)
    return cultura ? cultura.nome : "Desconhecida"
  }

  const getTotalItens = (itens: ColheitaItem[]) => {
    return itens.reduce((total, item) => total + item.quantidade, 0)
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-green-700">Colheitas</h1>
        <Button className="bg-green-600 hover:bg-green-700" onClick={() => router.push("/colheitas/nova")}>
          <Plus className="mr-2 h-4 w-4" /> Nova Colheita
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Colheitas</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Plantio</TableHead>
                <TableHead>Cultura</TableHead>
                <TableHead>Data da Colheita</TableHead>
                <TableHead>Total de Itens</TableHead>
                <TableHead>Qualidades</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {colheitas.length > 0 ? (
                colheitas.map((colheita) => (
                  <TableRow
                    key={colheita.id}
                    className="cursor-pointer"
                    onClick={() => router.push(`/colheitas/${colheita.id}`)}
                  >
                    <TableCell>{colheita.id}</TableCell>
                    <TableCell>#{colheita.id_plantio}</TableCell>
                    <TableCell>{getNomeCultura(colheita.id_plantio)}</TableCell>
                    <TableCell>{new Date(colheita.data_colheita).toLocaleDateString("pt-BR")}</TableCell>
                    <TableCell>{getTotalItens(colheita.itens)}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {colheita.itens.map((item, index) => (
                          <span
                            key={index}
                            className={`px-2 py-1 rounded-full text-xs font-medium
                              ${item.qualidade === "normal" ? "bg-slate-200 text-slate-800" : ""}
                              ${item.qualidade === "prata" ? "bg-gray-300 text-gray-800" : ""}
                              ${item.qualidade === "ouro" ? "bg-amber-200 text-amber-800" : ""}
                              ${item.qualidade === "iridio" ? "bg-purple-200 text-purple-800" : ""}
                            `}
                          >
                            {item.qualidade}: {item.quantidade}
                          </span>
                        ))}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    Nenhuma colheita encontrada
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
