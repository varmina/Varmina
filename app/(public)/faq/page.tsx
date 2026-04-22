import { Metadata } from 'next';
import { ChevronDown } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Preguntas Frecuentes | Varmina',
    description: 'Encuentra respuestas a las preguntas más comunes sobre nuestras joyas, envíos, devoluciones y más.',
};

interface FaqItem {
    q: string;
    a: string;
}

const faqSections: { title: string; items: FaqItem[] }[] = [
    {
        title: 'Productos',
        items: [
            {
                q: '¿Las joyas son de plata real?',
                a: 'Sí. Todas nuestras piezas son de Plata 925 certificada, también conocida como plata esterlina. Algunas piezas cuentan con baño de oro de 18k para un acabado premium.'
            },
            {
                q: '¿Puedo solicitar una joya personalizada?',
                a: 'Por supuesto. Contáctanos por WhatsApp con una descripción de lo que buscas y te asesoraremos sobre las opciones disponibles. Los pedidos personalizados pueden tomar entre 7 y 15 días hábiles.'
            },
            {
                q: '¿Qué significa "Por Encargo"?',
                a: 'Las piezas marcadas como "Por Encargo" no están disponibles en stock inmediato, pero se pueden fabricar especialmente para ti. El tiempo de elaboración varía según la pieza, generalmente entre 5 y 10 días hábiles.'
            },
            {
                q: '¿Las joyas incluyen algún empaque especial?',
                a: 'Sí. Cada pieza viene en un empaque premium con un estuche exclusivo Varmina, ideal para regalo o para guardar tu joya de forma segura.'
            },
        ]
    },
    {
        title: 'Pedidos y Envíos',
        items: [
            {
                q: '¿Cómo realizo un pedido?',
                a: 'Navega nuestro catálogo, agrega las piezas que te interesen a tu selección y solicita una cotización a través de WhatsApp. Te confirmaremos disponibilidad, precio final y opciones de envío.'
            },
            {
                q: '¿Cuáles son los tiempos de envío?',
                a: 'Los envíos dentro de Santiago se realizan en 1-2 días hábiles. Para regiones, el tiempo estimado es de 3-5 días hábiles. Todos los envíos incluyen seguimiento en tiempo real.'
            },
            {
                q: '¿Cuánto cuesta el envío?',
                a: 'El costo de envío varía según tu ubicación. Te informaremos el valor exacto al momento de confirmar tu pedido por WhatsApp. Periódicamente ofrecemos envío gratuito en promociones especiales.'
            },
            {
                q: '¿Realizan envíos internacionales?',
                a: 'Actualmente solo realizamos envíos dentro de Chile. Si estás en el extranjero, contáctanos y evaluaremos opciones caso a caso.'
            },
        ]
    },
    {
        title: 'Pagos y Devoluciones',
        items: [
            {
                q: '¿Qué métodos de pago aceptan?',
                a: 'Aceptamos transferencia bancaria, tarjetas de crédito/débito a través de links de pago seguros y pagos vía MercadoPago.'
            },
            {
                q: '¿Puedo devolver una pieza?',
                a: 'Sí. Tienes 10 días desde la recepción para solicitar un cambio o devolución, siempre que la pieza esté en su estado original y con su empaque. Consulta nuestra política completa de devoluciones para más detalles.'
            },
            {
                q: '¿Las joyas tienen garantía?',
                a: 'Todas nuestras piezas cuentan con garantía de calidad que cubre defectos de fabricación. Si notas algún problema, contáctanos dentro de los primeros 30 días y lo solucionaremos.'
            },
        ]
    },
    {
        title: 'Cuidado de Joyas',
        items: [
            {
                q: '¿Cómo debo cuidar mis joyas de plata?',
                a: 'Evita el contacto con perfumes, cremas y productos químicos. Limpia tus joyas con un paño de microfibra suave después de cada uso. Guárdalas en su estuche original cuando no las uses para evitar rayones y oxidación.'
            },
            {
                q: '¿Es normal que la plata se oscurezca?',
                a: 'Sí, es un proceso natural llamado oxidación. Puedes limpiar tus piezas con un paño especial para plata o con bicarbonato de sodio suave. Con el cuidado adecuado, tus joyas mantendrán su brillo original.'
            },
        ]
    },
];

export default function FaqPage() {
    return (
        <div className="min-h-screen bg-stone-50 dark:bg-stone-950">
            {/* Hero */}
            <div className="relative py-20 md:py-28 bg-white dark:bg-stone-900 border-b border-stone-100 dark:border-stone-800">
                <div className="max-w-4xl mx-auto px-6 md:px-16 text-center">
                    <div className="w-12 h-px bg-gold-400 mx-auto mb-6" />
                    <h1 className="font-serif text-3xl md:text-5xl tracking-[0.15em] text-stone-900 dark:text-white uppercase">
                        Preguntas Frecuentes
                    </h1>
                    <p className="mt-4 text-sm text-stone-500 dark:text-stone-400 max-w-xl mx-auto leading-relaxed">
                        Todo lo que necesitas saber sobre nuestras joyas, envíos y políticas.
                    </p>
                </div>
            </div>

            {/* FAQ Sections */}
            <div className="max-w-3xl mx-auto px-6 md:px-16 py-16 md:py-24 space-y-16">
                {faqSections.map((section, sIdx) => (
                    <div key={sIdx}>
                        <h2 className="text-[10px] font-bold uppercase tracking-[0.25em] text-gold-600 mb-8">
                            {section.title}
                        </h2>
                        <div className="space-y-0 border-t border-stone-200 dark:border-stone-800">
                            {section.items.map((item, iIdx) => (
                                <details
                                    key={iIdx}
                                    className="group border-b border-stone-200 dark:border-stone-800"
                                >
                                    <summary className="flex items-center justify-between py-5 cursor-pointer select-none list-none">
                                        <span className="text-sm font-bold text-stone-900 dark:text-white pr-4">
                                            {item.q}
                                        </span>
                                        <ChevronDown className="w-4 h-4 text-stone-400 transition-transform duration-300 group-open:rotate-180 flex-shrink-0" />
                                    </summary>
                                    <div className="pb-6 pr-8">
                                        <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                                            {item.a}
                                        </p>
                                    </div>
                                </details>
                            ))}
                        </div>
                    </div>
                ))}

                {/* Bottom CTA */}
                <div className="text-center pt-8 border-t border-stone-200 dark:border-stone-800">
                    <p className="text-sm text-stone-500 mb-4">¿No encontraste lo que buscabas?</p>
                    <a
                        href="https://wa.me/56944106742?text=Hola!%20Tengo%20una%20consulta."
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-8 py-3 bg-stone-900 dark:bg-white text-white dark:text-stone-900 text-xs font-bold uppercase tracking-[0.2em] rounded-sm hover:bg-stone-800 dark:hover:bg-stone-200 transition-all active:scale-[0.98]"
                    >
                        Contáctanos
                    </a>
                </div>
            </div>
        </div>
    );
}
