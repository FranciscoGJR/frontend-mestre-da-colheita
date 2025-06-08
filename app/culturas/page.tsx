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
  const [expandedId, setExpandedId] = useState<number | null>(null)
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
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Culturas</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead></TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Tempo de Crescimento</TableHead>
                <TableHead>Preço Normal</TableHead>
                <TableHead></TableHead> {/* Botão Mais informações */}
              </TableRow>
            </TableHeader>
            <TableBody>
              {culturas.length > 0 ? (
                culturas.map((cultura) => (
                  <>
                    <TableRow key={cultura.id}>
                      <TableCell>
                        {/* Mostra imagem se existir em /public/small-imgs/{cultura.nome.toLowerCase()}.png */}
                        <CulturaImg nome={cultura.nome} />
                      </TableCell>
                      <TableCell className="font-medium">{cultura.nome}</TableCell>
                      <TableCell>{cultura.tempo_crescimento} dias</TableCell>
                      <TableCell>R$ {cultura.preco_normal.toFixed(2)}</TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setExpandedId(expandedId === cultura.id ? null : cultura.id)
                          }
                        >
                          Mais informações
                        </Button>
                      </TableCell>
                    </TableRow>
                    {expandedId === cultura.id && (
                      <TableRow>
                        <TableCell colSpan={5}>
                          <div className="p-2 bg-gray-50 rounded">
                            <div><b>Preço Prata:</b> R$ {cultura.preco_prata.toFixed(2)}</div>
                            <div><b>Preço Ouro:</b> R$ {cultura.preco_ouro.toFixed(2)}</div>
                            <div><b>Preço Irídio:</b> R$ {cultura.preco_iridio.toFixed(2)}</div>
                            <div><b>Recorrente:</b> {cultura.recorrente ? "Sim" : "Não"}</div>
                            <div><b>Produtividade Esperada:</b> {cultura.produtividade_esperada}</div>
                            <div><b>Estação:</b> {(cultura as any).estacao || "Não especificada"}</div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
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

// Componente auxiliar para mostrar imagem se existir
function CulturaImg({ nome }: { nome: string }) {
  // Caminho da imagem baseado no nome da cultura
  const src = `/small-imgs/${nome.toLowerCase()}.png`
  const [exists, setExists] = useState(true)

  useEffect(() => {
    // Verifica se a imagem existe
    fetch(src, { method: "HEAD" })
      .then(res => setExists(res.ok))
      .catch(() => setExists(false))
  }, [src])

  if (!exists) return null
  return (
    <img src={src} alt={nome} style={{ width: 32, height: 32, objectFit: "contain" }} />
  )
}
