import { Metadata } from 'next';
import { Truck, RotateCcw, Package, Clock, ShieldCheck, AlertCircle } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Envíos y Devoluciones | Varmina',
    description: 'Conoce nuestra política de envíos a todo Chile y condiciones de devolución para tus compras en Varmina.',
};

export default function ShippingPage() {
    return (
        <div className="min-h-screen bg-stone-50 dark:bg-stone-950">
            {/* Hero */}
            <div className="relative py-20 md:py-28 bg-white dark:bg-stone-900 border-b border-stone-100 dark:border-stone-800">
                <div className="max-w-4xl mx-auto px-6 md:px-16 text-center">
                    <div className="w-12 h-px bg-gold-400 mx-auto mb-6" />
                    <h1 className="font-serif text-3xl md:text-5xl tracking-[0.15em] text-stone-900 dark:text-white uppercase">
                        Envíos y Devoluciones
                    </h1>
                    <p className="mt-4 text-sm text-stone-500 dark:text-stone-400 max-w-xl mx-auto leading-relaxed">
                        Tu tranquilidad es nuestra prioridad. Conoce cómo enviamos y protegemos cada pieza.
                    </p>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-3xl mx-auto px-6 md:px-16 py-16 md:py-24 space-y-20">

                {/* Shipping Section */}
                <section className="space-y-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gold-50 dark:bg-gold-900/10 flex items-center justify-center">
                            <Truck className="w-5 h-5 text-gold-600" />
                        </div>
                        <h2 className="font-serif text-xl tracking-[0.1em] text-stone-900 dark:text-white uppercase">Envíos</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-100 dark:border-stone-800 p-6 space-y-3">
                            <div className="flex items-center gap-2 mb-2">
                                <Clock className="w-4 h-4 text-gold-500" />
                                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-900 dark:text-white">Santiago</h3>
                            </div>
                            <p className="text-xs text-stone-500 leading-relaxed">Entrega en 1-2 días hábiles con despacho express. Incluye seguimiento en tiempo real.</p>
                        </div>
                        <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-100 dark:border-stone-800 p-6 space-y-3">
                            <div className="flex items-center gap-2 mb-2">
                                <Clock className="w-4 h-4 text-gold-500" />
                                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-900 dark:text-white">Regiones</h3>
                            </div>
                            <p className="text-xs text-stone-500 leading-relaxed">Entrega en 3-5 días hábiles a través de courier certificado con número de seguimiento.</p>
                        </div>
                    </div>

                    <div className="space-y-6 text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                        <div className="flex items-start gap-3">
                            <Package className="w-4 h-4 text-stone-400 mt-0.5 flex-shrink-0" />
                            <p><strong className="text-stone-900 dark:text-white">Empaque seguro:</strong> Cada pieza se embala individualmente en su estuche premium Varmina, dentro de un empaque acolchado para garantizar que llegue en perfecto estado.</p>
                        </div>
                        <div className="flex items-start gap-3">
                            <ShieldCheck className="w-4 h-4 text-stone-400 mt-0.5 flex-shrink-0" />
                            <p><strong className="text-stone-900 dark:text-white">Seguro de envío:</strong> Todos nuestros despachos incluyen seguro contra extravío o daño durante el transporte, sin costo adicional.</p>
                        </div>
                        <div className="flex items-start gap-3">
                            <AlertCircle className="w-4 h-4 text-stone-400 mt-0.5 flex-shrink-0" />
                            <p><strong className="text-stone-900 dark:text-white">Costos de envío:</strong> El valor del despacho se calcula según tu ubicación y se informa al momento de confirmar tu pedido por WhatsApp. Revisa nuestras promociones vigentes para envíos gratuitos.</p>
                        </div>
                    </div>
                </section>

                <div className="w-full h-px bg-gradient-to-r from-transparent via-stone-200 dark:via-stone-800 to-transparent" />

                {/* Returns Section */}
                <section className="space-y-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gold-50 dark:bg-gold-900/10 flex items-center justify-center">
                            <RotateCcw className="w-5 h-5 text-gold-600" />
                        </div>
                        <h2 className="font-serif text-xl tracking-[0.1em] text-stone-900 dark:text-white uppercase">Devoluciones</h2>
                    </div>

                    <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-100 dark:border-stone-800 p-8 space-y-6">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-stone-900 dark:text-white">Política de 10 Días</h3>
                        <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                            Si no estás 100% conforme con tu compra, puedes solicitar un cambio o devolución dentro de los primeros <strong className="text-stone-900 dark:text-white">10 días calendario</strong> desde la recepción del producto.
                        </p>

                        <div className="space-y-4">
                            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold-600 mt-4">Condiciones</h4>
                            <ul className="space-y-3 text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                                <li className="flex items-start gap-2">
                                    <span className="w-1 h-1 rounded-full bg-gold-500 mt-1.5 flex-shrink-0" />
                                    La pieza debe estar en su estado original, sin uso visible ni daño.
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="w-1 h-1 rounded-full bg-gold-500 mt-1.5 flex-shrink-0" />
                                    Debe incluir su empaque y estuche original.
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="w-1 h-1 rounded-full bg-gold-500 mt-1.5 flex-shrink-0" />
                                    Los productos personalizados o por encargo no admiten devolución, salvo defectos de fabricación.
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="w-1 h-1 rounded-full bg-gold-500 mt-1.5 flex-shrink-0" />
                                    Los costos de envío de devolución corren por cuenta del comprador, salvo que se trate de un error nuestro o producto defectuoso.
                                </li>
                            </ul>
                        </div>

                        <div className="space-y-2 pt-4 border-t border-stone-100 dark:border-stone-800">
                            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold-600">¿Cómo solicitar una devolución?</h4>
                            <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                                Escríbenos por WhatsApp o email indicando tu número de pedido y el motivo de la devolución. Te guiaremos en todo el proceso y coordinaremos el retiro o envío del producto.
                            </p>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
