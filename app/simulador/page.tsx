"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Calculator } from "lucide-react"
import { fetchApi } from "@/lib/api"

interface Cultura {
  id: number
  nome: string
}

interface SimulacaoResultado {
  lucro_estimado: number
  dias_ciclo: number
}

export default function SimuladorPage() {
  const [culturas, setCulturas] = useState<Cultura[]>([])
  const [loadingCulturas, setLoadingCulturas] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resultado, setResultado] = useState<SimulacaoResultado | null>(null)

  const [formData, setFormData] = useState({
    id_cultura: "",
    quantidade: 1,
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target

    if (type === "number") {
      setFormData({
        ...formData,
        [name]: Number.parseInt(value) || 1,
      })
    } else {
      setFormData({
        ...formData,
        [name]: value,
      })
    }
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setResultado(null)

    try {
      const data = await fetchApi("/simulador", {
        method: "POST",
        body: JSON.stringify({
          id_cultura: Number.parseInt(formData.id_cultura),
          quantidade: formData.quantidade,
        }),
      })
      setResultado(data)
    } catch (err) {
      setError("Erro ao simular lucro. Verifique os dados e tente novamente.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-green-700">Simulador de Lucro</h1>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Parâmetros da Simulação</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
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
                <Label htmlFor="quantidade">Quantidade</Label>
                <Input
                  id="quantidade"
                  name="quantidade"
                  type="number"
                  min="1"
                  value={formData.quantidade}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="pt-4">
                <Button
                  type="submit"
                  className="w-full bg-green-600 hover:bg-green-700"
                  disabled={loading || !formData.id_cultura}
                >
                  <Calculator className="mr-2 h-4 w-4" />
                  {loading ? "Calculando..." : "Calcular Lucro Estimado"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {resultado && (
          <Card>
            <CardHeader>
              <CardTitle>Resultado da Simulação</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Lucro Estimado</h3>
                <p className="text-3xl font-bold text-green-700">
                  R$ {resultado.lucro_estimado.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Duração do Ciclo</h3>
                <p className="text-xl">{resultado.dias_ciclo} dias</p>
              </div>

              <div className="pt-2">
                <Alert className="bg-amber-50 border-amber-200">
                  <AlertTitle className="text-amber-800">Informação</AlertTitle>
                  <AlertDescription className="text-amber-700">
                    Esta é uma estimativa baseada em condições ideais. O lucro real pode variar dependendo de fatores
                    como clima, qualidade do solo e cuidados durante o cultivo.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
