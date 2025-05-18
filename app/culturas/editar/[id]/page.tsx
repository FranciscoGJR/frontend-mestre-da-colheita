"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft } from "lucide-react"
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

export default function EditarCulturaPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState<Cultura>({
    id: 0,
    nome: "",
    tempo_crescimento: 0,
    preco_normal: 0,
    preco_prata: 0,
    preco_ouro: 0,
    preco_iridio: 0,
    recorrente: false,
    produtividade_esperada: 0,
    preco_customizavel: false,
  })

  useEffect(() => {
    async function fetchCultura() {
      try {
        const data = await fetchApi(`/culturas/${params.id}`)
        setFormData(data)
      } catch (err) {
        setError("Erro ao carregar dados da cultura. Tente novamente mais tarde.")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchCultura()
  }, [params.id])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target

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

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData({
      ...formData,
      [name]: checked,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      await fetchApi(`/culturas/${params.id}`, {
        method: "PUT",
        body: JSON.stringify(formData),
      })
      router.push("/culturas")
    } catch (err) {
      setError("Erro ao atualizar cultura. Verifique os dados e tente novamente.")
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="flex justify-center items-center h-64">Carregando...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button variant="ghost" onClick={() => router.back()} className="mr-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <h1 className="text-3xl font-bold tracking-tight text-green-700">Editar Cultura</h1>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Dados da Cultura</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome da Cultura</Label>
                <Input id="nome" name="nome" value={formData.nome} onChange={handleChange} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tempo_crescimento">Tempo de Crescimento (dias)</Label>
                <Input
                  id="tempo_crescimento"
                  name="tempo_crescimento"
                  type="number"
                  min="1"
                  value={formData.tempo_crescimento}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="preco_normal">Preço Normal</Label>
                <Input
                  id="preco_normal"
                  name="preco_normal"
                  type="number"
                  min="0"
                  value={formData.preco_normal}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="preco_prata">Preço Prata</Label>
                <Input
                  id="preco_prata"
                  name="preco_prata"
                  type="number"
                  min="0"
                  value={formData.preco_prata}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="preco_ouro">Preço Ouro</Label>
                <Input
                  id="preco_ouro"
                  name="preco_ouro"
                  type="number"
                  min="0"
                  value={formData.preco_ouro}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="preco_iridio">Preço Irídio</Label>
                <Input
                  id="preco_iridio"
                  name="preco_iridio"
                  type="number"
                  min="0"
                  value={formData.preco_iridio}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="produtividade_esperada">Produtividade Esperada</Label>
                <Input
                  id="produtividade_esperada"
                  name="produtividade_esperada"
                  type="number"
                  min="0"
                  value={formData.produtividade_esperada}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="flex items-center space-x-8 pt-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="recorrente"
                  checked={formData.recorrente}
                  onCheckedChange={(checked) => handleCheckboxChange("recorrente", checked === true)}
                />
                <Label htmlFor="recorrente">Cultura Recorrente</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="preco_customizavel"
                  checked={formData.preco_customizavel}
                  onCheckedChange={(checked) => handleCheckboxChange("preco_customizavel", checked === true)}
                />
                <Label htmlFor="preco_customizavel">Preço Customizável</Label>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <Button type="submit" className="bg-green-600 hover:bg-green-700" disabled={saving}>
                {saving ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
