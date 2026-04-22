import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Términos y Condiciones | Varmina',
    description: 'Lee los términos y condiciones de uso de Varmina, incluyendo políticas de compra, propiedad intelectual y uso del sitio.',
};

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-stone-50 dark:bg-stone-950">
            {/* Hero */}
            <div className="relative py-20 md:py-28 bg-white dark:bg-stone-900 border-b border-stone-100 dark:border-stone-800">
                <div className="max-w-4xl mx-auto px-6 md:px-16 text-center">
                    <div className="w-12 h-px bg-gold-400 mx-auto mb-6" />
                    <h1 className="font-serif text-3xl md:text-5xl tracking-[0.15em] text-stone-900 dark:text-white uppercase">
                        Términos y Condiciones
                    </h1>
                    <p className="mt-4 text-sm text-stone-500 dark:text-stone-400 max-w-xl mx-auto leading-relaxed">
                        Última actualización: Abril 2026
                    </p>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-3xl mx-auto px-6 md:px-16 py-16 md:py-24">
                <div className="prose-varmina space-y-12">

                    <section className="space-y-4">
                        <h2 className="text-[10px] font-bold uppercase tracking-[0.25em] text-gold-600">1. Generalidades</h2>
                        <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                            Al acceder y utilizar el sitio web de Varmina (en adelante, &ldquo;el Sitio&rdquo;), aceptas estos términos y condiciones en su totalidad. Si no estás de acuerdo con alguno de estos términos, te pedimos que no utilices el Sitio. Varmina se reserva el derecho de modificar estos términos en cualquier momento, siendo la versión vigente la publicada en esta página.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-[10px] font-bold uppercase tracking-[0.25em] text-gold-600">2. Productos y Disponibilidad</h2>
                        <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                            Las imágenes de los productos son referenciales y pueden presentar leves variaciones respecto al producto final, inherentes al proceso artesanal de fabricación. Los precios exhibidos están expresados en pesos chilenos (CLP) e incluyen IVA cuando corresponda. Varmina se reserva el derecho de modificar precios sin previo aviso.
                        </p>
                        <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                            La disponibilidad de los productos está sujeta a stock. En caso de que un producto no esté disponible tras la confirmación del pedido, te contactaremos para ofrecerte alternativas o el reembolso correspondiente.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-[10px] font-bold uppercase tracking-[0.25em] text-gold-600">3. Proceso de Compra</h2>
                        <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                            El proceso de compra se realiza a través de cotización vía WhatsApp. Al seleccionar productos y solicitar una cotización, recibirás confirmación de disponibilidad y precio final. La transacción se perfecciona una vez realizado el pago y confirmada la recepción del mismo por parte de Varmina.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-[10px] font-bold uppercase tracking-[0.25em] text-gold-600">4. Envíos</h2>
                        <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                            Los plazos de entrega son estimados y pueden verse afectados por factores externos como feriados, condiciones climáticas o contingencias del servicio de courier. Varmina no se hace responsable por retrasos imputables a terceros, aunque se compromete a gestionar la solución de cualquier inconveniente.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-[10px] font-bold uppercase tracking-[0.25em] text-gold-600">5. Devoluciones y Cambios</h2>
                        <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                            Las devoluciones y cambios se rigen por nuestra política específica, disponible en la sección &ldquo;Envíos y Devoluciones&rdquo; de este sitio. Los productos personalizados o fabricados por encargo no admiten devolución, salvo que presenten defectos de fabricación.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-[10px] font-bold uppercase tracking-[0.25em] text-gold-600">6. Propiedad Intelectual</h2>
                        <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                            Todo el contenido del Sitio, incluyendo pero no limitado a textos, imágenes, diseños, logotipos, nombres comerciales y código fuente, es propiedad exclusiva de Varmina o de sus respectivos titulares y está protegido por las leyes de propiedad intelectual vigentes. Queda prohibida su reproducción, distribución o uso sin autorización previa por escrito.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-[10px] font-bold uppercase tracking-[0.25em] text-gold-600">7. Limitación de Responsabilidad</h2>
                        <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                            Varmina no será responsable por daños indirectos, incidentales o consecuentes derivados del uso del Sitio o de la imposibilidad de acceder al mismo. El Sitio se proporciona &ldquo;tal cual&rdquo; y &ldquo;según disponibilidad&rdquo;, sin garantías de ningún tipo, expresas o implícitas.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-[10px] font-bold uppercase tracking-[0.25em] text-gold-600">8. Ley Aplicable</h2>
                        <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                            Estos términos se rigen por la legislación vigente de la República de Chile. Cualquier controversia será sometida a la jurisdicción de los tribunales competentes de la ciudad de Santiago.
                        </p>
                    </section>

                    <section className="space-y-4 pt-8 border-t border-stone-200 dark:border-stone-800">
                        <h2 className="text-[10px] font-bold uppercase tracking-[0.25em] text-gold-600">Contacto</h2>
                        <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                            Para consultas sobre estos términos, puedes contactarnos a través de nuestro correo electrónico <a href="mailto:varminamail@gmail.com" className="text-gold-600 hover:text-gold-500 transition-colors">varminamail@gmail.com</a> o por WhatsApp.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
