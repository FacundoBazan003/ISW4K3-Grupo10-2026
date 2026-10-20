import { Link } from "react-router";
import {
    EnvelopeSimpleIcon,
    XIcon,
    CheckCircleIcon,
    PaperclipIcon,
    DownloadSimpleIcon,
} from "@phosphor-icons/react";
import type { Reservation } from "@/types/activity";
import logoNavbar from "@/assets/img/logo.png";

interface EmailConfirmationModalProps {
    reservation: Reservation;
    onClose: () => void;
}

export default function EmailConfirmationModal({
    reservation,
    onClose,
}: EmailConfirmationModalProps) {
    return (
        <div className="modal modal-open z-50">
            <div className="modal-box max-w-2xl rounded-3xl bg-base-100 p-0 border border-base-300 shadow-2xl overflow-hidden">
                {/* Header estilo Cliente de Correo */}
                <div className="bg-neutral text-neutral-content px-6 py-4 flex items-center justify-between border-b border-neutral/20">
                    <div className="flex items-center gap-3">
                        <span className="p-2 bg-neutral-content/10 rounded-xl flex items-center justify-center">
                            <EnvelopeSimpleIcon size={20} weight="duotone" />
                        </span>
                        <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-neutral-content/70">
                                Correo Electrónico Enviado
                            </p>
                            <h3 className="text-sm font-extrabold text-neutral-content">
                                Bandeja de entrada • EcoHarmony Park
                            </h3>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="btn btn-xs btn-circle btn-ghost text-neutral-content hover:bg-neutral-content/10"
                        aria-label="Cerrar modal"
                    >
                        <XIcon size={14} weight="bold" />
                    </button>
                </div>

                {/* Metadata del Email */}
                <div className="bg-base-200/50 border-b border-base-300 px-6 py-3 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                        <span className="text-base-content/70">
                            <strong className="text-base-content">De:</strong> EcoHarmony Park &lt;reservas@ecoharmonypark.com&gt;
                        </span>
                        <span className="text-[11px] text-base-content/50">
                            {new Date(reservation.createdAt).toLocaleDateString()} {new Date(reservation.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    </div>
                    <div>
                        <span className="text-base-content/70">
                            <strong className="text-base-content">Para:</strong> {reservation.titularNombre} &lt;{reservation.titularEmail}&gt;
                        </span>
                    </div>
                    <div>
                        <span className="text-base-content/70">
                            <strong className="text-base-content">Asunto:</strong> ¡Reserva Confirmada! Tu lugar en {reservation.activityName} está asegurado • Orden #{reservation.orderNumber}
                        </span>
                    </div>
                </div>

                {/* Cuerpo del Correo */}
                <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
                    {/* Tarjeta de Confirmación */}
                    <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5 text-center space-y-2">
                        <img
                            src={logoNavbar}
                            alt="EcoHarmony Park"
                            className="h-10 w-auto mx-auto object-contain mb-2"
                        />
                        <span className="badge badge-primary font-bold text-xs gap-1 py-2 px-3">
                            <CheckCircleIcon size={14} weight="bold" />
                            <span>Inscripción Exitosa</span>
                        </span>
                        <h2 className="text-xl font-extrabold text-base-content">
                            ¡Todo listo para tu aventura!
                        </h2>
                        <p className="text-xs text-base-content/80 max-w-md mx-auto">
                            Tu reserva ha sido registrada correctamente en nuestro sistema. A continuación encontrarás los detalles de tu turno y los códigos de acceso.
                        </p>
                    </div>

                    {/* Resumen del Turno */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-base-200/60 p-4 rounded-2xl border border-base-300/80 text-xs">
                        <div>
                            <span className="text-base-content/60 block text-[10px] uppercase font-bold">
                                N° de Orden
                            </span>
                            <span className="font-mono font-bold text-primary text-sm">
                                {reservation.orderNumber}
                            </span>
                        </div>
                        <div>
                            <span className="text-base-content/60 block text-[10px] uppercase font-bold">
                                Actividad
                            </span>
                            <span className="font-bold text-base-content">
                                {reservation.activityName}
                            </span>
                        </div>
                        <div>
                            <span className="text-base-content/60 block text-[10px] uppercase font-bold">
                                Fecha de Visita
                            </span>
                            <span className="font-bold text-base-content">
                                {reservation.fecha}
                            </span>
                        </div>
                        <div>
                            <span className="text-base-content/60 block text-[10px] uppercase font-bold">
                                Horario del Turno
                            </span>
                            <span className="font-bold text-base-content">
                                {reservation.horario} hs
                            </span>
                        </div>
                    </div>

                    {/* Detalle de Participantes con Códigos QR Simulados */}
                    <div className="space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-base-content/80">
                            Visitantes Registrados y Pases de Acceso ({reservation.participantes.length})
                        </h4>

                        <div className="space-y-2.5">
                            {reservation.participantes.map((p, idx) => (
                                <div
                                    key={idx}
                                    className="border border-base-300 rounded-2xl p-3.5 flex flex-col sm:flex-row items-center justify-between gap-4 bg-base-100"
                                >
                                    <div className="space-y-1 text-left w-full sm:w-auto">
                                        <div className="flex items-center gap-2">
                                            <span className="badge badge-neutral badge-xs font-mono">
                                                #{idx + 1}
                                            </span>
                                            <span className="font-bold text-sm text-base-content">
                                                {p.nombre}
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-base-content/70">
                                            <span>
                                                <strong>DNI:</strong> {p.dni}
                                            </span>
                                            <span>
                                                <strong>Edad:</strong> {p.edad} años
                                            </span>
                                            {p.talle && (
                                                <span>
                                                    <strong>Talle:</strong> {p.talle}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* QR Mockup */}
                                    <div className="flex items-center gap-2.5 bg-base-200/80 px-3 py-2 rounded-xl border border-base-300 shrink-0">
                                        <div className="w-12 h-12 bg-white p-1 rounded-lg border border-base-300 grid grid-cols-4 grid-rows-4 gap-0.5">
                                            <div className="bg-black col-span-2 row-span-2"></div>
                                            <div className="bg-black"></div>
                                            <div></div>
                                            <div></div>
                                            <div className="bg-black"></div>
                                            <div className="bg-black col-span-2 row-span-2"></div>
                                            <div className="bg-black"></div>
                                            <div></div>
                                        </div>
                                        <div className="text-left">
                                            <span className="block text-[10px] font-mono font-bold text-base-content/80">
                                                QR-{reservation.orderNumber}-{idx + 1}
                                            </span>
                                            <span className="text-[9px] text-base-content/60">
                                                Escanear al ingresar
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Archivo Adjunto simulado (FAQ 5) */}
                    <div className="bg-base-200/50 border border-base-300 rounded-2xl p-3.5 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <span className="p-2 bg-base-100 rounded-xl border border-base-300/60 flex items-center justify-center">
                                <PaperclipIcon size={22} weight="duotone" className="text-primary" />
                            </span>
                            <div className="text-left">
                                <p className="text-xs font-bold text-base-content">
                                    Voucher_Reserva_{reservation.orderNumber}.pdf
                                </p>
                                <p className="text-[10px] text-base-content/60">
                                    Documento adjunto con comprobante y códigos QR (245 KB)
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => alert("Comprobante PDF simulado descargado correctamente.")}
                            className="btn btn-ghost btn-xs text-primary font-bold hover:underline flex items-center gap-1"
                        >
                            <DownloadSimpleIcon size={14} weight="bold" />
                            <span>Descargar</span>
                        </button>
                    </div>
                </div>

                {/* Footer Modal */}
                <div className="bg-base-200/70 border-t border-base-300 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <p className="text-[11px] text-base-content/60 text-center sm:text-left">
                        Presentá este comprobante digital en el punto de encuentro 15 minutos antes del inicio.
                    </p>
                    <Link
                        to="/"
                        onClick={onClose}
                        className="btn btn-primary btn-sm rounded-full px-6 font-bold w-full sm:w-auto"
                    >
                        Volver a Actividades
                    </Link>
                </div>
            </div>
            <div className="modal-backdrop bg-black/50 backdrop-blur-xs" onClick={onClose} />
        </div>
    );
}
