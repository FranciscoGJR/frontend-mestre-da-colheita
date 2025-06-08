"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart3, Home, Leaf, SproutIcon as Seedling, Sprout, Calculator } from "lucide-react"

export function Sidebar() {
  const pathname = usePathname()

  const navigation = [
    { name: "Dashboard", href: "/", icon: Home },
    { name: "Culturas", href: "/culturas", icon: Leaf },
    { name: "Plantios", href: "/plantios", icon: Seedling },
    { name: "Colheitas", href: "/colheitas", icon: Sprout },
    { name: "Histórico", href: "/relatorios", icon: BarChart3 },
    { name: "Simulador", href: "/simulador", icon: Calculator },
  ]

  return (
    <div className="hidden md:flex md:flex-col md:w-64 md:fixed md:inset-y-0 bg-green-700 z-10">
      <div className="flex flex-col flex-grow pt-5 overflow-y-auto">
        <div className="flex items-center flex-shrink-0 px-4">
          <h1 className="text-xl font-bold text-white">Mestre da Colheita</h1>
        </div>
        <div className="mt-5 flex-1 flex flex-col">
          <nav className="flex-1 px-2 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  group flex items-center px-2 py-2 text-sm font-medium rounded-md
                  ${pathname === item.href ? "bg-green-800 text-white" : "text-green-100 hover:bg-green-600"}
                `}
              >
                <item.icon className="mr-3 h-5 w-5 text-green-200" aria-hidden="true" />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </div>
  )
}
