import Link from "next/link";

export const metadata = {
  title: "Acordo de Tratamento de Dados (DPA) | SIGA180",
};

export default function DPAPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link href="/login" className="text-emerald-600 hover:text-emerald-700 text-sm">&larr; Voltar</Link>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Acordo de Tratamento de Dados (DPA)</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">Data Processing Agreement — Art. 28.º do RGPD (Regulamento (UE) 2016/679) — Versão 1.0, Março 2026</p>

        <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-xl border border-gray-100 space-y-8 text-gray-700 dark:text-gray-300 text-sm leading-relaxed">

          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Preâmbulo</h2>
            <p>O presente Acordo de Tratamento de Dados (&quot;DPA&quot;) é celebrado entre:</p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li><strong>Responsável pelo tratamento (&quot;Controlador&quot;):</strong> O Personal Trainer registado na plataforma SIGA180, que determina as finalidades e os meios do tratamento dos dados pessoais dos seus clientes/atletas.</li>
              <li><strong>Subcontratante (&quot;Processador&quot;):</strong> joaoazuldev (João Azul), operador da plataforma SIGA180, que trata dados pessoais por conta do Controlador.</li>
            </ul>
            <p className="mt-2">Este DPA complementa os <Link href="/termos" className="text-emerald-600 underline">Termos de Serviço</Link> e a <Link href="/privacy" className="text-emerald-600 underline">Política de Privacidade</Link> da plataforma SIGA180.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">1. Objeto e Duração</h2>
            <p><strong>1.1.</strong> O Processador trata dados pessoais por conta do Controlador no âmbito da disponibilização da plataforma SIGA180 para gestão de clientes de personal training.</p>
            <p className="mt-2"><strong>1.2.</strong> O presente DPA tem a mesma duração que a relação contratual entre o Controlador e o Processador (utilização ativa da plataforma), acrescida do período de retenção de dados aplicável.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">2. Natureza e Finalidade do Tratamento</h2>
            <p><strong>2.1.</strong> O tratamento tem por finalidade:</p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>Armazenamento e gestão de dados de clientes/atletas</li>
              <li>Disponibilização de planos de treino e nutrição</li>
              <li>Registo de avaliações corporais e progressos</li>
              <li>Comunicação entre PT e atleta</li>
              <li>Gestão de marcações e agenda</li>
              <li>Manutenção de registos de auditoria para segurança</li>
            </ul>
            <p className="mt-2"><strong>2.2.</strong> Categorias de dados tratados: dados de identificação, dados de saúde (Art. 9.º RGPD), dados de contacto, dados de treino e nutrição, dados de avaliação corporal.</p>
            <p className="mt-2"><strong>2.3.</strong> Titulares dos dados: Clientes/atletas do Personal Trainer (Controlador).</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">3. Obrigações do Processador</h2>
            <p>O Processador compromete-se a:</p>
            <ul className="list-disc ml-6 mt-2 space-y-2">
              <li><strong>3.1.</strong> Tratar os dados pessoais apenas segundo as instruções documentadas do Controlador, incluindo transferências para países terceiros (Art. 28.º(3)(a)).</li>
              <li><strong>3.2.</strong> Garantir que as pessoas autorizadas a tratar dados se comprometeram à confidencialidade (Art. 28.º(3)(b)).</li>
              <li><strong>3.3.</strong> Implementar as medidas técnicas e organizativas adequadas nos termos do Art. 32.º do RGPD, incluindo:
                <ul className="list-disc ml-6 mt-1 space-y-1">
                  <li>Encriptação de dados em trânsito (TLS 1.2+)</li>
                  <li>Hashing de passwords com bcrypt (12 rounds)</li>
                  <li>Autenticação por JWT com cookies httpOnly + Secure</li>
                  <li>Rate limiting em endpoints sensíveis</li>
                  <li>Isolamento de dados por PT (managerId)</li>
                  <li>Audit logging de ações críticas</li>
                  <li>Security headers (CSP, HSTS, X-Frame-Options)</li>
                </ul>
              </li>
              <li><strong>3.4.</strong> Não recorrer a outro subcontratante sem autorização prévia por escrito do Controlador (Art. 28.º(2)). Os subcontratantes atuais são listados na Secção 7.</li>
              <li><strong>3.5.</strong> Auxiliar o Controlador no cumprimento dos direitos dos titulares (Art. 28.º(3)(e)) — a plataforma disponibiliza funcionalidades de acesso, exportação, retificação e eliminação de dados.</li>
              <li><strong>3.6.</strong> Auxiliar o Controlador a cumprir as obrigações dos Art. 32.º a 36.º, incluindo notificação de violações de dados.</li>
              <li><strong>3.7.</strong> Eliminar ou devolver todos os dados pessoais ao Controlador após o término da prestação do serviço, e apagar cópias existentes (Art. 28.º(3)(g)).</li>
              <li><strong>3.8.</strong> Disponibilizar ao Controlador todas as informações necessárias para demonstrar o cumprimento do Art. 28.º e permitir auditorias (Art. 28.º(3)(h)).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">4. Obrigações do Controlador</h2>
            <p>O Controlador (PT) compromete-se a:</p>
            <ul className="list-disc ml-6 mt-2 space-y-2">
              <li><strong>4.1.</strong> Garantir que tem base legal para o tratamento, incluindo obtenção de consentimento explícito dos seus clientes para o tratamento de dados de saúde (Art. 9.º(2)(a)).</li>
              <li><strong>4.2.</strong> Fornecer instruções lícitas ao Processador em conformidade com o RGPD.</li>
              <li><strong>4.3.</strong> Informar os seus clientes sobre o tratamento de dados, incluindo a identidade do Processador e dos subprocessadores.</li>
              <li><strong>4.4.</strong> Responder aos pedidos de exercício de direitos dos titulares, utilizando as ferramentas disponibilizadas pela plataforma.</li>
              <li><strong>4.5.</strong> Não introduzir na plataforma dados de categorias especiais para além do estritamente necessário ao serviço de personal training.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">5. Notificação de Violação de Dados</h2>
            <p><strong>5.1.</strong> O Processador notifica o Controlador sem demora injustificada, e quando possível no prazo de 24 horas, após tomar conhecimento de uma violação de dados pessoais (Art. 33.º(2)).</p>
            <p className="mt-2"><strong>5.2.</strong> A notificação incluirá:</p>
            <ul className="list-disc ml-6 mt-1 space-y-1">
              <li>Natureza da violação</li>
              <li>Categorias e número aproximado de titulares afetados</li>
              <li>Consequências prováveis</li>
              <li>Medidas adotadas ou propostas</li>
            </ul>
            <p className="mt-2"><strong>5.3.</strong> O Controlador é responsável por notificar a CNPD no prazo de 72 horas (Art. 33.º(1)) e, quando aplicável, os titulares afetados (Art. 34.º).</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">6. Transferências Internacionais</h2>
            <p><strong>6.1.</strong> Os dados são armazenados e processados na União Europeia (Supabase — Alemanha; Hetzner — Alemanha).</p>
            <p className="mt-2"><strong>6.2.</strong> O envio de emails transacionais utiliza o serviço Resend (EUA), sendo aplicáveis Cláusulas Contratuais-Tipo (SCCs) aprovadas pela Comissão Europeia.</p>
            <p className="mt-2"><strong>6.3.</strong> Não são efetuadas outras transferências para fora do EEE.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">7. Subprocessadores Autorizados</h2>
            <table className="w-full text-sm border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              <thead><tr className="bg-gray-50 dark:bg-gray-950"><th className="py-2 px-3 text-left">Subprocessador</th><th className="py-2 px-3 text-left">Função</th><th className="py-2 px-3 text-left">Localização</th></tr></thead>
              <tbody>
                <tr className="border-t border-gray-100"><td className="py-2 px-3">Supabase Inc. (AWS eu-central-1)</td><td className="py-2 px-3">Base de dados PostgreSQL gerida</td><td className="py-2 px-3">Frankfurt, Alemanha</td></tr>
                <tr className="border-t border-gray-100"><td className="py-2 px-3">Hetzner Online GmbH</td><td className="py-2 px-3">Servidor de aplicação (VPS)</td><td className="py-2 px-3">Nuremberga, Alemanha</td></tr>
                <tr className="border-t border-gray-100"><td className="py-2 px-3">Resend Inc.</td><td className="py-2 px-3">Envio de emails transacionais</td><td className="py-2 px-3">EUA (SCCs aplicáveis)</td></tr>
              </tbody>
            </table>
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">O Controlador será notificado por email em caso de adição ou substituição de subprocessadores, com antecedência mínima de 30 dias, podendo opor-se nos termos do Art. 28.º(2).</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">8. Retenção e Eliminação</h2>
            <p><strong>8.1.</strong> Dados ativos são conservados enquanto a conta do Controlador estiver ativa.</p>
            <p className="mt-2"><strong>8.2.</strong> Após eliminação de uma conta de cliente, os dados pessoais são anonimizados de imediato.</p>
            <p className="mt-2"><strong>8.3.</strong> Registos auxiliares (logs) são purgados automaticamente após 1 ano (audit logs) e 2 anos (registos de contas eliminadas).</p>
            <p className="mt-2"><strong>8.4.</strong> Após cessação do serviço, todos os dados do Controlador são eliminados no prazo de 30 dias, salvo obrigação legal em contrário.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">9. Disposições Finais</h2>
            <p><strong>9.1.</strong> O presente DPA é regido pela lei portuguesa e pelo RGPD.</p>
            <p className="mt-2"><strong>9.2.</strong> Em caso de conflito entre o DPA e os Termos de Serviço, prevalece o DPA no que respeita à proteção de dados pessoais.</p>
            <p className="mt-2"><strong>9.3.</strong> Qualquer litígio será submetido aos tribunais da comarca de Faro, Portugal.</p>
          </section>

          <section>
            <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200">
              <p className="text-sm"><strong>Versão:</strong> 1.0</p>
              <p className="text-sm"><strong>Data de entrada em vigor:</strong> Março 2026</p>
              <p className="text-sm"><strong>Contacto:</strong> rgpd@siga180.pt</p>
            </div>
          </section>

        </div>

        <div className="flex gap-4 mt-6 text-xs text-gray-400 justify-center">
          <Link href="/privacy" className="hover:text-emerald-600 transition">Privacidade</Link>
          <Link href="/cookies" className="hover:text-emerald-600 transition">Cookies</Link>
          <Link href="/termos" className="hover:text-emerald-600 transition">Termos</Link>
          <Link href="/dpia" className="hover:text-emerald-600 transition">AIPD</Link>
        </div>
      </div>
    </div>
  );
}
