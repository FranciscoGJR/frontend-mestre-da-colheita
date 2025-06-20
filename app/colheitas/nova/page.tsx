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
import { ArrowLeft, Plus, Trash2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { fetchApi } from "@/lib/api"

interface Cultura {
  id: number
  nome: string
}

interface Plantio {
  id: number
  id_cultura: number
  status: string
}

interface ColheitaItem {
  qualidade: string
  quantidade: number
}

export default function NovaColheitaPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [plantios, setPlantios] = useState<Plantio[]>([])
  const [culturas, setCulturas] = useState<Cultura[]>([])
  const [loadingPlantios, setLoadingPlantios] = useState(true)

  const [formData, setFormData] = useState({
    id_usuario: 1, // Campo obrigatório adicionado
    id_plantio: 0,
    data_colheita: new Date().toISOString().split("T")[0],
    observacoes: "",
    itens: [{ qualidade: "normal", quantidade: 0 }] as ColheitaItem[],
    foto_url: "", // Campo obrigatório adicionado
  })

  useEffect(() => {
    async function fetchData() {
      try {
        const [plantiosData, culturasData] = await Promise.all([
          fetchApi("/plantios"),
          fetchApi("/culturas"),
        ])

        // Cria um mapa para lookup rápido de cultura por id
        const culturaMap = new Map<number, any>()
        culturasData.forEach((c: any) => culturaMap.set(c.id, c))

        // Filtra plantios prontos para colher (data atual >= data de plantio + tempo_crescimento)
        const hoje = new Date()
        const plantiosElegiveis = plantiosData.filter((p: any) => {
          const cultura = culturaMap.get(p.id_cultura)
          if (!cultura) return false
          const dataPlantio = new Date(p.data_plantio)
          const dataColheita = new Date(dataPlantio)
          dataColheita.setDate(dataColheita.getDate() + cultura.tempo_crescimento)
          return hoje >= dataColheita
        })

        setPlantios(plantiosElegiveis)
        setCulturas(culturasData)
      } catch (err) {
        console.error("Erro ao carregar dados:", err)
      } finally {
        setLoadingPlantios(false)
      }
    }

    fetchData()
  }, [])

  const getNomeCultura = (idPlantio: number) => {
    const plantio = plantios.find((p) => p.id === idPlantio)
    if (!plantio) return ""

    const cultura = culturas.find((c) => c.id === plantio.id_cultura)
    return cultura ? cultura.nome : ""
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleSelectChange = (name: string, value: string) => {
    if (name === "id_plantio") {
      // Garantir que o id_plantio seja um número
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

  const handleItemChange = (index: number, field: keyof ColheitaItem, value: string | number) => {
    const newItens = [...formData.itens]
    if (field === "quantidade") {
      newItens[index][field] = Number.parseInt(value as string) || 0
    } else {
      newItens[index][field] = value as string
    }
    setFormData({
      ...formData,
      itens: newItens,
    })
  }

  const addItem = () => {
    setFormData({
      ...formData,
      itens: [...formData.itens, { qualidade: "normal", quantidade: 0 }],
    })
  }

  const removeItem = (index: number) => {
    if (formData.itens.length <= 1) {
      return
    }
    const newItens = [...formData.itens]
    newItens.splice(index, 1)
    setFormData({
      ...formData,
      itens: newItens,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Verificar se id_plantio é um número válido
      if (!formData.id_plantio) {
        throw new Error("Selecione um plantio válido")
      }

      // Log para debug
      console.log("Enviando dados:", JSON.stringify(formData, null, 2))

      await fetchApi("/colheitas", {
        method: "POST",
        body: JSON.stringify(formData),
      })
      router.push("/colheitas")
    } catch (err) {
      if (err instanceof Error) {
        setError(`Erro ao criar colheita: ${err.message}`)
      } else {
        setError("Erro ao criar colheita. Verifique os dados e tente novamente.")
      }
      console.error("Erro completo:", err)
    } finally {
      setLoading(false)
    }
  }

  const qualidades = ["normal", "prata", "ouro", "iridio"]

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button variant="ghost" onClick={() => router.back()} className="mr-4 text-white">
          <ArrowLeft className="h-4 w-4 mr-2 text-white" />
          Voltar
        </Button>
        <h1 className="text-3xl font-bold tracking-tight text-green-700">Nova Colheita</h1>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Dados da Colheita</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="id_plantio">Plantio</Label>
                <Select
                  disabled={loadingPlantios}
                  onValueChange={(value) => handleSelectChange("id_plantio", value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um plantio" />
                  </SelectTrigger>
                  <SelectContent>
                    {plantios.length === 0 ? (
                      // Não use SelectItem para mensagem, use um div ou span
                      <div className="bg-white px-4 py-2 text-muted-foreground text-sm">
                        Não existe plantio pronto para colher
                      </div>
                    ) : (
                      plantios.map((plantio) => (
                        <SelectItem key={plantio.id} value={plantio.id.toString()}>
                          Plantio #{plantio.id} - {getNomeCultura(plantio.id)}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="data_colheita">Data da Colheita</Label>
                <Input
                  id="data_colheita"
                  name="data_colheita"
                  type="date"
                  value={formData.data_colheita}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Itens Colhidos</Label>
                <Button type="button" variant="outline" size="sm" onClick={addItem}>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Item
                </Button>
              </div>

              <div className="space-y-2">
                {formData.itens.map((item, index) => (
                  <div key={index} className="flex items-end gap-2 p-2 border rounded-md">
                    <div className="flex-1 space-y-2">
                      <Label>Qualidade</Label>
                      <Select
                        value={item.qualidade}
                        onValueChange={(value) => handleItemChange(index, "qualidade", value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {qualidades.map((qualidade) => (
                            <SelectItem key={qualidade} value={qualidade}>
                              {qualidade.charAt(0).toUpperCase() + qualidade.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex-1 space-y-2">
                      <Label>Quantidade</Label>
                      <Input
                        type="number"
                        min="1"
                        value={item.quantidade}
                        onChange={(e) => handleItemChange(index, "quantidade", e.target.value)}
                        required
                      />
                    </div>

                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      onClick={() => removeItem(index)}
                      disabled={formData.itens.length <= 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
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
                {loading ? "Salvando..." : "Salvar Colheita"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
