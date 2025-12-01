import type { ApiResponse, PaginatedResponse } from "./global.interfaces";
import type {
  CotizacionChangeStateDTO,
  CotizacionObservacionDTO,
  CotizacionRequestDTO,
} from "../models/Cotizacion/Cotizacion_request_dto";
import type {
  CotizacionCreateResponseDTO,
  CotizacionDashboardDTO,
  CotizacionFullDTO,
  CotizacionHistorialDTO,
  CotizacionPdfDTO,
} from "../models/Cotizacion/Cotizacion_response_dto";
import type { ProductoCarritoDetalleDTO } from "../models/CotizacionDetalle/Cotizacion_detalle";
import api from "../utils/api";

const BASE_URL =  "/cotizacion";

export async function postCotizacion(
  body: CotizacionRequestDTO
): Promise<CotizacionCreateResponseDTO[]> {
  const url = `${BASE_URL}/create`;

  const res = await api.post<ApiResponse<CotizacionCreateResponseDTO[]>>(
    url,
    body
  );

  return res.data.data;
}

export async function getCotizacionesByUserPaginated(
  id: number,
  page: number = 0,
  size: number = 10
): Promise<PaginatedResponse<CotizacionDashboardDTO>> {
  const url = `${BASE_URL}/by-usuario-paginated/${id}?page=${page}&size=${size}`;

  const res = await api.get<
    ApiResponse<PaginatedResponse<CotizacionDashboardDTO>>
  >(url);

  return res.data.data;
}

export async function getCotizacionById(
  id: number
): Promise<CotizacionFullDTO> {
  const url = `${BASE_URL}/${id}`;

  const res = await api.get<ApiResponse<CotizacionFullDTO>>(url, {});

  return res.data.data;
}

export async function getAllCotizaciones(
  page: number = 0,
  size: number = 10
): Promise<PaginatedResponse<CotizacionDashboardDTO>> {
  const url = `${BASE_URL}/dashboard-paginated?page=${page}&size=${size}`;

  const res = await api.get<
    ApiResponse<PaginatedResponse<CotizacionDashboardDTO>>
  >(url);

  return res.data.data;
}

export async function getSearchCotizaciones(
  busqueda: string,
  page: number = 0,
  size: number = 10
): Promise<PaginatedResponse<CotizacionDashboardDTO>> {
  const url = `${BASE_URL}/dashboard-search?busqueda=${encodeURIComponent(
    busqueda
  )}&page=${page}&size=${size}`;

  const res = await api.get<
    ApiResponse<PaginatedResponse<CotizacionDashboardDTO>>
  >(url);

  return res.data.data;
}

export async function getQuantityCotizaciones(): Promise<number> {
  const url = `${BASE_URL}/dashboard-quantity`;

  const res = await api.get<ApiResponse<number>>(url);

  return res.data.data;
}

export async function updateObservacionCotizacion(
  id: number,
  observaciones: string
): Promise<CotizacionObservacionDTO> {
  const url = `${BASE_URL}/observaciones/${id}`;

  const res = await api.put<ApiResponse<CotizacionObservacionDTO>>(url, {
    observaciones,
  });

  return res.data.data;
}

export async function change_state(
  id: number,
  nuevoEstado:
    | "PENDIENTE"
    | "EN_PROCESO"
    | "ENVIADA"
    | "ACEPTADA"
    | "RECHAZADA"
    | "CERRADA",
  observacion: string,
  usuarioId: number
): Promise<CotizacionChangeStateDTO> {
  const url = `${BASE_URL}/change-state/${id}`;

  const res = await api.put<ApiResponse<CotizacionChangeStateDTO>>(url, {
    nuevoEstado,
    observacion,
    usuarioId,
  });

  return res.data.data;
}

export async function uploadCotizacionPDF(
  cotizacionId: number,
  file: File
): Promise<CotizacionPdfDTO> {
  const url = `${BASE_URL}/create_pdf/${cotizacionId}`;

  const formData = new FormData();
  formData.append("archivo", file);

  const response = await api.post<ApiResponse<CotizacionPdfDTO>>(
    url,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data.data;
}

export async function getProductoCarritoDetalle(
  cotizacionId: number
): Promise<ProductoCarritoDetalleDTO[]> {
  const url = `${BASE_URL}/productos-por-cotizacion/${cotizacionId}`;

  const res = await api.get<ApiResponse<ProductoCarritoDetalleDTO[]>>(url);

  return res.data.data;
}

export async function getHistorialCambiosEstado(
  cotizacionId: number
): Promise<CotizacionHistorialDTO[]> {
  const url = `${BASE_URL}/${cotizacionId}/historial`;

  const res = await api.get<ApiResponse<CotizacionHistorialDTO[]>>(url);

  return res.data.data;
}

export async function getProductosByCotizacionId(
  cotizacionId: number,
  page: number = 0,
  size: number = 2
): Promise<PaginatedResponse<ProductoCarritoDetalleDTO>> {
  const url = `${BASE_URL}/${cotizacionId}/productos?page=${page}&size=${size}`;

  const res = await api.get<
    ApiResponse<PaginatedResponse<ProductoCarritoDetalleDTO>>
  >(url);

  return res.data.data;
}
