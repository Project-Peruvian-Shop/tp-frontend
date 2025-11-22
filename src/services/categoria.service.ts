import type { ApiResponse, PaginatedResponse } from "./global.interfaces";
import type {
  AllAndQuantityResponseDTO,
  CategoriaCreateResponseDTO,
  CategoriaDashboardDTO,
  ProductoResponseDTO,
} from "../models/Categoria/Categoria_response";
import type { CategoriaRequestDTO } from "../models/Categoria/Categoria_request";
import api from "../utils/api";

const BASE_URL =  "/categoria";


export async function getCategoriaAllQuantity(): Promise<
  AllAndQuantityResponseDTO[]
> {
  const url = `${BASE_URL}/all-and-quantity`;

  const res = await api.get<ApiResponse<AllAndQuantityResponseDTO[]>>(url);

  return res.data.data;
}

export async function getAllCategories(
  page: number = 0,
  size: number = 10
): Promise<PaginatedResponse<CategoriaDashboardDTO>> {

  const url = `${BASE_URL}/dashboard-paginated?page=${page}&size=${size}`;

  const res = await api.get<
    ApiResponse<PaginatedResponse<CategoriaDashboardDTO>>
  >(url);

  return res.data.data;
}

export async function getSearchCategories(
  busqueda: string,
  page: number = 0,
  size: number = 10
): Promise<PaginatedResponse<CategoriaDashboardDTO>> {
  const url = `${BASE_URL}/dashboard-search?busqueda=${encodeURIComponent(
    busqueda
  )}&page=${page}&size=${size}`;

  const res = await api.get<
    ApiResponse<PaginatedResponse<CategoriaDashboardDTO>>
  >(url);

  return res.data.data;
}

export async function getCategoryById(
  id: number
): Promise<CategoriaDashboardDTO> {
  const url = `${BASE_URL}/${id}`;

  const res = await api.get<ApiResponse<CategoriaDashboardDTO>>(url);

  return res.data.data;
}

export async function getProductosByCategoryId(
  categoryId: number,
  page: number = 0,
  size: number = 2
): Promise<PaginatedResponse<ProductoResponseDTO>> {
  const url = `${BASE_URL}/productos/${categoryId}?page=${page}&size=${size}`;

  const res = await api.get<
    ApiResponse<PaginatedResponse<ProductoResponseDTO>>
  >(url);

  return res.data.data;
}

export async function getQuantityCategorias(): Promise<number> {
  const url = `${BASE_URL}/dashboard-quantity`;

  const res = await api.get<ApiResponse<number>>(url);

  return res.data.data;
}

export async function createCategoria(
  body: CategoriaRequestDTO
): Promise<CategoriaCreateResponseDTO> {
  const url = `${BASE_URL}/`;

  const res = await api.post<ApiResponse<CategoriaCreateResponseDTO>>(
    url,
    body
  );

  return res.data.data;
}

export async function updateCategoria(
  id: number,
  body: CategoriaRequestDTO
): Promise<CategoriaCreateResponseDTO> {
  const url = `${BASE_URL}/${id}`;

  const res = await api.put<ApiResponse<CategoriaCreateResponseDTO>>(url, body);

  return res.data.data;
}
export async function deleteCategoria(id: number): Promise<void> {
  const url = `${BASE_URL}/${id}`;

  await api.delete<ApiResponse<void>>(url);
}
