"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Pencil, Trash2, Eye } from "lucide-react"
import { useRouter } from "next/navigation"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { fetchApi } from "@/lib/api"

interface Cultura {
  id: number
  nome: string
  tempo_crescimento: number
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

export default function PlantiosPage() {
  const [plantios, setPlantios] = useState<Plantio[]>([])
  const [culturas, setCulturas] = useState<Cultura[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    async function fetchData() {
      try {
        const [plantiosData, culturasData] = await Promise.all([fetchApi("/plantios"), fetchApi("/culturas")])
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

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir este plantio?")) {
      return
    }

    try {
      await fetchApi(`/plantios/${id}`, {
        method: "DELETE",
      })
      setPlantios(plantios.filter((plantio) => plantio.id !== id))
    } catch (err) {
      alert("Erro ao excluir plantio. Tente novamente.")
      console.error(err)
    }
  }

  const getNomeCultura = (idCultura: number) => {
    const cultura = culturas.find((c) => c.id === idCultura)
    return cultura ? cultura.nome : `ID: ${idCultura}`
  }

  // Função para buscar tempo de crescimento da cultura
  const getTempoCrescimento = (idCultura: number) => {
    const cultura = culturas.find((c) => c.id === idCultura)
    return cultura ? cultura.tempo_crescimento : 0
  }

  // Função para somar dias a uma data
  function addDays(dateStr: string, days: number) {
    const date = new Date(dateStr)
    date.setDate(date.getDate() + days)
    return date
  }

  // Função para calcular data de colheita
  const getDataColheita = (plantio: Plantio) => {
    const dias = getTempoCrescimento(plantio.id_cultura)
    return addDays(plantio.data_plantio, dias)
  }

  // Função para status dinâmico
  const getStatusDinamico = (plantio: Plantio) => {
    const dataColheita = getDataColheita(plantio)
    const hoje = new Date()
    if (dataColheita <= hoje) {
      return "Pronto para colher"
    } else{
      return "Crescendo"
    }
    return plantio.status
  }

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
        <h1 className="text-3xl font-bold tracking-tight text-green-700">Plantios</h1>
        <Button className="bg-green-600 hover:bg-green-700" onClick={() => router.push("/plantios/novo")}>
          <Plus className="mr-2 h-4 w-4" /> Novo Plantio
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Plantios</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cultura</TableHead>
                <TableHead>Data de Plantio</TableHead>
                <TableHead>Data de Colheita</TableHead>
                <TableHead>Localização</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {plantios.length > 0 ? (
                plantios.map((plantio) => {
                  const dataColheita = getDataColheita(plantio)
                  const status = getStatusDinamico(plantio)
                  return (
                    <TableRow key={plantio.id}>
                      <TableCell>{getNomeCultura(plantio.id_cultura)}</TableCell>
                      <TableCell>{new Date(plantio.data_plantio).toLocaleDateString("pt-BR")}</TableCell>
                      <TableCell>{dataColheita.toLocaleDateString("pt-BR")}</TableCell> {/* NOVO */}
                      <TableCell>{plantio.localizacao || "Não especificada"}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(getStatusDinamico(plantio))}>
                          {getStatusDinamico(plantio)}
                        </Badge>
                      </TableCell>
                      <TableCell className="flex space-x-2">
                        <Button variant="outline" size="icon" onClick={() => router.push(`/plantios/${plantio.id}`)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => router.push(`/plantios/editar/${plantio.id}`)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="destructive" size="icon" onClick={() => handleDelete(plantio.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
                    Nenhum plantio encontrado
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
