'use client'

import { useState, useEffect } from 'react'
import { PageWithSidebar } from '@/components/layout/PageWithSidebar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function PrivacyPage() {
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
            <CardTitle className="text-2xl sm:text-3xl md:text-4xl font-bold">
              Política de Privacidade
            </CardTitle>
            {lastUpdated && (
              <p className="text-sm text-muted-foreground mt-2">
                Última atualização: {lastUpdated}
              </p>
            )}
          </CardHeader>
          <CardContent className="prose prose-slate dark:prose-invert max-w-none">
            <div className="space-y-6">
              <section>
                <h2 className="text-xl font-semibold mb-3">1. Introdução</h2>
                <p className="text-muted-foreground">
                  Esta Política de Privacidade descreve como o SuperTierMaker ("nós", "nosso" ou "aplicativo") 
                  coleta, usa e protege suas informações pessoais quando você utiliza nosso serviço. 
                  Ao usar o SuperTierMaker, você concorda com a coleta e uso de informações de acordo com esta política.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">2. Informações que Coletamos</h2>
                <p className="text-muted-foreground mb-3">
                  Coletamos as seguintes informações quando você usa nosso serviço:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li><strong>Informações de Conta:</strong> Email, senha (criptografada) e informações do perfil</li>
                  <li><strong>Conteúdo Criado:</strong> Templates, tier lists e outras informações que você cria usando o serviço</li>
                  <li><strong>Dados de Uso:</strong> Informações sobre como você interage com o aplicativo</li>
                  <li><strong>Informações Técnicas:</strong> Endereço IP, tipo de navegador, dispositivo e dados de navegação</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">3. Como Usamos suas Informações</h2>
                <p className="text-muted-foreground mb-3">
                  Utilizamos as informações coletadas para:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>Fornecer, manter e melhorar nossos serviços</li>
                  <li>Comunicar-nos com você sobre atualizações e suporte</li>
                  <li>Personalizar sua experiência no aplicativo</li>
                  <li>Analisar o uso do serviço para melhorias</li>
                  <li>Detectar e prevenir atividades fraudulentas</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">4. Compartilhamento de Informações</h2>
                <p className="text-muted-foreground">
                  Não vendemos suas informações pessoais. Podemos compartilhar informações apenas nas seguintes situações:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4 mt-3">
                  <li><strong>Prestadores de Serviços:</strong> Com provedores de serviços que nos ajudam a operar o aplicativo (como hospedagem)</li>
                  <li><strong>Conteúdo Público:</strong> Templates e tier lists que você escolhe tornar públicos podem ser visualizados por outros usuários</li>
                  <li><strong>Obrigações Legais:</strong> Quando exigido por lei ou para proteger nossos direitos legais</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">5. Segurança dos Dados</h2>
                <p className="text-muted-foreground">
                  Implementamos medidas de segurança técnicas e organizacionais adequadas para proteger suas informações 
                  pessoais contra acesso não autorizado, alteração, divulgação ou destruição. No entanto, nenhum método 
                  de transmissão pela Internet ou armazenamento eletrônico é 100% seguro.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">6. Seus Direitos</h2>
                <p className="text-muted-foreground mb-3">
                  Você tem os seguintes direitos sobre suas informações pessoais:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li><strong>Acesso:</strong> Solicitar uma cópia das informações que temos sobre você</li>
                  <li><strong>Correção:</strong> Solicitar a correção de informações imprecisas</li>
                  <li><strong>Exclusão:</strong> Solicitar a exclusão de suas informações pessoais</li>
                  <li><strong>Portabilidade:</strong> Solicitar a transferência de seus dados</li>
                  <li><strong>Oposição:</strong> Opor-se ao processamento de suas informações em certas circunstâncias</li>
                </ul>
                <p className="text-muted-foreground mt-3">
                  Para exercer esses direitos, entre em contato conosco através das informações de contato fornecidas abaixo.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">7. Cookies e Tecnologias Similares</h2>
                <p className="text-muted-foreground">
                  Utilizamos cookies e tecnologias similares para melhorar sua experiência, analisar o uso do serviço 
                  e personalizar conteúdo. Você pode controlar cookies através das configurações do seu navegador.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">8. Retenção de Dados</h2>
                <p className="text-muted-foreground">
                  Mantemos suas informações pessoais apenas pelo tempo necessário para cumprir os propósitos descritos 
                  nesta política, a menos que um período de retenção mais longo seja exigido ou permitido por lei.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">9. Privacidade de Menores</h2>
                <p className="text-muted-foreground">
                  Nossos serviços não são dirigidos a menores de 18 anos. Não coletamos intencionalmente informações 
                  pessoais de menores. Se você é pai ou responsável e acredita que seu filho nos forneceu informações 
                  pessoais, entre em contato conosco.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">10. Alterações nesta Política</h2>
                <p className="text-muted-foreground">
                  Podemos atualizar esta Política de Privacidade periodicamente. Notificaremos você sobre mudanças 
                  significativas publicando a nova política nesta página e atualizando a data de "Última atualização".
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">11. Contato</h2>
                <p className="text-muted-foreground">
                  Se você tiver dúvidas sobre esta Política de Privacidade ou sobre como tratamos suas informações pessoais, 
                  entre em contato conosco através do seu perfil no aplicativo ou pela página de contato.
                </p>
              </section>
            </div>
          </CardContent>
        </Card>
      </PageWithSidebar>
    </main>
  )
}
