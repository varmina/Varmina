import { Metadata } from 'next';
import { Mail, Phone, MapPin, Clock, MessageCircle } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Contacto | Varmina',
    description: 'Contáctanos para consultas sobre joyería, pedidos personalizados o soporte post-venta. Estamos para ayudarte.',
};

export default function ContactPage() {
    return (
        <div className="min-h-screen bg-stone-50 dark:bg-stone-950">
            {/* Hero */}
            <div className="relative py-20 md:py-28 bg-white dark:bg-stone-900 border-b border-stone-100 dark:border-stone-800">
                <div className="max-w-4xl mx-auto px-6 md:px-16 text-center">
                    <div className="w-12 h-px bg-gold-400 mx-auto mb-6" />
                    <h1 className="font-serif text-3xl md:text-5xl tracking-[0.15em] text-stone-900 dark:text-white uppercase">
                        Contacto
                    </h1>
                    <p className="mt-4 text-sm text-stone-500 dark:text-stone-400 max-w-xl mx-auto leading-relaxed">
                        Estamos aquí para ayudarte. No dudes en comunicarte con nosotros para cualquier consulta sobre nuestras joyas o pedidos.
                    </p>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-5xl mx-auto px-6 md:px-16 py-16 md:py-24">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16">

                    {/* Contact Info */}
                    <div className="space-y-10">
                        <div>
                            <h2 className="text-[10px] font-bold uppercase tracking-[0.25em] text-stone-400 mb-6">Información de Contacto</h2>
                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-full bg-gold-50 dark:bg-gold-900/10 flex items-center justify-center flex-shrink-0">
                                        <Mail className="w-4 h-4 text-gold-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-wider text-stone-900 dark:text-white mb-1">Email</p>
                                        <a href="mailto:varminamail@gmail.com" className="text-sm text-stone-500 hover:text-gold-600 transition-colors">
                                            varminamail@gmail.com
                                        </a>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-full bg-gold-50 dark:bg-gold-900/10 flex items-center justify-center flex-shrink-0">
                                        <MessageCircle className="w-4 h-4 text-gold-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-wider text-stone-900 dark:text-white mb-1">WhatsApp</p>
                                        <a
                                            href="https://wa.me/56944106742?text=Hola!%20Me%20gustaría%20saber%20más%20información."
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm text-stone-500 hover:text-gold-600 transition-colors"
                                        >
                                            +56 9 4410 6742
                                        </a>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-full bg-gold-50 dark:bg-gold-900/10 flex items-center justify-center flex-shrink-0">
                                        <MapPin className="w-4 h-4 text-gold-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-wider text-stone-900 dark:text-white mb-1">Ubicación</p>
                                        <p className="text-sm text-stone-500">Santiago, Chile</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-full bg-gold-50 dark:bg-gold-900/10 flex items-center justify-center flex-shrink-0">
                                        <Clock className="w-4 h-4 text-gold-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-wider text-stone-900 dark:text-white mb-1">Horario de Atención</p>
                                        <p className="text-sm text-stone-500">Lunes a Viernes: 10:00 – 19:00</p>
                                        <p className="text-sm text-stone-500">Sábado: 10:00 – 14:00</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* CTA Panel */}
                    <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-100 dark:border-stone-800 p-8 md:p-10 space-y-8">
                        <div>
                            <h2 className="font-serif text-xl tracking-[0.1em] text-stone-900 dark:text-white uppercase mb-3">
                                ¿Tienes alguna consulta?
                            </h2>
                            <p className="text-xs text-stone-500 leading-relaxed">
                                La forma más rápida de contactarnos es a través de WhatsApp. Te responderemos en el menor tiempo posible con toda la información que necesites sobre nuestras piezas.
                            </p>
                        </div>

                        <a
                            href="https://wa.me/56944106742?text=Hola!%20Me%20gustaría%20saber%20más%20información%20sobre%20sus%20joyas."
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-3 w-full py-4 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-lg text-xs font-bold uppercase tracking-[0.2em] transition-all hover:shadow-lg hover:shadow-green-500/20 active:scale-[0.98]"
                        >
                            <MessageCircle className="w-5 h-5" />
                            Escríbenos por WhatsApp
                        </a>

                        <a
                            href="mailto:varminamail@gmail.com"
                            className="flex items-center justify-center gap-3 w-full py-4 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white rounded-lg text-xs font-bold uppercase tracking-[0.2em] transition-all hover:bg-stone-50 dark:hover:bg-stone-800 active:scale-[0.98]"
                        >
                            <Mail className="w-4 h-4" />
                            Enviar un Email
                        </a>

                        <div className="pt-4 border-t border-stone-100 dark:border-stone-800">
                            <p className="text-[10px] text-stone-400 text-center leading-relaxed">
                                Respondemos todas las consultas en un plazo máximo de 24 horas hábiles.
                                Para pedidos personalizados, incluye una descripción detallada de lo que buscas.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
