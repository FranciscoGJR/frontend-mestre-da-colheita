"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { fetchApi } from "@/lib/api"

interface Cultura {
  id: number
  nome: string
  tempo_crescimento: number
  preco_normal: number
  preco_prata: number
  preco_ouro: number
  preco_iridio: number
  recorrente: boolean
  produtividade_esperada: number
  preco_customizavel: boolean
}

export default function CulturasPage() {
  const [culturas, setCulturas] = useState<Cultura[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    async function fetchCulturas() {
      try {
        const data = await fetchApi("/culturas")
        setCulturas(data)
      } catch (err) {
        setError("Erro ao carregar culturas. Tente novamente mais tarde.")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchCulturas()
  }, [])

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir esta cultura?")) {
      return
    }

    try {
      await fetchApi(`/culturas/${id}`, {
        method: "DELETE",
      })
      setCulturas(culturas.filter((cultura) => cultura.id !== id))
    } catch (err) {
      alert("Erro ao excluir cultura. Tente novamente.")
      console.error(err)
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
        <h1 className="text-3xl font-bold tracking-tight text-green-700">Culturas</h1>
        <Button className="bg-green-600 hover:bg-green-700" onClick={() => router.push("/culturas/nova")}>
          <Plus className="mr-2 h-4 w-4" /> Nova Cultura
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Culturas</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Tempo de Crescimento</TableHead>
                <TableHead>Preço Normal</TableHead>
                <TableHead>Recorrente</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {culturas.length > 0 ? (
                culturas.map((cultura) => (
                  <TableRow key={cultura.id}>
                    <TableCell>{cultura.id}</TableCell>
                    <TableCell className="font-medium">{cultura.nome}</TableCell>
                    <TableCell>{cultura.tempo_crescimento} dias</TableCell>
                    <TableCell>R$ {cultura.preco_normal.toFixed(2)}</TableCell>
                    <TableCell>{cultura.recorrente ? "Sim" : "Não"}</TableCell>
                    <TableCell className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => router.push(`/culturas/editar/${cultura.id}`)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="destructive" size="icon" onClick={() => handleDelete(cultura.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    Nenhuma cultura encontrada
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
