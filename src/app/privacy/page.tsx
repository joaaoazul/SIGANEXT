export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 p-6 sm:p-10 shadow-sm">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">Política de Privacidade</h1>
        <p className="text-sm text-gray-400 mb-8">Última atualização: 1 de março de 2026</p>

        <div className="prose prose-gray prose-sm max-w-none space-y-6 text-gray-700 dark:text-gray-300 leading-relaxed">

          {/* 1. Responsável */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">1. Responsável pelo Tratamento</h2>
            <p>
              A plataforma <strong>SIGA180</strong> é operada como ferramenta de gestão para Personal Trainers (PT) 
              e os seus atletas. O responsável pelo tratamento dos dados pessoais é o PT que utiliza a plataforma 
              para gerir os seus clientes, na qualidade de responsável pelo tratamento nos termos do artigo 4.º, n.º 7, 
              do Regulamento Geral sobre a Proteção de Dados (RGPD — Regulamento (UE) 2016/679).
            </p>
            <p>
              Para questões relacionadas com proteção de dados, pode contactar-nos através do email: 
              <strong> privacidade@siga180.pt</strong>
            </p>
          </section>

          {/* 2. Dados Recolhidos */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">2. Dados Pessoais Recolhidos</h2>
            <p>A plataforma recolhe e trata as seguintes categorias de dados pessoais:</p>
            
            <h3 className="text-base font-medium text-gray-800 mt-4">2.1 Dados de Identificação</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Nome completo, email, telefone</li>
              <li>Data de nascimento, género</li>
              <li>Fotografia de perfil (opcional)</li>
            </ul>

            <h3 className="text-base font-medium text-gray-800 mt-4">2.2 Dados de Saúde (Categoria Especial — Art. 9.º RGPD)</h3>
            <p className="text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm">
              ⚠️ Os seguintes dados são considerados <strong>dados sensíveis</strong> ao abrigo do Art. 9.º do RGPD 
              e são tratados exclusivamente com base no seu <strong>consentimento explícito</strong>.
            </p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Condições médicas, medicação, alergias, lesões, cirurgias</li>
              <li>Historial familiar de saúde</li>
              <li>Tensão arterial, frequência cardíaca</li>
              <li>Peso, altura, percentagem de gordura corporal</li>
              <li>Medidas corporais (peito, cintura, ancas, braços, etc.)</li>
              <li>IMC, taxa metabólica basal, idade metabólica</li>
              <li>Estado de humor, nível de energia, qualidade do sono, stress, dor muscular (check-ins diários)</li>
              <li>Restrições alimentares, alergias alimentares</li>
              <li>Fotos de progresso corporal</li>
            </ul>

            <h3 className="text-base font-medium text-gray-800 mt-4">2.3 Dados de Utilização</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Planos de treino e registos de exercícios</li>
              <li>Planos de nutrição e refeições</li>
              <li>Marcações e agendamentos</li>
              <li>Mensagens trocadas com o PT</li>
              <li>Dados de login e autenticação (passwords são armazenadas em formato hash, nunca em texto plano)</li>
            </ul>
          </section>

          {/* 3. Finalidade */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">3. Finalidades do Tratamento</h2>
            <p>Os dados pessoais são tratados para as seguintes finalidades:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Prestação do serviço de acompanhamento desportivo personalizado</li>
              <li>Criação e gestão de planos de treino e nutrição adequados</li>
              <li>Monitorização do progresso e evolução do atleta</li>
              <li>Comunicação entre PT e atleta através da plataforma</li>
              <li>Agendamento de sessões de treino</li>
              <li>Gestão da conta e autenticação</li>
            </ul>
          </section>

          {/* 4. Base Legal */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">4. Base Legal</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Consentimento explícito (Art. 6.º, n.º 1, al. a) e Art. 9.º, n.º 2, al. a) do RGPD)</strong> — 
                para o tratamento de dados de saúde e dados sensíveis.
              </li>
              <li>
                <strong>Execução de contrato (Art. 6.º, n.º 1, al. b) do RGPD)</strong> — 
                para a prestação do serviço de gestão desportiva.
              </li>
              <li>
                <strong>Interesse legítimo (Art. 6.º, n.º 1, al. f) do RGPD)</strong> — 
                para garantir a segurança da plataforma e prevenir fraude.
              </li>
            </ul>
          </section>

          {/* 5. Partilha de Dados */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">5. Partilha de Dados</h2>
            <p>Os dados pessoais são partilhados exclusivamente com:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>O seu Personal Trainer</strong> — que tem acesso aos seus dados para fins de acompanhamento desportivo</li>
              <li><strong>Supabase (PostgreSQL)</strong> — subprocessador para armazenamento de dados, com sede na UE/EEE</li>
              <li><strong>Resend</strong> — subprocessador para envio de emails transacionais</li>
            </ul>
            <p className="mt-2">
              Os dados <strong>não são vendidos, cedidos ou partilhados</strong> com terceiros para fins comerciais ou publicitários.
            </p>
          </section>

          {/* 6. Retenção */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">6. Período de Conservação</h2>
            <p>
              Os dados pessoais são conservados enquanto a conta estiver ativa e durante um período máximo de 
              <strong> 2 anos</strong> após a desativação da conta, salvo obrigações legais que exijam um prazo 
              diferente.
            </p>
            <p>
              Após o período de retenção, os dados são permanentemente eliminados dos nossos sistemas.
            </p>
          </section>

          {/* 7. Direitos */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">7. Os Seus Direitos</h2>
            <p>Ao abrigo do RGPD, tem os seguintes direitos:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Direito de acesso (Art. 15.º)</strong> — 
                Pode consultar todos os seus dados pessoais na plataforma a qualquer momento.
              </li>
              <li>
                <strong>Direito de retificação (Art. 16.º)</strong> — 
                Pode corrigir os seus dados nas definições da conta.
              </li>
              <li>
                <strong>Direito ao apagamento (Art. 17.º)</strong> — 
                Pode solicitar a eliminação da sua conta e todos os dados associados através das definições da conta.
              </li>
              <li>
                <strong>Direito à portabilidade (Art. 20.º)</strong> — 
                Pode exportar todos os seus dados em formato digital (JSON) através das definições da conta.
              </li>
              <li>
                <strong>Direito de retirar o consentimento</strong> — 
                Pode retirar o consentimento a qualquer momento, sem que isso comprometa a licitude 
                do tratamento efetuado antes da retirada.
              </li>
              <li>
                <strong>Direito de apresentar reclamação</strong> — 
                Pode apresentar reclamação junto da <strong>CNPD — Comissão Nacional de Proteção de Dados</strong> 
                (www.cnpd.pt).
              </li>
            </ul>
          </section>

          {/* 8. Segurança */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">8. Medidas de Segurança</h2>
            <p>Implementamos as seguintes medidas técnicas e organizativas:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Passwords encriptadas com hash bcrypt (12 rounds)</li>
              <li>Autenticação via tokens JWT com cookies httpOnly e flag secure</li>
              <li>Comunicações encriptadas via HTTPS/TLS</li>
              <li>Limitação de taxa (rate limiting) na API para prevenir ataques</li>
              <li>Controlo de acesso baseado em roles (PT / Atleta)</li>
              <li>Soft delete de dados (marcação em vez de eliminação imediata)</li>
            </ul>
          </section>

          {/* 9. Cookies */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">9. Cookies</h2>
            <p>
              A plataforma utiliza exclusivamente um <strong>cookie funcional</strong> (token de autenticação JWT) 
              necessário para o funcionamento da aplicação. Este cookie:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>É estritamente necessário para manter a sessão do utilizador</li>
              <li>Tem a flag <code>httpOnly</code> (não acessível por JavaScript)</li>
              <li>Tem a flag <code>secure</code> em produção (transmitido apenas via HTTPS)</li>
              <li>Expira automaticamente após 7 dias</li>
            </ul>
            <p className="mt-2">
              <strong>Não utilizamos</strong> cookies de analytics, publicidade ou tracking de terceiros.
            </p>
          </section>

          {/* 10. Alterações */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">10. Alterações à Política</h2>
            <p>
              Reservamo-nos o direito de atualizar esta política de privacidade. As alterações serão comunicadas 
              através da plataforma e/ou por email. A continuação da utilização do serviço após a notificação 
              constitui aceitação das alterações.
            </p>
          </section>

          {/* 11. Contacto */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">11. Contacto</h2>
            <p>
              Para exercer os seus direitos ou esclarecer dúvidas sobre proteção de dados, contacte-nos:
            </p>
            <ul className="list-none pl-0 space-y-1 mt-2">
              <li>📧 <strong>privacidade@siga180.pt</strong></li>
            </ul>
          </section>

        </div>

        <div className="mt-10 pt-6 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-400 text-center">
            Esta política cumpre o Regulamento (UE) 2016/679 (RGPD) e a Lei n.º 58/2019 de proteção de dados pessoais portuguesa.
          </p>
        </div>
      </div>
    </div>
  );
}
