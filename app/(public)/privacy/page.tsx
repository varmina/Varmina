import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Política de Privacidad | Varmina',
    description: 'Conoce cómo protegemos tus datos personales en Varmina. Política de privacidad y tratamiento de información.',
};

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-stone-50 dark:bg-stone-950">
            {/* Hero */}
            <div className="relative py-20 md:py-28 bg-white dark:bg-stone-900 border-b border-stone-100 dark:border-stone-800">
                <div className="max-w-4xl mx-auto px-6 md:px-16 text-center">
                    <div className="w-12 h-px bg-gold-400 mx-auto mb-6" />
                    <h1 className="font-serif text-3xl md:text-5xl tracking-[0.15em] text-stone-900 dark:text-white uppercase">
                        Política de Privacidad
                    </h1>
                    <p className="mt-4 text-sm text-stone-500 dark:text-stone-400 max-w-xl mx-auto leading-relaxed">
                        Última actualización: Abril 2026
                    </p>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-3xl mx-auto px-6 md:px-16 py-16 md:py-24">
                <div className="space-y-12">

                    <section className="space-y-4">
                        <h2 className="text-[10px] font-bold uppercase tracking-[0.25em] text-gold-600">1. Información que Recopilamos</h2>
                        <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                            En Varmina, respetamos tu privacidad. La información que podemos recopilar incluye:
                        </p>
                        <ul className="space-y-2 text-xs text-stone-600 dark:text-stone-400 leading-relaxed pl-4">
                            <li className="flex items-start gap-2">
                                <span className="w-1 h-1 rounded-full bg-gold-500 mt-1.5 flex-shrink-0" />
                                <strong className="text-stone-900 dark:text-white">Datos de contacto:</strong> Nombre, número de teléfono y correo electrónico proporcionados voluntariamente al comunicarte con nosotros.
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="w-1 h-1 rounded-full bg-gold-500 mt-1.5 flex-shrink-0" />
                                <strong className="text-stone-900 dark:text-white">Datos de envío:</strong> Dirección de despacho proporcionada al momento de coordinar la entrega de tu pedido.
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="w-1 h-1 rounded-full bg-gold-500 mt-1.5 flex-shrink-0" />
                                <strong className="text-stone-900 dark:text-white">Datos de navegación:</strong> Información técnica como dirección IP, tipo de navegador y páginas visitadas, recopilada automáticamente con fines analíticos.
                            </li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-[10px] font-bold uppercase tracking-[0.25em] text-gold-600">2. Uso de la Información</h2>
                        <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                            Utilizamos tu información personal exclusivamente para:
                        </p>
                        <ul className="space-y-2 text-xs text-stone-600 dark:text-stone-400 leading-relaxed pl-4">
                            <li className="flex items-start gap-2">
                                <span className="w-1 h-1 rounded-full bg-gold-500 mt-1.5 flex-shrink-0" />
                                Procesar y coordinar tus pedidos y envíos.
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="w-1 h-1 rounded-full bg-gold-500 mt-1.5 flex-shrink-0" />
                                Comunicarnos contigo respecto a consultas y soporte post-venta.
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="w-1 h-1 rounded-full bg-gold-500 mt-1.5 flex-shrink-0" />
                                Mejorar la experiencia de navegación y funcionalidad del sitio.
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="w-1 h-1 rounded-full bg-gold-500 mt-1.5 flex-shrink-0" />
                                Enviarte información promocional, solo si has dado tu consentimiento previo.
                            </li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-[10px] font-bold uppercase tracking-[0.25em] text-gold-600">3. Protección de Datos</h2>
                        <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                            Implementamos medidas de seguridad técnicas y organizativas para proteger tu información personal contra acceso no autorizado, alteración, divulgación o destrucción. Tu información se almacena en servidores seguros y no se comparte con terceros, salvo cuando sea estrictamente necesario para procesar tu pedido (por ejemplo, empresas de courier para el despacho).
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-[10px] font-bold uppercase tracking-[0.25em] text-gold-600">4. Cookies y Tecnologías Similares</h2>
                        <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                            Nuestro sitio puede utilizar cookies y tecnologías de seguimiento para mejorar tu experiencia de navegación y con fines analíticos. Las cookies son pequeños archivos de texto que se almacenan en tu dispositivo. Puedes configurar tu navegador para rechazar las cookies, aunque esto podría afectar la funcionalidad del sitio.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-[10px] font-bold uppercase tracking-[0.25em] text-gold-600">5. Servicios de Terceros</h2>
                        <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                            Podemos utilizar servicios de terceros como Google Analytics para el análisis de tráfico y WhatsApp para la comunicación con clientes. Estos servicios tienen sus propias políticas de privacidad que te recomendamos revisar. No somos responsables por las prácticas de privacidad de estos servicios.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-[10px] font-bold uppercase tracking-[0.25em] text-gold-600">6. Tus Derechos</h2>
                        <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                            De acuerdo con la legislación chilena de protección de datos personales, tienes derecho a:
                        </p>
                        <ul className="space-y-2 text-xs text-stone-600 dark:text-stone-400 leading-relaxed pl-4">
                            <li className="flex items-start gap-2">
                                <span className="w-1 h-1 rounded-full bg-gold-500 mt-1.5 flex-shrink-0" />
                                Acceder a tus datos personales en posesión de Varmina.
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="w-1 h-1 rounded-full bg-gold-500 mt-1.5 flex-shrink-0" />
                                Solicitar la rectificación de datos inexactos.
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="w-1 h-1 rounded-full bg-gold-500 mt-1.5 flex-shrink-0" />
                                Solicitar la eliminación de tus datos cuando ya no sean necesarios.
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="w-1 h-1 rounded-full bg-gold-500 mt-1.5 flex-shrink-0" />
                                Revocar tu consentimiento para comunicaciones promocionales en cualquier momento.
                            </li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-[10px] font-bold uppercase tracking-[0.25em] text-gold-600">7. Menores de Edad</h2>
                        <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                            Nuestro sitio no está dirigido a menores de 18 años. No recopilamos conscientemente información personal de menores. Si eres padre o tutor y crees que tu hijo nos ha proporcionado información personal, contáctanos para que podamos eliminarla.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-[10px] font-bold uppercase tracking-[0.25em] text-gold-600">8. Cambios a esta Política</h2>
                        <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                            Nos reservamos el derecho de actualizar esta política de privacidad en cualquier momento. Los cambios serán efectivos desde su publicación en esta página. Te recomendamos revisar esta política periódicamente para mantenerte informado.
                        </p>
                    </section>

                    <section className="space-y-4 pt-8 border-t border-stone-200 dark:border-stone-800">
                        <h2 className="text-[10px] font-bold uppercase tracking-[0.25em] text-gold-600">Contacto</h2>
                        <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                            Si tienes preguntas o inquietudes sobre nuestra política de privacidad, puedes contactarnos en <a href="mailto:varminamail@gmail.com" className="text-gold-600 hover:text-gold-500 transition-colors">varminamail@gmail.com</a>.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
