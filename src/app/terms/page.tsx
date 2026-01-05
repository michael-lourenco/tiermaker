'use client'

import { useState, useEffect } from 'react'
import { PageWithSidebar } from '@/components/layout/PageWithSidebar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function TermsPage() {
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
              Termos de Uso
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
                <h2 className="text-xl font-semibold mb-3">1. Aceitação dos Termos</h2>
                <p className="text-muted-foreground">
                  Ao acessar e usar o SuperTierMaker ("nós", "nosso" ou "serviço"), você concorda em cumprir 
                  e estar vinculado a estes Termos de Uso. Se você não concorda com alguma parte destes termos, 
                  não deve usar nosso serviço.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">2. Descrição do Serviço</h2>
                <p className="text-muted-foreground mb-3">
                  O SuperTierMaker é uma plataforma online que permite aos usuários criar, organizar e compartilhar 
                  tier lists (listas hierárquicas) para diversos tópicos. O serviço oferece:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>Criação de templates personalizados</li>
                  <li>Organização de itens em tiers (categorias hierárquicas)</li>
                  <li>Compartilhamento público de tier lists</li>
                  <li>Armazenamento de seus templates e tier lists</li>
                  <li>Recursos premium com funcionalidades adicionais</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">3. Conta de Usuário</h2>
                <p className="text-muted-foreground mb-3">
                  Para usar certas funcionalidades do serviço, você precisa criar uma conta. Ao criar uma conta, você concorda em:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>Fornecer informações precisas, atuais e completas</li>
                  <li>Manter a segurança de sua senha</li>
                  <li>Ser responsável por todas as atividades que ocorrem em sua conta</li>
                  <li>Notificar-nos imediatamente sobre qualquer uso não autorizado de sua conta</li>
                  <li>Ter pelo menos 18 anos ou ter permissão de um responsável legal para usar o serviço</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">4. Uso Aceitável</h2>
                <p className="text-muted-foreground mb-3">
                  Você concorda em usar o serviço apenas para fins legais e de acordo com estes termos. Você não deve:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>Usar o serviço de forma que viole leis ou regulamentos aplicáveis</li>
                  <li>Infringir direitos de propriedade intelectual de terceiros</li>
                  <li>Publicar conteúdo difamatório, ofensivo, obsceno ou ilegal</li>
                  <li>Interferir ou interromper o funcionamento do serviço</li>
                  <li>Tentar acessar áreas não autorizadas do serviço</li>
                  <li>Usar o serviço para spam, phishing ou outras atividades maliciosas</li>
                  <li>Criar conteúdo que promova violência, ódio ou discriminação</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">5. Conteúdo do Usuário</h2>
                <p className="text-muted-foreground mb-3">
                  Você mantém todos os direitos sobre o conteúdo que cria e publica através do serviço. Ao fazer upload 
                  ou publicar conteúdo, você concede a nós uma licença não exclusiva, mundial, livre de royalties para:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>Armazenar, processar e exibir seu conteúdo no serviço</li>
                  <li>Permitir que outros usuários visualizem conteúdo que você torna público</li>
                  <li>Usar seu conteúdo para melhorar e operar o serviço</li>
                </ul>
                <p className="text-muted-foreground mt-3">
                  Você é responsável por garantir que tem todos os direitos necessários sobre o conteúdo que publica, 
                  incluindo imagens e outros materiais.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">6. Propriedade Intelectual</h2>
                <p className="text-muted-foreground">
                  O serviço e todo o conteúdo disponível através dele, incluindo mas não limitado a design, textos, 
                  gráficos, logos, ícones e software, são de propriedade do SuperTierMaker ou seus licenciadores e 
                  são protegidos por leis de propriedade intelectual. Você não pode copiar, modificar, distribuir ou 
                  criar trabalhos derivados sem autorização prévia por escrito.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">7. Assinaturas e Pagamentos</h2>
                <p className="text-muted-foreground mb-3">
                  O serviço oferece planos de assinatura com recursos adicionais. Ao assinar um plano premium:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>Você concorda em pagar as taxas descritas no momento da assinatura</li>
                  <li>As assinaturas são renovadas automaticamente conforme o período escolhido</li>
                  <li>Você pode cancelar sua assinatura a qualquer momento</li>
                  <li>O cancelamento entra em vigor no final do período de cobrança atual</li>
                  <li>Não oferecemos reembolsos para períodos já pagos</li>
                  <li>Reservamo-nos o direito de alterar os preços com aviso prévio</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">8. Limitação de Responsabilidade</h2>
                <p className="text-muted-foreground">
                  O serviço é fornecido "como está" e "conforme disponível". Não garantimos que o serviço será 
                  ininterrupto, seguro ou livre de erros. Em nenhuma circunstância seremos responsáveis por danos 
                  diretos, indiretos, incidentais, especiais ou consequenciais resultantes do uso ou impossibilidade 
                  de usar o serviço.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">9. Modificações do Serviço</h2>
                <p className="text-muted-foreground">
                  Reservamo-nos o direito de modificar, suspender ou descontinuar qualquer parte do serviço a qualquer 
                  momento, com ou sem aviso prévio. Não seremos responsáveis perante você ou terceiros por qualquer 
                  modificação, suspensão ou descontinuação do serviço.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">10. Rescisão</h2>
                <p className="text-muted-foreground mb-3">
                  Podemos encerrar ou suspender sua conta e acesso ao serviço imediatamente, sem aviso prévio ou 
                  responsabilidade, por qualquer motivo, incluindo se você violar estes Termos de Uso. Ao encerrar:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>Seu direito de usar o serviço cessará imediatamente</li>
                  <li>Podemos deletar sua conta e todo o conteúdo associado</li>
                  <li>Você permanece responsável por todas as obrigações até a data de rescisão</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">11. Alterações nos Termos</h2>
                <p className="text-muted-foreground">
                  Reservamo-nos o direito de modificar estes Termos de Uso a qualquer momento. Alterações significativas 
                  serão comunicadas através do serviço ou por email. O uso continuado do serviço após as alterações 
                  constitui sua aceitação dos novos termos.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">12. Lei Aplicável</h2>
                <p className="text-muted-foreground">
                  Estes Termos de Uso são regidos pelas leis brasileiras. Qualquer disputa relacionada a estes termos 
                  será resolvida nos tribunais competentes do Brasil.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">13. Disposições Gerais</h2>
                <p className="text-muted-foreground mb-3">
                  Se qualquer disposição destes termos for considerada inválida ou inexequível, as disposições restantes 
                  permanecerão em pleno vigor. Estes termos constituem o acordo completo entre você e o SuperTierMaker 
                  em relação ao uso do serviço.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">14. Contato</h2>
                <p className="text-muted-foreground">
                  Se você tiver dúvidas sobre estes Termos de Uso, entre em contato conosco através do seu perfil no 
                  aplicativo ou pela página de contato.
                </p>
              </section>
            </div>
          </CardContent>
        </Card>
      </PageWithSidebar>
    </main>
  )
}
