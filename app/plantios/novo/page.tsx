"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { fetchApi } from "@/lib/api"

interface Cultura {
  id: number
  nome: string
}

export default function NovoPlantioPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [culturas, setCulturas] = useState<Cultura[]>([])
  const [loadingCulturas, setLoadingCulturas] = useState(true)

  const [formData, setFormData] = useState({
    id_usuario: 1, // Campo obrigatório adicionado
    id_cultura: 0,
    quantidade_sementes: 0,
    data_plantio: new Date().toISOString().split("T")[0],
    estacao_plantio: "",
    localizacao: "",
    observacoes: "",
    status: "Crescendo",
    foto_url: "", // Campo obrigatório adicionado
  })

  useEffect(() => {
    async function fetchCulturas() {
      try {
        const data = await fetchApi("/culturas")
        setCulturas(data)
      } catch (err) {
        console.error("Erro ao carregar culturas:", err)
      } finally {
        setLoadingCulturas(false)
      }
    }

    fetchCulturas()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement

    if (type === "number") {
      setFormData({
        ...formData,
        [name]: Number.parseInt(value) || 0,
      })
    } else {
      setFormData({
        ...formData,
        [name]: value,
      })
    }
  }

  const handleSelectChange = (name: string, value: string) => {
    if (name === "id_cultura") {
      // Garantir que o id_cultura seja um número
      setFormData({
        ...formData,
        [name]: Number.parseInt(value),
      })
    } else {
      setFormData({
        ...formData,
        [name]: value,
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Verificar se id_cultura é um número válido
      if (!formData.id_cultura) {
        throw new Error("Selecione uma cultura válida")
      }

      // Log para debug
      console.log("Enviando dados:", JSON.stringify(formData, null, 2))

      await fetchApi("/plantios", {
        method: "POST",
        body: JSON.stringify(formData),
      })
      router.push("/plantios")
    } catch (err) {
      if (err instanceof Error) {
        setError(`Erro ao criar plantio: ${err.message}`)
      } else {
        setError("Erro ao criar plantio. Verifique os dados e tente novamente.")
      }
      console.error("Erro completo:", err)
    } finally {
      setLoading(false)
    }
  }

  const estacoes = ["Primavera", "Verão", "Outono", "Inverno"]

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button variant="ghost" onClick={() => router.back()} className="mr-4 text-white">
          <ArrowLeft className="h-4 w-4 mr-2 text-white" />
          Voltar
        </Button>
        <h1 className="text-3xl font-bold tracking-tight text-green-700">Novo Plantio</h1>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Dados do Plantio</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="id_cultura">Cultura</Label>
                <Select
                  disabled={loadingCulturas}
                  onValueChange={(value) => handleSelectChange("id_cultura", value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma cultura" />
                  </SelectTrigger>
                  <SelectContent>
                    {culturas.map((cultura) => (
                      <SelectItem key={cultura.id} value={cultura.id.toString()}>
                        {cultura.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantidade_sementes">Quantidade de Sementes</Label>
                <Input
                  id="quantidade_sementes"
                  name="quantidade_sementes"
                  type="number"
                  min="1"
                  value={formData.quantidade_sementes}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="data_plantio">Data de Plantio</Label>
                <Input
                  id="data_plantio"
                  name="data_plantio"
                  type="date"
                  value={formData.data_plantio}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="localizacao">Localização</Label>
                <Input id="localizacao" name="localizacao" value={formData.localizacao} onChange={handleChange} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                name="observacoes"
                value={formData.observacoes}
                onChange={handleChange}
                rows={3}
              />
            </div>

            <div className="pt-4 flex justify-end">
              <Button type="submit" className="bg-green-600 hover:bg-green-700" disabled={loading}>
                {loading ? "Salvando..." : "Salvar Plantio"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
