import type { ApiResponse, PaginatedResponse } from "./global.interfaces";
import type {
  PaginatedProductoResponseDTO,
  ProductoCreateResponseDTO,
  ProductoDashboardDTO,
  ProductoDTO,
} from "../models/Producto/Producto_response_dto";
import type { ProductoRequestDTO } from "../models/Producto/Producto_request_dto";
import api from "../utils/api";
const BASE_URL = "/producto";

export async function getPaginatedProductos(
  page: number = 0,
  size: number = 10,
  categoria: number | null = null
): Promise<PaginatedResponse<PaginatedProductoResponseDTO>> {
  const params = new URLSearchParams();
  params.append("page", page.toString());
  params.append("size", size.toString());
  if (categoria !== null) {
    params.append("categoria", categoria.toString());
  }

  const url = `${BASE_URL}/paginated?${params.toString()}`;
  const res = await api.get<
    ApiResponse<PaginatedResponse<PaginatedProductoResponseDTO>>
  >(url);

  return res.data.data;
}

export async function getProductoById(id: number): Promise<ProductoDTO> {
  const url = `${BASE_URL}/${id}`;
  const res = await api.get<ApiResponse<ProductoDTO>>(url);

  return res.data.data;
}

export async function getAllProductos(
  page: number = 0,
  size: number = 8
): Promise<PaginatedResponse<ProductoDashboardDTO>> {
  const url = `${BASE_URL}/dashboard-paginated?page=${page}&size=${size}`;
  const res = await api.get<
    ApiResponse<PaginatedResponse<ProductoDashboardDTO>>
  >(url);

  return res.data.data;
}

export async function getSearchProductos(
  busqueda: string,
  page: number = 0,
  size: number = 8
): Promise<PaginatedResponse<ProductoDashboardDTO>> {
  const url = `${BASE_URL}/dashboard-search?busqueda=${encodeURIComponent(
    busqueda
  )}&page=${page}&size=${size}`;

  const res = await api.get<
    ApiResponse<PaginatedResponse<ProductoDashboardDTO>>
  >(url);

  return res.data.data;
}

export async function createProducto(
  body: ProductoRequestDTO
): Promise<ProductoCreateResponseDTO> {
  const url = `${BASE_URL}/`;
  const res = await api.post<ApiResponse<ProductoCreateResponseDTO>>(url, body);

  return res.data.data;
}

export async function updateProducto(
  id: number,
  body: ProductoRequestDTO
): Promise<ProductoCreateResponseDTO> {
  const url = `${BASE_URL}/${id}`;
  const res = await api.put<ApiResponse<ProductoCreateResponseDTO>>(url, body);

  return res.data.data;
}

export async function deleteProducto(id: number): Promise<void> {
  const url = `${BASE_URL}/${id}`;
  await api.delete<ApiResponse<void>>(url);
}

export async function getQuantityProductos(): Promise<number> {
  const url = `${BASE_URL}/dashboard-quantity`;
  const res = await api.get<ApiResponse<number>>(url);

  return res.data.data;
}

export async function getSugeridos(
  producto: number,
  categoria: number
): Promise<PaginatedProductoResponseDTO[]> {
  const url = `${BASE_URL}/sugeridos?producto=${producto}&categoria=${categoria}`;
  const res = await api.get<ApiResponse<PaginatedProductoResponseDTO[]>>(url);

  return res.data.data;
}
