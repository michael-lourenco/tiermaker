'use client'

import { useState, useEffect } from 'react'
import { PageWithSidebar } from '@/components/layout/PageWithSidebar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function BetaPageClient() {
  const [lastUpdated, setLastUpdated] = useState<string>('')

  useEffect(() => {
    // Avoid hydration mismatch by setting date only on client
    setLastUpdated(new Date().toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    }))
  }, [])

  return (
    <main className="min-h-screen p-4 sm:p-6 md:p-8">
      <PageWithSidebar showRightSidebar={true}>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3 flex-wrap">
              <CardTitle className="text-2xl sm:text-3xl md:text-4xl font-bold">
                Versão Beta
              </CardTitle>
              <Badge className="bg-[#F5F5DC] text-black border-[#E0E0C0] font-semibold text-lg px-3 py-1">
                BETA
              </Badge>
            </div>
            {lastUpdated && (
              <p className="text-sm text-muted-foreground mt-2">
                Última atualização: {lastUpdated}
              </p>
            )}
          </CardHeader>
          <CardContent className="prose prose-slate dark:prose-invert max-w-none">
            <div className="space-y-6">
              <section>
                <h2 className="text-xl font-semibold mb-3">O que é a Versão Beta?</h2>
                <p className="text-muted-foreground">
                  O SuperTierMaker está atualmente em <strong>versão beta</strong>, o que significa que estamos 
                  constantemente melhorando e aprimorando a plataforma com base no feedback dos usuários. 
                  Esta versão permite que você teste todas as funcionalidades disponíveis, enquanto continuamos 
                  desenvolvendo novas features e refinando a experiência.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">Por que liberamos uma versão beta?</h2>
                <p className="text-muted-foreground mb-3">
                  Decidimos liberar esta versão beta para:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li><strong>Coletar feedback valioso:</strong> Sua opinião é essencial para melhorar a plataforma</li>
                  <li><strong>Testar em condições reais:</strong> Permitir que usuários reais usem o sistema ajuda a identificar problemas e oportunidades de melhoria</li>
                  <li><strong>Desenvolver recursos com base nas necessidades:</strong> Aprendemos quais features são mais importantes para você</li>
                  <li><strong>Garantir estabilidade:</strong> Identificar e corrigir bugs antes da versão final</li>
                  <li><strong>Otimizar a experiência:</strong> Melhorar a usabilidade baseada no uso real</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">O que você pode esperar?</h2>
                <p className="text-muted-foreground mb-3">
                  Durante a versão beta:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li><strong>Funcionalidades completas:</strong> Todas as features principais estão disponíveis e funcionais</li>
                  <li><strong>Melhorias contínuas:</strong> Regularmente adicionamos novos recursos e corrigimos problemas</li>
                  <li><strong>Possíveis instabilidades:</strong> Podem ocorrer alguns bugs ou mudanças enquanto refinamos o sistema</li>
                  <li><strong>Suporte ativo:</strong> Estamos sempre trabalhando para resolver problemas rapidamente</li>
                  <li><strong>Novas features:</strong> Você será um dos primeiros a experimentar novas funcionalidades</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">Como você pode ajudar?</h2>
                <p className="text-muted-foreground mb-3">
                  Sua participação é fundamental para o sucesso da plataforma:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li><strong>Use a plataforma:</strong> Explore todas as funcionalidades e crie seus templates e tier lists</li>
                  <li><strong>Reporte problemas:</strong> Se encontrar bugs ou comportamentos inesperados, entre em contato</li>
                  <li><strong>Compartilhe feedback:</strong> Sua opinião sobre o que funciona bem e o que pode melhorar é muito valiosa</li>
                  <li><strong>Seja paciente:</strong> Estamos trabalhando duro para tornar a experiência cada vez melhor</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">Quando será a versão final?</h2>
                <p className="text-muted-foreground">
                  Não temos uma data específica para o lançamento da versão final. Estamos focados em 
                  criar a melhor experiência possível com base no feedback dos usuários. Quando sentirmos 
                  que a plataforma está estável, polida e atende às necessidades dos usuários, faremos 
                  a transição para a versão final. Até lá, continuaremos melhorando e adicionando recursos 
                  baseados no seu feedback.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">Agradecimento</h2>
                <p className="text-muted-foreground">
                  Agradecemos por fazer parte desta jornada e por nos ajudar a construir uma plataforma 
                  melhor. Seu apoio e feedback são essenciais para o sucesso do SuperTierMaker!
                </p>
              </section>

              <section className="pt-4 border-t">
                <div className="flex gap-3 flex-wrap">
                  <Link href="/">
                    <Button variant="default">
                      Voltar para Início
                    </Button>
                  </Link>
                  <Link href="/create-template">
                    <Button variant="outline">
                      Criar Template
                    </Button>
                  </Link>
                </div>
              </section>
            </div>
          </CardContent>
        </Card>
      </PageWithSidebar>
    </main>
  )
}
